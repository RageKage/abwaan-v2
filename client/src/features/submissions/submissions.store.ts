import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NewSubmissionInput, Submission, SubmissionType } from '@/data/models/submission'
import {
  createSubmission,
  getSubmissionWithUserVote,
  listSubmissions,
  searchSubmissions,
  updateSubmission,
  deleteSubmission,
} from '@/data/firestore/submissions.repo'
import { voteSubmission } from '@/data/functions/votes'
import { useAuthStore } from '../auth/auth.store'
import { useProfileStore } from '../profile/profile.store'
import { toastError } from '@/shared/utils/alerts'

import type { QueryDocumentSnapshot } from 'firebase/firestore'

export const useSubmissionsStore = defineStore('submissions', () => {
  const items = ref<Submission[]>([])
  const selected = ref<Submission | null>(null)
  const userVote = ref<1 | 0 | -1 | null>(null)
  const lastDoc = ref<QueryDocumentSnapshot | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)

  const setError = (err: unknown, fallback: string) => {
    error.value = err instanceof Error ? err.message : fallback
  }

  const loadLatest = async (
    type?: SubmissionType,
    loadMore = false,
    sortBy: 'createdAt' | 'voteScore' = 'createdAt',
    language?: string,
  ) => {
    if (!loadMore) {
      busy.value = true
      items.value = []
      lastDoc.value = null
    }

    error.value = null
    try {
      const { items: newItems, lastDoc: newLastDoc } = await listSubmissions({
        type,
        language,
        sortBy,
        limit: 12,
        lastDoc: loadMore ? lastDoc.value : null,
      })

      if (loadMore) {
        items.value = [...items.value, ...newItems]
      } else {
        items.value = newItems
      }
      lastDoc.value = newLastDoc
    } catch (err) {
      setError(err, 'Failed to load submissions')
    } finally {
      if (!loadMore) {
        busy.value = false
      }
    }
  }

  const search = async (term: string) => {
    if (!term.trim()) {
      await loadLatest()
      return
    }
    busy.value = true
    error.value = null
    // Reset pagination state when searching
    lastDoc.value = null
    try {
      items.value = await searchSubmissions(term)
    } catch (err) {
      setError(err, 'Failed to search submissions')
    } finally {
      busy.value = false
    }
  }

  const loadById = async (id: string) => {
    const authStore = useAuthStore()
    busy.value = true
    error.value = null
    try {
      const result = await getSubmissionWithUserVote(id, authStore.user?.uid ?? null)
      if (result) {
        selected.value = result.submission
        userVote.value = result.userVote
      } else {
        selected.value = null
        userVote.value = null
      }
    } catch (err) {
      setError(err, 'Failed to load submission')
    } finally {
      busy.value = false
    }
  }

  const create = async (input: NewSubmissionInput) => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('Please log in again.')
    }

    const profileStore = useProfileStore()
    await profileStore.waitForProfile()

    busy.value = true
    error.value = null
    try {
      const created = await createSubmission(input, {
        uid: authStore.user.uid,
        displayName: authStore.user.displayName,
        email: authStore.user.email,
        profile: profileStore.profile,
      })
      selected.value = created
      items.value = [created, ...items.value.filter((item) => item.id !== created.id)]
      return created.id
    } catch (err) {
      setError(err, 'Failed to create submission')
      throw err
    } finally {
      busy.value = false
    }
  }

  const update = async (id: string, patch: Partial<Submission>) => {
    busy.value = true
    error.value = null
    try {
      await updateSubmission(id, patch)
      const patchWithTimestamp = { ...patch, updatedAt: Date.now() }
      if (selected.value?.id === id) {
        selected.value = { ...selected.value, ...patchWithTimestamp }
      }
      items.value = items.value.map((item) => (item.id === id ? { ...item, ...patchWithTimestamp } : item))
    } catch (err) {
      setError(err, 'Failed to update submission')
      throw err
    } finally {
      busy.value = false
    }
  }

  const vote = async (submissionId: string, intendedValue: 1 | -1) => {
    // 1. Check Auth
    const authStore = useAuthStore()
    if (!authStore.user) return

    // 2. Get Current State (Use .value)
    const currentVote = userVote.value ?? 0
    let finalValue: 0 | 1 | -1 = 0

    // 3. Determine New Vote (Toggle Logic)
    if (currentVote === intendedValue) {
      finalValue = 0 // Toggle Off (Remove Vote)
    } else {
      finalValue = intendedValue // New Vote or Switch
    }

    // 4. Optimistic UI Update
    if (selected.value && selected.value.id === submissionId) {
      // A. Remove the OLD vote from the counters
      if (currentVote === 1) selected.value.voteUp--
      if (currentVote === -1) selected.value.voteDown--

      // B. Add the NEW vote to the counters
      if (finalValue === 1) selected.value.voteUp++
      if (finalValue === -1) selected.value.voteDown++

      // C. Update the Total Score
      // Calculate difference (e.g., switching -1 to 1 is a +2 difference)
      const difference = finalValue - currentVote
      selected.value.voteScore += difference
    }

    // 5. Update User State (Crucial: Fixes button color)
    userVote.value = finalValue

    // 6. API Call
    try {
      await voteSubmission(submissionId, finalValue)
    } catch {
      // Rollback changes if server fails
      toastError('Vote failed')

      // Revert user state
      userVote.value = currentVote as 0 | 1 | -1

      // Revert counters/score (Simplified rollback)
      if (selected.value && selected.value.id === submissionId) {
        const revertDiff = currentVote - finalValue
        selected.value.voteScore += revertDiff

        // Revert counters logic (inverse of above)
        if (finalValue === 1) selected.value.voteUp--
        if (finalValue === -1) selected.value.voteDown--
        if (currentVote === 1) selected.value.voteUp++
        if (currentVote === -1) selected.value.voteDown++
      }
    }
  }

  const _delete = async (id: string) => {
    busy.value = true
    error.value = null
    try {
      await deleteSubmission(id)
      items.value = items.value.filter((item) => item.id !== id)
      if (selected.value?.id === id) {
        selected.value = null
      }
    } catch (err) {
      setError(err, 'Failed to delete submission')
      throw err
    } finally {
      busy.value = false
    }
  }

  return {
    items,
    selected,
    userVote,
    lastDoc,
    busy,
    error,
    loadLatest,
    search,
    loadById,
    create,
    update,
    vote,
    delete: _delete,
  }
})
