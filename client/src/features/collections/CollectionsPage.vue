<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { SubmissionType } from '@/data/models/submission'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import SearchBar from './SearchBar.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
import BaseDropdown from '@/shared/components/BaseDropdown.vue'

const submissionsStore = useSubmissionsStore()

const activeTab = ref<'all' | SubmissionType>('all')
const sortBy = ref<'createdAt' | 'voteScore'>('createdAt')
const activeLanguage = ref<'all' | 'so' | 'en'>('all')
const searchTerm = ref('')
const isLoadingMore = ref(false)

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

const activeType = computed(() => (activeTab.value === 'all' ? undefined : activeTab.value))
const activeLang = computed(() => (activeLanguage.value === 'all' ? undefined : activeLanguage.value))
const contentState = computed(() => {
  if (submissionsStore.busy) return 'loading'
  if (submissionsStore.items.length === 0) return 'empty'
  return 'grid'
})

const loadLatest = async () => {
  await submissionsStore.loadLatest(activeType.value, false, sortBy.value, activeLang.value)
}

const handleSearch = async () => {
  await submissionsStore.search(searchTerm.value)
}

const handleResetFilters = () => {
  activeLanguage.value = 'all'
  sortBy.value = 'createdAt'
  activeTab.value = 'all'
}

const handleLoadMore = async () => {
  isLoadingMore.value = true
  try {
    await submissionsStore.loadLatest(activeType.value, true, sortBy.value, activeLang.value)
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(loadLatest)

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
  <main
    class="relative w-full min-h-screen bg-gray-50 dot-pattern pt-24 font-sans text-gray-900 transition-all duration-300"
  >
    <div class="border-b border-gray-200">
      <div class="max-w-[1600px] mx-auto grid lg:grid-cols-12 min-h-[300px]">
        <div class="lg:col-span-7 p-8 md:p-12 lg:p-16 border-r border-gray-200 flex flex-col justify-end bg-gray-50">
          <div class="space-y-6">
            <span
              class="inline-block px-3 py-1 rounded-3xl border border-gray-900 text-[10px] font-bold uppercase tracking-widest w-fit"
            >
              Digital Library
            </span>
            <h1 class="text-6xl md:text-8xl font-serif tracking-tighter leading-none text-gray-900">The Archive</h1>
            <p class="text-xl text-gray-500 max-w-lg font-light leading-relaxed">
              Explore the latest verses, wisdom, and cultural heritage shared by the community.
            </p>
          </div>
        </div>

        <div class="lg:col-span-5 p-8 md:p-12 lg:p-16 flex items-end bg-white">
          <div class="w-full">
            <label class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Search Database</label>
            <SearchBar v-model="searchTerm" placeholder="Type keywords..." @search="handleSearch" class="w-full" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white border-b border-gray-200 z-40 sticky top-0 shadow-sm">
      <div class="max-w-[1600px] mx-auto grid lg:grid-cols-12">
        <div class="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-gray-200 flex overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex-1 min-w-[140px] h-14 flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all duration-200 border-r border-gray-100 lg:border-gray-200 last:border-r-0 lg:last:border-r-0"
            :class="
              activeTab === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-400 hover:text-carrotOrange-600 hover:bg-gray-50'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="lg:col-span-5 flex bg-white">
          <div class="flex-1 h-14 border-r border-gray-200 relative group hover:bg-gray-50 transition-colors">
            <BaseDropdown
              v-model="activeLanguage"
              :options="languages"
              label="LANG"
              class="w-full h-full justify-center"
            />
          </div>

          <div class="flex-1 h-14 relative group hover:bg-gray-50 transition-colors">
            <BaseDropdown v-model="sortBy" :options="sortOptions" label="SORT" class="w-full h-full justify-center" />
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

      <div
        v-else-if="contentState === 'empty'"
        class="flex flex-col items-center justify-center py-32 border-b border-gray-200"
      >
        <div
          class="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6"
        >
          <span class="text-2xl text-gray-400">?</span>
        </div>
        <h3 class="text-2xl font-serif text-gray-900 mb-2">No Records Found</h3>
        <p class="text-gray-500 mb-8 max-w-sm text-center">
          We couldn't find any entries matching your criteria. Try adjusting your filters.
        </p>
        <button
          @click="handleResetFilters"
          class="px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
        >
          Clear Filters
        </button>
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
          @load-more="handleLoadMore"
        />

        <div
          v-if="!submissionsStore.busy && submissionsStore.items.length > 0 && !submissionsStore.lastDoc && !searchTerm"
          class="py-[32px] flex justify-center opacity-40"
        >
          <div class="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            <span class="h-px w-8 bg-gray-300"></span>
            <span>End of Archive</span>
            <span class="h-px w-8 bg-gray-300"></span>
          </div>
        </div>
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
