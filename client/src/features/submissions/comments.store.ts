import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import type { Comment } from '@/data/models/comment'
import { createComment, deleteComment, listComments } from '@/data/firestore/comments.repo'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'

export const useCommentsStore = defineStore('comments', () => {
  const items = ref<Comment[]>([])
  const lastDoc = shallowRef<QueryDocumentSnapshot | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const activeSubmissionId = ref<string | null>(null)

  const reset = () => {
    items.value = []
    lastDoc.value = null
    error.value = null
  }

  const load = async (submissionId: string, loadMore = false) => {
    if (!submissionId) return
    if (activeSubmissionId.value !== submissionId) {
      activeSubmissionId.value = submissionId
      loadMore = false
    }

    if (!loadMore) {
      reset()
      loading.value = true
    }

    error.value = null
    try {
      const { items: newItems, lastDoc: newLastDoc } = await listComments({
        submissionId,
        limit: 12,
        lastDoc: loadMore ? lastDoc.value : null,
      })

      if (loadMore) {
        items.value = [...items.value, ...newItems]
      } else {
        items.value = newItems
      }
      lastDoc.value = newLastDoc
    } catch {
      error.value = 'Failed to load comments'
    } finally {
      if (!loadMore) {
        loading.value = false
      }
    }
  }

  const add = async (submissionId: string, body: string) => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('Please log in again.')
    }

    const profileStore = useProfileStore()
    await profileStore.waitForProfile()

    const displayName =
      profileStore.profile?.displayName || authStore.user.displayName || authStore.user.email || 'Anonymous'
    const username = profileStore.profile?.username ?? null

    saving.value = true
    error.value = null
    try {
      const comment = await createComment({
        submissionId,
        body,
        uid: authStore.user.uid,
        displayName,
        username,
      })
      items.value = [comment, ...items.value]
      return comment
    } catch {
      throw new Error('Failed to post comment')
    } finally {
      saving.value = false
    }
  }

  const remove = async (submissionId: string, commentId: string) => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('Please log in again.')
    }

    saving.value = true
    error.value = null
    try {
      await deleteComment(submissionId, commentId)
      items.value = items.value.filter((item) => item.id !== commentId)
    } catch {
      throw new Error('Failed to delete comment')
    } finally {
      saving.value = false
    }
  }

  return {
    items,
    lastDoc,
    loading,
    saving,
    error,
    load,
    add,
    remove,
  }
})
