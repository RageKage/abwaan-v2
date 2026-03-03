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
import { createSubmission as createSubmissionCallable, updateSubmissionCallable } from '@/data/functions/submissions'
import type {
  NewSubmissionInput,
  Submission,
  SubmissionStatus,
  SubmissionType,
} from '@/data/models/submission'

type SubmissionStatusFilter = SubmissionStatus | 'all'

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

export const updateSubmission = async (id: string, patch: Partial<Submission>): Promise<Submission> => {
  const result = await updateSubmissionCallable({
    id,
    patch: {
      ...(patch.type !== undefined && { type: patch.type }),
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.text !== undefined && { text: patch.text }),
      ...(patch.meaning !== undefined && { meaning: patch.meaning }),
      ...(patch.translation !== undefined && { translation: patch.translation }),
      ...(patch.language !== undefined && { language: patch.language }),
      ...(patch.origin !== undefined && { origin: patch.origin }),
      ...(patch.source !== undefined && { source: patch.source }),
    },
  })
  return result.submission
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
    skipPrefix = false,
    skipKeyword = false,
  }: {
    limit?: number
    status?: SubmissionStatusFilter
    lastPrefixDoc?: QueryDocumentSnapshot | null
    lastKeywordDoc?: QueryDocumentSnapshot | null
    skipPrefix?: boolean
    skipKeyword?: boolean
  } = {},
): Promise<{
  items: Submission[]
  lastPrefixDoc: QueryDocumentSnapshot | null
  lastKeywordDoc: QueryDocumentSnapshot | null
  hasMore: boolean
  prefixHasMore: boolean
  keywordHasMore: boolean
}> => {
  const normalizedTerm = term.trim().toLowerCase()
  if (!normalizedTerm) {
    return { items: [], lastPrefixDoc: null, lastKeywordDoc: null, hasMore: false, prefixHasMore: false, keywordHasMore: false }
  }

  const perQueryLimit = Math.max(1, Math.ceil(limit / 2))
  const statusFilter = status !== 'all' ? where('status', '==', status) : null

  // Build queries, skipping exhausted ones on loadMore
  const prefixPromise = skipPrefix
    ? Promise.resolve(null)
    : getDocs(
        query(collection(db, 'submissions'), ...[
          ...(statusFilter ? [statusFilter] : []),
          where('searchIndex', '>=', normalizedTerm),
          where('searchIndex', '<=', normalizedTerm + '\uf8ff'),
          orderBy('searchIndex'),
          limitResults(perQueryLimit),
          ...(lastPrefixDoc ? [startAfter(lastPrefixDoc)] : []),
        ]),
      )

  const keywordPromise = skipKeyword
    ? Promise.resolve(null)
    : getDocs(
        query(collection(db, 'submissions'), ...[
          ...(statusFilter ? [statusFilter] : []),
          where('searchKeywords', 'array-contains', normalizedTerm),
          limitResults(perQueryLimit),
          ...(lastKeywordDoc ? [startAfter(lastKeywordDoc)] : []),
        ]),
      )

  const [prefixSnap, keywordSnap] = await Promise.all([prefixPromise, keywordPromise])

  const resultMap = new Map<string, Submission>()
  prefixSnap?.docs.forEach((docSnap) => {
    resultMap.set(docSnap.id, normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))
  })
  keywordSnap?.docs.forEach((docSnap) => {
    if (!resultMap.has(docSnap.id)) {
      resultMap.set(docSnap.id, normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))
    }
  })

  const prefixHasMore = !skipPrefix && (prefixSnap?.docs.length ?? 0) === perQueryLimit
  const keywordHasMore = !skipKeyword && (keywordSnap?.docs.length ?? 0) === perQueryLimit
  const hasMore = prefixHasMore || keywordHasMore

  return {
    items: Array.from(resultMap.values()),
    lastPrefixDoc: prefixSnap?.docs[prefixSnap.docs.length - 1] ?? null,
    lastKeywordDoc: keywordSnap?.docs[keywordSnap.docs.length - 1] ?? null,
    hasMore,
    prefixHasMore,
    keywordHasMore,
  }
}

export const deleteSubmission = async (id: string): Promise<void> => {
  const submissionRef = doc(db, 'submissions', id)
  await deleteDoc(submissionRef)
}
