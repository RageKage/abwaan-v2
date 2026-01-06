import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Submission } from '@/data/models/submission'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { useAuthStore } from '@/features/auth/auth.store'
import { addFavorite, getFavorite, listFavoriteSubmissions, removeFavorite } from '@/data/firestore/favorites.repo'

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<Submission[]>([])
  const lastDoc = ref<QueryDocumentSnapshot | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)
  const favoriteIds = ref<Set<string>>(new Set())
  const statusLoaded = ref<Set<string>>(new Set())

  const hasFavorites = computed(() => items.value.length > 0)

  const setError = (err: unknown, fallback: string) => {
    error.value = err instanceof Error ? err.message : fallback
  }

  const reset = () => {
    items.value = []
    lastDoc.value = null
    favoriteIds.value = new Set()
    statusLoaded.value = new Set()
  }

  const isFavorited = (submissionId: string) => favoriteIds.value.has(submissionId)

  const markFavorite = (submissionId: string, value: boolean) => {
    const next = new Set(favoriteIds.value)
    if (value) {
      next.add(submissionId)
    } else {
      next.delete(submissionId)
    }
    favoriteIds.value = next
  }

  const markStatusLoaded = (submissionId: string) => {
    const next = new Set(statusLoaded.value)
    next.add(submissionId)
    statusLoaded.value = next
  }

  const ensureFavoriteStatus = async (submissionId: string) => {
    const authStore = useAuthStore()
    if (!authStore.user) return false
    if (statusLoaded.value.has(submissionId)) {
      return favoriteIds.value.has(submissionId)
    }

    try {
      const record = await getFavorite(authStore.user.uid, submissionId)
      const isSaved = Boolean(record)
      markFavorite(submissionId, isSaved)
      markStatusLoaded(submissionId)
      return isSaved
    } catch (err) {
      setError(err, 'Failed to check favorite status')
      return false
    }
  }

  const loadFavorites = async (loadMore = false) => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      reset()
      return
    }

    if (!loadMore) {
      busy.value = true
      items.value = []
      lastDoc.value = null
    }

    error.value = null
    try {
      const { items: newItems, lastDoc: newLastDoc } = await listFavoriteSubmissions({
        uid: authStore.user.uid,
        limit: 12,
        lastDoc: loadMore ? lastDoc.value : null,
      })

      if (loadMore) {
        items.value = [...items.value, ...newItems]
      } else {
        items.value = newItems
      }

      lastDoc.value = newLastDoc

      const nextIds = new Set(favoriteIds.value)
      const nextLoaded = new Set(statusLoaded.value)
      newItems.forEach((item) => nextIds.add(item.id))
      favoriteIds.value = nextIds
      newItems.forEach((item) => nextLoaded.add(item.id))
      statusLoaded.value = nextLoaded
    } catch (err) {
      setError(err, 'Failed to load favorites')
    } finally {
      if (!loadMore) {
        busy.value = false
      }
    }
  }

  const toggleFavorite = async (submission: Submission) => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('Please log in again.')
    }

    busy.value = true
    error.value = null

    const currentlySaved = isFavorited(submission.id)
    try {
      if (currentlySaved) {
        await removeFavorite(authStore.user.uid, submission.id)
        markFavorite(submission.id, false)
        items.value = items.value.filter((item) => item.id !== submission.id)
      } else {
        await addFavorite(authStore.user.uid, submission.id)
        markFavorite(submission.id, true)
        items.value = [submission, ...items.value.filter((item) => item.id !== submission.id)]
      }
      markStatusLoaded(submission.id)
    } catch (err) {
      setError(err, 'Failed to update favorites')
      throw err
    } finally {
      busy.value = false
    }
  }

  return {
    items,
    lastDoc,
    busy,
    error,
    hasFavorites,
    isFavorited,
    ensureFavoriteStatus,
    loadFavorites,
    toggleFavorite,
  }
})
