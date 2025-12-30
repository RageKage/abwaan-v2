import { defineStore } from 'pinia'
import { ref } from 'vue'
import { observeProfile, updateProfile, type UserProfile } from '@/data/firestore/profiles.repo'
import { listSubmissionsByAuthor } from '@/data/firestore/submissions.repo'
import type { Submission } from '@/data/models/submission'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile | null>(null)
  const submissions = ref<Submission[]>([])
  const lastDoc = ref<QueryDocumentSnapshot | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)

  let activeUid: string | null = null
  let unsubscribe: (() => void) | null = null
  let readyResolve: (() => void) | null = null
  let readyPromise: Promise<void> = Promise.resolve()

  const resetReady = () => {
    readyPromise = new Promise((resolve) => {
      readyResolve = resolve
    })
  }

  const start = (uid: string) => {
    if (activeUid === uid && unsubscribe) return
    stop()
    activeUid = uid
    busy.value = true
    error.value = null
    resetReady()
    unsubscribe = observeProfile(uid, (nextProfile) => {
      profile.value = nextProfile
      busy.value = false
      if (readyResolve) {
        readyResolve()
        readyResolve = null
      }
    })
  }

  const stop = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    activeUid = null
    profile.value = null
    submissions.value = []
    lastDoc.value = null
    busy.value = false
    error.value = null
    readyResolve = null
    readyPromise = Promise.resolve()
  }

  const fetchMySubmissions = async (loadMore = false) => {
    if (!activeUid) return

    if (!loadMore) {
      // Initial load: reset list
      submissions.value = []
      lastDoc.value = null
      busy.value = true
    } else {
      // Loading more: if no lastDoc, we might be at the end, or it's a mistake
      // but let's assume we proceed.
    }

    error.value = null

    try {
      const { items, lastDoc: newLastDoc } = await listSubmissionsByAuthor(
        activeUid,
        12, // Limit
        loadMore ? lastDoc.value : null,
        'all',
      )

      if (loadMore) {
        submissions.value = [...submissions.value, ...items]
      } else {
        submissions.value = items
      }

      lastDoc.value = newLastDoc
    } catch (err) {
      console.error('Failed to fetch user submissions:', err)
      error.value = 'Failed to load submissions'
    } finally {
      if (!loadMore) {
        busy.value = false
      }
    }
  }

  const save = async (data: Partial<UserProfile>) => {
    if (!activeUid) {
      error.value = 'No authenticated user'
      return
    }
    busy.value = true
    error.value = null
    try {
      await updateProfile(activeUid, data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      busy.value = false
    }
  }

  return {
    profile,
    submissions,
    lastDoc,
    busy,
    error,
    start,
    stop,
    save,
    fetchMySubmissions,
    waitForProfile: () => readyPromise,
  }
})
