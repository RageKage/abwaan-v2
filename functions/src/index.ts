import {initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import {auth, firestore} from "firebase-functions/v1";
import {onCall, HttpsError} from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

/**
 * Enforces a per-user, per-action rate limit using Firestore.
 * Throws HttpsError("resource-exhausted") if the limit is exceeded.
 */
async function checkRateLimit(
  uid: string,
  action: string,
  maxCalls: number,
  windowSeconds: number
): Promise<void> {
  const ref = db.collection("rateLimits").doc(`${uid}_${action}`);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    if (!data || now - data.windowStart >= windowMs) {
      tx.set(ref, {count: 1, windowStart: now});
      return;
    }

    if (data.count >= maxCalls) {
      throw new HttpsError(
        "resource-exhausted",
        `Too many requests. Try again later.`
      );
    }

    tx.update(ref, {count: FieldValue.increment(1)});
  });
}

/**
 * Normalizes a username by trimming whitespace and converting to lowercase.
 * Also validates the username format.
 *
 * @param {string} raw - The raw username string to normalize.
 * @return {object} An object containing the original and normalized username.
 * @throws {HttpsError} If the username is invalid.
 */
function normalizeUsername(raw: string) {
  const usernameOriginal = raw.trim();
  const usernameLower = usernameOriginal.toLowerCase();

  // 3-20 chars, a-z 0-9 underscore only (case-insensitive)
  if (!/^[a-z0-9_]{3,20}$/.test(usernameLower)) {
    throw new HttpsError(
      "invalid-argument",
      "Username must be 3-20 chars and only a-z, 0-9, underscore."
    );
  }

  return {usernameOriginal, usernameLower};
}

const SUBMISSION_TITLE_MIN = 3;
const SUBMISSION_TITLE_MAX = 120;
const SUBMISSION_TEXT_MAX = 4000;
const SUBMISSION_MEANING_MAX = 2000;
const SUBMISSION_TRANSLATION_MAX = 2000;
const REPORT_THRESHOLD = 3;

type SubmissionType = "Proverb" | "Poetry";
type SubmissionOrigin = "original" | "shared" | "unknown";
type LanguageCode = "so" | "en";
type SubmissionSource = {
  name: string;
  url: string | null;
  notes: string | null;
};

type NewSubmissionInput = {
  type?: string;
  language?: string;
  origin?: string;
  title?: string;
  text?: string;
  meaning?: string;
  translation?: string;
  source?: {
    name?: string;
    url?: string | null;
    notes?: string | null;
  };
};


const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const normalizeSource = (
  source?: NewSubmissionInput["source"]
): SubmissionSource => {
  const name = String(source?.name ?? "").trim();
  const urlRaw = typeof source?.url === "string" ? source?.url.trim() : "";
  const notesRaw =
    typeof source?.notes === "string" ? source?.notes.trim() : "";

  return {
    name,
    url: urlRaw || null,
    notes: notesRaw || null,
  };
};

const SEARCH_KEYWORD_LIMIT = 60;
const SEARCH_SOURCE_LIMIT = 600;
const SEARCH_TOKEN_MIN = 2;
const SEARCH_TOKEN_MAX = 24;

const buildSubmissionSearchFields = ({
  type,
  title,
  text,
  meaning,
  username,
}: {
  type: SubmissionType;
  title: string;
  text: string;
  meaning: string;
  username?: string | null;
}) => {
  const normalizedTitle = title.trim();
  const normalizedText = text.trim();
  const normalizedMeaning = meaning.trim();
  const normalizedType = type.trim();

  const searchIndex = (
    normalizedType === "Poetry" ? normalizedTitle : normalizedText
  ).toLowerCase();

  const tokenize = (value: string) =>
    value
      .slice(0, SEARCH_SOURCE_LIMIT)
      .toLowerCase()
      .split(/\s+/)
      .filter(
        (token) =>
          token.length >= SEARCH_TOKEN_MIN && token.length <= SEARCH_TOKEN_MAX
      );

  const tokens = [
    normalizedType.toLowerCase(),
    ...(username ? [username.toLowerCase()] : []),
    ...tokenize(normalizedTitle),
    ...tokenize(normalizedText),
    ...tokenize(normalizedMeaning),
  ];

  const searchKeywords: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    searchKeywords.push(token);
    if (searchKeywords.length >= SEARCH_KEYWORD_LIMIT) break;
  }

  return {searchIndex, searchKeywords};
};

// Auth trigger: create initial profile + private user docs
export const onAuthUserCreate = auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email ?? "";
  const providerId = user.providerData?.[0]?.providerId ?? null;
  const now = Date.now();

  logger.info("Creating profile for new user", {uid, providerId});

  const profileRef = db.collection("profiles").doc(uid);
  const privateRef = db.collection("privateUsers").doc(uid);

  try {
    await Promise.all([
      profileRef.set(
        {
          displayName: user.displayName ?? "",
          username: null,
          bio: "",
          photoURL: user.photoURL ?? null,
          createdAt: now,
          lastLoginAt: now,
          submissionCount: 0,
          isAdmin: false,
        },
        {merge: true}
      ),
      privateRef.set(
        {
          email,
          providerId,
          lastLoginAt: now,
        },
        {merge: true}
      ),
    ]);
  } catch (err) {
    logger.error("Failed to create profile", {uid, error: err});
    throw err;
  }
});

// Firestore trigger: keep profile submissionCount in sync
export const onSubmissionCreate = firestore
  .document("submissions/{id}")
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    const uid = data?.uid;
    if (!uid) return;
    await db.collection("profiles").doc(uid).set(
      {submissionCount: FieldValue.increment(1)},
      {merge: true}
    );
  });

export const onSubmissionDelete = firestore
  .document("submissions/{id}")
  .onDelete(async (snapshot, context) => {
    const data = snapshot.data();
    const uid = data?.uid;
    const submissionId = context.params.id;

    logger.info("Deleting submission and subcollections", {submissionId, uid});

    try {
      // 1. Decrement the author's submission count
      const profileUpdate = uid
        ? db.collection("profiles").doc(uid).set(
          {submissionCount: FieldValue.increment(-1)},
          {merge: true}
        )
        : Promise.resolve();

      // 2. Delete all subcollection documents (votes, comments, reports)
      const subRef = db.collection("submissions").doc(submissionId);
      const subcollections = ["votes", "comments", "reports"];
      const writer = db.bulkWriter();

      for (const name of subcollections) {
        const snap = await subRef.collection(name).select().get();
        for (const doc of snap.docs) {
          writer.delete(doc.ref);
        }
      }

      await Promise.all([profileUpdate, writer.close()]);
    } catch (err) {
      logger.error("Failed to clean up submission", {submissionId, error: err});
      throw err;
    }
  });

// Firestore trigger: auto-hide submissions after 3 distinct reports
export const onReportCreate = firestore
  .document("submissions/{id}/reports/{uid}")
  .onCreate(async (_, context) => {
    const submissionId = String(context.params.id ?? "");
    if (!submissionId) return;

    const submissionRef = db.collection("submissions").doc(submissionId);

    await db.runTransaction(async (tx) => {
      const submissionSnap = await tx.get(submissionRef);
      if (!submissionSnap.exists) return;

      const data = submissionSnap.data() ?? {};
      const currentCount =
        typeof data.reportCount === "number" ? data.reportCount : 0;
      const nextCount = currentCount + 1;

      const updates: Record<string, unknown> = {
        reportCount: nextCount,
      };

      if (data.status === "published" && nextCount >= REPORT_THRESHOLD) {
        logger.warn("Auto-hiding submission due to reports", {
          submissionId, reportCount: nextCount,
        });
        updates.status = "hidden";
        updates.statusChangedAt = Date.now();
        updates.statusChangedBy = "system";
        updates.statusReason = "auto-report-threshold";
      }

      tx.set(submissionRef, updates, {merge: true});
    });
  });

// Callable (v2): claim username atomically
export const claimUsername = onCall<{username?: string}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");
  await checkRateLimit(uid, "claimUsername", 5, 3600);

  const raw = String(request.data?.username ?? "");
  const {usernameOriginal, usernameLower} = normalizeUsername(raw);

  const usernameRef = db.collection("usernames").doc(usernameLower);
  const profileRef = db.collection("profiles").doc(uid);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(usernameRef);
    if (existing.exists) {
      throw new HttpsError("already-exists", "Username is taken.");
    }

    tx.set(usernameRef, {
      uid,
      usernameOriginal,
      createdAt: Date.now(),
    });

    tx.set(profileRef, {username: usernameOriginal}, {merge: true});
  });

  return {ok: true, username: usernameOriginal};
});

// Callable (v2): create a submission with server-side validation
// and search fields.
export const createSubmission = onCall<NewSubmissionInput>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");
  await checkRateLimit(uid, "createSubmission", 10, 3600);

  const raw = request.data ?? {};
  const type = String(raw.type ?? "").trim() as SubmissionType;
  const text = String(raw.text ?? "").trim();
  const meaning = String(raw.meaning ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const translation = String(raw.translation ?? "").trim();
  const language = String(raw.language ?? "")
    .trim()
    .toLowerCase() as LanguageCode;
  const origin = String(raw.origin ?? "").trim() as SubmissionOrigin;

  if (type !== "Proverb" && type !== "Poetry") {
    throw new HttpsError("invalid-argument", "Type must be Proverb or Poetry.");
  }

  if (!text) {
    throw new HttpsError("invalid-argument", "Text is required.");
  }
  if (text.length > SUBMISSION_TEXT_MAX) {
    throw new HttpsError(
      "invalid-argument",
      `Text must be ${SUBMISSION_TEXT_MAX} characters or fewer.`
    );
  }

  if (meaning.length > SUBMISSION_MEANING_MAX) {
    throw new HttpsError(
      "invalid-argument",
      `Meaning must be ${SUBMISSION_MEANING_MAX} characters or fewer.`
    );
  }

  if (translation.length > SUBMISSION_TRANSLATION_MAX) {
    throw new HttpsError(
      "invalid-argument",
      `Translation must be ${SUBMISSION_TRANSLATION_MAX} characters or fewer.`
    );
  }

  if (type === "Poetry") {
    if (!title) {
      throw new HttpsError(
        "invalid-argument",
        "Title is required for Poetry."
      );
    }
    if (title.length < SUBMISSION_TITLE_MIN) {
      throw new HttpsError(
        "invalid-argument",
        `Title must be at least ${SUBMISSION_TITLE_MIN} characters.`
      );
    }
    if (title.length > SUBMISSION_TITLE_MAX) {
      throw new HttpsError(
        "invalid-argument",
        `Title must be ${SUBMISSION_TITLE_MAX} characters or fewer.`
      );
    }
  }

  if (language !== "so" && language !== "en") {
    throw new HttpsError(
      "invalid-argument",
      "Language must be en or so."
    );
  }

  if (origin !== "original" && origin !== "shared" && origin !== "unknown") {
    throw new HttpsError(
      "invalid-argument",
      "Origin must be original, shared, or unknown."
    );
  }

  let source: SubmissionSource | null = null;
  if (origin === "shared") {
    source = normalizeSource(raw.source);
    if (!source.name) {
      throw new HttpsError("invalid-argument", "Source name is required.");
    }
    if (source.url && !isValidUrl(source.url)) {
      throw new HttpsError("invalid-argument", "Source URL is invalid.");
    }
  }

  const profileSnap = await db.collection("profiles").doc(uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : null;

  const tokenName = String(request.auth?.token?.name ?? "").trim();
  const tokenEmail = String(request.auth?.token?.email ?? "").trim();

  const displayName =
    String(profile?.displayName ?? "").trim() ||
    tokenName ||
    tokenEmail ||
    "Anonymous";

  const username =
    typeof profile?.username === "string" ? profile?.username : null;

  const searchFields = buildSubmissionSearchFields({
    type,
    title: type === "Poetry" ? title : "",
    text,
    meaning,
    username,
  });

  const now = Date.now();
  const payload = {
    uid,
    displayName,
    username,
    type,
    language,
    origin,
    status: "published",
    statusChangedAt: null,
    statusChangedBy: null,
    statusReason: null,
    title: type === "Poetry" ? title : null,
    text,
    meaning,
    translation: translation || null,
    source,
    createdAt: now,
    updatedAt: null,
    updatedBy: null,
    voteUp: 0,
    voteDown: 0,
    voteScore: 0,
    searchIndex: searchFields.searchIndex,
    searchKeywords: searchFields.searchKeywords,
    reportCount: 0,
  };

  const submissionRef = db.collection("submissions").doc();
  await submissionRef.set(payload);

  return {ok: true, submission: {id: submissionRef.id, ...payload}};
});


// Callable (v2): vote on submission (updates counters safely)
export const voteSubmission = onCall<{
  submissionId?: string;
  value?: number;
}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");
  await checkRateLimit(uid, "voteSubmission", 60, 60);

  const submissionId = String(request.data?.submissionId ?? "");
  const value = Number(request.data?.value); // 1, -1, or 0

  if (!submissionId) {
    throw new HttpsError("invalid-argument", "Missing submissionId.");
  }
  if (![1, -1, 0].includes(value)) {
    throw new HttpsError("invalid-argument", "Vote value must be 1, -1, or 0.");
  }

  const subRef = db.collection("submissions").doc(submissionId);
  const voteRef = subRef.collection("votes").doc(uid);

  await db.runTransaction(async (tx) => {
    const [subSnap, voteSnap] = await Promise.all([
      tx.get(subRef),
      tx.get(voteRef),
    ]);
    if (!subSnap.exists) {
      throw new HttpsError("not-found", "Submission not found.");
    }

    const oldValue = voteSnap.exists ? voteSnap.data()?.value ?? 0 : 0;

    // no-op
    if (oldValue === value) return;

    let upDelta = 0;
    let downDelta = 0;
    let scoreDelta = 0;

    // remove old
    if (oldValue === 1) {
      upDelta -= 1;
      scoreDelta -= 1;
    }
    if (oldValue === -1) {
      downDelta -= 1;
      scoreDelta += 1;
    }

    // apply new
    if (value === 1) {
      upDelta += 1;
      scoreDelta += 1;
    }
    if (value === -1) {
      downDelta += 1;
      scoreDelta -= 1;
    }

    // IMPORTANT: Use FieldValue.increment to ensure atomicity and avoid race
    // conditions. Do NOT rely on reading `subSnap` values and adding to them
    // manually.
    tx.set(
      subRef,
      {
        voteUp: FieldValue.increment(upDelta),
        voteDown: FieldValue.increment(downDelta),
        voteScore: FieldValue.increment(scoreDelta),
      },
      {merge: true}
    );

    if (value === 0) {
      tx.delete(voteRef);
    } else {
      tx.set(
        voteRef,
        {
          value,
          updatedAt: Date.now(),
          createdAt: voteSnap.exists ?
            voteSnap.data()?.createdAt ?? Date.now() :
            Date.now(),
        },
        {merge: true}
      );
    }
  });

  return {ok: true};
});

// Callable (v2): update a submission with server-side validation
// and search field rebuild (single source of truth for search logic).
type UpdateSubmissionInput = {
  id?: string;
  patch?: {
    type?: string;
    title?: string;
    text?: string;
    meaning?: string;
    translation?: string;
    language?: string;
    origin?: string;
    source?: {
      name?: string;
      url?: string | null;
      notes?: string | null;
    };
  };
};

export const updateSubmission = onCall<UpdateSubmissionInput>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");
  await checkRateLimit(uid, "updateSubmission", 30, 3600);

  const id = String(request.data?.id ?? "").trim();
  if (!id) throw new HttpsError("invalid-argument", "Missing submission id.");

  // Read existing document
  const submissionRef = db.collection("submissions").doc(id);
  const snap = await submissionRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Submission not found.");
  const existing = snap.data()!;

  // Authorization: owner or admin
  const profileSnap = await db.collection("profiles").doc(uid).get();
  const profile = profileSnap.exists ? profileSnap.data() : null;
  const callerIsAdmin = profile?.isAdmin === true;
  if (existing.uid !== uid && !callerIsAdmin) {
    throw new HttpsError(
      "permission-denied",
      "You can only edit your own submissions."
    );
  }

  // Build sanitized patch from input (only editable fields)
  const raw = request.data?.patch ?? {};
  const patch: Record<string, unknown> = {};

  if (raw.type !== undefined) {
    const type = String(raw.type).trim();
    if (type !== "Proverb" && type !== "Poetry") {
      throw new HttpsError(
        "invalid-argument",
        "Type must be Proverb or Poetry."
      );
    }
    patch.type = type;
  }

  if (raw.text !== undefined) {
    const text = String(raw.text).trim();
    if (!text) {
      throw new HttpsError("invalid-argument", "Text is required.");
    }
    if (text.length > SUBMISSION_TEXT_MAX) {
      throw new HttpsError(
        "invalid-argument",
        `Text must be ${SUBMISSION_TEXT_MAX} characters or fewer.`
      );
    }
    patch.text = text;
  }

  if (raw.meaning !== undefined) {
    const meaning = String(raw.meaning).trim();
    if (meaning.length > SUBMISSION_MEANING_MAX) {
      throw new HttpsError(
        "invalid-argument",
        `Meaning must be ${SUBMISSION_MEANING_MAX} characters or fewer.`
      );
    }
    patch.meaning = meaning;
  }

  if (raw.translation !== undefined) {
    const translation = String(raw.translation).trim();
    if (translation.length > SUBMISSION_TRANSLATION_MAX) {
      throw new HttpsError(
        "invalid-argument",
        `Translation must be ${SUBMISSION_TRANSLATION_MAX} characters or fewer.`
      );
    }
    patch.translation = translation || null;
  }

  if (raw.language !== undefined) {
    const language = String(raw.language).trim().toLowerCase();
    if (language !== "so" && language !== "en") {
      throw new HttpsError(
        "invalid-argument",
        "Language must be en or so."
      );
    }
    patch.language = language;
  }

  if (raw.origin !== undefined) {
    const origin = String(raw.origin).trim();
    if (origin !== "original" && origin !== "shared" && origin !== "unknown") {
      throw new HttpsError(
        "invalid-argument",
        "Origin must be original, shared, or unknown."
      );
    }
    patch.origin = origin;
  }

  if (raw.source !== undefined) {
    const resolvedOrigin = (patch.origin ?? existing.origin) as string;
    if (resolvedOrigin === "shared") {
      const source = normalizeSource(raw.source);
      if (!source.name) {
        throw new HttpsError(
          "invalid-argument",
          "Source name is required."
        );
      }
      if (source.url && !isValidUrl(source.url)) {
        throw new HttpsError(
          "invalid-argument",
          "Source URL is invalid."
        );
      }
      patch.source = source;
    } else {
      patch.source = null;
    }
  }

  // No-op guard
  if (Object.keys(patch).length === 0) {
    return {ok: true, submission: {id, ...existing}};
  }

  // Resolve merged values for title validation and search rebuild.
  // Reading from the existing document fixes the bug where missing
  // patch fields would fall back to empty string.
  const resolvedType = (patch.type ?? existing.type) as SubmissionType;
  const resolvedTitle = String(
    patch.title !== undefined ? patch.title : (existing.title ?? "")
  ).trim();
  const resolvedText = String(patch.text ?? existing.text ?? "").trim();
  const resolvedMeaning = String(
    patch.meaning ?? existing.meaning ?? ""
  ).trim();

  // Title validation (depends on resolved type)
  if (raw.title !== undefined) {
    patch.title = String(raw.title).trim();
  }

  if (resolvedType === "Poetry") {
    const title = (patch.title !== undefined
      ? String(patch.title).trim()
      : resolvedTitle);
    if (!title) {
      throw new HttpsError(
        "invalid-argument",
        "Title is required for Poetry."
      );
    }
    if (title.length < SUBMISSION_TITLE_MIN) {
      throw new HttpsError(
        "invalid-argument",
        `Title must be at least ${SUBMISSION_TITLE_MIN} characters.`
      );
    }
    if (title.length > SUBMISSION_TITLE_MAX) {
      throw new HttpsError(
        "invalid-argument",
        `Title must be ${SUBMISSION_TITLE_MAX} characters or fewer.`
      );
    }
    patch.title = title;
  } else {
    // Proverbs have no title — clear it if type changed to Proverb
    if ("type" in patch) {
      patch.title = null;
    }
  }

  // Rebuild search fields from merged data (single source of truth)
  const contentChanged = ["title", "text", "meaning", "type"].some(
    (key) => key in patch
  );
  if (contentChanged) {
    const searchFields = buildSubmissionSearchFields({
      type: resolvedType,
      title: resolvedType === "Poetry" ? resolvedTitle : "",
      text: resolvedText,
      meaning: resolvedMeaning,
      username: (existing.username ?? null) as string | null,
    });
    patch.searchIndex = searchFields.searchIndex;
    patch.searchKeywords = searchFields.searchKeywords;
  }

  // Set metadata
  patch.updatedAt = Date.now();
  patch.updatedBy = uid;

  await submissionRef.update(patch);

  const merged = {...existing, ...patch, id};
  return {ok: true, submission: merged};
});
