<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()
const route = useRoute()

const isRegister = ref(false)
const displayName = ref('')
const email = ref('')
const password = ref('')

const title = computed(() => (isRegister.value ? 'Member Registration' : 'Member Access'))
const submitLabel = computed(() => (isRegister.value ? 'Create ID' : 'Enter Archive'))
const toggleLabel = computed(() => (isRegister.value ? 'Already have an ID? Sign in' : 'New to the archive? Register'))

const toggleMode = () => {
  isRegister.value = !isRegister.value
  authStore.clearError()
}

watch(
  () => route.query.mode,
  (mode) => {
    const value = typeof mode === 'string' ? mode : undefined
    if (value === 'register') {
      isRegister.value = true
    } else if (value === 'login') {
      isRegister.value = false
    }
  },
  { immediate: true },
)


const handleSubmit = async () => {
  try {
    if (isRegister.value) {
      const name = displayName.value.trim()
      const credential = await authStore.register(email.value, password.value, name)
      profileStore.start(credential.user.uid)
      await router.push('/onboarding/username')
      return
    }
    await authStore.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch {
    // Error is stored in the auth store for display.
  }
}

const handleGoogleLogin = async () => {
  try {
    const credential = await authStore.loginWithGoogle()
    profileStore.start(credential.user.uid)
    await profileStore.waitForProfile()
    if (!profileStore.profile?.username) {
      await router.push('/onboarding/username')
      return
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch {
    // Error is stored in the auth store for display.
  }
}
</script>

<template>
  <main
    class="min-h-screen w-full bg-white flex items-center justify-center relative overflow-hidden font-sans text-gray-900"
  >
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
    ></div>

    <div class="w-full max-w-md relative z-10 p-6">
      <div class="bg-white border border-gray-200 shadow-none">
        <div class="p-10 border-b border-gray-200 bg-gray-50 text-center">
          <router-link to="/" class="inline-block mb-6 group">
            <div
              class="w-12 h-12 border border-gray-900 rounded-full flex items-center justify-center group-hover:bg-carrotOrange-500 group-hover:border-carrotOrange-500 group-hover:text-white transition-colors duration-300"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </div>
          </router-link>
          <h1 class="text-3xl font-serif text-gray-900 mb-2 tracking-tight">
            {{ title }}
          </h1>
          <p class="text-xs font-mono text-gray-400 uppercase tracking-widest">
            {{ isRegister ? 'Initialize new account' : 'Authenticate session' }}
          </p>
        </div>

        <div class="p-10 space-y-8">
          <form class="space-y-8" @submit.prevent="handleSubmit">
            <div v-if="isRegister" class="group">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Identity</label>
              <input
                v-model="displayName"
                type="text"
                autocomplete="name"
                required
                placeholder="Full Name"
                class="block w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
              />
            </div>

            <div class="group">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Credentials
              </label>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="Email Address"
                class="block w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
              />
            </div>

            <div class="group">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Security Key
              </label>
              <input
                v-model="password"
                type="password"
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                required
                placeholder="Password"
                class="block w-full bg-transparent border-b border-gray-200 py-3 text-lg font-serif text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
              />
            </div>

            <button
              type="submit"
              :disabled="authStore.busy"
              class="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait mt-4"
            >
              <span
                v-if="authStore.busy"
                class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
              ></span>
              {{ submitLabel }}
            </button>
          </form>

          <div class="relative flex items-center py-2">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink-0 mx-4 text-[10px] font-bold uppercase tracking-widest text-gray-300">Or</span>
            <div class="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            type="button"
            class="w-full py-4 border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            :disabled="authStore.busy"
            @click="handleGoogleLogin"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p v-if="authStore.error" class="text-center text-xs font-mono text-red-500 uppercase mt-4">
            /// Error: {{ authStore.error }}
          </p>
          <p v-if="resetMessage" class="text-center text-xs font-mono text-emerald-600 uppercase mt-4">
            /// {{ resetMessage }}
          </p>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-200 text-center">
          <button
            type="button"
            class="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-carrotOrange-600 transition-colors"
            @click="toggleMode"
          >
            {{ toggleLabel }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
