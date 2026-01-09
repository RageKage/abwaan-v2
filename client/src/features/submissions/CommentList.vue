<script setup lang="ts">
import type { Comment } from '@/data/models/comment'
import { formatSubmissionDate } from '@/shared/utils/submissions'
import LoadMore from '@/shared/components/LoadMore.vue'

const props = defineProps<{
  comments: Comment[]
  loading: boolean
  error?: string | null
  canDelete?: (comment: Comment) => boolean
  hasMore: boolean
  loadingMore: boolean
  showEnd?: boolean
  endLabel?: string
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
  (e: 'retry'): void
  (e: 'delete', comment: Comment): void
}>()

const handleRetry = () => emit('retry')
const handleLoadMore = () => emit('load-more')
const handleDelete = (comment: Comment) => emit('delete', comment)
const canDeleteComment = (comment: Comment) => (props.canDelete ? props.canDelete(comment) : false)
</script>

<template>
  <div class="w-full border-b border-gray-200">
    <div v-if="loading" class="divide-y divide-gray-200 bg-white">
      <div v-for="i in 3" :key="i" class="h-32 bg-gray-50/50 animate-pulse"></div>
    </div>

    <div v-else-if="error" class="p-8 bg-red-50">
      <div class="flex items-center justify-between">
        <p class="font-mono text-xs text-red-600 uppercase">/// System Error: {{ error }}</p>
        <button
          type="button"
          class="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-gray-900 underline"
          @click="handleRetry"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else-if="comments.length === 0" class="p-12 text-center bg-white">
      <span class="font-serif text-lg italic text-gray-400">"No entries recorded yet."</span>
    </div>

    <div v-else class="bg-white">
      <div class="max-h-[520px] overflow-y-auto divide-y divide-gray-200" data-lenis-prevent>
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="group md:grid md:grid-cols-12 min-h-[120px] transition-colors"
        >
          <div
            class="md:col-span-3 p-6 md:p-8 bg-gray-50/40 md:border-r border-gray-200 group-hover:bg-gray-50/70 transition-colors"
          >
            <div class="flex flex-col gap-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-gray-900 truncate">
                {{ comment.username ? '@' + comment.username : comment.displayName || 'Anonymous' }}
              </p>
              <p class="font-mono text-[10px] text-gray-400">
                {{ formatSubmissionDate(comment.createdAt) }}
              </p>

              <button
                v-if="canDeleteComment(comment)"
                type="button"
                class="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-red-600 transition-colors text-left"
                @click="handleDelete(comment)"
              >
                [Delete]
              </button>
            </div>
          </div>

          <div class="md:col-span-9 p-6 md:p-8 bg-white group-hover:bg-gray-50/20 transition-colors">
            <p class="font-serif text-lg leading-relaxed text-gray-800 whitespace-pre-line">
              {{ comment.body }}
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 bg-gray-50/40">
        <LoadMore
          :has-more="hasMore"
          :loading="loadingMore"
          :show-end="showEnd"
          :end-label="endLabel"
          @load-more="handleLoadMore"
        />
      </div>
    </div>
  </div>
</template>
