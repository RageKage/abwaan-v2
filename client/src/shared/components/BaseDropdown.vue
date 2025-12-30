<script setup lang="ts" generic="T extends string | number | symbol">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  options: ReadonlyArray<{ key: T; label: string }>
  modelValue: T
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const select = (value: T) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative inline-block text-left" ref="containerRef">
    <button
      type="button"
      class="inline-flex items-center justify-between gap-x-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-carrotOrange-500/20"
      @click="toggle"
    >
      <span class="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1" v-if="label">{{ label }}:</span>
      <span>{{ options.find(o => o.key === modelValue)?.label }}</span>
      <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <div class="px-1 py-1">
          <button
            v-for="option in options"
            :key="String(option.key)"
            class="group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="[
              modelValue === option.key ? 'bg-carrotOrange-50 text-carrotOrange-600' : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="select(option.key)"
          >
            {{ option.label }}
            <span v-if="modelValue === option.key" class="ml-auto text-carrotOrange-600">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
