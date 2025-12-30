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
  <nav class="flex items-center justify-between w-full">
    <div class="flex items-center gap-10">
      <SiteLogo />

      <div class="hidden lg:flex items-center gap-8">
        <router-link
          v-for="route in routes"
          :key="route.to"
          :to="route.to"
          class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-carrotOrange-600 transition-colors duration-300"
          active-class="text-carrotOrange-600"
        >
          {{ route.label }}
        </router-link>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <template v-if="!user">
        <div class="flex items-center gap-6">
          <router-link
            class="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
            :to="{ path: '/login', query: { mode: 'login' } }"
          >
            Log In
          </router-link>
          <router-link
            class="rounded-xl bg-gray-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-carrotOrange-500 transition-colors shadow-lg hover:shadow-carrotOrange-500/20 hover:-translate-y-0.5 transform duration-300"
            :to="{ path: '/login', query: { mode: 'register' } }"
          >
            Join Archive
          </router-link>
        </div>
      </template>

      <template v-else>
        <div class="relative" ref="menuRef">
          <button
            type="button"
            class="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white pl-1 pr-4 py-1 shadow-sm hover:shadow-md hover:border-carrotOrange-200 transition-all duration-300"
            @click="toggleMenu"
          >
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-xs font-bold text-gray-600 border border-gray-100 group-hover:bg-carrotOrange-50 group-hover:text-carrotOrange-600 group-hover:border-carrotOrange-100 transition-colors"
            >
              {{ avatarInitial }}
            </div>

            <div class="flex flex-col items-start">
              <span
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-carrotOrange-500 transition-colors"
              >
                {{ user.displayName || 'Contributor' }}
              </span>
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
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div
              v-if="isMenuOpen"
              class="absolute right-0 top-full mt-3 w-60 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-gray-100 z-50 origin-top-right"
            >
              <div class="flex flex-col gap-1 p-1">
                <button
                  v-for="route in userRoutes"
                  :key="route.action"
                  type="button"
                  class="flex items-center w-full rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-carrotOrange-600 transition-colors text-left"
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
