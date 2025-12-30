import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/data/firebase/client'

export interface UserProfile {
  displayName: string
  username: string | null
  bio: string
  photoURL: string | null
  createdAt: number
  lastLoginAt: number | null
  submissionCount: number
}

export const getProfile = async (uid: string): Promise<UserProfile | null> => {
  const profileRef = doc(db, 'profiles', uid)
  const snapshot = await getDoc(profileRef)
  if (!snapshot.exists()) {
    return null
  }
  return snapshot.data() as UserProfile
}

export const observeProfile = (uid: string, cb: (profile: UserProfile | null) => void) => {
  const profileRef = doc(db, 'profiles', uid)
  return onSnapshot(profileRef, (snapshot) => {
    if (!snapshot.exists()) {
      cb(null)
      return
    }
    cb(snapshot.data() as UserProfile)
  })
}

export const updateProfile = async (uid: string, data: Partial<UserProfile>) => {
  const profileRef = doc(db, 'profiles', uid)
  await setDoc(profileRef, data, { merge: true })
}
