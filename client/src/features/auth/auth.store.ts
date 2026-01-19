import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
  type User,
} from 'firebase/auth'
import { auth } from '@/data/firebase/client'
import { updateProfile as updateProfileDoc } from '@/data/firestore/profiles.repo'
import { useProfileStore } from '@/features/profile/profile.store'

let resolveAuthReady: (() => void) | null = null
const authReady = new Promise<void>((resolve) => {
  resolveAuthReady = resolve
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(auth.currentUser)
  const busy = ref(false)
  const error = ref<string | null>(null)
  const profileStore = useProfileStore()

  const setError = (err: unknown) => {
    if (err instanceof Error) {
      error.value = err.message
      return
    }
    error.value = 'Authentication failed'
  }

  const clearError = () => {
    error.value = null
  }

  const withStatus = async <T>(action: () => Promise<T>): Promise<T> => {
    busy.value = true
    error.value = null
    try {
      const result = await action()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      busy.value = false
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    const trimmedName = displayName?.trim() ?? ''
    const credential = await withStatus(() => createUserWithEmailAndPassword(auth, email, password))
    if (trimmedName) {
      await updateAuthProfile(credential.user, { displayName: trimmedName })
      await updateProfileDoc(credential.user.uid, { displayName: trimmedName })
    }
    return credential
  }

  const login = async (email: string, password: string) => {
    await withStatus(async () => {
      await signInWithEmailAndPassword(auth, email, password)
    })
  }

  const loginWithGoogle = async () => {
    const credential = await withStatus(async () => {
      const provider = new GoogleAuthProvider()
      return signInWithPopup(auth, provider)
    })
    return credential
  }

  const logout = async () => {
    await withStatus(async () => {
      await signOut(auth)
    })
  }

  let didInit = false

  async function initAuthListener() {
    if (didInit) return
    didInit = true

    // ensures login survives refresh/browser restart
    await setPersistence(auth, browserLocalPersistence)

    onAuthStateChanged(auth, (nextUser) => {
      user.value = nextUser
      if (nextUser) {
        profileStore.start(nextUser.uid)
      } else {
        profileStore.stop()
      }
      if (resolveAuthReady) {
        resolveAuthReady()
        resolveAuthReady = null
      }
    })
  }

  void initAuthListener()

  const waitForAuthReady = () => authReady

  return {
    user,
    busy,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    waitForAuthReady,
    clearError,
  }
})
