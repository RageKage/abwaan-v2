import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as limitResults,
  orderBy,
  query,
  setDoc,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/data/firebase/client'
import type { FavoriteRecord } from '@/data/models/favorite'
import type { Submission } from '@/data/models/submission'
import { getSubmission } from '@/data/firestore/submissions.repo'

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
  const constraints = [orderBy('savedAt', 'desc'), limitResults(limit)]
  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const favoritesQuery = query(favoritesCollection(uid), ...constraints)
  const snapshot = await getDocs(favoritesQuery)
  const favorites = snapshot.docs.map(
    (docSnap) =>
      ({
        submissionId: docSnap.id,
        ...(docSnap.data() as FavoriteRecord),
      }) satisfies FavoriteRecord,
  )

  const submissions = await Promise.all(
    favorites.map(async (favorite) => {
      try {
        return await getSubmission(favorite.submissionId)
      } catch {
        return null
      }
    }),
  )

  const items = favorites
    .map((favorite, index) => submissions[index] ?? null)
    .filter((item): item is Submission => item !== null)

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null
  return { items, lastDoc: newLastDoc }
}
