<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'
import DesktopNav from '@/shared/navigation/DesktopNav.vue'
import MobileNav from '@/shared/navigation/MobileNav.vue'
import SiteLogo from '@/shared/navigation/SiteLogo.vue'
import { getUserDropdownRoutes, mainRoutes, type UserRouteAction } from '@/shared/navigation/useNavigation'

const auth = useAuthStore()
const router = useRouter()
const profileStore = useProfileStore()

const isMobileMenuOpen = ref(false)
const isVisible = ref(true)
const lastScrollY = ref(0)
const TOP_THRESHOLD = 64

const navClasses = computed(() => ({
  'translate-y-0 opacity-100': isVisible.value,
  '-translate-y-full opacity-0 pointer-events-none': !isVisible.value,
}))

const navUser = computed(() => {
  if (!auth.user) return null
  return {
    uid: auth.user.uid,
    displayName: profileStore.profile?.displayName || auth.user.displayName || null,
    username: profileStore.profile?.username || null,
  }
})
const isAdmin = computed(() => profileStore.profile?.isAdmin === true)
const userRoutes = computed(() => getUserDropdownRoutes(isAdmin.value))

const openMobileMenu = () => {
  isMobileMenuOpen.value = true
}
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleUserAction = async (action: UserRouteAction) => {
  closeMobileMenu()
  if (action === 'logout') {
    await auth.logout()
    await router.push('/login')
    return
  }
  if (action === 'profile') {
    await router.push('/profile')
    return
  }
  if (action === 'admin') {
    await router.push('/admin')
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
    class="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300 font-sans text-gray-900"
    :class="navClasses"
  >
    <div class="mx-auto max-w-[1600px] h-20 md:h-24">
      <div class="h-full w-full">
        <div class="flex items-center justify-between h-full">
          <div class="md:hidden flex items-center justify-between w-full border-r border-gray-200 h-full">
            <SiteLogo />
            <button
              type="button"
              class="h-full aspect-square flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 hover:text-white transition-colors group"
              @click="openMobileMenu"
            >
              <span class="sr-only">Open Menu</span>
              <div class="flex flex-col gap-1.5">
                <span class="block w-6 h-0.5 bg-gray-900"></span>
                <span class="block w-6 h-0.5 bg-gray-900"></span>
                <span class="block w-6 h-0.5 bg-gray-900"></span>
              </div>
            </button>
          </div>

          <div class="hidden md:flex w-full h-full">
            <DesktopNav
              :routes="mainRoutes"
              :user-routes="userRoutes"
              :user="navUser"
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
    :user-routes="userRoutes"
    :user="navUser"
    @close="closeMobileMenu"
    @trigger-action="handleUserAction"
  />
</template>
