<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'
import { createReport } from '@/data/firestore/reports.repo'
import type { ReportReason } from '@/data/models/report'
import {
  getAuthorName,
  getAuthorUsername,
  submissionAuthorInitial,
  formatSubmissionDate,
} from '@/shared/utils/submissions'
import { confirmAction, toastError, toastSuccess } from '@/shared/utils/alerts'
const route = useRoute()
const router = useRouter()
const submissionsStore = useSubmissionsStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const submission = computed(() => submissionsStore.selected)
const userVote = computed(() => submissionsStore.userVote)
const isLoading = computed(() => submissionsStore.busy)
const error = computed(() => submissionsStore.error)

const authorName = computed(() => (submission.value ? getAuthorName(submission.value) : null))
const username = computed(() => (submission.value ? getAuthorUsername(submission.value) : null))

const isAuthor = computed(() => {
  return authStore.user && submission.value && authStore.user.uid === submission.value.uid
})

const isGuest = computed(() => !authStore.user)
const isAdmin = computed(() => profileStore.profile?.isAdmin === true)

const showReportModal = ref(false)
const reportReason = ref<ReportReason>('spam')
const reportDetails = ref('')
const reportBusy = ref(false)
const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or promotion' },
  { value: 'abuse', label: 'Abusive or hateful content' },
  { value: 'plagiarism', label: 'Plagiarism or stolen work' },
  { value: 'inaccurate', label: 'Inaccurate or misleading' },
  { value: 'other', label: 'Other' },
]

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
  if (typeof id === 'string') {
    await submissionsStore.loadById(id)
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

const handleShare = () => {
  navigator.clipboard.writeText(window.location.href)
  toastSuccess('Link copied to clipboard')
}

const openReportModal = () => {
  if (isGuest.value) {
    router.push('/login')
    return
  }
  reportReason.value = 'spam'
  reportDetails.value = ''
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
}

const submitReport = async () => {
  if (!submission.value || !authStore.user) return
  reportBusy.value = true
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
  } catch {
    toastError('Failed to submit report.')
  } finally {
    reportBusy.value = false
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
</script>

<template>
  <main
    class="relative w-full min-h-screen bg-gray-50 dot-pattern pt-24 font-sans text-gray-900 transition-all duration-300"
  >
    <div v-if="isLoading" class="flex h-[80vh] items-center justify-center border-t border-b border-gray-200">
      <div class="flex flex-col items-center gap-6">
        <div class="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-carrotOrange-500"></div>
        <p class="font-mono text-xs uppercase tracking-widest text-gray-400">Retrieving Record...</p>
      </div>
    </div>

    <div
      v-else-if="error"
      class="flex h-[80vh] items-center justify-center text-center border-t border-b border-gray-200"
    >
      <div class="max-w-md p-12 border border-gray-200 bg-gray-50">
        <h2 class="text-3xl font-serif text-gray-900 mb-4">Record Unavailable</h2>
        <p class="text-gray-500 mb-8 font-light">{{ error }}</p>
        <button
          @click="loadSubmission"
          class="px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
        >
          Try Again
        </button>
      </div>
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
        <div class="hidden md:block text-[10px] font-mono text-gray-400">
          RECORDED: {{ formatSubmissionDate(submission.createdAt) }}
        </div>
      </nav>

      <div class="grid lg:grid-cols-12 min-h-screen">
        <div class="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
          <article v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" class="p-12 lg:p-20">
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

            <div v-if="submission.meaning || submission.translation" class="grid gap-12 pt-12 border-t border-gray-200">
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
                <p v-if="submission.source.notes" class="text-sm text-gray-500 italic">{{ submission.source.notes }}</p>
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

          <div class="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200 bg-white">
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
              @click="openReportModal"
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
      <div class="border-gray-200 p-12"></div>
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

    <div
      v-if="showReportModal"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6"
      @click.self="closeReportModal"
    >
      <div class="w-full max-w-lg bg-white border border-gray-200 shadow-xl">
        <div class="border-b border-gray-200 bg-gray-50 p-6">
          <h3 class="text-2xl font-serif text-gray-900">Report Entry</h3>
          <p class="text-sm text-gray-500 mt-2">Help us keep the archive accurate and respectful.</p>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Reason</label>
            <select
              v-model="reportReason"
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
              rows="4"
              class="w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:border-carrotOrange-500 focus:outline-none"
              placeholder="Share any context that helps the review."
            ></textarea>
          </div>

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
