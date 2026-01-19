<script setup lang="ts">
defineProps<{
  hasMore: boolean
  loading: boolean
  showEnd?: boolean
  endLabel?: string
}>()

defineEmits<{
  (e: 'load-more'): void
}>()
</script>

<template>
  <div class="w-full">
    <button
      v-if="hasMore"
      type="button"
      :disabled="loading"
      class="group w-full py-[32px] flex items-center justify-center gap-3 bg-white text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-carrotOrange-600 hover:bg-gray-50 transition-all disabled:opacity-100 disabled:cursor-wait"
      @click="$emit('load-more')"
    >
      <div v-if="loading" class="flex items-center gap-2">
         <span class="h-1.5 w-1.5 rotate-45 bg-carrotOrange-600 animate-[pulse_1s_ease-in-out_infinite]"></span>
         <span class="h-1.5 w-1.5 rotate-45 bg-carrotOrange-600/60 animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
         <span class="h-1.5 w-1.5 rotate-45 bg-carrotOrange-600/30 animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
      </div>

      <span v-else class="group-hover:translate-y-px transition-transform duration-300">
        Load Next Batch
      </span>

      <span
        v-if="!loading"
        class="text-lg group-hover:translate-y-1 transition-transform duration-300"
      >
        ↓
      </span>
    </button>

    <div v-else-if="showEnd && !loading" class="py-[32px] flex justify-center opacity-40">
      <div class="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
        <span class="h-px w-8 bg-gray-300"></span>
        <span>{{ endLabel || 'End of Archive' }}</span>
        <span class="h-px w-8 bg-gray-300"></span>
      </div>
    </div>
  </div>
</template>
