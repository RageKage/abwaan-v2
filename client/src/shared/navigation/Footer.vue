<script lang="ts">
export default {
  name: 'SiteFooter',
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDatabaseStatus } from '@/shared/utils/dbStatus'

// Database Status Logic
const { status, lastChecked } = useDatabaseStatus()

const statusLabel = computed(() => {
  if (status.value === 'online') return 'SYSTEM ONLINE'
  if (status.value === 'offline') return 'SYSTEM OFFLINE'
  return 'CHECKING CONNECTION'
})

const statusDotClass = computed(() => {
  if (status.value === 'online') return 'bg-carrotOrange-500'
  if (status.value === 'offline') return 'bg-red-500'
  return 'bg-gray-400'
})

const statusRingClass = computed(() => {
  if (status.value === 'online') return 'bg-carrotOrange-400'
  if (status.value === 'offline') return 'bg-red-400'
  return 'bg-gray-300'
})

// Newsletter Logic (New)
const email = ref('')

const appVersion = __APP_VERSION__

const lastCheckedLabel = computed(() => {
  if (!lastChecked.value) return 'Last heartbeat: —'
  return `Heartbeat: ${lastChecked.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
})
</script>

<template>
  <footer class="bg-white border-t border-gray-200 text-gray-900 font-sans relative">
    <div
      class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
      style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
    ></div>

    <div class="max-w-[1600px] mx-auto relative z-10">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200"
      >
        <div
          class="p-10 lg:p-12 flex flex-col justify-between h-full bg-white hover:bg-gray-50 transition-colors duration-500"
        >
          <div class="space-y-6">
            <router-link to="/" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-full group-hover:border-carrotOrange-500 transition-colors"
              >
                <img
                  src="@/assets/logo/Abwaan_4.svg"
                  alt="Abwaan"
                  class="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
                />
              </div>
              <span class="font-serif text-2xl tracking-tight group-hover:text-carrotOrange-600 transition-colors">
                Abwaan
              </span>
            </router-link>

            <p class="text-gray-500 font-light leading-relaxed max-w-xs">
              A living archive for poetry, proverbs, and shared memory.
            </p>
          </div>

          <div class="mt-12 pt-6 border-t border-gray-100">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
              Loc: Minneapolis, MN
              <br />
              Est: 2026
            </p>
          </div>
        </div>

        <div class="p-10 lg:p-12 bg-white hover:bg-gray-50 transition-colors duration-500">
          <span
            class="block font-mono text-xs text-gray-400 uppercase tracking-widest mb-8 border-l-2 border-carrotOrange-500 pl-3"
          >
            01. Index
          </span>
          <ul class="space-y-4">
            <li>
              <router-link to="/" class="flex items-baseline justify-between group">
                <span
                  class="text-lg font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
                >
                  Home
                </span>
                <span class="font-mono text-xs text-gray-300 group-hover:text-carrotOrange-500">001</span>
              </router-link>
            </li>
            <li>
              <router-link to="/collections" class="flex items-baseline justify-between group">
                <span
                  class="text-lg font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
                >
                  The Archive
                </span>
                <span class="font-mono text-xs text-gray-300 group-hover:text-carrotOrange-500">002</span>
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="flex items-baseline justify-between group">
                <span
                  class="text-lg font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
                >
                  Mission
                </span>
                <span class="font-mono text-xs text-gray-300 group-hover:text-carrotOrange-500">003</span>
              </router-link>
            </li>

            <li>
              <router-link to="/roadmap" class="flex items-baseline justify-between group">
                <span
                  class="text-lg font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
                >
                  Roadmap
                </span>
                <span class="font-mono text-xs text-gray-300 group-hover:text-carrotOrange-500">004</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="p-10 lg:p-12 bg-white hover:bg-gray-50 transition-colors duration-500">
          <span
            class="block font-mono text-xs text-gray-400 uppercase tracking-widest mb-8 border-l-2 border-gray-900 pl-3"
          >
            02. Connect
          </span>
          <ul class="space-y-4">
            <li>
              <router-link to="/contribute" class="flex items-baseline justify-between group">
                <span
                  class="text-lg font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
                >
                  Contribute
                </span>
                <span class="text-xs text-gray-300 group-hover:text-gray-900">→</span>
              </router-link>
            </li>
            <li>
              <a href="mailto:nimanahmed000@gmail.com" class="flex items-baseline justify-between group">
                <span
                  class="text-lg font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
                >
                  Contact
                </span>
                <span class="text-xs text-gray-300 group-hover:text-gray-900">@</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="p-10 lg:p-12 bg-gray-50 flex flex-col justify-between">
          <div>
            <span class="block font-mono text-xs text-gray-400 uppercase tracking-widest mb-6">System Status</span>
            <div class="flex items-center gap-3 mb-2">
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  :class="statusRingClass"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2" :class="statusDotClass"></span>
              </span>
              <span class="font-mono text-xs text-gray-900">{{ statusLabel }}</span>
            </div>
            <p class="text-xs text-gray-500 font-mono">{{ lastCheckedLabel }}</p>
          </div>

          <!-- <div class="mt-8">
            <label class="block font-serif text-gray-900 mb-4">Stay updated</label>

            <form class="relative group">
              <input
                v-model="email"
                type="email"
                placeholder="Enter email address"
                class="w-full bg-transparent border-b border-gray-300 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-carrotOrange-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                class="absolute right-0 top-2 text-gray-400 hover:text-carrotOrange-600 transition-colors disabled:text-green-600"
              >
                <span>→</span>
              </button>
            </form>
          </div> -->
        </div>
      </div>

      <div
        class="grid md:grid-cols-1 p-6 md:p-8 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500"
      >
        <div class="flex gap-6 justify-between">
          <span>&copy; {{ new Date().getFullYear() }} Abwaan Project</span>

          <span class="text-carrotOrange-600 border-gray-300 pl-6 ml-2">V{{ appVersion }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
