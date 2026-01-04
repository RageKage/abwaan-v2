<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePublicProfileStore } from '@/features/profile/publicProfile.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import LoadMore from '@/shared/components/LoadMore.vue'
const route = useRoute()

const publicProfileStore = usePublicProfileStore()
const { profile, submissions, lastDoc, loading, error, loadingMore } =
  storeToRefs(publicProfileStore)

const loadProfile = () => {
  const uid = route.params.uid
  if (typeof uid !== 'string') return
  void publicProfileStore.loadProfile(uid)
}

const handleLoadMore = async () => {
  await publicProfileStore.loadMore()
}

onMounted(() => {
  loadProfile()
})
watch(
  () => route.params.uid,
  () => {
    loadProfile()
  },
)
</script>

<template>
  <main class="w-full font-sans text-gray-900 pt-24 pb-24">

    <div v-if="loading" class="flex h-[80vh] items-center justify-center border-t border-b border-gray-200">
      <div class="flex flex-col items-center gap-6">
        <div class="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-carrotOrange-500"></div>
        <p class="font-mono text-xs uppercase tracking-widest text-gray-400">Locating Contributor...</p>
      </div>
    </div>

    <div v-else-if="error || !profile" class="flex h-[80vh] items-center justify-center text-center border-t border-b border-gray-200">
      <div class="max-w-md p-12 border border-gray-200 bg-gray-50">
        <h2 class="text-3xl font-serif text-gray-900 mb-4">Member Not Found</h2>
        <p class="text-gray-500 mb-8 font-light">The contributor record you are looking for does not exist.</p>
        <router-link to="/collections" class="px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors">Return to Archive</router-link>
      </div>
    </div>

    <div v-else class="max-w-[1600px] mx-auto border-l border-r border-gray-200">

      <div class="grid lg:grid-cols-12 border-b border-gray-200">

        <div class="lg:col-span-3 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex items-center justify-center">
            <div class="h-40 w-40 rounded-full bg-white border border-gray-200 flex items-center justify-center text-6xl font-serif font-medium text-gray-900 shadow-sm">
              {{ profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?' }}
            </div>
        </div>

        <div class="lg:col-span-6 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white flex flex-col justify-center">
            <div class="mb-6">
               <h1 class="text-5xl font-serif font-medium text-gray-900 tracking-tight mb-3">
                  {{ profile.displayName }}
               </h1>
               <div v-if="profile.username">
                  <span class="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest">
                    @{{ profile.username }}
                  </span>
               </div>
            </div>

            <p v-if="profile.bio" class="text-lg text-gray-600 leading-relaxed font-light whitespace-pre-line max-w-xl">
               {{ profile.bio }}
            </p>
            <p v-else class="text-gray-400 italic font-light">
               This member has not added a biography yet.
            </p>
        </div>

        <div class="lg:col-span-3 p-10 lg:p-12 bg-white flex flex-col justify-center items-center lg:items-start">
             <span class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Contributions</span>
             <span class="text-6xl font-serif text-gray-900">{{ submissions.length }}</span>
             <span class="mt-4 inline-block h-1 w-12 bg-carrotOrange-500"></span>
        </div>
      </div>

      <div class="border-b border-gray-200 bg-gray-50 px-8 py-4">
          <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
             <span class="w-2 h-2 rounded-full bg-gray-400"></span>
             Published Works
          </h2>
      </div>

      <div v-if="submissions.length > 0">
         <div class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200 bg-white">
            <div
              v-for="(submission, index) in submissions"
              :key="submission.id"
              class="hover:bg-gray-50 transition-colors duration-300"
            >
              <SubmissionCard :submission="submission" :index="index" />
            </div>
         </div>

         <LoadMore
            :has-more="!!lastDoc"
            :loading="loadingMore"
            @load-more="handleLoadMore"
            class="border-b border-gray-200"
          />

                   <div
        v-if="submissions.length > 0 && !lastDoc"
        class="mt-20 flex justify-center opacity-40"
      >
        <div class="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
          <span class="h-px w-8 bg-gray-300"></span>
          <span>End of Archive</span>
          <span class="h-px w-8 bg-gray-300"></span>
        </div>
      </div>


      </div>

      <div v-else class="py-32 flex flex-col items-center justify-center text-center border-b border-gray-200 bg-white">
          <div class="mb-6 opacity-20 text-gray-300">
             <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 class="text-2xl font-serif text-gray-900 mb-2">The Archive is Silent</h3>
          <p class="text-gray-500 font-light text-sm tracking-wide max-w-xs mx-auto">
             This member has not yet contributed to the library.
          </p>
      </div>

    </div>
  </main>
</template>
