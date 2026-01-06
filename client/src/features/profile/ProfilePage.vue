<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { claimUsername } from '@/data/functions/usernames'
import { useProfileStore } from '@/features/profile/profile.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
import { toastError, toastSuccess } from '@/shared/utils/alerts'
const profileStore = useProfileStore()

const displayName = ref('')
const bio = ref('')
const usernameInput = ref('')

const claimBusy = ref(false)
const claimError = ref<string | null>(null)
const isLoadingMore = ref(false)

const isLoading = computed(() => profileStore.busy && !profileStore.profile)
const joinedLabel = computed(() => {
  const createdAt = profileStore.profile?.createdAt
  if (!createdAt) return 'Joined: —'
  const date = new Date(createdAt)
  return `Joined: ${date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`
})
const contributionCount = computed(() => {
  const total = profileStore.profile?.submissionCount
  if (typeof total === 'number') return total
  return profileStore.submissions.length
})

watch(
  () => profileStore.profile,
  (profile) => {
    if (!profile) return
    displayName.value = profile.displayName
    bio.value = profile.bio
  },
  { immediate: true },
)

const handleSave = async () => {
  const trimmedName = displayName.value.trim()
  const trimmedBio = bio.value.trim()
  try {
    await profileStore.save({ displayName: trimmedName, bio: trimmedBio })
    toastSuccess('Profile updated')
  } catch {
    toastError('Failed to update profile')
  }
}

const handleClaimUsername = async () => {
  const trimmed = usernameInput.value.trim()
  if (!trimmed) {
    claimError.value = 'Username is required.'
    return
  }
  claimBusy.value = true
  claimError.value = null
  try {
    await claimUsername(trimmed)
    usernameInput.value = ''
  } catch (err) {
    claimError.value = err instanceof Error ? err.message : 'Failed to claim username.'
  } finally {
    claimBusy.value = false
  }
}

const handleLoadMore = async () => {
  isLoadingMore.value = true
  try {
    await profileStore.fetchMySubmissions(true)
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(() => {
  void profileStore.fetchMySubmissions()
})
</script>

<template>
  <main
    class="relative w-full min-h-screen bg-gray-50 dot-pattern pt-24 font-sans text-gray-900 transition-all duration-300"
  >
    <div v-if="isLoading" class="flex h-[80vh] items-center justify-center border-t border-b border-gray-200">
      <div class="flex flex-col items-center gap-6">
        <div class="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-carrotOrange-500"></div>
        <p class="font-mono text-xs uppercase tracking-widest text-gray-400">Loading Preferences...</p>
      </div>
    </div>

    <div v-else class="max-w-[1600px] mx-auto border-l border-r border-gray-200">
      <div class="grid lg:grid-cols-12 border-b border-gray-200">
        <div class="lg:col-span-12 p-12 lg:p-20 bg-gray-50">
          <div class="max-w-3xl">
            <span
              class="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit"
            >
              Settings
            </span>
            <h1 class="text-5xl md:text-7xl font-serif tracking-tighter text-gray-900 mb-6">Archive Identity.</h1>
            <p class="text-xl text-gray-500 font-light leading-relaxed">Manage how you are seen in the registry.</p>
            <div class="mt-6 flex flex-wrap gap-6 text-[10px] font-mono uppercase tracking-widest text-gray-400">
              <span>{{ joinedLabel }}</span>
              <span>Total Contributions: {{ contributionCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-12 border-b border-gray-200">
        <div class="lg:col-span-4 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
          <span class="text-xs font-mono text-gray-400 block mb-2">01. Identity</span>
          <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Personal Details</h3>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed">This information is visible on your public dossier.</p>
        </div>

        <div class="lg:col-span-8 p-10 lg:p-12 bg-white flex flex-col justify-between gap-12">
          <div class="space-y-10">
            <div class="group">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Display Name
              </label>
              <input
                v-model="displayName"
                type="text"
                placeholder="e.g. Arawelo"
                autocomplete="name"
                class="block w-full bg-transparent border-b-2 border-gray-200 py-3 text-2xl font-serif text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
              />
            </div>

            <div class="group">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Biography</label>
              <textarea
                v-model="bio"
                rows="4"
                placeholder="Tell the community about yourself..."
                class="block w-full resize-none bg-transparent border-b border-gray-200 py-3 text-lg text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-between pt-6 border-gray-200">
            <p v-if="profileStore.error" class="text-xs font-mono font-bold text-red-500 uppercase">
              /// Error: {{ profileStore.error }}
            </p>
            <div v-else></div>

            <button
              type="button"
              :disabled="profileStore.busy"
              class="px-8 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleSave"
            >
              <span v-if="profileStore.busy">Updating...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-12 border-b border-gray-200">
        <div class="lg:col-span-4 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
          <span class="text-xs font-mono text-gray-400 block mb-2">02. Official Handle</span>
          <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Unique ID</h3>
          <p class="mt-4 text-sm text-gray-500 leading-relaxed">
            Your unique signature in the archive. Once claimed, it cannot be changed.
          </p>
        </div>

        <div class="lg:col-span-8 p-10 lg:p-12 bg-white flex items-center">
          <div v-if="profileStore.profile?.username" class="w-full">
            <div class="flex items-center justify-between p-6 bg-green-50 border border-green-100">
              <div>
                <span class="block text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">
                  Status: Active
                </span>
                <span class="text-2xl font-mono font-bold text-gray-900">@{{ profileStore.profile.username }}</span>
              </div>
              <div class="h-10 w-10 rounded-full bg-white flex items-center justify-center text-green-500">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div v-else class="w-full space-y-6">
            <div class="flex flex-col sm:flex-row gap-0 border border-gray-200">
              <div class="relative flex-grow">
                <div
                  class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-bold"
                >
                  @
                </div>
                <input
                  v-model="usernameInput"
                  type="text"
                  placeholder="username"
                  class="block w-full bg-white py-4 pl-10 pr-4 text-lg font-mono text-gray-900 focus:bg-gray-50 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                :disabled="claimBusy"
                class="sm:w-auto w-full px-8 py-4 bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 border-t sm:border-t-0 sm:border-l border-gray-200"
                @click="handleClaimUsername"
              >
                {{ claimBusy ? 'Checking...' : 'Claim Handle' }}
              </button>
            </div>

            <p v-if="claimError" class="text-xs font-mono font-bold text-red-500 uppercase">
              /// Error: {{ claimError }}
            </p>
            <p v-else class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              * Warning: Permanent Action
            </p>
          </div>
        </div>
      </div>

      <div class="border-b border-gray-200 bg-gray-50 px-10 py-6 border-l lg:border-l-0">
        <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-carrotOrange-500"></span>
          Your Contributions
        </h2>
      </div>

      <div v-if="profileStore.submissions.length > 0">
        <div
          class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 bg-white"
        >
          <div
            v-for="(submission, index) in profileStore.submissions"
            :key="submission.id"
            class="hover:bg-gray-50 transition-colors duration-300"
          >
            <SubmissionCard :submission="submission" :index="index" />
          </div>
        </div>

        <div class="bg-white">
          <LoadMore :has-more="!!profileStore.lastDoc" :loading="isLoadingMore" @load-more="handleLoadMore" />

          <div v-if="!profileStore.busy && !profileStore.lastDoc" class="py-[32px] flex justify-center opacity-40">
            <div class="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
              <span class="h-px w-8 bg-gray-300"></span>
              <span>End of Archive</span>
              <span class="h-px w-8 bg-gray-300"></span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="py-32 flex flex-col items-center justify-center text-center border-b border-gray-200 bg-white">
        <div class="mb-6 opacity-20 text-gray-300">
          <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-serif text-gray-900 mb-2">Archive Empty</h3>
        <p class="text-gray-500 font-light text-sm tracking-wide max-w-xs mx-auto mb-8">
          You haven't shared any wisdom or poetry yet.
        </p>
        <router-link
          to="/contribute"
          class="px-8 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
        >
          Create First Entry
        </router-link>
      </div>
    </div>
  </main>
</template>
