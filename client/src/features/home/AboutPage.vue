<script setup lang="ts">
import landingImage from '@/assets/images/lido_beach_fiat.jpg'
import abwaanLogo from '@/assets/archive/wisdom_2.svg'

const appVersion = __APP_VERSION__
</script>

<template>
  <div class="selection:bg-gray-900 selection:text-white font-sans text-gray-900 pt-24">
    <div class="max-w-[1600px] mx-auto border-l border-r border-gray-200">
      <header class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12 min-h-[85vh]">
          <div
            class="lg:col-span-7 p-10 lg:p-20 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between relative bg-white"
          >
            <div
              class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
              style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
            ></div>

            <div class="relative z-10">
              <span
                class="inline-flex items-center gap-2 mb-8 px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit"
              >
                Est. 2026
              </span>
              <h1 class="text-6xl md:text-8xl lg:text-9xl font-serif tracking-tighter leading-[0.9] mb-8">
                Preserving
                <br />
                <span class="text-carrotOrange-600">The Oral.</span>
              </h1>
            </div>

            <div class="relative z-10 max-w-xl">
              <p
                class="text-xl md:text-2xl font-light text-gray-500 leading-relaxed border-l-2 border-carrotOrange-500 pl-6"
              >
                We are building a digital vault for
                <span class="font-serif italic text-gray-900">Gabay</span>
                and
                <span class="font-serif italic text-gray-900">Maahmaahyo</span>
                before the algorithm buries them forever.
              </p>
            </div>
          </div>

          <div class="lg:col-span-5 relative overflow-hidden group bg-gray-50">
            <img
              :src="landingImage"
              alt="Somali Landscape"
              class="absolute inset-0 w-full h-full object-cover transition-all duration-[2s] ease-in-out grayscale group-hover:grayscale-0 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gray-900/10 mix-blend-multiply pointer-events-none"></div>

            <div
              class="absolute bottom-10 left-10 bg-white/95 backdrop-blur px-6 py-4 border border-white/20 shadow-sm"
            >
              <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Figure 1.0</p>
              <p class="font-serif text-lg text-gray-900">The landscape of memory.</p>
            </div>
          </div>
        </div>
      </header>

      <section class="border-b border-gray-200">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div class="p-12 lg:p-16 bg-gray-50 flex flex-col justify-between min-h-[400px]">
            <span class="text-carrotOrange-600 text-6xl font-serif">01.</span>
            <div>
              <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">The Trigger</h2>
              <p class="text-xl font-serif text-gray-900 leading-relaxed">
                "I would stumble across incredible pieces of Somali poetry on TikTok. I’d screenshot them thinking,
                <span class="italic text-gray-500">'I need to save this.'</span>
                "
              </p>
            </div>
          </div>

          <div class="p-12 lg:p-16 bg-white flex flex-col justify-between min-h-[400px]">
            <span class="text-gray-200 text-6xl font-serif">02.</span>
            <div>
              <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">The Decay</h2>
              <p class="text-xl font-serif text-gray-900 leading-relaxed">
                Feeds move fast. Screenshots get buried. Accounts get deleted.
              </p>
            </div>
          </div>

          <div class="p-12 lg:p-16 bg-gray-900 text-white flex flex-col justify-center min-h-[400px]">
            <h2 class="text-3xl md:text-4xl font-serif leading-tight mb-8">
              "We didn't need another feed. We needed a sanctuary."
            </h2>
            <div class="h-px w-full bg-gray-700 mb-4"></div>
            <p class="text-gray-500 font-mono text-xs uppercase tracking-widest">/// SYSTEM: ARCHIVE INITIALIZED</p>
          </div>
        </div>
      </section>

      <section class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12 min-h-[600px]">
          <div
            class="lg:col-span-1 p-8 border-b lg:border-b-0 lg:border-r border-gray-200 flex items-center justify-center bg-gray-50"
          >
            <h2
              class="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 lg:writing-vertical-lr lg:rotate-180"
            >
              Project Timeline
            </h2>
          </div>

          <div
            class="lg:col-span-5 p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-gray-200 hover:bg-gray-50 transition-colors duration-500 group"
          >
            <div class="h-full flex flex-col justify-between">
              <div class="space-y-4">
                <span
                  class="inline-block px-2 py-1 border border-gray-200 rounded text-[10px] font-mono text-gray-400 uppercase"
                >
                  V1.0 BETA
                </span>
                <h3
                  class="text-5xl font-serif italic text-gray-300 decoration-gray-200 decoration-2 line-through decoration-wavy group-hover:text-gray-400 transition-colors"
                >
                  Wisdom Weyn
                </h3>
              </div>
              <div class="mt-12">
                <p class="text-lg text-gray-500 leading-relaxed font-light">
                  The "Big Wisdom" phase. It began as a rough repository for Somali culture—raw, functional, and
                  personal. It was the proof of concept.
                </p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 p-12 lg:p-20 bg-carrotOrange-50/10">
            <div class="h-full flex flex-col justify-between">
              <div class="space-y-4">
                <span class="inline-block px-2 py-1 bg-gray-900 text-white rounded text-[10px] font-mono uppercase">
                  V{{ appVersion }} LIVE BETA
                </span>
                <h3 class="text-5xl font-serif text-gray-900">Abwaan</h3>
              </div>
              <div class="mt-12">
                <p class="text-2xl font-serif text-gray-900 mb-4">The Custodian.</p>
                <p class="text-lg text-gray-600 leading-relaxed font-light max-w-md">
                  As the vision grew, the name became clear:
                  <span class="border-b border-carrotOrange-500 text-gray-900">Abwaan</span>
                  . In Somali, it means "The Custodian"—the poet, the scholar, the one who keeps history alive. But
                  while the word is Somali, the role exists in every culture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12">
          <div
            class="lg:col-span-5 p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex flex-col justify-center"
          >
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-carrotOrange-600 mb-4 block">
              ARCHIVE STATUS
            </span>
            <h2 class="text-4xl font-serif text-gray-900 leading-tight">
              The First
              <br />
              Layer.
            </h2>
            <p class="mt-4 text-sm text-gray-500 font-mono">
              // A snapshot of the material that has been preserved so far.
            </p>
          </div>

          <div class="lg:col-span-7 p-12 lg:p-20 bg-white flex flex-col justify-center">
            <p class="text-2xl md:text-3xl font-light text-gray-400 leading-tight mb-8">
              We have archived over
              <strong class="text-gray-900 font-serif font-medium">300 proverbs</strong>
              from diverse sources, plus at least
              <strong class="text-gray-900 font-serif font-medium">100 poems</strong>
              in raw form.
            </p>

            <div class="border-l-2 border-gray-200 pl-6">
              <p class="text-lg text-gray-500 leading-relaxed">
                Most lack translation, word-by-word meaning, or context. We hope to assign these entries to contributors
                who can provide this depth—allowing them to claim authorship of the context when the site goes live.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-gray-200 overflow-hidden relative">
        <span
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-serif text-gray-50 opacity-50 select-none z-0"
        >
          1960
        </span>

        <div class="grid lg:grid-cols-2 min-h-[80vh] relative z-10">
          <div class="p-12 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-200">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-3 h-3 bg-carrotOrange-500 rounded-full"></div>
              <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Visual Language</span>
            </div>
            <h2 class="text-5xl md:text-7xl font-serif text-gray-900 mb-8 leading-none">
              Two Faces.
              <br />
              One Voice.
            </h2>
            <p class="text-xl text-gray-600 font-light leading-relaxed mb-8">
              When Abwaan began, our identity was defined by the silhouettes of a eldery Somali man wearing a
              <span class="italic font-serif text-gray-900">Koofiyad</span>
              and a woman wearing a
              <span class="italic font-serif text-gray-900">Garbasaar</span>
              .
            </p>

            <p class="text-lg text-gray-500 font-light leading-relaxed">
              This duality represents the oral tradition. From the lullabies sung by mothers to the
              <em>Buraanbur</em>
              chanted at weddings, our history has always been a conversation between genders and generations.
            </p>
            <p class="text-gray-500 text-sm font-mono mt-6 uppercase tracking-wider">
              * WHILE OUR ROOTS ARE SOMALI, THE ORANGE KNOT SYMBOLIZES A UNIVERSAL FABRIC. IT IS DESIGNED TO INTERLACE
              THE WISDOM OF MANY TONGUES—STARTING WITH ONE CULTURE, BUT ARCHITECTED TO PRESERVE THEM ALL.
            </p>
          </div>

          <div class="flex items-center justify-center p-12 lg:p-24 bg-gray-50">
            <div
              class="relative w-full max-w-md aspect-square flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
            >
              <div
                class="absolute inset-0 border border-gray-200 rounded-full scale-110 opacity-50 border-dashed animate-[spin_60s_linear_infinite]"
              ></div>
              <img :src="abwaanLogo" alt="Abwaan Logo" />
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gray-50">
        <div class="grid md:grid-cols-2">
          <router-link
            to="/contribute"
            class="group relative block p-16 lg:p-24 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-carrotOrange-500 transition-colors duration-500 overflow-hidden"
          >
            <div class="relative z-10">
              <span
                class="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 group-hover:text-white/70 transition-colors"
              >
                Action 01
              </span>
              <span class="text-5xl md:text-7xl font-serif text-gray-900 group-hover:text-white transition-colors">
                Contribute
              </span>
              <span
                class="block mt-6 text-gray-500 font-mono text-xs uppercase tracking-widest group-hover:text-white/80 transition-colors"
              >
                Add your piece to the vault &rarr;
              </span>
            </div>
          </router-link>

          <router-link
            to="/collections"
            class="group relative block p-16 lg:p-24 hover:bg-gray-900 transition-colors duration-500 overflow-hidden"
          >
            <div class="relative z-10">
              <span class="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Action 02</span>
              <span class="text-5xl md:text-7xl font-serif text-gray-900 group-hover:text-white transition-colors">
                Explore
              </span>
              <span
                class="block mt-6 text-gray-500 font-mono text-xs uppercase tracking-widest group-hover:text-gray-400 transition-colors"
              >
                Browse the Archive &rarr;
              </span>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>
