<template>
  <div class="w-full font-sans text-gray-900 pt-24">
    <header class="border-b border-gray-200">
      <div class="max-w-[1600px] mx-auto grid lg:grid-cols-12 min-h-[85vh]">
        <div
          class="lg:col-span-7 flex flex-col justify-between p-8 md:p-16 lg:p-24 border-r border-gray-200 relative bg-white"
        >
          <div
            class="absolute inset-0 z-0 opacity-[0.03]"
            style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
          ></div>

          <div class="relative z-10 space-y-8">
            <div
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0 }"
              class="inline-flex items-center gap-3 px-3 py-1 border border-gray-900 rounded-full w-fit"
            >
              <div class="w-2 h-2 bg-carrotOrange-500 rounded-full animate-pulse"></div>
              <span class="text-[10px] font-bold uppercase tracking-widest">Preserving Heritage</span>
            </div>

            <h1
              class="text-7xl md:text-9xl font-serif tracking-tighter leading-none"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
              Abwaan
            </h1>

            <p
              class="text-xl md:text-2xl text-gray-500 font-light max-w-lg leading-relaxed border-l-2 border-carrotOrange-500 pl-6"
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{ opacity: 1, transition: { delay: 200 } }"
            >
              A digital home for
              <span class="font-serif italic text-gray-900">Gabay</span>
              (Poetry) &
              <span class="font-serif italic text-gray-900">Maahmaahyo</span>
              (Proverbs).
            </p>
          </div>
        </div>

        <div class="lg:col-span-5 relative group bg-gray-50 flex items-center justify-center p-12">
          <div
            class="relative w-full max-w-md shadow-2xl shadow-gray-200 bg-white p-4 rotate-1 group-hover:rotate-0 transition-transform duration-700 h-fit"
          >
            <div class="aspect-[4/5] w-full relative overflow-hidden bg-gray-100">
              <img
                v-if="currentImage?.src"
                :src="currentImage.src"
                alt="Archive Feature"
                class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>

            <div v-if="currentImage?.description" class="mt-4 pt-4 border-t border-gray-200">
              <p class="font-serif text-lg leading-tight mb-2">{{ currentImage.description }}</p>
              <p class="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{{ currentImage.source }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="border-b border-gray-200 bg-white">
      <div class="max-w-[1600px] mx-auto grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div
          class="group p-12 lg:p-20 hover:bg-gray-50 transition-colors duration-500 cursor-pointer relative overflow-hidden"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 300 } }"
        >
          <span
            class="absolute top-8 right-8 text-xs font-mono text-gray-300 group-hover:text-carrotOrange-500 transition-colors"
          >
            01
          </span>
          <div class="space-y-6 relative z-10">
            <span class="text-xs font-bold uppercase tracking-[0.3em] text-carrotOrange-600 block mb-2">Long Form</span>
            <h3
              class="text-5xl md:text-6xl font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
            >
              Gabay
            </h3>
            <p
              class="text-gray-500 max-w-sm leading-relaxed border-l border-gray-200 pl-4 group-hover:border-gray-900 transition-colors"
            >
              Rhythm, metaphor, memory.
            </p>
          </div>
        </div>

        <div
          class="group p-12 lg:p-20 hover:bg-gray-50 transition-colors duration-500 cursor-pointer relative overflow-hidden"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 400 } }"
        >
          <span
            class="absolute top-8 right-8 text-xs font-mono text-gray-300 group-hover:text-carrotOrange-500 transition-colors"
          >
            02
          </span>
          <div class="space-y-6 relative z-10">
            <span class="text-xs font-bold uppercase tracking-[0.3em] text-carrotOrange-600 block mb-2">
              Short Form
            </span>
            <h3
              class="text-5xl md:text-6xl font-serif text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
            >
              Maahmaahyo
            </h3>
            <p
              class="text-gray-500 max-w-sm leading-relaxed border-l border-gray-200 pl-4 group-hover:border-gray-900 transition-colors"
            >
              Short lines. Sharp meaning. Say less. Mean more.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="submissionsStore.items.length > 0" class="max-w-[1600px] mx-auto border-b border-gray-200">
      <div class="grid lg:grid-cols-12 border-b border-gray-200">
        <div class="lg:col-span-3 p-8 border-r border-gray-200 bg-gray-50 flex flex-col justify-center">
          <h2 class="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">Latest Entries</h2>
          <p class="font-serif text-2xl text-gray-900">Recent Additions</p>
        </div>
        <div class="lg:col-span-9 p-8 flex items-center justify-end">
          <router-link
            to="/collections"
            class="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:text-carrotOrange-600 transition-colors"
          >
            Access Full Archive
            <span class="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </router-link>
        </div>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div
          v-for="(submission, index) in submissionsStore.items.slice(0, 3)"
          :key="submission.id"
          class="p-10 hover:bg-gray-50 transition-colors duration-300 group"
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
        >
          <SubmissionCard :submission="submission" :index="index" class="h-full" />
        </div>
      </div>
    </section>
    <section
      v-else-if="showErrorState && !submissionsStore.busy"
      class="max-w-[1600px] mx-auto border-b border-gray-200"
    >
      <EmptyState
        eyebrow="Latest Entries"
        title="Unable to load latest entries"
        :description="loadErrorMessage"
        primary-label="Try Again"
        :primary-action="reloadLatest"
        secondary-label="Browse Archive"
        secondary-to="/collections"
      />
    </section>
    <section v-else-if="!submissionsStore.busy" class="max-w-[1600px] mx-auto border-b border-gray-200">
      <EmptyState
        eyebrow="Latest Entries"
        title="No entries yet"
        description="Be the first to contribute a proverb or poem to the archive."
        primary-label="Contribute"
        primary-to="/contribute"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import SubmissionCard from '@/shared/components/SubmissionCard.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

// Image Imports
import somaliPortrait from '@/assets/images/somali_portrait_hyatt.jpg'
import lidoBeachCar from '@/assets/images/lido_beach_fiat.jpg'
import manWithMiswak from '@/assets/images/man_with_miswak.jpg'
import danceStampBlue from '@/assets/images/dance_stamp_blue_1973.jpg'
import waaberiDancers from '@/assets/images/waaberi_dancers_stage.jpg'
import danceStampRed from '@/assets/images/dance_stamp_red_1973.jpg'
import oudPlayer from '@/assets/images/oud_player_ahmed_naji.jpg'
import somaliCoralReef from '@/assets/images/somaliCoralReef.jpg'

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
  {
    src: somaliCoralReef,
    source: 'Source: Inside of the Somali Indian Ocean, Hawo Ali, Acrylic, 2019',
    description: 'Vibrant acrylic painting of a colorful coral reef under the blue waters of the Indian Ocean.',
  },
]

const currentImage = ref<GalleryItem | null>(null)
const showErrorState = computed(() => Boolean(submissionsStore.error))
const loadErrorMessage = 'We could not load the latest entries right now.'

const setRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * galleryItems.length)
  currentImage.value = galleryItems[randomIndex] ?? null
}

const reloadLatest = async () => {
  await submissionsStore.loadLatest(undefined, false)
}

onMounted(async () => {
  setRandomImage()
  await submissionsStore.loadLatest(undefined, false)
})
</script>
