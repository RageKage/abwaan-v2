<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search'): void
}>()

const inputValue = ref(props.modelValue)

let timeout: ReturnType<typeof setTimeout>

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  inputValue.value = value

  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('update:modelValue', value)
    emit('search')
  }, 500)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value) {
    inputValue.value = newValue
  }
})
</script>

<template>
  <div class="relative w-full max-w-lg group">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-carrotOrange-500 transition-colors duration-300">
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      :value="inputValue"
      type="text"
      :placeholder="placeholder || 'Search the archive...'"
      class="block w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-carrotOrange-300 focus:ring-4 focus:ring-carrotOrange-50/50 focus:outline-none sm:text-sm transition-all duration-300"
      @input="handleInput"
    />
  </div>
</template>
