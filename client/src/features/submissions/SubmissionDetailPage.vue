<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  getAuthorName,
  getAuthorUsername,
  submissionAuthorInitial,
  formatSubmissionDate
} from '@/shared/utils/submissions'
import { confirmAction, toastError, toastSuccess } from '@/shared/utils/alerts'
const route = useRoute()
const router = useRouter()
const submissionsStore = useSubmissionsStore()
const authStore = useAuthStore()

const submission = computed(() => submissionsStore.selected)
const userVote = computed(() => submissionsStore.userVote)
const isLoading = computed(() => submissionsStore.busy)
const error = computed(() => submissionsStore.error)

const authorName = computed(() => (submission.value ? getAuthorName(submission.value) : null))
const authorUsername = computed(() =>
  submission.value ? getAuthorUsername(submission.value) : null,
)

const isAuthor = computed(() => {
  return authStore.user && submission.value && authStore.user.uid === submission.value.uid
})

const isGuest = computed(() => !authStore.user)

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

const handleReport = () => {
  toastSuccess('Thank you for your report. Admins will review this entry.')
}

onMounted(() => { void loadSubmission() })
watch(() => route.params.id, () => { void loadSubmission() })
</script>

<template>
  <main class="min-h-screen w-full bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 font-sans selection:bg-carrotOrange-100 selection:text-carrotOrange-900 pb-24">

    <div v-if="isLoading" class="flex h-[80vh] items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-carrotOrange-500"></div>
        <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Archive...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex h-[80vh] items-center justify-center text-center">
      <div>
        <h2 class="text-2xl font-serif text-gray-900 mb-2">Item Unavailable</h2>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <button @click="loadSubmission" class="text-sm font-bold text-carrotOrange-600 hover:underline">Try Again</button>
      </div>
    </div>

    <div v-else-if="submission" class="max-w-7xl mx-auto">

      <nav class="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        <router-link to="/collections" class="hover:text-carrotOrange-600 transition-colors">Archive</router-link>
        <span class="text-gray-300">/</span>
        <span class="text-carrotOrange-600">{{ submission.type }}</span>
      </nav>

      <div class="grid lg:grid-cols-12 gap-8 items-start">

        <div class="lg:col-span-8 space-y-8">

          <article 
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <header class="mb-10">
              <div class="flex flex-wrap items-center gap-4 mb-6">
                 <span class="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold tracking-widest uppercase text-gray-500">
                    {{ submission.language === 'so' ? 'Somali' : 'English' }}
                 </span>
                 <span class="text-xs font-bold text-gray-300">•</span>
                 <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {{ formatSubmissionDate(submission.createdAt) }}
                 </span>
              </div>
              <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-gray-900 leading-[1.1] mb-2">
                <span v-if="submission.type === 'Proverb'">{{ submission.text }}</span>
                <span v-else>{{ submission.title || 'Untitled Piece' }}</span>
              </h1>
            </header>

            <div v-if="submission.type === 'Poetry'" class="prose prose-xl prose-gray max-w-none">
              <p class="whitespace-pre-line font-serif leading-loose text-gray-800 italic">
                "{{ submission.text }}"
              </p>
            </div>
          </article>

          <div v-if="submission.meaning || submission.translation || submission.source" class="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-gray-100">

             <div v-if="submission.meaning" class="mb-10">
                <h3 class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  <span class="w-2 h-2 rounded-full bg-carrotOrange-400"></span>
                  Interpretation
                </h3>
                <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {{ submission.meaning }}
                </p>
             </div>

             <div v-if="submission.translation" class="mb-10">
                <h3 class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                  English Translation
                </h3>
                <p class="text-xl font-serif italic text-gray-600 leading-relaxed">
                  "{{ submission.translation }}"
                </p>
             </div>

             <div v-if="submission.origin && submission.origin !== 'original'" class="pt-8 border-t border-gray-100">
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Origin & Source</h3>
                <div class="bg-gray-50 rounded-xl p-4 inline-block min-w-[50%]">
                   <p class="text-sm font-bold text-gray-900 capitalize mb-1">{{ submission.origin }}</p>
                   <div v-if="submission.source">
                      <p class="text-sm text-gray-600 font-medium">{{ submission.source.name }}</p>
                      <p v-if="submission.source.notes" class="text-xs text-gray-500 italic mt-1">{{ submission.source.notes }}</p>
                      <a v-if="submission.source.url" :href="submission.source.url" target="_blank" class="text-xs font-bold text-carrotOrange-600 hover:underline mt-2 inline-block">View Reference</a>
                   </div>
                </div>
             </div>
          </div>

        </div>

        <aside class="lg:col-span-4 lg:sticky lg:top-8">

          <div class="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

            <div class="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Contributed By</h3>
              <router-link :to="`/p/${submission.uid}`" class="flex items-center gap-4 group">
                <div class="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 group-hover:border-carrotOrange-300 transition-colors">
                  {{ submissionAuthorInitial(submission) }}
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900 group-hover:text-carrotOrange-700 transition-colors">
                    {{ authorName || 'Anonymous' }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ authorUsername ? '@' + authorUsername : 'Community Member' }}
                  </p>
                </div>
              </router-link>
            </div>

            <div class="p-6 border-b border-gray-100">
              <h3 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">Community Value</h3>
              <div class="flex items-center justify-between bg-gray-50 rounded-xl p-1">
                <button
                  @click="handleVote(1)"
                  :disabled="submissionsStore.busy || isGuest"
                  :class="['flex-1 py-3 rounded-lg flex items-center justify-center transition-all', userVote === 1 ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:bg-white hover:text-green-600']"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <div class="px-4 font-mono font-bold text-gray-900 text-lg">
                  {{ submission.voteScore }}
                </div>
                <button
                  @click="handleVote(-1)"
                  :disabled="submissionsStore.busy || isGuest"
                  :class="['flex-1 py-3 rounded-lg flex items-center justify-center transition-all', userVote === -1 ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:bg-white hover:text-red-600']"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>

            <div class="p-6 grid grid-cols-2 gap-3">

              <button @click="handleShare" class="col-span-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <svg class="h-5 w-5 text-gray-400 group-hover:text-carrotOrange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Share</span>
              </button>

              <button @click="handleReport" class="col-span-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                 <svg class="h-5 w-5 text-gray-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-8a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 4h6m-6 4h6m-6 4h6" /></svg>
                 <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900">Report</span>
              </button>

              <button
                v-if="isAuthor"
                @click="handleDelete"
                class="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-red-50 bg-red-50/50 hover:bg-red-100 transition-all group mt-2"
              >
                <svg class="h-4 w-4 text-red-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span class="text-[10px] font-bold uppercase tracking-widest text-red-400 group-hover:text-red-700">Delete Entry</span>
              </button>

            </div>

          </div>
        </aside>

      </div>
    </div>

    <div v-else class="flex h-[80vh] items-center justify-center">
      <div class="text-center">
        <h2 class="text-2xl font-serif text-gray-900 mb-4">Not Found</h2>
        <router-link to="/collections" class="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-carrotOrange-500 transition-colors">Back to Archive</router-link>
      </div>
    </div>

  </main>
</template>
