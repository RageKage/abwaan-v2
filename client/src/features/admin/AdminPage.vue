<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Submission, SubmissionStatus } from '@/data/models/submission'
import type { Report, ReportReason, ReportStatus } from '@/data/models/report'
import { countOpenReportsBySubmissionIds } from '@/data/firestore/reports.repo'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import { useReportsStore } from '@/features/admin/reports.store'
import { toastError, toastSuccess } from '@/shared/utils/alerts'
import EmptyState from '@/shared/components/EmptyState.vue'
import { ArrowUpRightIcon, EyeSlashIcon, CheckIcon } from '@heroicons/vue/24/outline'

const submissionsStore = useSubmissionsStore()
const reportsStore = useReportsStore()

const activeTab = ref<'submissions' | 'reports'>('submissions')
const activeStatus = ref<SubmissionStatus>('pending')
const activeReportStatus = ref<ReportStatus>('open')

const submissionLoading = computed(() => submissionsStore.busy)
const reportLoading = computed(() => reportsStore.busy)
const submissionItems = computed(() => submissionsStore.items)
const reportItems = computed(() => reportsStore.items)
const reportCounts = ref<Record<string, number>>({})
const reportCountsReady = ref(false)
const errorMessage = computed(() =>
  activeTab.value === 'submissions'
    ? 'We could not load the moderation queue. Please try again.'
    : 'We could not load reports right now. Please try again.',
)
const emptyTitle = computed(() => (activeTab.value === 'submissions' ? 'Queue is clear' : 'No reports to review'))
const emptyDescription = computed(() => {
  if (activeTab.value === 'submissions') {
    return 'No submissions need moderation right now.'
  }
  return 'Reports will show up here when the community flags content.'
})

type ReportGroup = {
  submissionId: string
  submissionTitle: string
  submissionType: Report['submissionType']
  latestAt: number
  reports: Report[]
}

const groupedReports = computed<ReportGroup[]>(() => {
  const groups = new Map<string, ReportGroup>()
  reportItems.value.forEach((report) => {
    const existing = groups.get(report.submissionId)
    if (existing) {
      existing.reports.push(report)
      if (report.createdAt > existing.latestAt) existing.latestAt = report.createdAt
      return
    }
    groups.set(report.submissionId, {
      submissionId: report.submissionId,
      submissionTitle: report.submissionTitle,
      submissionType: report.submissionType,
      latestAt: report.createdAt,
      reports: [report],
    })
  })

  return Array.from(groups.values()).sort((left, right) => right.latestAt - left.latestAt)
})

const countLabel = computed(() => {
  if (activeTab.value === 'submissions') return `${submissionItems.value.length}`.padStart(2, '0')
  return `${groupedReports.value.length}`.padStart(2, '0')
})

const showErrorState = computed(() => {
  if (activeTab.value === 'submissions') {
    return !submissionLoading.value && !!submissionsStore.error && submissionItems.value.length === 0
  }
  return !reportLoading.value && !!reportsStore.error && reportItems.value.length === 0
})

const canResolveReports = computed(() => activeReportStatus.value === 'open')

const loadSubmissions = async () => {
  await submissionsStore.loadLatest(undefined, false, 'createdAt', undefined, activeStatus.value)
  await loadReportCounts()
}

const loadReports = async () => {
  await reportsStore.load(activeReportStatus.value)
}

const loadReportCounts = async () => {
  reportCountsReady.value = false
  reportCounts.value = {}

  if (activeStatus.value === 'published') return

  const ids = submissionItems.value.map((item) => item.id).filter(Boolean)
  if (ids.length === 0) {
    reportCountsReady.value = true
    return
  }

  try {
    reportCounts.value = await countOpenReportsBySubmissionIds(ids)
  } catch {
    reportCounts.value = {}
  } finally {
    reportCountsReady.value = true
  }
}

const handleToggleStatus = async (submission: Submission) => {
  const nextStatus: SubmissionStatus =
    submission.status === 'hidden' || submission.status === 'pending' ? 'published' : 'hidden'
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

const reportReasonLabel = (reason: ReportReason) => {
  const labels: Record<ReportReason, string> = {
    spam: 'Spam',
    abuse: 'Abuse',
    plagiarism: 'Plagiarism',
    inaccurate: 'Inaccurate',
    other: 'Other',
  }
  return labels[reason] ?? reason
}

const handleRetry = async () => {
  if (activeTab.value === 'submissions') {
    await loadSubmissions()
    return
  }
  await loadReports()
}

const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
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
          <div
            class="col-span-12 lg:col-span-8 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between"
          >
            <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">System Level 01</span>
            <h1 class="text-6xl md:text-7xl font-serif text-gray-900 leading-none mt-4">The Desk.</h1>
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
                  v-for="status in ['pending', 'hidden', 'published']"
                  :key="status"
                  @click="activeStatus = status as any"
                  class="px-3 py-1 border border-gray-900 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  :class="
                    activeStatus === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-transparent text-gray-900 hover:bg-gray-200'
                  "
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
                  :class="
                    activeReportStatus === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-transparent text-gray-900 hover:bg-gray-200'
                  "
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

      <div v-else-if="showErrorState" class="border-b border-gray-200 bg-white">
        <EmptyState
          eyebrow="Admin Desk"
          :title="activeTab === 'submissions' ? 'Unable to load moderation queue' : 'Unable to load reports'"
          :description="errorMessage"
          primary-label="Try Again"
          :primary-action="handleRetry"
        />
      </div>

      <div
        v-else-if="
          (activeTab === 'submissions' && submissionItems.length === 0) ||
          (activeTab === 'reports' && reportItems.length === 0)
        "
      >
        <EmptyState eyebrow="Admin Desk" :title="emptyTitle" :description="emptyDescription" />
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
              <p class="font-mono text-xs text-gray-500 uppercase tracking-wide">By {{ submission.displayName }}</p>
              <div v-if="activeStatus !== 'published' && reportCountsReady" class="mt-4">
                <span
                  v-if="(reportCounts[submission.id] ?? 0) > 0"
                  class="inline-flex items-center gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100"
                >
                  ⚠️ {{ reportCounts[submission.id] }} Active Reports
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100"
                >
                  ✅ Reports Resolved
                </span>
              </div>
            </div>

            <div
              class="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300"
            >
              <router-link
                :to="`/s/${submission.id}`"
                class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Inspect
                <ArrowUpRightIcon class="w-3 h-3" />
              </router-link>

              <button
                @click="handleToggleStatus(submission)"
                class="flex items-center gap-2 px-4 py-2 border border-gray-900 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
              >
                <component
                  :is="submission.status === 'hidden' || submission.status === 'pending' ? CheckIcon : EyeSlashIcon"
                  class="w-3 h-3"
                />
                {{ submission.status === 'hidden' || submission.status === 'pending' ? 'Approve' : 'Hide' }}
              </button>
            </div>
          </article>
        </template>

        <template v-else>
          <article
            v-for="(group, index) in groupedReports"
            :key="group.submissionId"
            class="group relative flex flex-col justify-between p-8 border-b border-gray-200 bg-red-50/20 transition-colors hover:bg-red-50/40 min-h-[320px]"
            :class="(index + 1) % 3 !== 0 ? 'md:border-r' : ''"
          >
            <div class="flex justify-between items-start mb-6">
              <span class="font-mono text-[10px] text-red-600 uppercase tracking-widest">
                REPORTS / {{ group.reports.length }}
              </span>
              <span class="font-mono text-[10px] text-gray-400">{{ formatDate(group.latestAt) }}</span>
            </div>

            <div class="mb-6">
              <router-link
                :to="`/s/${group.submissionId}`"
                class="font-serif text-2xl text-gray-900 leading-tight hover:underline"
              >
                {{ group.submissionTitle }}
              </router-link>
              <p class="font-mono text-xs text-gray-500 uppercase mt-2">Total Reports: {{ group.reports.length }}</p>
            </div>

            <details class="mt-auto border-t border-gray-200 pt-4">
              <summary class="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-gray-600">
                View Reports
              </summary>
              <ul class="mt-4 space-y-4">
                <li v-for="report in group.reports" :key="report.id" class="p-4 bg-white border border-gray-200">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <span class="font-mono text-[10px] text-red-600 uppercase tracking-widest">
                        {{ reportReasonLabel(report.reason) }}
                      </span>
                      <p v-if="report.details" class="text-sm text-gray-700 mt-2">"{{ report.details }}"</p>
                      <p class="text-[10px] font-mono text-gray-400 uppercase mt-2">
                        {{ formatDate(report.createdAt) }}
                      </p>
                    </div>
                    <div v-if="canResolveReports" class="flex flex-col gap-2">
                      <button
                        @click="handleReportStatus(report, 'dismissed')"
                        class="px-3 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:border-gray-900 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        @click="handleReportStatus(report, 'reviewed')"
                        class="px-3 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </details>
          </article>
        </template>
      </div>
    </div>
  </main>
</template>
