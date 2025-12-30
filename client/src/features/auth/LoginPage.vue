<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const toggleLabel = computed(() =>
  isRegister.value ? 'Already have an ID? Sign in' : 'New to the archive? Register',
)

const toggleMode = () => {
  isRegister.value = !isRegister.value
  authStore.clearError()
}

onMounted(() => {
  const mode = route.query.mode
  if (mode === 'register') {
    isRegister.value = true
  } else if (mode === 'login') {
    isRegister.value = false
  }
})

const handleSubmit = async () => {
  try {
    if (isRegister.value) {
      const credential = await authStore.register(email.value, password.value)
      profileStore.start(credential.user.uid)
      const name = displayName.value.trim()
      if (name) {
        await profileStore.save({ displayName: name })
      }
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
  <main class="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-carrotOrange-100 selection:text-carrotOrange-900">

    <div class="w-full max-w-md">

      <div class="text-center mb-10">
        <router-link to="/" class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-carrotOrange-50 text-carrotOrange-600 mb-6">
           <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </router-link>
        <h1 class="font-serif text-3xl font-medium text-gray-900 mb-3">
          {{ title }}
        </h1>
        <p class="text-sm text-gray-500 font-light">
          {{ isRegister ? 'Join the community preserving Somali heritage.' : 'Welcome back to the digital library.' }}
        </p>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-carrotOrange-400 to-transparent opacity-50"></div>

        <div class="p-8 sm:p-10">
          <form class="space-y-6" @submit.prevent="handleSubmit">

            <div v-if="isRegister" class="group">
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
              <input
                v-model="displayName"
                type="text"
                autocomplete="name"
                required
                class="block w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
              />
            </div>

            <div class="group">
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
              />
            </div>

            <div class="group">
              <label class="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
              <input
                v-model="password"
                type="password"
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                required
                class="block w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              :disabled="authStore.busy"
              class="w-full flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-carrotOrange-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span v-if="authStore.busy" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></span>
              {{ submitLabel }}
            </button>
          </form>

          <div class="my-8 flex items-center gap-4">
            <span class="h-px flex-1 bg-gray-100"></span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-300">Or continue with</span>
            <span class="h-px flex-1 bg-gray-100"></span>
          </div>

          <button
            type="button"
            class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
            :disabled="authStore.busy"
            @click="handleGoogleLogin"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            <span class="text-xs font-bold uppercase tracking-widest">Google</span>
          </button>

          <p v-if="authStore.error" role="alert" class="mt-6 text-center text-xs font-bold text-red-500 bg-red-50 py-2 rounded-lg">
            {{ authStore.error }}
          </p>

          <div class="mt-8 text-center">
            <button
              type="button"
              class="text-xs font-bold uppercase tracking-widest text-carrotOrange-600 hover:text-carrotOrange-700 hover:underline transition-all"
              @click="toggleMode"
            >
              {{ toggleLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
