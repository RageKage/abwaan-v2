<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { claimUsername } from '@/data/functions/usernames'
import { useProfileStore } from '@/features/profile/profile.store'
import { toastError, toastSuccess } from '@/shared/utils/alerts'
const profileStore = useProfileStore()

const displayName = ref('')
const bio = ref('')
const usernameInput = ref('')

const claimBusy = ref(false)
const claimError = ref<string | null>(null)

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
  return 0
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

</script>

<template>
  <main class="page-shell app-surface dot-pattern">
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
              <label for="settings-display-name" class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Display Name
              </label>
              <input
                v-model="displayName"
                id="settings-display-name"
                type="text"
                placeholder="e.g. Arawelo"
                autocomplete="name"
                class="block w-full bg-transparent border-b-2 border-gray-200 py-3 text-2xl font-serif text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
              />
            </div>

            <div class="group">
              <label for="settings-bio" class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Biography</label>
              <textarea
                v-model="bio"
                id="settings-bio"
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
                <label for="settings-username" class="sr-only">Username</label>
                <input
                  v-model="usernameInput"
                  id="settings-username"
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
    </div>
  </main>
</template>
