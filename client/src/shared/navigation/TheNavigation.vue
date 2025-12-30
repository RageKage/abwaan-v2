<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import DesktopNav from '@/shared/navigation/DesktopNav.vue'
import MobileNav from '@/shared/navigation/MobileNav.vue'
import SiteLogo from '@/shared/navigation/SiteLogo.vue'
import {
  mainRoutes,
  userDropdownRoutes,
  type UserRouteAction,
} from '@/shared/navigation/useNavigation'

const auth = useAuthStore()
const router = useRouter()

const isMobileMenuOpen = ref(false)
const isVisible = ref(true)
const lastScrollY = ref(0)
const TOP_THRESHOLD = 64

const navClasses = computed(() => ({
  'translate-y-0 opacity-100': isVisible.value,
  '-translate-y-full opacity-0 pointer-events-none': !isVisible.value,
}))

const openMobileMenu = () => { isMobileMenuOpen.value = true }
const closeMobileMenu = () => { isMobileMenuOpen.value = false }

const handleUserAction = async (action: UserRouteAction) => {
  closeMobileMenu()
  if (action === 'logout') {
    await auth.logout()
    await router.push('/login')
    return
  }
  if (action === 'profile') {
    await router.push('/profile')
  }
}

const updateVisibility = () => {
  const currentY = window.scrollY || 0
  if (isMobileMenuOpen.value) {
    isVisible.value = true
    lastScrollY.value = currentY
    return
  }
  if (currentY <= TOP_THRESHOLD) {
    isVisible.value = true
  } else if (currentY > lastScrollY.value) {
    isVisible.value = false
  } else {
    isVisible.value = true
  }
  lastScrollY.value = currentY
}

let ticking = false
const onScroll = () => {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(() => {
    updateVisibility()
    ticking = false
  })
}

onMounted(() => {
  lastScrollY.value = window.scrollY || 0
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) isVisible.value = true
})
</script>

<template>
  <header
    class="fixed top-6 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 sm:px-6 lg:px-8"
    :class="navClasses"
  >
    <div class="mx-auto max-w-7xl">
      <div class="relative rounded-2xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-sm shadow-gray-200/40 ring-1 ring-black/5 px-4 py-3 sm:px-6">

        <div class="flex items-center justify-between">

          <div class="lg:hidden flex items-center justify-between w-full">
            <SiteLogo />
            <button
              type="button"
              class="p-2 -mr-2 text-gray-500 hover:text-carrotOrange-600 transition-colors"
              @click="openMobileMenu"
            >
              <span class="sr-only">Open Menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          <div class="hidden lg:flex w-full">
            <DesktopNav
              :routes="mainRoutes"
              :user-routes="userDropdownRoutes"
              :user="auth.user"
              @trigger-action="handleUserAction"
            />
          </div>

        </div>
      </div>
    </div>
  </header>

  <MobileNav
    :is-open="isMobileMenuOpen"
    :routes="mainRoutes"
    :user-routes="userDropdownRoutes"
    :user="auth.user"
    @close="closeMobileMenu"
    @trigger-action="handleUserAction"
  />
</template>
