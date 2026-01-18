<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProfileStore } from '@/features/profile/profile.store'
import { useFavoritesStore } from '@/features/favorites/favorites.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

// 1. UPDATED: Naming Convention matches "The Study" aesthetic
type DeskTab = 'contributions' | 'saved'

const tabs = [
  { key: 'contributions', label: 'Works' },       // Was "Published"
  { key: 'saved', label: 'Collection' },          // Was "Saved Library"
] as const

const activeTab = ref<DeskTab>('contributions')
const profileStore = useProfileStore()
const favoritesStore = useFavoritesStore()

const loadedTabs = ref<Record<DeskTab, boolean>>({
  contributions: false,
  saved: false,
})

const isLoadingMore = ref(false)
const isFavoritesLoadingMore = ref(false)

const contributionCountLabel = computed(() => {
  const total = profileStore.profile?.submissionCount
  if (typeof total === 'number') return total.toString()
  return profileStore.submissions.length.toString()
})

const savedCountLabel = computed(() => favoritesStore.items.length.toString())

const loadContributions = async (force = false) => {
  if (!force && loadedTabs.value.contributions) return
  await profileStore.fetchMySubmissions()
  loadedTabs.value.contributions = true
}

const loadSaved = async (force = false) => {
  if (!force && loadedTabs.value.saved) return
  await favoritesStore.loadFavorites()
  loadedTabs.value.saved = true
}

watch(
  () => activeTab.value,
  (tab) => {
    if (tab === 'contributions') {
      void loadContributions()
      return
    }
    if (tab === 'saved') {
      void loadSaved()
    }
  },
  { immediate: true },
)

const contributionsLoading = computed(() => profileStore.busy && !isLoadingMore.value)
const savedLoading = computed(() => favoritesStore.busy && !isFavoritesLoadingMore.value)

const handleLoadMoreContributions = async () => {
  isLoadingMore.value = true
  try {
    await profileStore.fetchMySubmissions(true)
  } finally {
    isLoadingMore.value = false
  }
}

const handleLoadMoreSaved = async () => {
  isFavoritesLoadingMore.value = true
  try {
    await favoritesStore.loadFavorites(true)
  } finally {
    isFavoritesLoadingMore.value = false
  }
}

const handleRetryContributions = async () => {
  await loadContributions(true)
}

const handleRetrySaved = async () => {
  await loadSaved(true)
}
</script>

<template>
  <main class="page-shell app-surface dot-pattern">
    <div class="max-w-[1600px] mx-auto border-l border-r border-gray-200">

      <div class="grid lg:grid-cols-12 border-b border-gray-200">
        <div class="lg:col-span-8 p-12 lg:p-20 bg-white">
          <div class="max-w-3xl">
            <span
              class="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit"
            >
              The Study
            </span>
            <h1 class="text-5xl md:text-7xl font-serif tracking-tighter text-gray-900 mb-6">
              The Study.
            </h1>
            <p class="text-xl text-gray-500 font-light leading-relaxed">
              Manage your contributions, draft new works, and organize your personal collection.
            </p>
          </div>
        </div>

        <div
          class="lg:col-span-4 p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50 flex flex-col justify-between gap-8"
        >
          <div>
            <span class="text-xs font-mono text-gray-400 block mb-2">Quick Metrics</span>
            <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Your Desk</h3>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Works</span>
              <span class="text-3xl font-serif text-gray-900">{{ contributionCountLabel }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Collection</span>
              <span class="text-3xl font-serif text-gray-900">{{ savedCountLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-b border-gray-200 bg-white">


 

                <div class="lg:col-span-4 flex overflow-x-auto no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex-1 min-w-max h-16  flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all duration-200 border-r border-gray-100 lg:border-r-0 last:border-r-0"
            :class="
              activeTab === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-400 hover:text-carrotOrange-600 hover:bg-gray-50'
            "
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <section v-if="activeTab === 'contributions'">
        <div v-if="contributionsLoading" class="p-16 bg-white border-b border-gray-200">
          <div class="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-400">
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-carrotOrange-500"></span>
            Loading works...
          </div>
        </div>

        <div v-else-if="profileStore.error" class="border-b border-gray-200 bg-white">
          <EmptyState
            eyebrow="The Study"
            title="Unable to load works"
            description="We could not fetch your catalog right now."
            primary-label="Try Again"
            :primary-action="handleRetryContributions"
          />
        </div>

        <div v-else-if="profileStore.submissions.length === 0" class="border-b border-gray-200 bg-white">
          <EmptyState
            eyebrow="The Study"
            title="No works cataloged yet"
            description="Share a proverb or poem to start your public record."
            primary-label="Draft New Work"
            primary-to="/contribute"
          />
        </div>

        <div v-else>
          <div
            class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 bg-white"
          >
            <div
              v-for="(submission, index) in profileStore.submissions"
              :key="submission.id"
              class="hover:bg-gray-50 transition-colors duration-300"
            >
              <SubmissionCard :submission="submission" :index="index" />
            </div>
          </div>

          <div class="bg-white">
            <LoadMore
              :has-more="!!profileStore.lastDoc"
              :loading="isLoadingMore"
              :show-end="!profileStore.busy && profileStore.submissions.length > 0"
              @load-more="handleLoadMoreContributions"
            />
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'saved'">
        <div v-if="savedLoading" class="p-16 bg-white border-b border-gray-200">
          <div class="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-400">
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-carrotOrange-500"></span>
            Loading collection...
          </div>
        </div>

        <div v-else-if="favoritesStore.error" class="border-b border-gray-200 bg-white">
          <EmptyState
            eyebrow="The Study"
            title="Unable to load collection"
            description="We could not fetch your saved entries right now."
            primary-label="Try Again"
            :primary-action="handleRetrySaved"
          />
        </div>

        <div v-else-if="favoritesStore.items.length === 0" class="border-b border-gray-200 bg-white">
          <EmptyState
            eyebrow="The Study"
            title="Collection is empty"
            description="Curate entries you want to revisit later."
            primary-label="Browse Archive"
            primary-to="/collections"
          />
        </div>

        <div v-else>
          <div
            class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 bg-white"
          >
            <div
              v-for="(submission, index) in favoritesStore.items"
              :key="submission.id"
              class="hover:bg-gray-50 transition-colors duration-300"
            >
              <SubmissionCard :submission="submission" :index="index" />
            </div>
          </div>

          <div class="bg-white">
            <LoadMore
              :has-more="!!favoritesStore.lastDoc"
              :loading="isFavoritesLoadingMore"
              :show-end="!favoritesStore.busy && favoritesStore.items.length > 0"
              @load-more="handleLoadMoreSaved"
            />
          </div>
        </div>
      </section>

    </div>
  </main>
</template>
