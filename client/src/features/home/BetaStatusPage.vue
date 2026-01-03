<template>
  <main class="w-full font-sans text-gray-900 pt-24 pb-24">
    <div class="max-w-[1600px] mx-auto border-l border-r border-gray-200">
      <header class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12">
          <div class="lg:col-span-7 p-12 lg:p-16 bg-white">
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Beta Status
            </span>
            <h1 class="mt-6 text-5xl md:text-7xl font-serif tracking-tight text-gray-900">
              Status Board
            </h1>
            <p class="mt-6 text-lg text-gray-500 font-light max-w-xl">
              A transparent snapshot of where Abwaan began, where it stands today, and what is
              coming next.
            </p>
          </div>
          <div
            class="lg:col-span-5 p-12 lg:p-16 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200"
          >
            <div class="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2">
              <span class="h-2 w-2 rounded-full bg-carrotOrange-500"></span>
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                Beta, Jan 03, 2026
              </span>
            </div>
            <p class="mt-6 text-sm text-gray-500 leading-relaxed">
              This board is updated during beta to keep the community aligned on progress and
              priorities.
            </p>
            <div class="mt-8 border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-2">
              <p class="uppercase tracking-[0.2em] font-bold text-gray-400">Focus</p>
              <p>Stability, feedback, and archive growth.</p>
            </div>
          </div>
        </div>
      </header>

      <section class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12">
          <div class="lg:col-span-4 p-10 lg:p-12 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Where We Started
            </span>
            <h2 class="mt-4 text-3xl font-serif text-gray-900">A rescue mission.</h2>
            <p class="mt-4 text-sm text-gray-500 font-light leading-relaxed">
              The earliest versions were personal and small, focused on saving words before they
              disappeared.
            </p>
          </div>
          <div class="lg:col-span-8 p-10 lg:p-12 bg-white">
            <div class="space-y-4 text-sm text-gray-600 font-light">
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>
                  Abwaan began as a personal attempt to protect Somali proverbs and poetry that
                  were getting buried in fast-moving feeds.
                </p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>
                  Early versions were simple: a place to collect screenshots and notes that were
                  otherwise lost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12">
          <div class="lg:col-span-4 p-10 lg:p-12 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Where We Are Now
            </span>
            <h2 class="mt-4 text-3xl font-serif text-gray-900">v2 beta live.</h2>
            <p class="mt-4 text-sm text-gray-500 font-light leading-relaxed">
              The archive is functional, searchable, and open for feedback.
            </p>
          </div>
          <div class="lg:col-span-8 p-10 lg:p-12 bg-white">
            <div class="space-y-4 text-sm text-gray-600 font-light">
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Browse the archive with filters, search, and pagination.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Accounts support email/password and Google sign-in.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>New users claim a unique username during onboarding.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Profiles include display name, bio, and public contributions.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Submissions support meaning, translation, origin, and sources.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Voting works for signed-in users with real-time score updates.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>The Swiss Grid design system is applied across core pages.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12">
          <div class="lg:col-span-4 p-10 lg:p-12 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              What We Plan Next
            </span>
            <h2 class="mt-4 text-3xl font-serif text-gray-900">The roadmap.</h2>
            <p class="mt-4 text-sm text-gray-500 font-light leading-relaxed">
              These are the next major bets after beta feedback.
            </p>
          </div>
          <div class="lg:col-span-8 p-10 lg:p-12 bg-white">
            <div class="space-y-4 text-sm text-gray-600 font-light">
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Import the larger proverb archive (300+ already collected).</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Add translation and context for 100+ raw poems.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Moderation flow: review, approve, and hide submissions.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Guest or anonymous voting to reduce feedback friction.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Submission editing and a real report workflow.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-carrotOrange-500"></span>
                <p>Stronger discovery: tags, collections, and improved search.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-gray-200">
        <div class="grid lg:grid-cols-12">
          <div class="lg:col-span-4 p-10 lg:p-12 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Archive Note
            </span>
            <h2 class="mt-4 text-3xl font-serif text-gray-900">What is already saved.</h2>
          </div>
          <div class="lg:col-span-8 p-10 lg:p-12 bg-white">
            <p class="text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
              We have archived over 300 proverbs from many sources online, plus at least 100 poems
              in raw form with no translation, word-by-word meaning, or context yet.
            </p>
            <p class="mt-6 text-sm text-gray-500 font-light max-w-2xl">
              Turning these into complete, searchable entries is part of the work ahead.
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
