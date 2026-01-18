import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit as limitResults,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/data/firebase/client'
import type { FavoriteRecord } from '@/data/models/favorite'
import type { Submission } from '@/data/models/submission'
import { normalizeSubmission } from '@/data/firestore/submissions.repo'

const favoritesCollection = (uid: string) => collection(db, 'privateUsers', uid, 'favorites')

export const getFavorite = async (uid: string, submissionId: string): Promise<FavoriteRecord | null> => {
  const favoriteRef = doc(db, 'privateUsers', uid, 'favorites', submissionId)
  const snapshot = await getDoc(favoriteRef)
  if (!snapshot.exists()) return null
  return snapshot.data() as FavoriteRecord
}

export const addFavorite = async (uid: string, submissionId: string): Promise<void> => {
  const favoriteRef = doc(db, 'privateUsers', uid, 'favorites', submissionId)
  const payload: FavoriteRecord = {
    submissionId,
    savedAt: Date.now(),
  }
  await setDoc(favoriteRef, payload, { merge: true })
}

export const removeFavorite = async (uid: string, submissionId: string): Promise<void> => {
  const favoriteRef = doc(db, 'privateUsers', uid, 'favorites', submissionId)
  await deleteDoc(favoriteRef)
}

export const listFavoriteSubmissions = async ({
  uid,
  limit = 12,
  lastDoc = null,
}: {
  uid: string
  limit?: number
  lastDoc?: QueryDocumentSnapshot | null
}): Promise<{ items: Submission[]; lastDoc: QueryDocumentSnapshot | null }> => {
  const constraints: QueryConstraint[] = [orderBy('savedAt', 'desc'), limitResults(limit)]
  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const favoritesQuery = query(favoritesCollection(uid), ...constraints)
  const snapshot = await getDocs(favoritesQuery)
  const favorites = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as FavoriteRecord
    return {
      ...data,
      submissionId: data.submissionId ?? docSnap.id,
    } satisfies FavoriteRecord
  })

  const submissionIds = favorites.map((favorite) => favorite.submissionId).filter(Boolean)
  const submissionsById = new Map<string, Submission>()
  const batchSize = 10

  for (let index = 0; index < submissionIds.length; index += batchSize) {
    const batch = submissionIds.slice(index, index + batchSize)
    if (batch.length === 0) continue
    const submissionsQuery = query(collection(db, 'submissions'), where(documentId(), 'in', batch))
    const submissionsSnap = await getDocs(submissionsQuery)
    submissionsSnap.docs.forEach((docSnap) => {
      submissionsById.set(docSnap.id, normalizeSubmission(docSnap.id, docSnap.data() as Partial<Submission>))
    })
  }

  const items = favorites
    .map((favorite) => submissionsById.get(favorite.submissionId) ?? null)
    .filter((item): item is Submission => item !== null)

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null
  return { items, lastDoc: newLastDoc }
}
