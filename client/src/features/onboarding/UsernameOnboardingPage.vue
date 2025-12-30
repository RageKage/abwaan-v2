<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { claimUsername } from '@/data/functions/usernames'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const username = ref('')
const busy = ref(false)
const error = ref<string | null>(null)

const displayName = computed(() => {
  return (
    profileStore.profile?.displayName ||
    authStore.user?.displayName ||
    authStore.user?.email ||
    'Member'
  )
})

watch(
  () => profileStore.profile?.username,
  (nextUsername) => {
    if (nextUsername) {
      void router.replace('/')
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  const trimmed = username.value.trim()
  if (!trimmed) {
    error.value = 'Username is required.'
    return
  }
  busy.value = true
  error.value = null
  try {
    await claimUsername(trimmed)
    await router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to claim username.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main
    class="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-carrotOrange-100 selection:text-carrotOrange-900"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-carrotOrange-50 text-carrotOrange-600 mb-6"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
        <h1 class="font-serif text-3xl font-medium text-gray-900 mb-3">Finalize Registration</h1>
        <p class="text-sm text-gray-500 font-light">
          Welcome, <span class="font-bold text-gray-900">{{ displayName }}</span
          >. Choose a unique handle for your contributions.
        </p>
      </div>

      <div
        class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative"
      >
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-carrotOrange-400 to-transparent opacity-50"
        ></div>

        <div class="p-8 sm:p-10">
          <form class="space-y-8" @submit.prevent="handleSubmit">
            <div class="group">
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500"
                >Username</label
              >
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span class="text-gray-400 font-bold">@</span>
                </div>
                <input
                  v-model="username"
                  type="text"
                  autocomplete="username"
                  required
                  placeholder="username"
                  class="block w-full rounded-xl border border-gray-200 bg-gray-50/30 py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
                />
              </div>
              <p class="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                This will be permanent, For now...
              </p>
            </div>

            <button
              type="submit"
              :disabled="busy || profileStore.busy"
              class="w-full flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-carrotOrange-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                v-if="busy || profileStore.busy"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"
              ></span>
              Claim Identity
            </button>
          </form>

          <p
            v-if="error"
            role="alert"
            class="mt-6 text-center text-xs font-bold text-red-500 bg-red-50 py-2 rounded-lg"
          >
            {{ error }}
          </p>

          <div v-if="profileStore.busy && !profileStore.profile" class="mt-4 text-center">
            <p class="text-xs font-bold uppercase tracking-widest text-gray-300 animate-pulse">
              Syncing Profile...
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
