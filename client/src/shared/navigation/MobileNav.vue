<script setup lang="ts">
import SiteLogo from '@/shared/navigation/SiteLogo.vue'
import type { NavRoute, UserRoute, UserRouteAction } from '@/shared/navigation/useNavigation'

type NavUser = {
  uid?: string | null
  username?: string | null
  displayName?: string | null
}

defineProps<{
  isOpen: boolean
  routes: NavRoute[]
  userRoutes: UserRoute[]
  user: NavUser | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'trigger-action', action: UserRouteAction): void
}>()

const handleClose = () => { emit('close') }

const handleAction = (action: UserRouteAction) => {
  emit('trigger-action', action)
  emit('close')
}

const getInitial = (name: string) => name.charAt(0).toUpperCase()
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-xl">

      <header class="px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <SiteLogo @click="handleClose" />
        <button type="button" class="p-2 -mr-2 text-gray-500 hover:text-gray-900" @click="handleClose">
          <span class="sr-only">Close menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">

        <div v-if="user" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div class="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-lg font-bold text-carrotOrange-600 shadow-sm border border-gray-100">
              {{ user.displayName ? getInitial(user.displayName) : 'U' }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">{{ user.displayName || 'Member' }}</p>
              <p v-if="user.username" class="text-xs font-bold text-gray-400 uppercase tracking-widest">@{{ user.username }}</p>
            </div>
        </div>

        <nav class="flex flex-col gap-2">
          <router-link
            v-for="route in routes"
            :key="route.to"
            :to="route.to"
            class="text-2xl font-serif font-medium text-gray-900 py-3 border-b border-gray-100"
            active-class="text-carrotOrange-600 border-carrotOrange-100"
            @click="handleClose"
          >
            {{ route.label }}
          </router-link>
        </nav>

        <div v-if="user" class="flex flex-col gap-4 mt-auto">
           <button
              v-for="route in userRoutes"
              :key="route.action"
              class="w-full py-4 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest shadow-lg"
              @click="handleAction(route.action)"
            >
              {{ route.label }}
            </button>
        </div>

        <div v-else class="flex flex-col gap-4 mt-auto">
           <router-link
             to="/login?mode=register"
             class="w-full py-4 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest shadow-lg text-center"
             @click="handleClose"
           >
             Join Archive
           </router-link>
           <router-link
             to="/login?mode=login"
             class="w-full py-4 rounded-xl bg-gray-50 text-gray-900 text-xs font-bold uppercase tracking-widest text-center border border-gray-200"
             @click="handleClose"
           >
             Log In
           </router-link>
        </div>

      </div>
    </div>
  </transition>
</template>
