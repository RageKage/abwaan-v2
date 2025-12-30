<template>
  <div
    class="bg-gray-50 min-h-screen selection:bg-carrotOrange-200 selection:text-carrotOrange-900 font-sans"
  >
    <div
      class="relative bg-gray-900 text-white rounded-b-[3rem] sm:rounded-[4rem] shadow-2xl shadow-gray-900/20 overflow-hidden pt-32 pb-48 px-6 text-center z-10"
    >
      <div class="absolute inset-0 z-0">
        <img
          :src="landingImage"
          alt="Vintage Somali Landscape"
          class="w-full h-full object-cover opacity-40 mix-blend-overlay grayscale contrast-125"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900"
        ></div>
      </div>

      <div
        class="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay z-10"
        style="
          background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E');
        "
      ></div>

      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-carrotOrange-500/10 blur-[120px] rounded-full pointer-events-none z-10"
      ></div>

      <div class="relative z-20 max-w-4xl mx-auto space-y-10">
        <span
          class="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-carrotOrange-400"
        >
          The Origin Story
        </span>

        <h1 class="text-5xl md:text-8xl font-serif tracking-tight mb-4 drop-shadow-2xl text-white">
          It started with <br />
          <span class="italic text-gray-400 font-light">a lost screenshot.</span>
        </h1>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 -mt-32 relative z-20 pb-32">
      <div class="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-gray-100 mb-12">
        <div class="flex items-center gap-3 mb-8">
          <span class="h-px w-8 bg-carrotOrange-500"></span>
          <span class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.2em]"
            >The Spark</span
          >
        </div>

        <h2 class="text-3xl md:text-4xl font-serif text-gray-900 mb-8 leading-tight">
          "I struggle to remember or relocate these gems."
        </h2>

        <div class="prose prose-lg text-gray-600 leading-relaxed font-light">
          <p class="mb-6">
            Like many of us, I would stumble across incredible pieces of Somali poetry or wisdom on
            TikTok, Twitter, and Pinterest. I’d screenshot them, thinking,
            <em>"I need to save this."</em>
          </p>
          <p class="mb-6">
            But the feeds move fast. The screenshots got buried. The accounts got deleted. The
            history was slipping through the cracks of the algorithm.
          </p>
          <p>
            I realized we didn't need another social feed. We needed a vault. A sanctuary where
            these words could rest permanently, safe from the refresh button.
          </p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div
          class="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-xl flex flex-col justify-center relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
            style="
              background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E');
            "
          ></div>

          <h3
            class="text-2xl font-serif text-carrotOrange-400 mb-4 italic group-hover:translate-x-1 transition-transform"
          >
            Wisdom Weyn
          </h3>
          <p class="text-gray-400 font-light leading-relaxed">
            The project began under the name <strong>"Wisdom Weyn"</strong> (Big Wisdom). It was a
            rough, personal repository built between school assignments and late-night coding
            sessions.
          </p>
        </div>

        <div
          class="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col justify-center group"
        >
          <h3
            class="text-2xl font-serif text-gray-900 mb-4 italic group-hover:translate-x-1 transition-transform"
          >
            Abwaan
          </h3>
          <p class="text-gray-600 font-light leading-relaxed">
            As the vision grew, so did the name. <strong>"Abwaan"</strong> refers to the Somali
            custodian of culture—the poet, the scholar, the one who keeps the history alive.
          </p>
        </div>
      </div>

      <div
        class="bg-carrotOrange-50 p-10 md:p-16 rounded-[2.5rem] border border-carrotOrange-100 mb-24 relative overflow-hidden"
      >
        <div class="relative z-10 grid md:grid-cols-12 gap-12 items-center">
  <div class="md:col-span-7">
  <div class="flex items-center gap-3 mb-6">
    <span class="h-px w-8 bg-carrotOrange-500"></span>
    <span class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.2em]">The Original Concept</span>
  </div>
  <h2 class="text-3xl font-serif text-gray-900 mb-6">Two faces. One voice.</h2>

  <p class="text-gray-700 text-lg font-light leading-relaxed mb-6">
    When Abwaan began, our identity was defined by the silhouettes of a Two eldery Somali man wearing a <em>Koofiyad</em> and a woman wearing a <em>Garbasaar</em>.
  </p>
  <p class="text-gray-700 text-lg font-light leading-relaxed">
    This represented the duality of our oral tradition. From the lullabies sung by mothers to the <em>Buraanbur</em> chanted at weddings, our history has always been a conversation between genders and generations.
  </p>
  <p class="text-gray-500 text-sm font-mono mt-6 uppercase tracking-wider">
    * Although the brand has evolved, this symbol remains the heart of our mission.
  </p>
</div>

          <div class="md:col-span-5 flex justify-center">
            <img
              :src="abwaanLogo"
              alt="Abwaan Logo: Two Faces"
              class="w-64 h-auto object-contain opacity-90 mix-blend-multiply drop-shadow-sm hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      <div class="text-center">
        <h2 class="text-4xl md:text-5xl font-serif text-gray-900 mb-8">The archive is open.</h2>
        <p class="text-gray-500 text-lg mb-12 max-w-xl mx-auto font-light">
          Whether you are a student, a creative, or just reconnecting with your roots—welcome home.
        </p>
        <router-link
          to="/collections"
          class="inline-block px-12 py-5 bg-gray-900 text-white rounded-2xl font-bold text-sm tracking-[0.15em] uppercase hover:bg-carrotOrange-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-gray-900/20"
        >
          Explore the Collection
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import landingImage from '@/assets/images/lido_beach_fiat.jpg'

import abwaanLogo from '@/assets/archive/wisdom_weyn_logo_2.svg'
</script>
