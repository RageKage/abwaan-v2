import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProfile, type UserProfile } from '@/data/firestore/profiles.repo'
import { listSubmissionsByAuthor } from '@/data/firestore/submissions.repo'
import type { Submission } from '@/data/models/submission'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

export const usePublicProfileStore = defineStore('publicProfile', () => {
  const profile = ref<UserProfile | null>(null)
  const submissions = ref<Submission[]>([])
  const lastDoc = ref<QueryDocumentSnapshot | null>(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)

  let activeUid: string | null = null

  const reset = () => {
    profile.value = null
    submissions.value = []
    lastDoc.value = null
    loading.value = false
    loadingMore.value = false
    error.value = null
  }

  const loadProfile = async (uid: string) => {
    if (!uid) return
    activeUid = uid
    loading.value = true
    error.value = null
    profile.value = null
    submissions.value = []
    lastDoc.value = null

    try {
      const [fetchedProfile, { items, lastDoc: newLastDoc }] = await Promise.all([
        getProfile(uid),
        listSubmissionsByAuthor(uid, 12),
      ])

      if (!fetchedProfile) {
        error.value = 'User not found'
        return
      }

      profile.value = fetchedProfile
      submissions.value = items
      lastDoc.value = newLastDoc
    } catch (err) {
      console.error('Error loading public profile:', err)
      error.value = 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (!activeUid || !lastDoc.value) return
    loadingMore.value = true
    try {
      const { items, lastDoc: newLastDoc } = await listSubmissionsByAuthor(activeUid, 12, lastDoc.value)
      submissions.value = [...submissions.value, ...items]
      lastDoc.value = newLastDoc
    } catch (err) {
      console.error('Error loading more submissions:', err)
    } finally {
      loadingMore.value = false
    }
  }

  return {
    profile,
    submissions,
    lastDoc,
    loading,
    loadingMore,
    error,
    reset,
    loadProfile,
    loadMore,
  }
})
