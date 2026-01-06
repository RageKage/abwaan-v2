<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  eyebrow?: string
  primaryLabel?: string
  primaryTo?: string
  primaryAction?: () => void
  secondaryLabel?: string
  secondaryTo?: string
  secondaryAction?: () => void
}>()

const handlePrimary = () => {
  props.primaryAction?.()
}

const handleSecondary = () => {
  props.secondaryAction?.()
}
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center border-b border-gray-200 bg-white py-24 px-6">
    <div class="mb-6 text-gray-300">
      <slot name="icon">
        <div
          class="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center"
        >
          <span class="text-2xl text-gray-400">?</span>
        </div>
      </slot>
    </div>

    <p v-if="eyebrow" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
      {{ eyebrow }}
    </p>
    <h3 class="text-2xl font-serif text-gray-900 mb-2">{{ title }}</h3>
    <p v-if="description" class="text-gray-500 font-light text-sm tracking-wide max-w-sm mx-auto mb-8">
      {{ description }}
    </p>

    <div v-if="primaryLabel || secondaryLabel" class="flex flex-col sm:flex-row gap-3">
      <router-link
        v-if="primaryTo && primaryLabel"
        :to="primaryTo"
        class="px-8 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
      >
        {{ primaryLabel }}
      </router-link>
      <button
        v-else-if="primaryLabel"
        type="button"
        class="px-8 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
        @click="handlePrimary"
      >
        {{ primaryLabel }}
      </button>

      <router-link
        v-if="secondaryTo && secondaryLabel"
        :to="secondaryTo"
        class="px-8 py-4 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-colors"
      >
        {{ secondaryLabel }}
      </router-link>
      <button
        v-else-if="secondaryLabel"
        type="button"
        class="px-8 py-4 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-colors"
        @click="handleSecondary"
      >
        {{ secondaryLabel }}
      </button>
    </div>
  </div>
</template>
