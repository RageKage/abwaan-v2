<script setup lang="ts">
import type { Submission } from '@/data/models/submission'
import {
  formatSubmissionDate,
  submissionAuthorInitial,
  submissionAuthorLabel,
  submissionPreviewText,
} from '@/shared/utils/submissions'

const props = defineProps<{
  submission: Submission
  index?: number
}>()
</script>

<template>
  <router-link
    :to="`/s/${props.submission.id}`"
    v-motion
    :initial="{ opacity: 0, y: 30 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 25,
        delay: props.index ? props.index * 50 : 0,
      },
    }"
    class="group relative flex flex-col justify-between p-8 h-full bg-white border border-gray-100 rounded-[2rem] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl overflow-hidden"
  >
    <div>
      <div class="flex items-center justify-between mb-6">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-hover:bg-carrotOrange-50 group-hover:text-carrotOrange-600 group-hover:border-carrotOrange-100 transition-colors"
        >
          {{ props.submission.type }}
        </span>
        <span class="text-xs font-mono text-gray-300">
          {{ formatSubmissionDate(props.submission.createdAt) }}
        </span>
      </div>

      <h2
        class="mb-4 text-xl font-bold text-gray-900 leading-tight group-hover:text-carrotOrange-600 transition-colors break-words line-clamp-3"
      >
        <span v-if="props.submission.type === 'Proverb'">
          {{ props.submission.text }}
        </span>
        <span v-else>
          {{ props.submission.title || 'Untitled Poem' }}
        </span>
      </h2>

      <p
        v-if="props.submission.type === 'Poetry'"
        class="font-serif text-lg text-gray-600 leading-relaxed italic line-clamp-4 break-words"
      >
        "{{ submissionPreviewText(props.submission) }}"
      </p>
    </div>

    <div class="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
      <router-link
        :to="`/p/${props.submission.uid}`"
        class="flex items-center gap-3 group/author -ml-2 px-2 py-1 rounded-full transition-colors hover:bg-gray-50"
        @click.stop
      >
        <div
          class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover/author:bg-white group-hover/author:shadow-sm transition-all"
        >
          {{ submissionAuthorInitial(props.submission) }}
        </div>
        <span
          class="text-xs font-bold text-gray-400 group-hover/author:text-gray-700 transition-colors"
        >
          {{ submissionAuthorLabel(props.submission) }}
        </span>
      </router-link>

      <div
        class="flex items-center gap-1.5 text-gray-300 group-hover:text-carrotOrange-400 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span class="text-xs font-bold font-mono">{{ props.submission.voteScore }}</span>
      </div>
    </div>
  </router-link>
</template>
