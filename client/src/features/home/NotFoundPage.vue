<template>
  <main
    class="min-h-screen w-full bg-white flex items-center justify-center relative overflow-hidden font-sans text-gray-900"
  >
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
    ></div>

    <div class="w-full max-w-lg relative z-10 p-6">
      <div class="bg-white border border-gray-200 shadow-none">
        <div class="p-12 border-b border-gray-200 bg-gray-50 text-center">
          <div class="inline-flex items-center justify-center h-16 w-16 border border-gray-900 rounded-full mb-6">
            <span class="font-mono text-xl font-bold">?</span>
          </div>

          <h1 class="text-6xl md:text-8xl font-serif tracking-tighter text-gray-900 leading-none mb-2">404</h1>
          <p class="font-mono text-xs text-red-500 uppercase tracking-widest">/// Error: File Not Found</p>
        </div>

        <div class="p-12 text-center space-y-8">
          <p class="text-lg text-gray-500 font-light leading-relaxed">
            The record you are looking for has slipped between the shelves or does not exist in this archive.
          </p>

          <div class="flex flex-col gap-4">
            <router-link
              to="/"
              class="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-carrotOrange-500 transition-colors"
            >
              Return Home
            </router-link>

            <router-link
              to="/collections"
              class="w-full py-4 border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Browse Archive
            </router-link>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 bg-gray-50 text-center">
          <p class="text-[10px] font-mono text-gray-400 uppercase tracking-widest">System Code: ERR_MISSING_REF</p>
        </div>
      </div>
    </div>
  </main>
</template>
