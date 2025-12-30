<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProfile, type UserProfile } from '@/data/firestore/profiles.repo'
import { listSubmissionsByAuthor } from '@/data/firestore/submissions.repo'
import type { Submission } from '@/data/models/submission'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
const route = useRoute()

const profile = ref<UserProfile | null>(null)
const submissions = ref<Submission[]>([])
const lastDoc = ref<QueryDocumentSnapshot | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const loadingMore = ref(false)

const loadProfile = async () => {
  const uid = route.params.uid as string
  if (!uid) return

  loading.value = true
  error.value = null
  profile.value = null
  submissions.value = []
  lastDoc.value = null

  try {
    const [fetchedProfile, { items, lastDoc: newLastDoc }] = await Promise.all([
      getProfile(uid),
      listSubmissionsByAuthor(uid, 12),
    ])

    if (!fetchedProfile) {
      error.value = 'User not found'
    } else {
      profile.value = fetchedProfile
      submissions.value = items
      lastDoc.value = newLastDoc
    }
  } catch (err) {
    console.error('Error loading public profile:', err)
    error.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const handleLoadMore = async () => {
  const uid = route.params.uid as string
  if (!uid || !lastDoc.value) return

  loadingMore.value = true
  try {
    const { items, lastDoc: newLastDoc } = await listSubmissionsByAuthor(uid, 12, lastDoc.value)
    submissions.value = [...submissions.value, ...items]
    lastDoc.value = newLastDoc
  } catch (err) {
    console.error('Error loading more submissions:', err)
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
watch(
  () => route.params.uid,
  () => {
    void loadProfile()
  },
)
</script>

<template>
  <main
    class="min-h-screen w-full bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-carrotOrange-100 selection:text-carrotOrange-900 pb-24"
  >
    <div v-if="loading" class="flex h-[50vh] flex-col items-center justify-center">
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-carrotOrange-500"
      ></div>
      <p class="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
        Locating Contributor...
      </p>
    </div>

    <div
      v-else-if="error || !profile"
      class="flex flex-col items-center justify-center py-32 text-center"
    >
      <h2 class="text-3xl font-serif text-gray-900 mb-2">Member Not Found</h2>
      <p class="text-gray-500 mb-8 font-light">
        The contributor record you are looking for does not exist.
      </p>
      <router-link
        to="/collections"
        class="text-sm font-bold uppercase tracking-widest text-carrotOrange-600 hover:text-carrotOrange-700"
      >
        Return to Archive
      </router-link>
    </div>

    <div v-else class="mx-auto max-w-5xl space-y-12">
      <div
        class="relative bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >

        <div class="p-8 sm:p-12 relative z-10">
          <div class="flex flex-col md:flex-row items-start gap-8 md:gap-10">
            <div class="flex-shrink-0">
              <div
                class="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-900 text-white flex items-center justify-center text-4xl sm:text-5xl font-serif font-medium shadow-lg ring-4 ring-gray-50"
              >
                {{ profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?' }}
              </div>
            </div>

            <div class="flex-1 min-w-0 pt-2">
              <div class="mb-6">
                <h1
                  class="text-4xl sm:text-5xl font-serif font-medium text-gray-900 tracking-tight mb-2"
                >
                  {{ profile.displayName }}
                </h1>

                <div v-if="profile.username">
                  <span
                    class="text-sm font-bold text-carrotOrange-600 tracking-wide bg-carrotOrange-50 px-3 py-1 rounded-lg"
                  >
                    @{{ profile.username }}
                  </span>
                </div>
              </div>

              <div class="mb-8">
                <p
                  v-if="profile.bio"
                  class="text-lg text-gray-600 leading-relaxed font-light whitespace-pre-line max-w-2xl"
                >
                  {{ profile.bio }}
                </p>
                <p v-else class="text-gray-400 italic font-light">
                  This member has not added a biography yet.
                </p>
              </div>

              <div class="flex items-center gap-8 pt-6 border-t border-gray-100">
                <div class="flex flex-col">
                  <span class="text-3xl font-serif font-medium text-gray-900 leading-none">
                    {{ submissions.length }}
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                    Contributions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <span class="h-px w-8 bg-gray-300"></span>
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              Published Works
            </h2>
          </div>
        </div>

        <div v-if="submissions.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SubmissionCard
              v-for="(submission, index) in submissions"
              :key="submission.id"
              :submission="submission"
              :index="index"
            />
          </div>

          <LoadMore
            :has-more="!!lastDoc"
            :loading="loadingMore"
            @load-more="handleLoadMore"
            class="mt-12"
          />
        </div>

        <div v-else class="rounded-[2.5rem] border border-dashed border-gray-200 bg-gray-50/50 p-20 text-center">
          <div class="mx-auto mb-6 opacity-30">
            <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 class="text-xl font-serif text-gray-900 mb-2">The Archive is Silent</h3>
          <p class="text-gray-500 font-light text-sm tracking-wide">
            This member has not yet contributed to the library.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
