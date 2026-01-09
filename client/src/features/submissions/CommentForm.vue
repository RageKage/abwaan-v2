<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    isGuest: boolean
    saving: boolean
    canPost: boolean
    error?: string | null
    maxLength?: number
    loginTo?: string
  }>(),
  {
    error: null,
    maxLength: 2000,
    loginTo: '/login',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

const lengthLabel = computed(() => `${props.modelValue.length}/${props.maxLength}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <div class="border-b border-gray-200 bg-white">
    <div v-if="isGuest" class="md:grid md:grid-cols-12">
      <div class="md:col-span-3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/40 p-6 md:p-8">
        <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Access Required</span>
        <p class="text-xs text-gray-500 mt-3 leading-relaxed">Sign in to add a note to the archive ledger.</p>
      </div>
      <div class="md:col-span-9 p-6 md:p-8 flex flex-col gap-6">
        <p class="font-serif text-lg text-gray-500 italic">Log in to add your voice to the archive.</p>
        <router-link
          :to="loginTo"
          class="inline-flex w-fit items-center justify-center px-8 py-4 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
        >
          Authenticate
        </router-link>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="md:grid md:grid-cols-12">
      <div class="md:col-span-3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/40 p-6 md:p-8">
        <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">New Entry</span>
        <p class="text-xs text-gray-500 mt-3 leading-relaxed">
          Keep it factual and respectful. Citations and translation notes are welcome.
        </p>
        <div class="mt-8">
          <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            {{ lengthLabel }}
          </span>
        </div>
      </div>

      <div class="md:col-span-9 p-6 md:p-8 flex flex-col gap-4">
        <label class="sr-only">Comment Content</label>
        <textarea
          :value="modelValue"
          rows="6"
          :maxlength="maxLength"
          class="block w-full min-h-[180px] resize-none border border-gray-200 bg-white p-6 font-serif text-lg text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors"
          placeholder="Record a new note for this entry..."
          @input="handleInput"
        ></textarea>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p v-if="error" class="text-[10px] font-mono text-red-500 uppercase tracking-widest">
            /// Error: {{ error }}
          </p>
          <button
            type="submit"
            class="sm:ml-auto px-10 py-4 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canPost"
          >
            {{ saving ? 'Saving...' : 'Record Entry' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
