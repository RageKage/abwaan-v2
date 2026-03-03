<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Submission } from '@/data/models/submission'
import {
  formatSubmissionDate,
  submissionAuthorInitial,
  submissionAuthorLabel,
  submissionPreviewText,
} from '@/shared/utils/submissions'
import { sanitizeText } from '@/shared/utils/sanitize'

const router = useRouter()

const props = defineProps<{
  submission: Submission
  index?: number
}>()


const goToSubmission = () => {
  router.push(`/s/${props.submission.id}`)
}

const handleCardKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    goToSubmission()
  }
}
</script>

<template>
  <article
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { delay: props.index ? props.index * 50 : 0 } }"
    class="group block h-full p-10 md:p-12 flex flex-col justify-between relative z-0 cursor-pointer"
    role="link"
    tabindex="0"
    @click="goToSubmission"
    @keydown="handleCardKeydown"
  >
    <div class="flex items-start justify-between mb-8">
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-widest text-carrotOrange-600">
          {{ props.submission.type }}
        </span>
        <span class="text-[10px] font-mono text-gray-400 uppercase">ID: {{ props.submission.id.slice(0, 6) }}</span>
      </div>
      <span class="text-[10px] font-mono text-gray-400">
        {{ formatSubmissionDate(props.submission.createdAt) }}
      </span>
    </div>

    <div class="mb-12">
      <h2
        class="text-3xl md:text-4xl font-serif text-gray-900 leading-tight group-hover:text-carrotOrange-600 transition-colors line-clamp-3 mb-4"
      >
        <span v-if="props.submission.type === 'Proverb'" v-html="sanitizeText(props.submission.text)">
        </span>
        <span v-else v-html="sanitizeText(props.submission.title || 'Untitled Poem')">
        </span>
      </h2>

      <p
        v-if="props.submission.type === 'Poetry'"
        class="font-serif text-lg text-gray-500 italic line-clamp-3 border-l-2 border-gray-100 pl-4 group-hover:border-carrotOrange-200 transition-colors"
        v-html="'&quot;' + sanitizeText(submissionPreviewText(props.submission)) + '&quot;'"
      >
      </p>
    </div>

    <div
      class="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between group-hover:border-gray-200 transition-colors"
    >
      <router-link :to="`/p/${props.submission.uid}`" class="flex items-center gap-3" @click.stop @keydown.stop>
        <div
          class="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-carrotOrange-500 group-hover:text-white group-hover:border-carrotOrange-500 transition-colors"
        >
          {{ submissionAuthorInitial(props.submission) }}
        </div>
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-900">
          {{ submissionAuthorLabel(props.submission) }}
        </span>
      </router-link>

      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-bold text-gray-300 group-hover:text-carrotOrange-500 transition-colors">
          {{ props.submission.voteScore }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 text-gray-300 group-hover:text-carrotOrange-500 transition-colors transition-transform"
          :class="{ 'rotate-180': props.submission.voteScore < 0 }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>
    </div>
  </article>
</template>
