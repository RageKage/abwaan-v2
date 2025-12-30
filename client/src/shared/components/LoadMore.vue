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
  <div v-if="hasMore" class="mt-10 flex justify-center">
    <button
      type="button"
      :disabled="loading"
      class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-50 hover:text-carrotOrange-600 disabled:cursor-not-allowed disabled:opacity-70"
      @click="$emit('load-more')"
    >
      <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-carrotOrange-500"></span>
      <span v-else>Load More</span>
    </button>
  </div>
</template>
