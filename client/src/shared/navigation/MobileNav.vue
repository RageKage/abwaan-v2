<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import SiteLogo from '@/shared/navigation/SiteLogo.vue'
import type { NavRoute, UserRoute, UserRouteAction } from '@/shared/navigation/useNavigation'
import { useDatabaseStatus } from '@/shared/utils/dbStatus'

type NavUser = {
  uid?: string | null
  username?: string | null
  displayName?: string | null
}

const props = defineProps<{
  isOpen: boolean
  routes: NavRoute[]
  userRoutes: UserRoute[]
  user: NavUser | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'trigger-action', action: UserRouteAction): void
}>()

const handleClose = () => {
  emit('close')
}

const handleAction = (action: UserRouteAction) => {
  emit('trigger-action', action)
  emit('close')
}

// Get initial for avatar
const getInitial = (name: string) => name.charAt(0).toUpperCase()

// Lock body scroll when menu is open
onMounted(() => {
  if (props.isOpen) document.body.style.overflow = 'hidden'
})

watch(
  () => props.isOpen,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  },
)

const { status } = useDatabaseStatus()

const statusLabel = computed(() => {
  if (status.value === 'online') return 'SYSTEM: ONLINE'
  if (status.value === 'offline') return 'SYSTEM: OFFLINE'
  return 'SYSTEM: CHECKING'
})

const appVersion = __APP_VERSION__
</script>

<template>
  <transition
    enter-active-class="transition duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
    enter-from-class="transform -translate-y-full"
    enter-to-class="transform translate-y-0"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="transform translate-y-0"
    leave-to-class="transform -translate-y-full"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex flex-col bg-white text-gray-900 font-sans">
      <header class="flex-shrink-0 h-20 flex items-center justify-between border-b border-gray-200 bg-white">
        <div class="h-full flex items-center px-6 border-r border-gray-200">
          <SiteLogo @click="handleClose" />
        </div>

        <button
          type="button"
          class="h-full aspect-square flex items-center justify-center border-l border-gray-200 hover:bg-carrotOrange-500 hover:text-white transition-colors group"
          @click="handleClose"
        >
          <span class="sr-only">Close menu</span>
          <div class="relative w-6 h-6">
            <span
              class="absolute top-1/2 left-0 w-full h-0.5 bg-current transform -translate-y-1/2 rotate-45 transition-transform group-hover:rotate-0"
            ></span>
            <span
              class="absolute top-1/2 left-0 w-full h-0.5 bg-current transform -translate-y-1/2 -rotate-45 transition-transform group-hover:rotate-0"
            ></span>
          </div>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto">
        <nav class="flex flex-col">
          <router-link
            v-for="(route, index) in routes"
            :key="route.to"
            :to="route.to"
            class="group relative flex items-center justify-between p-8 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            @click="handleClose"
          >
            <span
              class="text-3xl md:text-4xl font-serif text-gray-900 group-hover:text-carrotOrange-600 transition-colors"
            >
              {{ route.label }}
            </span>

            <div class="flex items-center gap-4">
              <span class="font-mono text-xs text-gray-300 group-hover:text-carrotOrange-400">0{{ index + 1 }}</span>
              <span
                class="text-2xl text-gray-200 group-hover:text-carrotOrange-500 transition-colors transform group-hover:translate-x-2 duration-300"
              >
                &rarr;
              </span>
            </div>
          </router-link>
        </nav>
      </div>

      <div class="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-6 md:p-8">
        <div v-if="user" class="space-y-6">
          <div class="flex items-center gap-4">
            <div
              class="h-14 w-14 rounded-full border border-gray-300 bg-white flex items-center justify-center text-xl font-bold text-gray-900"
            >
              {{ user.displayName ? getInitial(user.displayName) : 'U' }}
            </div>
            <div>
              <p class="font-bold uppercase tracking-widest text-sm text-gray-900">
                {{ user.displayName || 'Contributor' }}
              </p>
              <p class="font-mono text-xs text-carrotOrange-600 mt-1">LOGGED IN</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="route in userRoutes"
              :key="route.action"
              class="py-3 px-4 bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
              @click="handleAction(route.action)"
            >
              {{ route.label }}
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 gap-4">
          <router-link
            to="/login?mode=login"
            class="flex items-center justify-center py-4 border border-gray-300 bg-transparent text-gray-900 text-xs font-bold uppercase tracking-widest hover:border-gray-900 hover:bg-white transition-colors"
            @click="handleClose"
          >
            Log In
          </router-link>
          <router-link
            to="/login?mode=register"
            class="flex items-center justify-center py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
            @click="handleClose"
          >
            Join Archive
          </router-link>
        </div>

        <div
          class="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] font-mono uppercase text-gray-400"
        >
          <span>{{ statusLabel }}</span>
          <span>V{{ appVersion }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>
