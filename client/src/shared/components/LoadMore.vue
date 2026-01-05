<script setup lang="ts">
defineProps<{
  hasMore: boolean
  loading: boolean
}>()

defineEmits<{
  (e: 'load-more'): void
}>()
</script>

<template>
  <div v-if="hasMore" class="w-full">
    <button
      type="button"
      :disabled="loading"
      class="w-full py-[32px] flex items-center justify-center gap-3 bg-white text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-carrotOrange-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-wait"
      @click="$emit('load-more')"
    >
      <span
        v-if="loading"
        class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-carrotOrange-600"
      ></span>
      <span v-else>Load Next Batch</span>
      <span v-if="!loading" class="text-lg">↓</span>
    </button>
  </div>
</template>
