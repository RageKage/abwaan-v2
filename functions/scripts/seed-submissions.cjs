#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] ?? null;
};

const uid = getArgValue('--uid');
const fileArg = getArgValue('--file') || 'dataset.json';
const projectArg = getArgValue('--project');

if (!uid) {
  console.error('Missing required --uid argument.');
  process.exit(1);
}

const resolveProjectId = () => {
  if (projectArg) return projectArg;
  const rcPath = path.resolve(process.cwd(), '.firebaserc');
  try {
    const raw = fs.readFileSync(rcPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed?.projects?.default ?? null;
  } catch {
    return null;
  }
};

const projectId = resolveProjectId();
if (!projectId) {
  console.error('Unable to resolve Firebase project id. Pass --project or set .firebaserc.');
  process.exit(1);
}

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:4000';
  console.log('FIRESTORE_EMULATOR_HOST not set. Defaulting to 127.0.0.1:8080.');
}

process.env.GCLOUD_PROJECT = projectId;

const dataPath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(dataPath)) {
  console.error(`Dataset file not found: ${dataPath}`);
  process.exit(1);
}

let dataset = [];
try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  dataset = JSON.parse(raw);
} catch (err) {
  console.error('Failed to read or parse dataset JSON.');
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

if (!Array.isArray(dataset)) {
  console.error('Dataset must be a JSON array.');
  process.exit(1);
}

const SUBMISSION_TITLE_MIN = 3;
const SUBMISSION_TITLE_MAX = 120;
const SUBMISSION_TEXT_MAX = 4000;
const SUBMISSION_MEANING_MAX = 2000;
const SUBMISSION_TRANSLATION_MAX = 2000;

const SEARCH_KEYWORD_LIMIT = 60;
const SEARCH_SOURCE_LIMIT = 600;
const SEARCH_TOKEN_MIN = 2;
const SEARCH_TOKEN_MAX = 24;

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const normalizeSource = (source) => {
  const name = String(source?.name ?? '').trim();
  const urlRaw = typeof source?.url === 'string' ? source?.url.trim() : '';
  const notesRaw = typeof source?.notes === 'string' ? source?.notes.trim() : '';
  return {
    name,
    url: urlRaw || null,
    notes: notesRaw || null,
  };
};

const buildSubmissionSearchFields = ({ type, title, text, meaning, username }) => {
  const normalizedTitle = title.trim();
  const normalizedText = text.trim();
  const normalizedMeaning = meaning.trim();
  const normalizedType = type.trim();

  const searchIndex = (normalizedType === 'Poetry' ? normalizedTitle : normalizedText).toLowerCase();

  const tokenize = (value) =>
    value
      .slice(0, SEARCH_SOURCE_LIMIT)
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length >= SEARCH_TOKEN_MIN && token.length <= SEARCH_TOKEN_MAX);

  const tokens = [
    normalizedType.toLowerCase(),
    ...(username ? [username.toLowerCase()] : []),
    ...tokenize(normalizedTitle),
    ...tokenize(normalizedText),
    ...tokenize(normalizedMeaning),
  ];

  const searchKeywords = [];
  const seen = new Set();
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    searchKeywords.push(token);
    if (searchKeywords.length >= SEARCH_KEYWORD_LIMIT) break;
  }

  return { searchIndex, searchKeywords };
};

const validateEntry = (entry, index) => {
  const errors = [];
  if (!entry || typeof entry !== 'object') {
    errors.push('Entry must be an object.');
    return errors;
  }

  const type = String(entry.type ?? '').trim();
  const text = String(entry.text ?? '').trim();
  const meaning = String(entry.meaning ?? '').trim();
  const title = String(entry.title ?? '').trim();
  const translation = String(entry.translation ?? '').trim();
  const language = String(entry.language ?? '').trim().toLowerCase();
  const origin = String(entry.origin ?? '').trim();

  if (!['Proverb', 'Poetry'].includes(type)) {
    errors.push('Type must be Proverb or Poetry.');
  }

  if (!text) {
    errors.push('Text is required.');
  } else if (text.length > SUBMISSION_TEXT_MAX) {
    errors.push(`Text must be ${SUBMISSION_TEXT_MAX} characters or fewer.`);
  }

  if (meaning.length > SUBMISSION_MEANING_MAX) {
    errors.push(`Meaning must be ${SUBMISSION_MEANING_MAX} characters or fewer.`);
  }

  if (translation.length > SUBMISSION_TRANSLATION_MAX) {
    errors.push(`Translation must be ${SUBMISSION_TRANSLATION_MAX} characters or fewer.`);
  }

  if (type === 'Poetry') {
    if (!title) {
      errors.push('Title is required for Poetry.');
    } else if (title.length < SUBMISSION_TITLE_MIN) {
      errors.push(`Title must be at least ${SUBMISSION_TITLE_MIN} characters.`);
    } else if (title.length > SUBMISSION_TITLE_MAX) {
      errors.push(`Title must be ${SUBMISSION_TITLE_MAX} characters or fewer.`);
    }
  }

  if (!['so', 'en'].includes(language)) {
    errors.push('Language must be so or en.');
  }

  if (!['original', 'shared', 'unknown'].includes(origin)) {
    errors.push('Origin must be original, shared, or unknown.');
  }

  if (origin === 'shared') {
    const source = normalizeSource(entry.source);
    if (!source.name) {
      errors.push('Source name is required for shared submissions.');
    }
    if (source.url && !isValidUrl(source.url)) {
      errors.push('Source URL is invalid.');
    }
  }

  if (errors.length > 0) {
    return errors.map((err) => `#${index + 1}: ${err}`);
  }
  return errors;
};

const main = async () => {
  const validationErrors = dataset.flatMap((entry, index) => validateEntry(entry, index));
  if (validationErrors.length > 0) {
    console.error('Validation failed. Fix the dataset and retry.');
    validationErrors.forEach((err) => console.error(`- ${err}`));
    process.exit(1);
  }

  initializeApp({ projectId });
  const db = getFirestore();

  const profileSnap = await db.collection('profiles').doc(uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : null;
  const displayName = String(profile?.displayName ?? '').trim() || 'Seed User';
  const username = typeof profile?.username === 'string' ? profile?.username : null;

  const batchLimit = 400;
  let batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;

  for (const entry of dataset) {
    const type = String(entry.type ?? '').trim();
    const text = String(entry.text ?? '').trim();
    const meaning = String(entry.meaning ?? '').trim();
    const title = String(entry.title ?? '').trim();
    const translation = String(entry.translation ?? '').trim();
    const language = String(entry.language ?? '').trim().toLowerCase();
    const origin = String(entry.origin ?? '').trim();
    const createdAt = Number.isFinite(entry.createdAt) ? entry.createdAt : Date.now();

    const source = origin === 'shared' ? normalizeSource(entry.source) : null;
    const searchFields = buildSubmissionSearchFields({
      type,
      title: type === 'Poetry' ? title : '',
      text,
      meaning,
      username,
    });

    const payload = {
      uid,
      displayName,
      username,
      type,
      language,
      origin,
      status: 'published',
      statusChangedAt: null,
      statusChangedBy: null,
      statusReason: null,
      title: type === 'Poetry' ? title : null,
      text,
      meaning,
      translation: translation || null,
      source,
      createdAt,
      updatedAt: null,
      updatedBy: null,
      voteUp: 0,
      voteDown: 0,
      voteScore: 0,
      searchIndex: searchFields.searchIndex,
      searchKeywords: searchFields.searchKeywords,
      reportCount: 0,
    };

    const docRef = db.collection('submissions').doc();
    batch.set(docRef, payload);
    batchCount += 1;
    totalCount += 1;

    if (batchCount >= batchLimit) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Seeded ${totalCount} submissions for uid ${uid}.`);
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
