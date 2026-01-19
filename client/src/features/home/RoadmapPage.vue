<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Defines which item is currently expanded (for mobile tap logic)
const activeItemId = ref<string | null>(null)

const toggleItem = (id: string) => {
  if (activeItemId.value === id) {
    activeItemId.value = null
  } else {
    activeItemId.value = id
  }
}

const appVersion = __APP_VERSION__
const buildDate = ref<string | null>(null)

const loadBuildDate = async () => {
  try {
    const response = await fetch('/build.json', { cache: 'no-store' })
    if (!response.ok) return
    const payload = (await response.json()) as { buildDate?: string }
    if (typeof payload.buildDate === 'string') {
      buildDate.value = payload.buildDate
    }
  } catch {
    // Ignore build stamp failures to avoid breaking the page.
  }
}

onMounted(() => {
  void loadBuildDate()
})

const phases = [
  {
    id: 'foundation',
    label: '01. The Foundation',
    status: 'Operational',
    color: 'bg-gray-900',
    description: 'The digital bedrock. The Swiss Grid design system is active, and core archival features.',
    items: [
      {
        id: 'f-1',
        title: 'Core Archive',
        desc: 'A fully functional library. Users can create, list, paginate, and view submissions in real-time.',
      },
      {
        id: 'f-2',
        title: 'Identity System',
        desc: 'Secure authentication via Email & Google, complete with public profiles and unique username claiming.',
      },
      {
        id: 'f-3',
        title: 'Search & Discovery',
        desc: 'Robust search with deep filtering (type, language, sort) and a fully wired community voting system.',
      },
      {
        id: 'f-4',
        title: 'Moderation',
        desc: 'A reactive safety system. All submissions are published immediately, but community reports will trigger a "pending" status for admin review.',
      },
      {
        id: 'f-5',
        title: 'Author Control',
        desc: 'Edit workflows allow contributors to refine their submissions and manage their own data.',
      },
    ],
  },
  {
    id: 'construction',
    label: '02. Construction',
    status: 'In Progress',
    color: 'bg-carrotOrange-500 animate-pulse',
    description: 'Growth and depth. We are filling the archive and building personal collection tools.',
    items: [
      {
        id: 'p-1',
        title: 'Personal Collections',
        desc: 'Tools for users to curate, save, and share their own personal anthologies of wisdom.',
      },
      {
        id: 'p-2',
        title: 'Content Pipeline',
        desc: 'Ingesting our backlog of 300+ proverbs and 100+ raw poems to transform them into searchable entries.',
      },
    ],
  },
  {
    id: 'horizon',
    label: '03. The Horizon',
    status: 'Planned',
    color: 'bg-gray-300',
    description: 'The Universal Vault. Features designed to open the architecture to the wider world.',
    items: [
      {
        id: 'fut-1',
        title: 'Audio Experience',
        desc: 'Native audio player integration to allow for the playback of oral recitations.',
      },
      {
        id: 'fut-2',
        title: 'Deep Discovery',
        desc: 'Thematic tagging and visualizations to connect disparate entries. Contributors will categorize themes (e.g., Love, War, Grief) directly on the submission page.',
      },
    ],
  },
]
</script>

<template>
  <div class="selection:bg-gray-900 selection:text-white font-sans text-gray-900 pt-24">
    <div class="max-w-[1600px] mx-auto border-l border-r border-gray-200">
      <header class="border-b border-gray-200 bg-white p-10 lg:p-20">
        <div class="max-w-4xl">
          <span
            class="inline-block px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-6"
          >
            Project Status
          </span>
          <h1 class="text-6xl md:text-8xl font-serif tracking-tighter leading-none text-gray-900 mb-8">The Roadmap.</h1>
          <p class="text-xl md:text-2xl font-light text-gray-500 leading-relaxed max-w-2xl">
            Abwaan is built in public. Explore our journey from a functional beta to a universal custodian of history.
          </p>
        </div>
      </header>

      <div
        class="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 border-b border-gray-200 bg-gray-50"
      >
        <div v-for="phase in phases" :key="phase.id" class="flex flex-col min-h-[60vh]">
          <div class="p-10 lg:p-12 border-b border-gray-200 bg-white">
            <div class="flex items-center gap-3 mb-6">
              <div :class="['w-2 h-2 rounded-full', phase.color]"></div>
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                {{ phase.status }}
              </span>
            </div>
            <h2 class="text-3xl font-serif text-gray-900 mb-4">{{ phase.label }}</h2>
            <p class="text-sm text-gray-500 leading-relaxed font-mono">
              {{ phase.description }}
            </p>
          </div>

          <div class="flex-1 bg-gray-50 flex flex-col">
            <div
              v-for="item in phase.items"
              :key="item.id"
              class="group relative border-b last:border-b-0 border-gray-200 bg-gray-50 hover:bg-white transition-all duration-500 cursor-pointer overflow-hidden"
              @mouseenter="activeItemId = item.id"
              @mouseleave="activeItemId = null"
              @click="toggleItem(item.id)"
            >
              <div class="p-8 lg:p-10 flex items-start justify-between relative z-10">
                <h3
                  class="text-lg font-serif text-gray-900 group-hover:text-carrotOrange-600 transition-colors duration-300"
                >
                  {{ item.title }}
                </h3>
                <span
                  class="text-gray-300 group-hover:text-carrotOrange-500 transition-colors duration-300 text-xl font-light"
                >
                  <span v-if="activeItemId === item.id">-</span>
                  <span v-else>+</span>
                </span>
              </div>

              <div
                class="px-8 lg:px-10 pb-10 transition-all duration-500 ease-in-out"
                :class="
                  activeItemId === item.id ? 'max-h-48 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
                "
              >
                <p class="text-sm text-gray-500 leading-relaxed border-l-2 border-carrotOrange-200 pl-4">
                  {{ item.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div class="p-12 lg:p-24 bg-white flex flex-col justify-center">
          <h3 class="text-4xl font-serif text-gray-900 mb-6">Have an idea?</h3>
          <p class="text-gray-500 mb-8 max-w-sm">
            We build for the community. If you see a gap in our vision, let us know.
          </p>
          <a
            href="mailto:nimanahmed000@gmail.com"
            class="text-carrotOrange-600 font-bold uppercase text-xs tracking-widest hover:text-gray-900 transition-colors"
          >
            Submit Feature Request &rarr;
          </a>
        </div>
        <div class="p-12 lg:p-24 bg-gray-900 text-white flex flex-col justify-center items-start">
          <span class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Live Beta</span>
          <div class="text-6xl font-serif mb-2">v{{ appVersion }}</div>
          <div class="text-gray-400 font-mono text-sm">Build {{ buildDate ?? '—' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
