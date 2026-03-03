<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import Lenis from 'lenis' //
import 'lenis/dist/lenis.css' //
import TheNavigation from '@/shared/navigation/TheNavigation.vue'
import LoadingSpinner from '@/shared/components/AppLoader.vue'
import GlobalDialog from '@/shared/components/GlobalDialog.vue'
import Footer from '@/shared/navigation/Footer.vue'
import AudioPlayer from '@/shared/components/AudioPlayer.vue'
import { useAuthStore } from '@/features/auth/auth.store'
import 'vue-sonner/style.css'

const route = useRoute()
const hideChrome = computed(() => route.path === '/onboarding/username')
const hideFooter = computed(() => route.path === '/login' || hideChrome.value)
const showNav = computed(() => route.path !== '/login' && !hideChrome.value)
const showFooter = computed(() => !hideFooter.value)

const isLoading = ref(true)
const serverDown = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false)
const isDismissed = ref(false)
let lenis: Lenis | null = null

const handleOnline = () => {
  serverDown.value = false
}
const handleOffline = () => {
  serverDown.value = true
}

onMounted(async () => {
  // Initialize Lenis Smooth Scroll
  lenis = new Lenis({
    autoRaf: true, // Automatically handles the requestAnimationFrame loop
  })

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Dismiss the splash screen once Firebase Auth resolves (knows whether
  // a user session exists). A minimum delay prevents a jarring flash on
  // fast connections; the safety cap prevents an infinite loader if auth
  // somehow never resolves.
  const MIN_SPLASH_MS = 400
  const MAX_SPLASH_MS = 5000
  const authStore = useAuthStore()

  await Promise.race([
    Promise.all([
      authStore.waitForAuthReady(),
      new Promise<void>((r) => setTimeout(r, MIN_SPLASH_MS)),
    ]),
    new Promise<void>((r) => setTimeout(r, MAX_SPLASH_MS)),
  ])

  isLoading.value = false
})

onBeforeUnmount(() => {
  // Clean up Lenis
  if (lenis) {
    lenis.destroy()
    lenis = null
  }

  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

watch(serverDown, (isDown) => {
  if (!isDown) isDismissed.value = false
})

const PageReload = () => {
  window.location.reload()
}
</script>

<template>
  <div
    id="app"
    class="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-carrotOrange-200 selection:text-carrotOrange-900"
  >
    <TheNavigation v-if="showNav" class="max-w-[1600px] mx-auto" />

    <div class="flex-grow relative min-h-screen">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in" appear>
          <component :is="Component" class="transition-all duration-300" />
        </transition>
      </router-view>
    </div>

    <transition name="slide-up">
      <div
        v-if="serverDown && !isDismissed"
        class="fixed bottom-6 left-4 right-4 z-[200] md:left-auto md:right-6 md:w-96"
      >
        <div
          class="bg-white border-l-4 border-red-500 rounded-xl p-4 shadow-2xl flex items-start gap-4 ring-1 ring-black/5"
        >
          <div class="text-red-500 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path
                fill-rule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 text-sm">Connection Lost</h3>
            <p class="text-xs text-gray-500 mt-1">We can't reach the network right now.</p>
            <button
              @click="PageReload"
              class="mt-3 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            >
              Retry Connection
            </button>
          </div>
          <button @click="isDismissed = true" class="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path
                fill-rule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <LoadingSpinner v-if="isLoading" class="fixed inset-0 z-[9999]" />
    </transition>

    <GlobalDialog />

    <Toaster position="top-center" richColors />

    <AudioPlayer />

    <Footer v-if="showFooter" class="mt-auto"></Footer>
  </div>
</template>

<style>
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* TRANSITIONS */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
