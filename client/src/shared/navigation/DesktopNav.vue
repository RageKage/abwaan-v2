<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import SiteLogo from '@/shared/navigation/SiteLogo.vue'
import type { NavRoute, UserRoute, UserRouteAction } from '@/shared/navigation/useNavigation'

type NavUser = {
  uid?: string | null
  username?: string | null
  displayName?: string | null
}

const props = defineProps<{
  routes: NavRoute[]
  userRoutes: UserRoute[]
  user: NavUser | null
}>()

const emit = defineEmits<{
  (event: 'trigger-action', action: UserRouteAction): void
}>()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const avatarInitial = computed(() => {
  const nameInitial = props.user?.displayName?.trim()?.[0]
  const usernameInitial = props.user?.username?.trim()?.[0]
  return (nameInitial ?? usernameInitial ?? '?').toUpperCase()
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const handleAction = (action: UserRouteAction) => {
  emit('trigger-action', action)
  closeMenu()
}
</script>

<template>
  <nav class="flex items-stretch justify-between w-full h-full">

    <div class="flex items-stretch h-full flex-1">

      <div class="flex-shrink-0 flex items-center border-r border-gray-200 bg-white hover:bg-gray-50 transition-colors">
         <SiteLogo />
      </div>

      <div class="flex items-stretch h-full">
        <router-link
          v-for="(route, index) in routes"
          :key="route.to"
          :to="route.to"
          class="relative group flex items-center justify-center px-10 border-r border-gray-200 h-full min-w-[140px] hover:bg-gray-50 transition-all duration-300"
          active-class="bg-gray-50"
        >
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-carrotOrange-600 transition-colors relative z-10">
            {{ route.label }}
          </span>

          <span class="absolute top-3 right-3 text-[9px] font-mono text-gray-300 group-hover:text-carrotOrange-300 transition-colors">
            0{{ index + 1 }}
          </span>

          <span class="absolute bottom-0 left-0 w-full h-[2px] bg-carrotOrange-500 transform scale-x-0 group-[.router-link-active]:scale-x-100 transition-transform duration-300"></span>
        </router-link>
      </div>
    </div>

    <div class="flex items-stretch h-full">
      <template v-if="!user">
        <div class="flex items-stretch h-full">
          <router-link
            class="flex items-center px-8 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l border-gray-200 transition-colors h-full"
            :to="{ path: '/login', query: { mode: 'login' } }"
          >
            Log In
          </router-link>
          <router-link
            class="flex items-center px-8 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors h-full"
            :to="{ path: '/login', query: { mode: 'register' } }"
          >
            Join Archive
          </router-link>
        </div>
      </template>

      <template v-else>
        <div class="relative flex items-stretch h-full border-l border-gray-200 min-w-[220px]" ref="menuRef">
          <button
            type="button"
            class="group w-full flex items-center justify-between px-8 bg-white hover:bg-gray-50 transition-colors h-full gap-4"
            @click="toggleMenu"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 border border-gray-200 group-hover:border-carrotOrange-200 group-hover:text-carrotOrange-600 transition-colors"
              >
                {{ avatarInitial }}
              </div>

              <div class="flex flex-col items-start text-left">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                  {{ user.displayName || 'Contributor' }}
                </span>
                <span class="text-[9px] font-mono text-gray-400 group-hover:text-carrotOrange-500 transition-colors">
                  LOGGED IN
                </span>
              </div>
            </div>

            <svg
              class="h-3 w-3 text-gray-300 group-hover:text-carrotOrange-400 transition-transform duration-300"
              :class="{ 'rotate-180': isMenuOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 translate-y-2"
          >
            <div
              v-if="isMenuOpen"
              class="absolute right-0 top-full mt-0 w-full bg-white border border-gray-200 border-t-0 shadow-xl z-50"
            >
              <div class="flex flex-col divide-y divide-gray-100">
                <button
                  v-for="route in userRoutes"
                  :key="route.action"
                  type="button"
                  class="flex items-center w-full px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-carrotOrange-600 transition-colors text-left"
                  @click="handleAction(route.action)"
                >
                  {{ route.label }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </template>
    </div>
  </nav>
</template>
