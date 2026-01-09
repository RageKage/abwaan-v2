import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as limitResults,
  orderBy,
  query,
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/data/firebase/client'
import type { Comment } from '@/data/models/comment'

const commentsCollection = (submissionId: string) => collection(db, 'submissions', submissionId, 'comments')

const normalizeComment = (id: string, data: Partial<Comment>): Comment => {
  return {
    id,
    submissionId: data.submissionId ?? '',
    uid: data.uid ?? '',
    displayName: data.displayName ?? '',
    username: data.username ?? null,
    body: data.body ?? '',
    createdAt: data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt ?? null,
  }
}

export const createComment = async ({
  submissionId,
  body,
  uid,
  displayName,
  username,
}: {
  submissionId: string
  body: string
  uid: string
  displayName: string
  username: string | null
}): Promise<Comment> => {
  const payload: Omit<Comment, 'id'> = {
    submissionId,
    uid,
    displayName,
    username,
    body: body.trim(),
    createdAt: Date.now(),
    updatedAt: null,
  }

  const docRef = await addDoc(commentsCollection(submissionId), payload)
  return normalizeComment(docRef.id, payload)
}

export const listComments = async ({
  submissionId,
  limit = 12,
  lastDoc = null,
}: {
  submissionId: string
  limit?: number
  lastDoc?: QueryDocumentSnapshot | null
}): Promise<{ items: Comment[]; lastDoc: QueryDocumentSnapshot | null }> => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]
  if (limit) {
    constraints.push(limitResults(limit))
  }
  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const commentsQuery = query(commentsCollection(submissionId), ...constraints)
  const snapshot = await getDocs(commentsQuery)
  const items = snapshot.docs.map((docSnap) => normalizeComment(docSnap.id, docSnap.data() as Partial<Comment>))
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null

  return { items, lastDoc: newLastDoc }
}

export const deleteComment = async (submissionId: string, id: string): Promise<void> => {
  const commentRef = doc(db, 'submissions', submissionId, 'comments', id)
  await deleteDoc(commentRef)
}
