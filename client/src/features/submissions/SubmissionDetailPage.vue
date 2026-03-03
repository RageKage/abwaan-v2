<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import ChevronDownIcon from '@/shared/components/icons/ChevronDownIcon.vue'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'
import { useFavoritesStore } from '@/features/favorites/favorites.store'
import { createReport } from '@/data/firestore/reports.repo'
import type { ReportReason } from '@/data/models/report'
import type { LanguageCode, Submission, SubmissionOrigin, SubmissionType } from '@/data/models/submission'
import type { Comment } from '@/data/models/comment'
import {
  validateSubmissionDraft,
  type OriginType,
  type SubmissionDraft,
} from '@/features/submissions/submission.validation'
import {
  getAuthorName,
  getAuthorUsername,
  submissionAuthorInitial,
  formatSubmissionDate,
} from '@/shared/utils/submissions'
import { confirmAction, toastError, toastSuccess } from '@/shared/utils/alerts'
import EmptyState from '@/shared/components/EmptyState.vue'
import { useCommentsStore } from '@/features/submissions/comments.store'
import CommentForm from '@/features/submissions/CommentForm.vue'
import CommentList from '@/features/submissions/CommentList.vue'
const route = useRoute()
const router = useRouter()
const submissionsStore = useSubmissionsStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const favoritesStore = useFavoritesStore()
const commentsStore = useCommentsStore()

const submission = computed(() => submissionsStore.selected)
const userVote = computed(() => submissionsStore.userVote)
const isLoading = computed(() => submissionsStore.busy)
const loadError = ref<string | null>(null)

const authorName = computed(() => (submission.value ? getAuthorName(submission.value) : null))
const username = computed(() => (submission.value ? getAuthorUsername(submission.value) : null))

const isAuthor = computed(() => {
  return authStore.user && submission.value && authStore.user.uid === submission.value.uid
})

const isGuest = computed(() => !authStore.user)
const isAdmin = computed(() => profileStore.profile?.isAdmin === true)
const isFavorited = computed(() => (submission.value ? favoritesStore.isFavorited(submission.value.id) : false))
const commentBody = ref('')
const commentError = ref<string | null>(null)
const commentsLoadingMore = ref(false)
const canPostComment = computed(
  () =>
    !isGuest.value &&
    commentBody.value.trim().length > 0 &&
    commentBody.value.trim().length <= 2000 &&
    !commentsStore.saving,
)
const commentCountLabel = computed(() => {
  const count = commentsStore.items.length
  return `${count} Comment${count === 1 ? '' : 's'}`
})

const showReportModal = ref(false)
const reportReason = ref<ReportReason>('spam')
const reportDetails = ref('')
const reportDetailLimit = 2000
const reportDetailCount = computed(() => `${reportDetails.value.length}/${reportDetailLimit}`)
const reportBusy = ref(false)
const reportError = ref<string | null>(null)
const reportTriggerRef = ref<HTMLButtonElement | null>(null)
const reportReasonRef = ref<HTMLSelectElement | null>(null)
const reportDetailsRef = ref<HTMLTextAreaElement | null>(null)
const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or promotion' },
  { value: 'abuse', label: 'Abusive or hateful content' },
  { value: 'plagiarism', label: 'Plagiarism or stolen work' },
  { value: 'inaccurate', label: 'Inaccurate or misleading' },
  { value: 'other', label: 'Other' },
]

const isEditing = ref(false)
const showEditErrors = ref(false)
const editDraft = reactive<SubmissionDraft>({
  type: 'Proverb',
  title: '',
  text: '',
  meaning: '',
  translation: '',
  language: 'so',
  origin: 'original',
  source: {
    name: '',
    url: '',
    notes: '',
  },
})

const editValidation = computed(() => validateSubmissionDraft(editDraft))
const editErrors = computed(() => editValidation.value.errors)
const isEditPoetry = computed(() => editDraft.type === 'Poetry')
const showEditSource = computed(() => editDraft.origin === 'attributed')

const errorOrder = [
  'type',
  'title',
  'text',
  'meaning',
  'translation',
  'language',
  'origin',
  'source.name',
  'source.url',
  'source.notes',
]

const scrollToFirstError = (errs: Record<string, string>) => {
  for (const key of errorOrder) {
    if (errs[key]) {
      const el = document.querySelector(`[data-error-for="${key}"]`)
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      break
    }
  }
}

const normalizeLanguage = (value: string): LanguageCode => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'en' || normalized === 'so') return normalized
  return 'so'
}

const normalizeOrigin = (value: OriginType | ''): SubmissionOrigin => {
  if (value === 'attributed') return 'shared'
  if (value === 'original' || value === 'unknown') return value
  return 'unknown'
}

const toDraftOrigin = (origin: SubmissionOrigin): OriginType => {
  if (origin === 'shared') return 'attributed'
  if (origin === 'original' || origin === 'unknown') return origin
  return 'unknown'
}

const populateDraft = (data: Submission) => {
  editDraft.type = data.type
  editDraft.language = data.language
  editDraft.origin = toDraftOrigin(data.origin)
  editDraft.title = data.title ?? ''
  editDraft.text = data.text
  editDraft.meaning = data.meaning
  editDraft.translation = data.translation ?? ''
  editDraft.source = {
    name: data.source?.name ?? '',
    url: data.source?.url ?? '',
    notes: data.source?.notes ?? '',
  }
}

const buildEditPayload = () => {
  const type = editDraft.type as SubmissionType
  const language = normalizeLanguage(editDraft.language)
  const origin = normalizeOrigin(editDraft.origin)
  const title = type === 'Poetry' ? editDraft.title.trim() : ''
  const payload = {
    type,
    language,
    origin,
    title: type === 'Poetry' ? title || null : null,
    text: editDraft.text.trim(),
    meaning: editDraft.meaning.trim(),
    translation: editDraft.translation.trim() || null,
    source:
      origin === 'shared'
        ? {
            name: editDraft.source.name.trim(),
            url: editDraft.source.url.trim() || null,
            notes: editDraft.source.notes.trim() || null,
          }
        : null,
  }

  return payload
}

const sourcesEqual = (left: Submission['source'], right: Submission['source']) => {
  if (!left && !right) return true
  if (!left || !right) return false
  return left.name === right.name && left.url === right.url && left.notes === right.notes
}

const hasChanges = computed(() => {
  if (!submission.value) return false
  const payload = buildEditPayload()
  return (
    submission.value.type !== payload.type ||
    submission.value.language !== payload.language ||
    submission.value.origin !== payload.origin ||
    (submission.value.title ?? null) !== (payload.title ?? null) ||
    submission.value.text !== payload.text ||
    submission.value.meaning !== payload.meaning ||
    (submission.value.translation ?? null) !== (payload.translation ?? null) ||
    !sourcesEqual(submission.value.source, payload.source)
  )
})

const canSave = computed(() => editValidation.value.ok && hasChanges.value && !submissionsStore.busy)

const handleVote = (intendedValue: 1 | -1) => {
  if (isGuest.value) {
    router.push('/login')
    return
  }
  if (submission.value) {
    submissionsStore.vote(submission.value.id, intendedValue)
  }
}

const loadSubmission = async () => {
  const id = route.params.id
  if (typeof id !== 'string') {
    loadError.value = 'This link is invalid.'
    return
  }

  isEditing.value = false
  showEditErrors.value = false
  loadError.value = null
  commentBody.value = ''
  commentError.value = null
  await submissionsStore.loadById(id)
  if (submissionsStore.error) {
    loadError.value = 'We could not load this record. It may be private or missing.'
    return
  }
  if (!submissionsStore.selected) {
    loadError.value = 'Record not found.'
    return
  }
  await commentsStore.load(id)
  if (authStore.user) {
    await favoritesStore.ensureFavoriteStatus(id)
  }
}

const handleDelete = async () => {
  if (!submission.value) return
  const confirmed = await confirmAction('Delete Submission?', 'This cannot be undone.')
  if (!confirmed) return
  try {
    await submissionsStore.delete(submission.value.id)
    toastSuccess('Deleted')
    await router.push('/collections')
  } catch {
    toastError('Failed to delete')
  }
}

const handleShare = async () => {
  const url = window.location.href
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      toastSuccess('Link copied to clipboard')
      return
    }
  } catch {
    // Fall through to legacy clipboard handling.
  }

  try {
    const textArea = document.createElement('textarea')
    textArea.value = url
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    if (success) {
      toastSuccess('Link copied to clipboard')
      return
    }
  } catch {
    // Fall through to prompt fallback.
  }

  window.prompt('Copy this link', url)
  toastSuccess('Copy the link from the prompt.')
}

const handleToggleFavorite = async () => {
  if (!submission.value) return
  if (isGuest.value) {
    router.push('/login')
    return
  }
  try {
    await favoritesStore.toggleFavorite(submission.value)
    toastSuccess(isFavorited.value ? 'Saved to favorites' : 'Removed from favorites')
  } catch {
    toastError('Failed to update favorites')
  }
}

const openReportModal = () => {
  if (isGuest.value) {
    router.push('/login')
    return
  }
  reportReason.value = 'spam'
  reportDetails.value = ''
  reportError.value = null
  showReportModal.value = true
}

const closeReportModal = () => {
  reportError.value = null
  showReportModal.value = false
}

const handleReportKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeReportModal()
  }
}

const submitReport = async () => {
  if (!submission.value || !authStore.user) return
  reportBusy.value = true
  reportError.value = null
  try {
    await profileStore.waitForProfile()
    await createReport({
      submission: submission.value,
      reason: reportReason.value,
      details: reportDetails.value,
      reporterUid: authStore.user.uid,
      reporterUsername: profileStore.profile?.username ?? null,
    })
    toastSuccess('Report submitted. Thank you for helping protect the archive.')
    closeReportModal()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to submit report.'
    reportError.value = message
  } finally {
    reportBusy.value = false
  }
}

const startEdit = () => {
  if (!submission.value) return
  populateDraft(submission.value)
  showEditErrors.value = false
  isEditing.value = true
}

const cancelEdit = () => {
  if (submission.value) {
    populateDraft(submission.value)
  }
  showEditErrors.value = false
  isEditing.value = false
}

const saveEdit = async () => {
  if (!submission.value) return
  showEditErrors.value = true
  const result = validateSubmissionDraft(editDraft)
  if (!result.ok) {
    await nextTick()
    scrollToFirstError(result.errors)
    return
  }

  if (!hasChanges.value) {
    isEditing.value = false
    return
  }

  try {
    await submissionsStore.update(submission.value.id, buildEditPayload())
    toastSuccess('Submission updated')
    isEditing.value = false
  } catch {
    toastError('Failed to update submission')
  }
}

const submitComment = async () => {
  if (!submission.value) return
  const body = commentBody.value.trim()
  if (!body) return
  commentError.value = null
  try {
    await commentsStore.add(submission.value.id, body)
    commentBody.value = ''
  } catch {
    commentError.value = 'Unable to post comment.'
  }
}

const loadMoreComments = async () => {
  if (!submission.value) return
  if (commentsLoadingMore.value) return
  commentsLoadingMore.value = true
  await commentsStore.load(submission.value.id, true)
  commentsLoadingMore.value = false
}

const reloadComments = async () => {
  if (!submission.value) return
  await commentsStore.load(submission.value.id, false)
}

const canDeleteComment = (comment: Comment) => {
  return isAdmin.value || (!!authStore.user && comment.uid === authStore.user.uid)
}

const handleDeleteComment = async (comment: Comment) => {
  if (!submission.value) return
  const confirmed = await confirmAction('Delete comment?', 'This cannot be undone.')
  if (!confirmed) return
  try {
    await commentsStore.remove(submission.value.id, comment.id)
    toastSuccess('Comment deleted')
  } catch {
    toastError('Failed to delete comment')
  }
}

const handleModeration = async (nextStatus: 'published' | 'hidden') => {
  if (!submission.value) return
  const actionLabel = nextStatus === 'hidden' ? 'Hide Submission?' : 'Restore Submission?'
  const actionHint =
    nextStatus === 'hidden'
      ? 'This entry will be removed from public listings.'
      : 'This entry will be visible in public listings again.'
  const confirmed = await confirmAction(actionLabel, actionHint)
  if (!confirmed) return
  try {
    await submissionsStore.setStatus(submission.value.id, nextStatus)
    toastSuccess(nextStatus === 'hidden' ? 'Submission hidden' : 'Submission restored')
  } catch {
    toastError('Failed to update submission status')
  }
}

onMounted(() => {
  void loadSubmission()
})
watch(
  () => route.params.id,
  () => {
    void loadSubmission()
  },
)

watch(showReportModal, async (open) => {
  if (open) {
    document.addEventListener('keydown', handleReportKeydown)
    await nextTick()
    reportReasonRef.value?.focus() ?? reportDetailsRef.value?.focus()
    return
  }
  document.removeEventListener('keydown', handleReportKeydown)
  reportTriggerRef.value?.focus()
})
</script>

<template>
  <main class="page-shell app-surface dot-pattern">
    <div v-if="isLoading" class="flex h-[80vh] items-center justify-center border-t border-b border-gray-200">
      <div class="flex flex-col items-center gap-6">
        <div class="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-carrotOrange-500"></div>
        <p class="font-mono text-xs uppercase tracking-widest text-gray-400">Retrieving Record...</p>
      </div>
    </div>

    <div v-else-if="loadError">
      <EmptyState
        eyebrow="Submission"
        title="Record Unavailable"
        :description="loadError"
        primary-label="Try Again"
        :primary-action="loadSubmission"
        secondary-label="Browse Archive"
        secondary-to="/collections"
      />
    </div>

    <div v-else-if="submission" class="max-w-[1600px] mx-auto border-l border-r border-gray-200">
      <nav class="border-b border-gray-200 bg-gray-50 px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
          <router-link to="/collections" class="text-gray-400 hover:text-gray-900 transition-colors">
            Archive
          </router-link>
          <span class="text-gray-300">/</span>
          <span class="text-carrotOrange-600">{{ submission.type }}</span>
          <span class="text-gray-300">/</span>
          <span class="text-gray-900">ID: {{ submission.id.slice(0, 8) }}</span>
        </div>
        <div class="hidden md:flex flex-col items-end gap-1 text-[10px] font-mono text-gray-400">
          <span>RECORDED: {{ formatSubmissionDate(submission.createdAt) }}</span>
          <span v-if="submission.updatedAt">LAST EDITED: {{ formatSubmissionDate(submission.updatedAt) }}</span>
        </div>
      </nav>

      <div class="grid lg:grid-cols-12 min-h-screen">
        <div class="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
          <article v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" class="p-12 lg:p-20">
            <template v-if="!isEditing">
              <div class="mb-16">
                <div class="flex flex-wrap gap-4 mb-8">
                  <span
                    class="inline-block px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  >
                    {{ submission.language === 'so' ? 'Somali' : 'English' }}
                  </span>
                  <span
                    v-if="submission.origin !== 'original'"
                    class="inline-block px-3 py-1 border border-gray-200 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  >
                    {{ submission.origin }}
                  </span>
                </div>

                <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight text-gray-900 mb-8">
                  <span v-if="submission.type === 'Proverb'">{{ submission.text }}</span>
                  <span v-else>{{ submission.title || 'Untitled Piece' }}</span>
                </h1>

                <div v-if="submission.type === 'Poetry'" class="prose prose-xl prose-gray max-w-none">
                  <p
                    class="whitespace-pre-line font-serif leading-loose text-gray-600 italic border-l-2 border-carrotOrange-500 pl-8"
                  >
                    "{{ submission.text }}"
                  </p>
                </div>
              </div>

              <div
                v-if="submission.meaning || submission.translation"
                class="grid gap-12 pt-12 border-t border-gray-200"
              >
                <div v-if="submission.meaning" class="group">
                  <span class="block text-xs font-mono text-gray-400 mb-4">/// INTERPRETATION</span>
                  <p class="text-xl text-gray-800 font-light leading-relaxed">
                    {{ submission.meaning }}
                  </p>
                </div>

                <div v-if="submission.translation" class="group">
                  <span class="block text-xs font-mono text-gray-400 mb-4">/// ENGLISH TRANSLATION</span>
                  <p class="text-xl font-serif italic text-gray-500 leading-relaxed">"{{ submission.translation }}"</p>
                </div>
              </div>

              <div
                v-if="submission.origin && submission.origin !== 'original' && submission.source"
                class="mt-16 p-8 bg-gray-50 border-l-4 border-gray-200"
              >
                <span class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Historical Reference
                </span>
                <div class="grid gap-2">
                  <p class="text-lg font-serif text-gray-900">{{ submission.source.name }}</p>
                  <p v-if="submission.source.notes" class="text-sm text-gray-500 italic">
                    {{ submission.source.notes }}
                  </p>
                  <a
                    v-if="submission.source.url"
                    :href="submission.source.url"
                    target="_blank"
                    class="text-xs font-bold text-carrotOrange-600 uppercase tracking-wider hover:underline mt-2 inline-block"
                  >
                    View Source Material &rarr;
                  </a>
                </div>
              </div>
            </template>

            <form v-else @submit.prevent="saveEdit" class="space-y-12">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Edit Mode</span>
                <h2 class="text-3xl md:text-4xl font-serif text-gray-900 mt-3">Update this entry</h2>
                <p class="text-sm text-gray-500 mt-2">Changes stay published and update immediately.</p>
              </div>

              <div class="grid md:grid-cols-2 gap-8">
                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Category
                  </label>
                  <div class="relative">
                    <select
                      v-model="editDraft.type"
                      class="block w-full appearance-none bg-transparent border-b-2 border-gray-200 py-3 text-xl font-serif text-gray-900 focus:border-carrotOrange-500 focus:outline-none transition-colors cursor-pointer rounded-none"
                    >
                      <option value="Proverb">Proverb (Maahmaah)</option>
                      <option value="Poetry">Poetry (Gabay)</option>
                    </select>
                    <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>
                  <p
                    v-if="showEditErrors && editErrors.type"
                    data-error-for="type"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.type }}
                  </p>
                </div>

                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Language
                  </label>
                  <div class="relative">
                    <select
                      v-model="editDraft.language"
                      class="block w-full appearance-none bg-transparent border-b-2 border-gray-200 py-3 text-xl font-serif text-gray-900 focus:border-carrotOrange-500 focus:outline-none transition-colors cursor-pointer rounded-none"
                    >
                      <option value="">Select Language</option>
                      <option value="so">Somali</option>
                      <option value="en">English</option>
                    </select>
                    <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>
                  <p
                    v-if="showEditErrors && editErrors.language"
                    data-error-for="language"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.language }}
                  </p>
                </div>
              </div>

              <div class="space-y-8">
                <div v-if="isEditPoetry" class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title</label>
                  <input
                    v-model="editDraft.title"
                    type="text"
                    placeholder="Enter title..."
                    class="block w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-serif text-gray-900 placeholder:text-gray-200 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
                  />
                  <p
                    v-if="showEditErrors && editErrors.title"
                    data-error-for="title"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.title }}
                  </p>
                </div>

                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    {{ isEditPoetry ? 'Verses' : 'Proverb Text' }}
                  </label>
                  <textarea
                    v-model="editDraft.text"
                    rows="6"
                    placeholder="Begin writing here..."
                    class="block w-full resize-y bg-gray-50/30 p-6 text-xl md:text-2xl font-serif text-gray-900 placeholder:text-gray-300 border border-gray-200 focus:border-carrotOrange-500 focus:ring-1 focus:ring-carrotOrange-500 focus:outline-none transition-all leading-loose"
                  ></textarea>
                  <p
                    v-if="showEditErrors && editErrors.text"
                    data-error-for="text"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.text }}
                  </p>
                </div>
              </div>

              <div class="grid gap-8">
                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Hidden Meaning / Context
                  </label>
                  <textarea
                    v-model="editDraft.meaning"
                    rows="3"
                    placeholder="Explain the context..."
                    class="block w-full bg-transparent border-b border-gray-200 py-2 text-lg text-gray-700 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors resize-none rounded-none"
                  ></textarea>
                  <p
                    v-if="showEditErrors && editErrors.meaning"
                    data-error-for="meaning"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.meaning }}
                  </p>
                </div>

                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    English Translation
                  </label>
                  <textarea
                    v-model="editDraft.translation"
                    rows="3"
                    placeholder="Literal translation..."
                    class="block w-full bg-transparent border-b border-gray-200 py-2 text-lg text-gray-700 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors resize-none rounded-none"
                  ></textarea>
                  <p
                    v-if="showEditErrors && editErrors.translation"
                    data-error-for="translation"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.translation }}
                  </p>
                </div>
              </div>

              <div class="space-y-6 border-t border-gray-200 pt-8">
                <div class="group max-w-sm">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Origin Type
                  </label>
                  <div class="relative">
                    <select
                      v-model="editDraft.origin"
                      class="block w-full appearance-none bg-transparent border-b-2 border-gray-200 py-3 text-xl font-serif text-gray-900 focus:border-carrotOrange-500 focus:outline-none transition-colors cursor-pointer rounded-none"
                    >
                      <option value="">Select Origin</option>
                      <option value="original">Original (My own work)</option>
                      <option value="attributed">Attributed (Known author)</option>
                      <option value="unknown">Unknown (Folklore)</option>
                    </select>
                    <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDownIcon class="h-4 w-4" />
                    </div>
                  </div>
                  <p
                    v-if="showEditErrors && editErrors.origin"
                    data-error-for="origin"
                    class="mt-2 text-xs font-mono text-red-500 uppercase"
                  >
                    /// Error: {{ editErrors.origin }}
                  </p>
                </div>

                <transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="transform -translate-y-4 opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-4 opacity-0"
                >
                  <div v-if="showEditSource" class="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                    <div class="group">
                      <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Original Author Name
                      </label>
                      <input
                        v-model="editDraft.source.name"
                        type="text"
                        class="block w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:border-carrotOrange-500 focus:outline-none"
                      />
                      <p
                        v-if="showEditErrors && editErrors['source.name']"
                        data-error-for="source.name"
                        class="mt-2 text-xs font-mono text-red-500 uppercase"
                      >
                        /// Error: {{ editErrors['source.name'] }}
                      </p>
                    </div>

                    <div class="group">
                      <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Reference URL
                      </label>
                      <input
                        v-model="editDraft.source.url"
                        type="url"
                        class="block w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:border-carrotOrange-500 focus:outline-none"
                      />
                      <p
                        v-if="showEditErrors && editErrors['source.url']"
                        data-error-for="source.url"
                        class="mt-2 text-xs font-mono text-red-500 uppercase"
                      >
                        /// Error: {{ editErrors['source.url'] }}
                      </p>
                    </div>

                    <div class="group md:col-span-2">
                      <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        v-model="editDraft.source.notes"
                        rows="2"
                        class="block w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:border-carrotOrange-500 focus:outline-none resize-none"
                      ></textarea>
                      <p
                        v-if="showEditErrors && editErrors['source.notes']"
                        data-error-for="source.notes"
                        class="mt-2 text-xs font-mono text-red-500 uppercase"
                      >
                        /// Error: {{ editErrors['source.notes'] }}
                      </p>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-carrotOrange-500 transition-colors disabled:opacity-60"
                  :disabled="!canSave"
                >
                  {{ submissionsStore.busy ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </article>
        </div>

        <aside class="lg:col-span-4 bg-gray-50 flex flex-col h-full border-b border-gray-200">
          <div class="p-10 border-b border-gray-200 bg-white">
            <span class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Archived By</span>
            <router-link :to="`/p/${submission.uid}`" class="flex items-center gap-6 group">
              <div
                class="h-16 w-16 bg-gray-100 border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-carrotOrange-500 group-hover:text-white transition-colors duration-300"
              >
                {{ submissionAuthorInitial(submission) }}
              </div>
              <div>
                <p class="text-lg font-bold text-gray-900 group-hover:text-carrotOrange-600 transition-colors">
                  {{ authorName || 'Anonymous' }}
                </p>
                <p class="text-xs font-mono text-gray-400 mt-1">
                  {{ username ? '@' + username : 'Community Member' }}
                </p>
              </div>
            </router-link>
          </div>

          <div class="p-10 border-b border-gray-200 flex-1">
            <span class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
              Community Validation
            </span>

            <div class="flex items-center justify-between bg-white border border-gray-200 p-2">
              <button
                @click="handleVote(1)"
                :disabled="submissionsStore.busy || isGuest"
                class="flex-1 py-4 flex items-center justify-center hover:bg-green-50 text-gray-300 hover:text-green-600 transition-colors disabled:opacity-50"
                :class="{ 'text-green-600 bg-green-50': userVote === 1 }"
              >
                <span class="text-xl">▲</span>
              </button>

              <div class="px-6 py-2 border-x border-gray-200 font-mono text-2xl font-bold text-gray-900">
                {{ submission.voteScore }}
              </div>

              <button
                @click="handleVote(-1)"
                :disabled="submissionsStore.busy || isGuest"
                class="flex-1 py-4 flex items-center justify-center hover:bg-red-50 text-gray-300 hover:text-red-600 transition-colors disabled:opacity-50"
                :class="{ 'text-red-600 bg-red-50': userVote === -1 }"
              >
                <span class="text-xl">▼</span>
              </button>
            </div>
            <p class="text-[10px] text-gray-400 mt-4 text-center leading-relaxed">
              Vote to validate the authenticity and accuracy of this entry.
            </p>
          </div>

          <div class="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 bg-white">
            <button
              @click="handleShare"
              class="p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group"
            >
              <svg
                class="h-5 w-5 text-gray-400 group-hover:text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                Share ID
              </span>
            </button>
            <button
              @click="handleToggleFavorite"
              :disabled="favoritesStore.busy"
              class="p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group disabled:opacity-60"
            >
              <svg
                class="h-5 w-5"
                :class="isFavorited ? 'text-carrotOrange-600' : 'text-gray-400 group-hover:text-gray-900'"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
                />
              </svg>
              <span
                class="text-[10px] font-bold uppercase tracking-widest"
                :class="isFavorited ? 'text-carrotOrange-600' : 'text-gray-400 group-hover:text-gray-900'"
              >
                {{ isFavorited ? 'Saved' : 'Save' }}
              </span>
            </button>
            <button
              @click="openReportModal"
              ref="reportTriggerRef"
              class="p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group"
            >
              <svg
                class="h-5 w-5 text-gray-400 group-hover:text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 21v-8a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 4h6m-6 4h6m-6 4h6"
                />
              </svg>
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-red-600">
                Report
              </span>
            </button>
          </div>

          <div v-if="isAuthor" class="border-b border-gray-200 bg-white">
            <div class="flex items-center justify-between px-6 pt-6 text-[10px] font-bold uppercase tracking-widest">
              <span class="text-gray-400">Author Tools</span>
              <span v-if="submission.updatedAt" class="text-gray-500">Edited</span>
            </div>
            <div class="p-6">
              <button
                type="button"
                class="w-full py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                :class="
                  isEditing
                    ? 'bg-gray-900 text-white hover:bg-carrotOrange-500'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                "
                :disabled="submissionsStore.busy"
                @click="isEditing ? cancelEdit() : startEdit()"
              >
                {{ isEditing ? 'Exit Edit Mode' : 'Edit Submission' }}
              </button>
            </div>
          </div>

          <div v-if="isAdmin" class="border-b border-gray-200 bg-white">
            <div class="flex items-center justify-between px-6 pt-6 text-[10px] font-bold uppercase tracking-widest">
              <span class="text-gray-400">Moderation</span>
              <span class="text-gray-500">Status: {{ submission.status }}</span>
            </div>
            <div class="p-6">
              <button
                type="button"
                class="w-full py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                :class="
                  submission.status === 'hidden'
                    ? 'bg-gray-900 text-white hover:bg-carrotOrange-500'
                    : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                "
                @click="handleModeration(submission.status === 'hidden' ? 'published' : 'hidden')"
              >
                {{ submission.status === 'hidden' ? 'Restore Submission' : 'Hide Submission' }}
              </button>
            </div>
          </div>

          <div v-if="isAuthor" class="bg-red-50/30">
            <button
              @click="handleDelete"
              class="w-full p-6 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Permanently Delete
            </button>
          </div>
        </aside>
      </div>
      <section class="border-t border-gray-200 bg-white">
        <div class="grid lg:grid-cols-12 min-h-[600px]">
          <aside class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-8 lg:p-12">
            <div class="sticky top-12 space-y-8">
              <div>
                <h2 class="text-3xl font-serif text-gray-900 leading-tight">Discussion</h2>
              </div>

              <div class="w-12 h-[1px] bg-carrotOrange-500"></div>

              <div class="pt-8 border-t border-gray-200/50">
                <span class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Entries Loaded
                </span>
                <p class="font-mono text-3xl text-gray-900">{{ commentsStore.items.length }}</p>
                <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-2">
                  {{ commentCountLabel }}
                </p>
              </div>
            </div>
          </aside>

          <div class="lg:col-span-8 flex flex-col bg-white">
            <CommentForm
              v-model="commentBody"
              :is-guest="isGuest"
              :saving="commentsStore.saving"
              :can-post="canPostComment"
              :error="commentError"
              :max-length="2000"
              @submit="submitComment"
            />

            <CommentList
              :comments="commentsStore.items"
              :loading="commentsStore.loading"
              :error="commentsStore.error"
              :can-delete="canDeleteComment"
              :has-more="!!commentsStore.lastDoc"
              :loading-more="commentsLoadingMore"
              :show-end="commentsStore.items.length > 0"
              end-label="End of Ledger"
              @retry="reloadComments"
              @delete="handleDeleteComment"
              @load-more="loadMoreComments"
            />
          </div>
        </div>
      </section>
    </div>

    <div v-else class="flex h-[80vh] items-center justify-center border-t border-b border-gray-200">
      <div class="text-center">
        <h2 class="text-3xl font-serif text-gray-900 mb-6">404: Not Found</h2>
        <router-link
          to="/collections"
          class="px-8 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
        >
          Return to Archive
        </router-link>
      </div>
    </div>

    <div v-if="showReportModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6" @click.self="closeReportModal">
      <div
        class="w-full max-w-lg bg-white border border-gray-200 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div class="border-b border-gray-200 bg-gray-50 p-6">
          <h3 id="report-modal-title" class="text-2xl font-serif text-gray-900">Report Entry</h3>
          <p class="text-sm text-gray-500 mt-2">Help us keep the archive accurate and respectful.</p>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Reason</label>
            <select
              v-model="reportReason"
              ref="reportReasonRef"
              class="w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:border-carrotOrange-500 focus:outline-none"
            >
              <option v-for="reason in reportReasons" :key="reason.value" :value="reason.value">
                {{ reason.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              v-model="reportDetails"
              ref="reportDetailsRef"
              rows="4"
              :maxlength="reportDetailLimit"
              class="w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:border-carrotOrange-500 focus:outline-none"
              placeholder="Share any context that helps the review."
            ></textarea>
            <p class="mt-2 text-[10px] font-mono uppercase tracking-widest text-gray-400">
              {{ reportDetailCount }}
            </p>
          </div>

          <p v-if="reportError" class="text-[10px] font-mono uppercase tracking-widest text-red-500">
            /// Error: {{ reportError }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
              @click="closeReportModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-carrotOrange-500 transition-colors disabled:opacity-60"
              :disabled="reportBusy"
              @click="submitReport"
            >
              {{ reportBusy ? 'Submitting...' : 'Submit Report' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
