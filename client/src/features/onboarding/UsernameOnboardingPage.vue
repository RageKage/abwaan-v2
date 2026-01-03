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
  <main class="min-h-screen w-full bg-white flex items-center justify-center relative overflow-hidden font-sans text-gray-900">

    <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
         style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;">
    </div>

    <div class="w-full max-w-md relative z-10 p-6">

      <div class="bg-white border border-gray-200 shadow-none">

        <div class="p-10 border-b border-gray-200 bg-gray-50 text-center">
           <div class="inline-block mb-6">
              <div class="w-12 h-12 border border-gray-900 rounded-full flex items-center justify-center text-carrotOrange-600">
                 <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                 </svg>
              </div>
           </div>
           <h1 class="text-3xl font-serif text-gray-900 mb-4 tracking-tight">
             Create Handle
           </h1>
           <p class="text-sm text-gray-500 font-light leading-relaxed">
             Welcome, <span class="font-bold text-gray-900 border-b border-gray-300">{{ displayName }}</span>. <br/>
             Establish your unique signature in the archive.
           </p>
        </div>

        <div class="p-10 space-y-8">
          <form class="space-y-8" @submit.prevent="handleSubmit">

            <div class="group">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Desired Username</label>

              <div class="relative flex items-center border-b-2 border-gray-200 focus-within:border-carrotOrange-500 transition-colors">
                <span class="text-2xl font-serif text-gray-400 mr-2">@</span>
                <input
                  v-model="username"
                  type="text"
                  autocomplete="username"
                  required
                  placeholder="username"
                  class="block w-full bg-transparent py-3 text-2xl font-serif text-gray-900 placeholder:text-gray-200 focus:outline-none"
                />
              </div>

              <p class="mt-4 text-[10px] font-mono uppercase tracking-widest text-gray-400">
                * Note: This handle is permanent.
              </p>
            </div>

            <button
              type="submit"
              :disabled="busy || profileStore.busy"
              class="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                v-if="busy || profileStore.busy"
                class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
              ></span>
              Claim Identity
            </button>
          </form>

          <div v-if="error" class="p-4 bg-red-50 border border-red-100 text-center">
             <p class="text-xs font-mono font-bold text-red-500 uppercase">
               /// Error: {{ error }}
             </p>
          </div>

          <div v-if="profileStore.busy && !profileStore.profile" class="text-center">
            <p class="text-[10px] font-mono uppercase tracking-widest text-gray-300 animate-pulse">
              Syncing Profile Data...
            </p>
          </div>

        </div>
      </div>
    </div>
  </main>
</template>
