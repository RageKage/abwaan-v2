<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { SubmissionType } from '@/data/models/submission'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
import BaseDropdown from '@/shared/components/BaseDropdown.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

const submissionsStore = useSubmissionsStore()

// --- Filter State ---
const activeTab = ref<'all' | SubmissionType>('all')
const sortBy = ref<'createdAt' | 'voteScore'>('createdAt')
const activeLanguage = ref<'all' | 'so' | 'en'>('all')
const searchTerm = ref('')
const isLoadingMore = ref(false)

// --- Scroll & Visibility State ---
const isFilterBarVisible = ref(true)
const lastScrollY = ref(0)

// --- Configuration ---
const tabs = [
  { key: 'all', label: 'All Records' },
  { key: 'Proverb', label: 'Proverbs' },
  { key: 'Poetry', label: 'Poetry' },
] as const

const languages = [
  { key: 'all', label: 'All Langs' },
  { key: 'so', label: 'Somali' },
  { key: 'en', label: 'English' },
] as const

const sortOptions = [
  { key: 'createdAt', label: 'Newest' },
  { key: 'voteScore', label: 'Top Rated' },
] as const

// --- Computed ---
const activeType = computed(() => (activeTab.value === 'all' ? undefined : activeTab.value))
const activeLang = computed(() => (activeLanguage.value === 'all' ? undefined : activeLanguage.value))
const hasSearch = computed(() => searchTerm.value.trim().length > 0)
const hasFilters = computed(
  () => activeTab.value !== 'all' || activeLanguage.value !== 'all' || sortBy.value !== 'createdAt',
)
const contentState = computed(() => {
  if (submissionsStore.busy) return 'loading'
  if (submissionsStore.error) return 'error'
  if (submissionsStore.items.length === 0) return 'empty'
  return 'grid'
})

// --- Logic ---
const loadLatest = async () => {
  await submissionsStore.loadLatest(activeType.value, false, sortBy.value, activeLang.value)
}

const handleSearch = async () => {
  await submissionsStore.search(searchTerm.value)
}

const handleRetry = async () => {
  if (hasSearch.value) {
    await handleSearch()
    return
  }
  await loadLatest()
}

const handleResetFilters = () => {
  activeLanguage.value = 'all'
  sortBy.value = 'createdAt'
  activeTab.value = 'all'
}

const handleClearSearch = () => {
  searchTerm.value = ''
}

// --- Empty State Logic ---
const emptyStateTitle = computed(() => {
  if (hasSearch.value) return `No results for "${searchTerm.value.trim()}"`
  if (hasFilters.value) return 'No records match your filters'
  return 'The archive is empty'
})

const emptyStateDescription = computed(() => {
  if (hasSearch.value) return 'Try a different keyword or clear your search.'
  if (hasFilters.value) return 'Adjust the filters to explore more entries.'
  return 'Be the first to add a proverb or poem to the collection.'
})

const emptyPrimaryLabel = computed(() => {
  if (hasSearch.value) return 'Clear search'
  if (hasFilters.value) return 'Reset filters'
  return 'Contribute'
})

const emptyPrimaryTo = computed(() => {
  if (!hasSearch.value && !hasFilters.value) return '/contribute'
  return undefined
})

const emptyPrimaryAction = computed(() => {
  if (hasSearch.value) return handleClearSearch
  if (hasFilters.value) return handleResetFilters
  return undefined
})

const emptySecondaryLabel = computed(() => {
  if (hasSearch.value && hasFilters.value) return 'Reset filters'
  return undefined
})

const emptySecondaryAction = computed(() => {
  if (hasSearch.value && hasFilters.value) return handleResetFilters
  return undefined
})

const errorTitle = computed(() => (hasSearch.value ? 'Search unavailable' : 'Archive unavailable'))
const errorDescription = computed(() =>
  hasSearch.value
    ? 'Search is temporarily unavailable. Please try again.'
    : 'We could not load the archive right now. Please try again.',
)
const errorEyebrow = computed(() => (hasSearch.value ? 'Search' : 'Archive'))
const errorSecondaryLabel = computed(() => (hasSearch.value ? 'Clear search' : undefined))
const errorSecondaryAction = computed(() => (hasSearch.value ? handleClearSearch : undefined))

const handleLoadMore = async () => {
  isLoadingMore.value = true
  try {
    await submissionsStore.loadLatest(activeType.value, true, sortBy.value, activeLang.value)
  } finally {
    isLoadingMore.value = false
  }
}

// --- Scroll Handler for Smart Bar ---
const handleScroll = () => {
  const currentScrollY = window.scrollY

  // Ignore small movements (jitter)
  if (Math.abs(currentScrollY - lastScrollY.value) < 10) return

  // If at top, always show
  if (currentScrollY < 50) {
    isFilterBarVisible.value = true
  }
  // If scrolling DOWN, hide
  else if (currentScrollY > lastScrollY.value) {
    isFilterBarVisible.value = false
  }
  // If scrolling UP, show
  else {
    isFilterBarVisible.value = true
  }

  lastScrollY.value = currentScrollY
}

// --- Lifecycle ---
onMounted(() => {
  loadLatest()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch([activeType, sortBy, activeLanguage], () => {
  if (!searchTerm.value) {
    void loadLatest()
  }
})

watch(searchTerm, (newTerm) => {
  if (!newTerm) {
    void loadLatest()
  }
})
</script>

<template>
  <main class="page-shell app-panel dot-pattern">
    <div class="bg-white border-y border-gray-200 shadow-sm">
      <div
        class="max-w-[1600px] mx-auto grid lg:grid-cols-12 h-auto lg:h-16 divide-y lg:divide-y-0 lg:divide-x divide-gray-200"
      >
        <div class="lg:col-span-4 flex overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex-1 min-w-[100px] h-16 lg:h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all duration-200 border-r border-gray-100 lg:border-r-0 last:border-r-0"
            :class="
              activeTab === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-400 hover:text-carrotOrange-600 hover:bg-gray-50'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="lg:col-span-5 flex items-center px-6 bg-white group hover:bg-gray-50 transition-colors">
          <div class="w-full relative flex items-center">
            <svg class="w-4 h-4 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchTerm"
              @keydown.enter="handleSearch"
              type="text"
              placeholder="Search database..."
              class="w-full h-16 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none uppercase tracking-wider"
            />
            <button
              v-if="searchTerm"
              @click="handleClearSearch"
              class="text-xs font-bold text-gray-400 hover:text-red-500 uppercase transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 flex bg-white">
          <div
            class="flex-1 h-16 border-r lg:border-l border-gray-200 relative group hover:bg-gray-50 transition-colors z-10"
          >
            <BaseDropdown
              v-model="activeLanguage"
              :options="languages"
              label="Lang"
              class="w-full h-full justify-center"
            />
          </div>

          <div class="flex-1 h-16 relative group hover:bg-gray-50 transition-colors">
            <BaseDropdown
              v-model="sortBy"
              :options="sortOptions"
              label="Sort"
              class="w-full h-full justify-center z-10"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto">
      <div
        v-if="contentState === 'loading'"
        class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200"
      >
        <div v-for="i in 6" :key="i" class="h-96 p-10 animate-pulse bg-white">
          <div class="flex justify-between mb-8">
            <div class="h-4 w-20 bg-gray-100 rounded"></div>
            <div class="h-4 w-12 bg-gray-100 rounded"></div>
          </div>
          <div class="h-8 w-3/4 bg-gray-100 rounded mb-4"></div>
          <div class="h-4 w-full bg-gray-50 rounded mb-2"></div>
          <div class="h-4 w-2/3 bg-gray-50 rounded"></div>
        </div>
      </div>

      <div v-else-if="contentState === 'error'">
        <EmptyState
          :eyebrow="errorEyebrow"
          :title="errorTitle"
          :description="errorDescription"
          primary-label="Try Again"
          :primary-action="handleRetry"
          :secondary-label="errorSecondaryLabel"
          :secondary-action="errorSecondaryAction"
        />
      </div>

      <div v-else-if="contentState === 'empty'">
        <EmptyState
          eyebrow="Archive"
          :title="emptyStateTitle"
          :description="emptyStateDescription"
          :primary-label="emptyPrimaryLabel"
          :primary-to="emptyPrimaryTo"
          :primary-action="emptyPrimaryAction"
          :secondary-label="emptySecondaryLabel"
          :secondary-action="emptySecondaryAction"
        />
      </div>

      <div
        v-else
        class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 bg-white"
      >
        <div
          v-for="(submission, index) in submissionsStore.items"
          :key="submission.id"
          class="hover:bg-gray-50 transition-colors duration-300"
        >
          <SubmissionCard :submission="submission" :index="index" />
        </div>
      </div>

      <div class="bg-white">
        <LoadMore
          v-if="!searchTerm"
          :has-more="!!submissionsStore.lastDoc"
          :loading="isLoadingMore"
          :show-end="!submissionsStore.busy && submissionsStore.items.length > 0"
          @load-more="handleLoadMore"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
