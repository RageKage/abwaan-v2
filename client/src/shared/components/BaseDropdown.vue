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

const toggle = () => { isOpen.value = !isOpen.value }
const select = (value: T) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="relative w-full md:w-auto" ref="containerRef">
    <button
      type="button"
      class="w-full md:w-auto flex items-center justify-between gap-3 px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-carrotOrange-600 hover:bg-gray-50 transition-colors focus:outline-none"
      @click="toggle"
    >
      <span class="text-gray-400" v-if="label">{{ label }}:</span>
      <span>{{ options.find(o => o.key === modelValue)?.label }}</span>
      <svg
        class="h-3 w-3 transition-transform duration-300"
        :class="isOpen ? 'rotate-180 text-carrotOrange-600' : 'text-gray-300'"
        viewBox="0 0 20 20" fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full z-50 w-full md:w-56 bg-white border border-gray-200 shadow-xl"
      >
        <div class="flex flex-col">
          <button
            v-for="option in options"
            :key="String(option.key)"
            class="flex items-center justify-between px-6 py-3 text-xs font-bold uppercase tracking-widest text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            :class="modelValue === option.key ? 'text-carrotOrange-600' : 'text-gray-500'"
            @click="select(option.key)"
          >
            {{ option.label }}
            <span v-if="modelValue === option.key" class="w-1.5 h-1.5 rounded-full bg-carrotOrange-600"></span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
