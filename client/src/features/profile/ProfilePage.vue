<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { claimUsername } from '@/data/functions/usernames'
import { useProfileStore } from '@/features/profile/profile.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
const profileStore = useProfileStore()

const displayName = ref('')
const bio = ref('')
const usernameInput = ref('')

const claimBusy = ref(false)
const claimError = ref<string | null>(null)
const isLoadingMore = ref(false)

const isLoading = computed(() => profileStore.busy && !profileStore.profile)

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
  await profileStore.save({ displayName: trimmedName, bio: trimmedBio })
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

onMounted(() => { void profileStore.fetchMySubmissions() })
</script>

<template>
  <main class="min-h-screen w-full bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-carrotOrange-100 selection:text-carrotOrange-900 pb-24">
    <div class="mx-auto max-w-3xl">

      <div class="mb-12 text-center">
        <span class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.2em] mb-4 block">
          Member Profile
        </span>
        <h1 class="font-serif text-4xl sm:text-5xl font-medium text-gray-900">
          Your Archive Identity.
        </h1>
        <p class="mt-4 text-lg text-gray-500 font-light">
          Manage how you are seen in the registry of Somali wisdom.
        </p>
      </div>

      <div v-if="isLoading" class="flex h-64 flex-col items-center justify-center rounded-[2.5rem] bg-white border border-gray-100">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-carrotOrange-500"></div>
        <p class="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Loading Record...</p>
      </div>

      <div v-else class="space-y-8">

        <div class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">




          <div class="p-8 sm:p-12 space-y-8">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-4">
              Personal Details
            </h2>

            <div class="space-y-6">
              <div class="group">
                <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Display Name</label>
                <input
                  v-model="displayName"
                  type="text"
                  placeholder="e.g. Arawelo"
                  autocomplete="name"
                  class="block w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all"
                />
              </div>

              <div class="group">
                <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Biography</label>
                <textarea
                  v-model="bio"
                  rows="4"
                  placeholder="Tell the community about yourself..."
                  class="block w-full resize-none rounded-xl border border-gray-200 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all"
                ></textarea>
                <p class="mt-2 text-right text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  Publicly Visible
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-gray-50">
              <p v-if="profileStore.error" class="text-sm font-bold text-red-500">
                {{ profileStore.error }}
              </p>
              <div v-else></div>

              <button
                type="button"
                :disabled="profileStore.busy"
                class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-carrotOrange-500 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                @click="handleSave"
              >
                <span v-if="profileStore.busy">Saving...</span>
                <span v-else>Update Record</span>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-gray-100/50 rounded-[2.5rem] border border-gray-200 p-8 sm:p-10 relative overflow-hidden">

           <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 class="text-lg font-bold text-gray-900">Official Handle</h2>
                <p class="text-sm text-gray-500 font-light">Your unique signature in the archive.</p>
              </div>

              <div v-if="profileStore.profile?.username" class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span class="text-green-500">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <span class="font-mono font-bold text-gray-700">@{{ profileStore.profile.username }}</span>
              </div>
           </div>

           <div v-if="!profileStore.profile?.username" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div class="relative flex flex-col gap-3 sm:flex-row">
                <div class="relative flex-grow">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-bold">@</div>
                  <input
                    v-model="usernameInput"
                    type="text"
                    placeholder="username"
                    class="block w-full rounded-xl border border-gray-200 bg-gray-50/30 py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
                  />
                </div>
                <button
                  type="button"
                  :disabled="claimBusy"
                  class="inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-gray-800 disabled:opacity-50"
                  @click="handleClaimUsername"
                >
                  {{ claimBusy ? 'Checking...' : 'Claim Handle' }}
                </button>
              </div>

              <p v-if="claimError" class="mt-4 text-xs font-bold text-red-500 flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ claimError }}
              </p>
              <p v-else class="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Warning: Usernames are permanent once claimed.
              </p>
           </div>
        </div>

        <div class="pt-8 border-t border-gray-200">
          <div class="flex items-center gap-3 mb-8">
             <span class="h-px w-8 bg-gray-300"></span>
             <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Your Contributions</h2>
          </div>

          <div v-if="profileStore.submissions.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SubmissionCard
                v-for="(submission, index) in profileStore.submissions"
                :key="submission.id"
                :submission="submission"
                :index="index"
              />
            </div>
            <LoadMore
              :has-more="!!profileStore.lastDoc"
              :loading="isLoadingMore"
              @load-more="handleLoadMore"
              class="mt-8"
            />
          </div>

          <div v-else class="rounded-[2.5rem] border border-gray-200 bg-white p-12 text-center">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-2xl opacity-50">
              ✍️
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Archive Empty</h3>
            <p class="text-gray-500 font-light mb-8">
              You haven't shared any wisdom or poetry yet.
            </p>
            <router-link
              to="/contribute"
              class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-carrotOrange-500 hover:-translate-y-1"
            >
              Add First Entry
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>
