import { httpsCallable } from 'firebase/functions'
import type { FirebaseError } from 'firebase/app'
import { functions } from '@/data/firebase/client'

type ClaimUsernameResult = { ok: boolean; username: string }

export const claimUsername = async (username: string): Promise<ClaimUsernameResult> => {
  try {
    const call = httpsCallable<{ username: string }, ClaimUsernameResult>(functions, 'claimUsername')
    const res = await call({ username })
    return res.data
  } catch (err) {
    const code = typeof (err as FirebaseError)?.code === 'string' ? (err as FirebaseError).code : ''
    const normalizedCode = code.replace('functions/', '')
    if (normalizedCode === 'already-exists') {
      throw new Error('That username is taken.')
    }
    if (normalizedCode === 'invalid-argument') {
      throw new Error('Username must be 3–20 characters and only letters, numbers, underscore.')
    }
    if (normalizedCode === 'unauthenticated') {
      throw new Error('Please log in again.')
    }
    throw err
  }
}
