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
  <main class="w-full font-sans text-gray-900 pt-24 pb-24">

    <div class="border-b border-gray-200">
      <div class="max-w-[1600px] mx-auto grid lg:grid-cols-12 min-h-[300px]">

        <div class="lg:col-span-7 p-8 md:p-12 lg:p-16 border-r border-gray-200 flex flex-col justify-end bg-gray-50">
          <div class="space-y-6">
             <span class="inline-block px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                Digital Library
             </span>
             <h1 class="text-6xl md:text-8xl font-serif tracking-tighter leading-none text-gray-900">
               The Archive
             </h1>
             <p class="text-xl text-gray-500 max-w-lg font-light leading-relaxed">
               Explore the latest verses, wisdom, and cultural heritage shared by the community.
             </p>
          </div>
        </div>

        <div class="lg:col-span-5 p-8 md:p-12 lg:p-16 flex items-end bg-white">
           <div class="w-full">
             <label class="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Search Database</label>
             <SearchBar
                v-model="searchTerm"
                placeholder="Type keywords..."
                @search="handleSearch"
                class="w-full"
              />
           </div>
        </div>

      </div>
    </div>

    <div class="bg-gray-50/95 backdrop-blur-md border-b border-gray-200 relative z-50">
      <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between">

        <div class="flex items-stretch w-full md:w-auto overflow-x-auto no-scrollbar border-b md:border-b-0 border-gray-200">
           <button
              v-for="tab in tabs"
              :key="tab.key"
              class="px-8 py-5 text-xs font-bold uppercase tracking-widest transition-colors border-r border-gray-200 whitespace-nowrap hover:bg-gray-50"
              :class="activeTab === tab.key ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-gray-500 hover:text-carrotOrange-600'"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
           </button>
        </div>

        <div class="flex items-center w-full md:w-auto divide-x divide-gray-200 border-b md:border-b-0 border-gray-200">
           <BaseDropdown v-model="activeLanguage" :options="languages" label="LANG" class="flex-1 md:flex-none" />
           <BaseDropdown v-model="sortBy" :options="sortOptions" label="SORT" class="flex-1 md:flex-none" />
        </div>

      </div>
    </div>

    <div class="max-w-[1600px] mx-auto min-h-[50vh]">

      <div v-if="contentState === 'loading'" class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200">
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

      <div v-else-if="contentState === 'empty'" class="flex flex-col items-center justify-center py-32 border-b border-gray-200">
          <div class="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6">
             <span class="text-2xl text-gray-400">?</span>
          </div>
          <h3 class="text-2xl font-serif text-gray-900 mb-2">No Records Found</h3>
          <p class="text-gray-500 mb-8 max-w-sm text-center">
             We couldn't find any entries matching your criteria. Try adjusting your filters.
          </p>
          <button @click="handleResetFilters" class="px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors">
             Clear Filters
          </button>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 bg-white">
         <div
           v-for="(submission, index) in submissionsStore.items"
           :key="submission.id"
           class="hover:bg-gray-50 transition-colors duration-300"
         >
            <SubmissionCard :submission="submission" :index="index" />
         </div>
      </div>

      <LoadMore
        v-if="!searchTerm && !!submissionsStore.lastDoc"
        :has-more="true"
        :loading="isLoadingMore"
        @load-more="handleLoadMore"
        class="border-b border-gray-200 py-12"
      />

           <div
        v-if="!submissionsStore.busy && submissionsStore.items.length > 0 && !submissionsStore.lastDoc && !searchTerm"
        class="mt-20 flex justify-center opacity-40"
      >
        <div class="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
          <span class="h-px w-8 bg-gray-300"></span>
          <span>End of Archive</span>
          <span class="h-px w-8 bg-gray-300"></span>
        </div>
      </div>

    </div>

  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
