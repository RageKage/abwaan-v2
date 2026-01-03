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
  if (newValue !== inputValue.value) inputValue.value = newValue
})
</script>

<template>
  <div class="relative w-full group">
    <input
      :value="inputValue"
      type="text"
      :placeholder="placeholder || 'Search...'"
      class="block w-full bg-transparent py-4 text-xl md:text-2xl font-serif text-gray-900 placeholder:text-gray-300 border-b-2 border-gray-200 focus:border-carrotOrange-500 focus:outline-none transition-colors duration-300"
      @input="handleInput"
    />
    <div class="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-carrotOrange-500 transition-colors">
       <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
         <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
       </svg>
    </div>
  </div>
</template>
