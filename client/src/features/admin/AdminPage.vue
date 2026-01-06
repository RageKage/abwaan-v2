<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Submission, SubmissionStatus } from '@/data/models/submission'
import type { Report, ReportStatus } from '@/data/models/report'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import { useReportsStore } from '@/features/admin/reports.store'
import { toastError, toastSuccess } from '@/shared/utils/alerts'
import EmptyState from '@/shared/components/EmptyState.vue'
import {
  ArrowUpRightIcon,
  EyeSlashIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const submissionsStore = useSubmissionsStore()
const reportsStore = useReportsStore()

const activeTab = ref<'submissions' | 'reports'>('submissions')
const activeStatus = ref<SubmissionStatus>('hidden')
const activeReportStatus = ref<ReportStatus>('open')

const submissionLoading = computed(() => submissionsStore.busy)
const reportLoading = computed(() => reportsStore.busy)
const submissionItems = computed(() => submissionsStore.items)
const reportItems = computed(() => reportsStore.items)
const emptyTitle = computed(() => (activeTab.value === 'submissions' ? 'Queue is clear' : 'No reports to review'))
const emptyDescription = computed(() => {
  if (activeTab.value === 'submissions') {
    return 'No submissions need moderation right now.'
  }
  return 'Reports will show up here when the community flags content.'
})

const countLabel = computed(() => {
  if (activeTab.value === 'submissions') return `${submissionItems.value.length}`.padStart(2, '0')
  return `${reportItems.value.length}`.padStart(2, '0')
})

const loadSubmissions = async () => {
  await submissionsStore.loadLatest(undefined, false, 'createdAt', undefined, activeStatus.value)
}

const loadReports = async () => {
  await reportsStore.load(activeReportStatus.value)
}

const handleToggleStatus = async (submission: Submission) => {
  const nextStatus = submission.status === 'hidden' ? 'published' : 'hidden'
  try {
    await submissionsStore.setStatus(submission.id, nextStatus)
    toastSuccess(nextStatus === 'hidden' ? 'Submission hidden' : 'Submission restored')
    await loadSubmissions()
  } catch {
    toastError('Failed to update submission status')
  }
}

const handleReportStatus = async (report: Report, status: ReportStatus) => {
  try {
    await reportsStore.setStatus(report.id, status)
    toastSuccess('Report updated')
    await loadReports()
  } catch {
    toastError('Failed to update report')
  }
}

const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  void loadSubmissions()
})

watch([activeStatus, activeTab], () => {
  if (activeTab.value === 'submissions') void loadSubmissions()
})

watch([activeReportStatus, activeTab], () => {
  if (activeTab.value === 'reports') void loadReports()
})
</script>

<template>
  <main class="min-h-screen w-full bg-white font-sans text-gray-900 pt-24 pb-20">
    <div class="max-w-[1800px] mx-auto border-x border-gray-200">

      <header class="border-b border-gray-200">
        <div class="grid grid-cols-12 min-h-[200px]">

          <div class="col-span-12 lg:col-span-8 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between">
            <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">System Level 01</span>
            <h1 class="text-6xl md:text-7xl font-serif text-gray-900 leading-none mt-4">
              The Desk.
            </h1>
          </div>

          <div class="col-span-12 lg:col-span-4 bg-gray-50/50">
             <div class="grid grid-cols-2 border-b border-gray-200 h-16">
                <button
                  v-for="tab in ['submissions', 'reports']"
                  :key="tab"
                  @click="activeTab = tab as any"
                  class="flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-colors hover:bg-gray-100"
                  :class="activeTab === tab ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-500'"
                >
                  {{ tab }}
                </button>
             </div>

             <div class="p-8 border-b border-gray-200 flex items-center justify-between">
                <span class="font-mono text-xs text-gray-400 uppercase">Queue Count</span>
                <span class="font-serif text-4xl">{{ countLabel }}</span>
             </div>

             <div class="flex flex-wrap p-4 gap-2">
                <template v-if="activeTab === 'submissions'">
                  <button
                    v-for="status in ['hidden', 'published']"
                    :key="status"
                    @click="activeStatus = status as any"
                    class="px-3 py-1 border border-gray-900 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    :class="activeStatus === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-transparent text-gray-900 hover:bg-gray-200'"
                  >
                    {{ status }}
                  </button>
                </template>
                <template v-else>
                   <button
                    v-for="status in ['open', 'reviewed']"
                    :key="status"
                    @click="activeReportStatus = status as any"
                    class="px-3 py-1 border border-gray-900 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    :class="activeReportStatus === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-transparent text-gray-900 hover:bg-gray-200'"
                  >
                    {{ status }}
                  </button>
                </template>
             </div>
          </div>
        </div>
      </header>

      <div v-if="submissionLoading || reportLoading" class="p-20 text-center border-b border-gray-200">
         <span class="font-mono text-xs animate-pulse">LOADING DATA...</span>
      </div>

      <div
        v-else-if="(activeTab === 'submissions' && submissionItems.length === 0) || (activeTab === 'reports' && reportItems.length === 0)"
      >
        <EmptyState
          eyebrow="Admin Desk"
          :title="emptyTitle"
          :description="emptyDescription"
        />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

        <template v-if="activeTab === 'submissions'">
          <article
            v-for="(submission, index) in submissionItems"
            :key="submission.id"
            class="group relative flex flex-col justify-between p-8 border-b border-gray-200 transition-colors hover:bg-gray-50 min-h-[320px]"
            :class="(index + 1) % 3 !== 0 ? 'md:border-r' : ''"
          >
            <div class="flex justify-between items-start mb-6">
              <span class="font-mono text-[10px] text-carrotOrange-600 uppercase tracking-widest">
                 0{{ index + 1 }} / {{ submission.type }}
              </span>
              <span class="font-mono text-[10px] text-gray-400">{{ formatDate(submission.createdAt) }}</span>
            </div>

            <div class="mb-8">
              <h3 class="font-serif text-3xl text-gray-900 leading-tight mb-4">
                {{ submission.title || submission.text }}
              </h3>
              <p class="font-mono text-xs text-gray-500 uppercase tracking-wide">
                By {{ submission.displayName }}
              </p>
            </div>

            <div class="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
               <router-link
                  :to="`/s/${submission.id}`"
                  class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  Inspect <ArrowUpRightIcon class="w-3 h-3" />
                </router-link>

                <button
                  @click="handleToggleStatus(submission)"
                  class="flex items-center gap-2 px-4 py-2 border border-gray-900 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <component :is="submission.status === 'hidden' ? CheckIcon : EyeSlashIcon" class="w-3 h-3" />
                  {{ submission.status === 'hidden' ? 'Approve' : 'Hide' }}
                </button>
            </div>
          </article>
        </template>

        <template v-else>
          <article
            v-for="(report, index) in reportItems"
            :key="report.id"
            class="group relative flex flex-col justify-between p-8 border-b border-gray-200 bg-red-50/20 transition-colors hover:bg-red-50/40 min-h-[320px]"
            :class="(index + 1) % 3 !== 0 ? 'md:border-r' : ''"
          >
             <div class="flex justify-between items-start mb-6">
              <span class="font-mono text-[10px] text-red-600 uppercase tracking-widest">
                 REPORT / {{ report.reason }}
              </span>
              <span class="font-mono text-[10px] text-gray-400">{{ formatDate(report.createdAt) }}</span>
            </div>

            <div class="mb-8">
              <p class="font-serif text-xl italic text-gray-800 mb-4">"{{ report.details }}"</p>
              <div class="h-px w-8 bg-gray-300 mb-4"></div>
              <p class="font-mono text-xs text-gray-500 uppercase">
                Target: {{ report.submissionTitle }}
              </p>
            </div>

            <div class="mt-auto grid grid-cols-2 gap-px bg-gray-200 border border-gray-200">
               <button
                  @click="handleReportStatus(report, 'dismissed')"
                  class="bg-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  @click="handleReportStatus(report, 'reviewed')"
                  class="bg-gray-900 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Resolve
                </button>
            </div>
          </article>
        </template>

      </div>
    </div>
  </main>
</template>
