<template>
  <div class="bg-gray-50 min-h-screen selection:bg-carrotOrange-200 selection:text-carrotOrange-900 font-sans">
    <div
      class="relative bg-gray-900 text-white rounded-b-[3rem] sm:rounded-b-[4rem] shadow-2xl shadow-gray-900/20 overflow-hidden pt-32 pb-48 px-6 text-center z-10"
    >
      <div class="relative z-10 max-w-4xl mx-auto space-y-10">
        <span
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-carrotOrange-400"
        >
          Preserving Somali Heritage
        </span>

        <h1
          class="text-7xl md:text-9xl font-serif tracking-tight mb-4 drop-shadow-2xl text-white"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 20,
              delay: 100,
            },
          }"
        >
          Abwaan
        </h1>

        <p
          class="text-xl md:text-3xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 300 } }"
        >
          A digital home for
          <span class="text-white font-serif italic">Gabay</span>
          (Poetry) &
          <span class="text-white font-serif italic">Maahmaahyo</span>
          (Proverbs).
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-24">
      <div class="grid md:grid-cols-2 gap-6 sm:gap-8 mb-32">
        <div
          class="bg-white p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100 relative overflow-hidden"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          <div class="flex flex-col h-full">
            <div class="flex items-center gap-3 mb-8">
              <span class="h-px w-8 bg-carrotOrange-500"></span>
              <span class="text-xs font-bold text-carrotOrange-900 uppercase tracking-[0.2em]">Oral Literature</span>
            </div>

            <div class="mb-8">
              <h3 class="text-5xl font-serif text-gray-900 mb-3 group-hover:text-carrotOrange-700 transition-colors">
                Gabay
              </h3>
            </div>

            <p
              class="text-gray-500 text-lg leading-relaxed font-light mt-auto border-l-2 border-gray-100 pl-6 group-hover:border-carrotOrange-200 transition-colors"
            >
              Long-form poetry. Rhythm, metaphor, memory. This is where Somali thought stretches out and takes its time.
            </p>
          </div>
        </div>

        <div
          class="bg-white p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100 relative overflow-hidden"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
          <div class="flex flex-col h-full">
            <div class="flex items-center gap-3 mb-8">
              <span class="h-px w-8 bg-carrotOrange-500"></span>
              <span class="text-xs font-bold text-carrotOrange-900 uppercase tracking-[0.2em]">Wisdom</span>
            </div>

            <div class="mb-8">
              <h3 class="text-5xl font-serif text-gray-900 mb-3 group-hover:text-carrotOrange-700 transition-colors">
                Maahmaahyo
              </h3>
            </div>

            <p
              class="text-gray-500 text-lg leading-relaxed font-light mt-auto border-l-2 border-gray-100 pl-6 group-hover:border-carrotOrange-200 transition-colors"
            >
              Short lines. Sharp meaning. Say less. Mean more. The condensed truth of generations.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-32 max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-12 gap-0">
          <div class="lg:col-span-7 bg-gray-50 relative min-h-[500px] p-8 md:p-12 flex items-center justify-center">
            <div
              class="absolute inset-0 opacity-[0.03]"
              style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
            ></div>

            <span v-if="currentImage?.src" class="relative w-full h-full flex items-center justify-center z-10">
              <img
                :src="currentImage?.src"
                class="absolute transform scale-95 blur-3xl opacity-20 pointer-events-none transition-all duration-700"
                alt=""
                aria-hidden="true"
              />

              <div
                class="relative w-full h-full max-h-[600px] flex items-center justify-center transition-transform duration-500 ease-out hover:scale-[1.01]"
              >
                <img
                  :src="currentImage?.src"
                  class="max-w-full max-h-full w-auto h-auto object-contain rounded shadow-lg ring-1 ring-gray-900/5 bg-white"
                  alt="Somali Art Feature"
                />
              </div>
            </span>
          </div>

          <div
            class="lg:col-span-5 bg-white p-10 md:p-16 flex flex-col justify-center relative z-20 border-l border-gray-50"
          >
            <div class="flex items-center gap-3 mb-8">
              <span class="h-px w-8 bg-carrotOrange-500"></span>
              <span class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.2em]">Exhibition</span>
            </div>

            <h2 class="text-4xl md:text-5xl font-serif text-gray-900 mb-8 leading-[1.1]">
              Contemporary
              <br />
              <span class="italic text-gray-400 font-light">Somali Art.</span>
            </h2>

            <div class="relative group">
              <div
                class="absolute -left-6 top-2 bottom-2 w-1 bg-gray-100 rounded-full transition-colors duration-300 group-hover:bg-carrotOrange-400"
              ></div>

              <div v-if="currentImage?.description">
                <p class="text-lg text-gray-700 font-light leading-relaxed">
                  {{ currentImage?.description }}
                </p>

                <div v-if="currentImage?.source" class="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-gray-300"></span>
                  <p class="text-xs text-gray-400 font-mono uppercase tracking-wide">
                    {{ currentImage?.source }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="submissionsStore.items.length > 0" class="mb-32">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-gray-200 pb-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="h-px w-8 bg-carrotOrange-500"></span>
              <span class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.2em]">The Archive</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-serif text-gray-900">
              Recently
              <span class="italic text-gray-400 font-light">Shared.</span>
            </h2>
          </div>

          <router-link
            to="/collections"
            class="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-carrotOrange-600 transition-colors pb-2"
          >
            View Full Collection
            <span class="bg-gray-100 p-2 rounded-full group-hover:bg-carrotOrange-100 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(submission, index) in submissionsStore.items.slice(0, 3)"
            :key="submission.id"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
            class="h-full"
          >
            <SubmissionCard
              :submission="submission"
              :index="index"
              class="h-full hover:-translate-y-2 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      <div class="relative w-full mb-12">
        <div
          class="bg-gray-900 rounded-[3rem] sm:rounded-[4rem] overflow-hidden text-center py-24 px-6 relative z-10 shadow-2xl shadow-gray-900/20"
        >
          <div
            class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
            style="
              background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E');
            "
          ></div>

          <div
            class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-carrotOrange-500/10 blur-[100px] rounded-full pointer-events-none"
          ></div>

          <div class="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 class="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight">
              Let's build
              <br />
              <span class="italic text-gray-500 font-light">the archive.</span>
            </h2>

            <p class="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto">
              Digitize a poem, share a proverb, or simply explore what others have saved.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <router-link
                to="/contribute"
                class="w-full sm:w-auto px-10 py-5 bg-carrotOrange-500 text-white rounded-2xl font-bold text-sm tracking-[0.15em] uppercase hover:bg-carrotOrange-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-carrotOrange-900/50"
              >
                Contribute Now
              </router-link>

              <router-link
                to="/about"
                class="w-full sm:w-auto px-10 py-5 bg-transparent border border-gray-700 text-white rounded-2xl font-bold text-sm tracking-[0.15em] uppercase hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Learn More
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="pb-12 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
          Abwaan Project &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'

// Image Imports
import somaliPortrait from '@/assets/images/somali_portrait_hyatt.jpg'
import lidoBeachCar from '@/assets/images/lido_beach_fiat.jpg'
import manWithMiswak from '@/assets/images/man_with_miswak.jpg'
import danceStampBlue from '@/assets/images/dance_stamp_blue_1973.jpg'
import waaberiDancers from '@/assets/images/waaberi_dancers_stage.jpg'
import danceStampRed from '@/assets/images/dance_stamp_red_1973.jpg'
import oudPlayer from '@/assets/images/oud_player_ahmed_naji.jpg'

const submissionsStore = useSubmissionsStore()

type GalleryItem = {
  src: string
  source: string
  description: string
}

const galleryItems: GalleryItem[] = [
  {
    src: somaliPortrait,
    source: 'Source: Hyatt Moore, c. 2000s',
    description: 'Portrait of a Somali Youth (Oil on Canvas)',
  },
  {
    src: lidoBeachCar,
    source: 'Source: Vintage Postcard, c. 1970s',
    description: 'Scenic view of Lido Beach with Fiat 1500 and women in traditional attire',
  },
  {
    src: manWithMiswak,
    source: 'Source: Vintage Postcard, c. 1970s',
    description: 'Portrait of a man with an Afro using a traditional Miswak (Aday) stick',
  },
  {
    src: danceStampBlue,
    source: 'Source: Muradi, 1973',
    description: 'Somali Folklore Dances Stamp (0.40 Sh.So), printed by I.P.S. Rome',
  },
  {
    src: waaberiDancers,
    source: 'Source: National Theatre of Somalia, c. 1970s',
    description: 'Waaberi artists performing a traditional folklore dance on stage',
  },
  {
    src: danceStampRed,
    source: 'Source: Muradi, 1973',
    description: 'Somali Folklore Dances Stamp (2.00 Sh.So), printed by I.P.S. Rome',
  },
  {
    src: oudPlayer,
    source: 'Source: Vintage Photograph, c. 1970s',
    description: 'Musician playing the Oud on the beach (Likely Ahmed Naji Saad)',
  },
]

const currentImage = ref<GalleryItem | null>(null)

const setRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * galleryItems.length)
  currentImage.value = galleryItems[randomIndex] ?? null
}

onMounted(async () => {
  setRandomImage()
  await submissionsStore.loadLatest(undefined, false)
})
</script>
