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
  { key: 'all', label: 'All Collection' },
  { key: 'Proverb', label: 'Proverbs' },
  { key: 'Poetry', label: 'Poetry' },
] as const

const languages = [
  { key: 'all', label: 'All' },
  { key: 'so', label: 'Somali' },
  { key: 'en', label: 'English' },
] as const

const sortOptions = [
  { key: 'createdAt', label: 'Latest' },
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

const handleClearSearch = () => {
  searchTerm.value = ''
  void handleSearch()
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
    class="min-h-screen w-full bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans pb-24 selection:bg-carrotOrange-100 selection:text-carrotOrange-900"
  >
    <div class="mx-auto max-w-7xl">
      <!-- Header & Search -->
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-20">
        <div class="relative">
          <div
            class="absolute -top-10 -left-10 w-40 h-40 bg-carrotOrange-200/20 rounded-full blur-3xl transition-colors duration-700"
          ></div>

          <div class="relative space-y-4">
            <div class="flex items-center gap-3">
              <span class="h-px w-8 bg-carrotOrange-500"></span>
              <span
                key="badge"
                class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.25em] transition-all duration-500"
              >
                Digital Library
              </span>
            </div>

            <h1
              class="font-serif text-6xl md:text-7xl font-medium tracking-tighter text-gray-900 transition-all duration-500"
            >
              The Archive.
            </h1>

            <p
              class="text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed font-light font-serif italic transition-all duration-500"
            >
              Explore the latest verses, wisdom, and cultural heritage shared by the community.
            </p>
          </div>
        </div>

        <div class="w-full lg:w-[400px]">
          <div
            class="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-transform focus-within:-translate-y-1 duration-300"
          >
            <SearchBar
              v-model="searchTerm"
              placeholder="Search the collection..."
              @search="handleSearch"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div class="sticky top-6 z-30 mb-12">
        <div
          class="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-200/60 p-2 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div class="flex p-1 bg-gray-100/50 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="relative px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 focus:outline-none whitespace-nowrap flex-1 md:flex-none"
              :class="
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5 scale-[1.02]'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <div
            class="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-2 md:pt-0 px-2 md:px-0"
          >
            <span class="text-[10px] font-bold uppercase text-gray-400 mr-2 hidden md:inline-block">Filter By:</span>
            <BaseDropdown v-model="activeLanguage" :options="languages" label="LANG" class="flex-1 md:flex-none" />
            <div class="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>
            <BaseDropdown v-model="sortBy" :options="sortOptions" label="Sort" class="flex-1 md:flex-none" />
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <transition name="fade-grid" mode="out-in">
        <div :key="contentState">
          <div v-if="contentState === 'loading'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Loading State -->
            <div
              v-for="i in 6"
              :key="i"
              class="flex flex-col h-80 rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="h-8 w-8 animate-pulse rounded-full bg-gray-100"></div>
                <div class="space-y-2">
                  <div class="h-3 w-24 animate-pulse rounded bg-gray-100"></div>
                  <div class="h-2 w-16 animate-pulse rounded bg-gray-100"></div>
                </div>
              </div>
              <div class="space-y-4 flex-1">
                <div class="h-6 w-3/4 animate-pulse rounded bg-gray-100"></div>
                <div class="h-4 w-full animate-pulse rounded bg-gray-50"></div>
                <div class="h-4 w-full animate-pulse rounded bg-gray-50"></div>
              </div>
            </div>
          </div>

          <div
            v-if="contentState === 'empty'"
            class="flex flex-col items-center justify-center py-24 px-4 text-center rounded-[2.5rem] border border-gray-100 bg-white shadow-sm"
          >
            <!-- Empty State -->
            <div
              class="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full border-2 border-gray-200 bg-white/50 text-carrotOrange-500 shadow-sm"
            >
              <svg
                v-if="searchTerm"
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>

            <div v-if="searchTerm">
              <h3 class="text-2xl font-serif text-gray-900 mb-2">No results found</h3>
              <p class="text-gray-500 max-w-sm mx-auto mb-8 font-light">
                We couldn't find any submissions matching "
                <span class="font-medium text-gray-900">{{ searchTerm }}</span>
                ".
              </p>
              <button
                @click="handleClearSearch"
                class="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-lg ring-1 ring-gray-100 transition-all hover:ring-carrotOrange-200 hover:text-carrotOrange-600"
              >
                Clear Search
              </button>
            </div>

            <div v-else>
              <h3 class="text-2xl font-serif text-gray-900 mb-2">The Archive is empty</h3>
              <p class="text-gray-500 max-w-sm mx-auto mb-8 font-light">
                We couldn't find any {{ activeTab === 'all' ? 'submissions' : activeTab }} right now.
              </p>
              <div class="flex gap-4 mt-6">
                <button
                  @click="handleResetFilters"
                  class="inline-flex items-center rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-200"
                >
                  Reset Filters
                </button>
                <router-link
                  to="/contribute"
                  class="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-xl transition-all hover:bg-carrotOrange-500 hover:scale-105 tracking-widest uppercase duration-300"
                >
                  Contribute
                </router-link>
              </div>
            </div>
          </div>
          <div v-if="contentState === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Data Grid -->
            <SubmissionCard
              v-for="(submission, index) in submissionsStore.items"
              :key="submission.id"
              :submission="submission"
              :index="index"
              class="h-full hover:-translate-y-2 transition-transform duration-500"
            />
          </div>
        </div>
      </transition>

      <LoadMore
        v-if="!searchTerm && !!submissionsStore.lastDoc"
        :has-more="true"
        :loading="isLoadingMore"
        @load-more="handleLoadMore"
        class="mt-12"
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
.fade-grid-enter-active,
.fade-grid-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.fade-grid-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-grid-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
