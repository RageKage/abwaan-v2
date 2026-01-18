import {
  collection,
  doc,
  getDoc,
  getDocs,
  type QueryConstraint,
  updateDoc,
  limit as limitResults,
  orderBy,
  query,
  where,
  deleteDoc,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/data/firebase/client'
import { createSubmission as createSubmissionCallable } from '@/data/functions/submissions'
import type {
  NewSubmissionInput,
  Submission,
  SubmissionStatus,
  SubmissionType,
} from '@/data/models/submission'

type SubmissionStatusFilter = SubmissionStatus | 'all'
type SubmissionPublicFields = Partial<
  Pick<
    Submission,
    | 'title'
    | 'text'
    | 'meaning'
    | 'translation'
    | 'type'
    | 'language'
    | 'origin'
    | 'source'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
    | 'updatedBy'
    | 'searchIndex'
    | 'searchKeywords'
  >
>

const BANNED_KEYS = ['email', 'providerId', 'privateUsers', 'uid', 'username']

export const pickSubmissionPublicFields = (input: Record<string, unknown>): SubmissionPublicFields => {
  const allowedKeys = new Set([
    'title',
    'text',
    'meaning',
    'translation',
    'type',
    'language',
    'origin',
    'source',
    'status',
    'createdAt',
    'updatedAt',
    'updatedBy',
    'searchIndex',
    'searchKeywords',
  ])

  const bannedKeys = Object.keys(input).filter((key) => BANNED_KEYS.includes(key))
  if (import.meta.env.DEV && bannedKeys.length > 0) {
    console.warn('Ignoring banned keys in submission payload:', bannedKeys)
  }

  return Object.fromEntries(Object.entries(input).filter(([key]) => allowedKeys.has(key))) as SubmissionPublicFields
}

const SEARCH_KEYWORD_LIMIT = 60
const SEARCH_SOURCE_LIMIT = 600
const SEARCH_TOKEN_MIN = 2
const SEARCH_TOKEN_MAX = 24

export const buildSubmissionSearchFields = ({
  type,
  title,
  text,
  meaning,
  username,
}: {
  type: SubmissionType
  title: string
  text: string
  meaning: string
  username?: string | null
}) => {
  const normalizedTitle = title.trim()
  const normalizedText = text.trim()
  const normalizedMeaning = meaning.trim()
  const normalizedType = type.trim()

  const searchIndex = (normalizedType === 'Poetry' ? normalizedTitle : normalizedText).toLowerCase()

  const tokenize = (value: string) =>
    value
      .slice(0, SEARCH_SOURCE_LIMIT)
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length >= SEARCH_TOKEN_MIN && token.length <= SEARCH_TOKEN_MAX)

  const tokens = [
    normalizedType.toLowerCase(),
    ...(username ? [username.toLowerCase()] : []),
    ...tokenize(normalizedTitle),
    ...tokenize(normalizedText),
    ...tokenize(normalizedMeaning),
  ]

  const searchKeywords: string[] = []
  const seen = new Set<string>()
  for (const token of tokens) {
    if (seen.has(token)) continue
    seen.add(token)
    searchKeywords.push(token)
    if (searchKeywords.length >= SEARCH_KEYWORD_LIMIT) break
  }

  return { searchIndex, searchKeywords }
}

export const normalizeSubmission = (id: string, data: Partial<Submission>): Submission => {
  return {
    id,
    uid: data.uid ?? '',
    displayName: data.displayName ?? '',
    username: data.username ?? null,
    type: data.type ?? 'Proverb',
    language: data.language ?? 'so',
    origin: data.origin ?? 'unknown',
    status: data.status ?? 'published',
    statusChangedAt: data.statusChangedAt ?? null,
    statusChangedBy: data.statusChangedBy ?? null,
    statusReason: data.statusReason ?? null,
    title: data.title ?? null,
    text: data.text ?? '',
    meaning: data.meaning ?? '',
    translation: data.translation ?? null,
    source: data.source ?? null,
    createdAt: data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
    voteUp: data.voteUp ?? 0,
    voteDown: data.voteDown ?? 0,
    voteScore: data.voteScore ?? 0,
    reportCount: data.reportCount ?? 0,
    // Add searchable index field (normalized for case-insensitive search)
    searchIndex: data.searchIndex ?? '',
    searchKeywords: data.searchKeywords ?? [],
  }
}

export const createSubmission = async (input: NewSubmissionInput): Promise<Submission> => {
  const result = await createSubmissionCallable(input)
  return result.submission
}

export const listSubmissions = async ({
  type,
  language,
  status = 'published',
  sortBy = 'createdAt',
  order = 'desc',
  limit,
  lastDoc = null,
}: {
  type?: SubmissionType
  language?: string
  status?: SubmissionStatusFilter
  sortBy?: 'createdAt' | 'voteScore'
  order?: 'asc' | 'desc'
  limit?: number
  lastDoc?: QueryDocumentSnapshot | null
} = {}): Promise<{ items: Submission[]; lastDoc: QueryDocumentSnapshot | null }> => {
  const constraints: QueryConstraint[] = [orderBy(sortBy, order), limitResults(limit ?? 20)]
  if (status !== 'all') {
    constraints.unshift(where('status', '==', status))
  }
  if (type) {
    constraints.unshift(where('type', '==', type))
  }
  if (language) {
    constraints.unshift(where('language', '==', language))
  }
  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }
  const submissionsQuery = query(collection(db, 'submissions'), ...constraints)
  const snapshot = await getDocs(submissionsQuery)

  const items = snapshot.docs.map((docSnap) => normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null

  return { items, lastDoc: newLastDoc }
}

export const getSubmission = async (id: string): Promise<Submission | null> => {
  const submissionRef = doc(db, 'submissions', id)
  const snapshot = await getDoc(submissionRef)
  if (!snapshot.exists()) return null
  return normalizeSubmission(snapshot.id, snapshot.data() as Partial<Submission>)
}

export const updateSubmission = async (id: string, patch: Partial<Submission>): Promise<void> => {
  const publicPatch = pickSubmissionPublicFields(patch as unknown as Record<string, unknown>)
  delete publicPatch.createdAt
  delete publicPatch.status
  delete (publicPatch as Partial<Submission>).uid
  delete (publicPatch as Partial<Submission>).username
  delete (publicPatch as Partial<Submission>).displayName

  const shouldUpdateSearch = ['title', 'text', 'meaning', 'type'].some((key) => key in publicPatch)
  if (shouldUpdateSearch) {
    const type = (publicPatch.type ?? patch.type ?? 'Proverb') as SubmissionType
    const title = typeof publicPatch.title === 'string' ? publicPatch.title : ''
    const text = typeof publicPatch.text === 'string' ? publicPatch.text : ''
    const meaning = typeof publicPatch.meaning === 'string' ? publicPatch.meaning : ''
    const username = typeof patch.username === 'string' ? patch.username : null
    const searchFields = buildSubmissionSearchFields({ type, title, text, meaning, username })
    publicPatch.searchIndex = searchFields.searchIndex
    publicPatch.searchKeywords = searchFields.searchKeywords
  }

  if (!Object.keys(publicPatch).length) return

  const submissionRef = doc(db, 'submissions', id)
  await updateDoc(submissionRef, {
    ...publicPatch,
    updatedAt: Date.now(),
  })
}

export const updateSubmissionStatus = async (
  id: string,
  status: SubmissionStatus,
  options: { actorUid?: string | null; reason?: string | null } = {},
): Promise<void> => {
  const submissionRef = doc(db, 'submissions', id)
  await updateDoc(submissionRef, {
    status,
    statusChangedAt: Date.now(),
    statusChangedBy: options.actorUid ?? null,
    statusReason: options.reason ?? null,
  })
}

export const getSubmissionWithUserVote = async (
  id: string,
  uid: string | null,
): Promise<{ submission: Submission; userVote: 1 | 0 | -1 } | null> => {
  const submissionRef = doc(db, 'submissions', id)
  const voteRef = uid ? doc(db, 'submissions', id, 'votes', uid) : null

  const [submissionSnap, voteSnap] = await Promise.all([
    getDoc(submissionRef),
    voteRef ? getDoc(voteRef) : Promise.resolve(null),
  ])

  if (!submissionSnap.exists()) return null

  const submission = normalizeSubmission(submissionSnap.id, submissionSnap.data() as Partial<Submission>)
  const userVote = (voteSnap?.exists() ? (voteSnap.data()?.value ?? 0) : 0) as 1 | 0 | -1

  return { submission, userVote }
}

export const listSubmissionsByAuthor = async (
  uid: string,
  limit: number = 12,
  lastDoc: QueryDocumentSnapshot | null = null,
  status: SubmissionStatusFilter = 'published',
): Promise<{ items: Submission[]; lastDoc: QueryDocumentSnapshot | null }> => {
  const constraints: QueryConstraint[] = [where('uid', '==', uid), orderBy('createdAt', 'desc'), limitResults(limit)]

  if (status !== 'all') {
    constraints.splice(1, 0, where('status', '==', status))
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const submissionsQuery = query(collection(db, 'submissions'), ...constraints)
  const snapshot = await getDocs(submissionsQuery)

  const items = snapshot.docs.map((docSnap) => normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null

  return { items, lastDoc: newLastDoc }
}

export const searchSubmissions = async (
  term: string,
  {
    limit = 20,
    status = 'published',
    lastPrefixDoc = null,
    lastKeywordDoc = null,
  }: {
    limit?: number
    status?: SubmissionStatusFilter
    lastPrefixDoc?: QueryDocumentSnapshot | null
    lastKeywordDoc?: QueryDocumentSnapshot | null
  } = {},
): Promise<{
  items: Submission[]
  lastPrefixDoc: QueryDocumentSnapshot | null
  lastKeywordDoc: QueryDocumentSnapshot | null
  hasMore: boolean
}> => {
  const normalizedTerm = term.trim().toLowerCase()
  if (!normalizedTerm) {
    return { items: [], lastPrefixDoc: null, lastKeywordDoc: null, hasMore: false }
  }

  const perQueryLimit = Math.max(1, Math.ceil(limit / 2))
  const statusFilter = status !== 'all' ? where('status', '==', status) : null

  const prefixConstraints: QueryConstraint[] = [
    ...(statusFilter ? [statusFilter] : []),
    where('searchIndex', '>=', normalizedTerm),
    where('searchIndex', '<=', normalizedTerm + '\uf8ff'),
    orderBy('searchIndex'),
    limitResults(perQueryLimit),
  ]
  if (lastPrefixDoc) {
    prefixConstraints.push(startAfter(lastPrefixDoc))
  }

  const keywordConstraints: QueryConstraint[] = [
    ...(statusFilter ? [statusFilter] : []),
    where('searchKeywords', 'array-contains', normalizedTerm),
    limitResults(perQueryLimit),
  ]
  if (lastKeywordDoc) {
    keywordConstraints.push(startAfter(lastKeywordDoc))
  }

  const [prefixSnap, keywordSnap] = await Promise.all([
    getDocs(query(collection(db, 'submissions'), ...prefixConstraints)),
    getDocs(query(collection(db, 'submissions'), ...keywordConstraints)),
  ])

  const resultMap = new Map<string, Submission>()
  prefixSnap.docs.forEach((docSnap) => {
    resultMap.set(docSnap.id, normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))
  })
  keywordSnap.docs.forEach((docSnap) => {
    if (!resultMap.has(docSnap.id)) {
      resultMap.set(docSnap.id, normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))
    }
  })

  const hasMore = prefixSnap.docs.length === perQueryLimit || keywordSnap.docs.length === perQueryLimit
  const nextPrefixDoc = prefixSnap.docs[prefixSnap.docs.length - 1] ?? null
  const nextKeywordDoc = keywordSnap.docs[keywordSnap.docs.length - 1] ?? null

  return {
    items: Array.from(resultMap.values()),
    lastPrefixDoc: nextPrefixDoc,
    lastKeywordDoc: nextKeywordDoc,
    hasMore,
  }
}

export const deleteSubmission = async (id: string): Promise<void> => {
  const submissionRef = doc(db, 'submissions', id)
  await deleteDoc(submissionRef)
}
