<template>
  <div
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-500"
  >
    <div class="relative flex items-center justify-center">
      <div
        class="absolute w-20 h-20 border-4 border-gray-100 rounded-full"
      ></div>
      <div
        class="w-20 h-20 border-4 border-transparent border-t-carrotOrange-500 rounded-full animate-spin-slow"
      ></div>

      <div
        class="absolute w-12 h-12 border-4 border-gray-100 rounded-full"
      ></div>
      <div
        class="absolute w-12 h-12 border-4 border-transparent border-b-carrotOrange-600 rounded-full animate-spin-reverse"
      ></div>

      <div
        class="absolute w-3 h-3 bg-carrotOrange-500 rounded-full animate-pulse-glow"
      ></div>
    </div>

    <div class="mt-8 text-center space-y-1">
      <h3
        class="text-sm font-bold text-gray-900 tracking-[0.2em] uppercase animate-pulse"
      >
        Abwaan
      </h3>
      <p class="text-[10px] font-medium text-gray-400">Loading archive...</p>
    </div>
  </div>
</template>

<style scoped>
  /* 1. Slow Spin for Outer Ring */
  @keyframes spin-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }

  /* 2. Reverse Spin for Inner Ring */
  @keyframes spin-reverse {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-360deg);
    }
  }
  .animate-spin-reverse {
    animation: spin-reverse 1.5s linear infinite;
  }

  /* 3. Glowing Pulse for Center Dot */
  @keyframes pulse-glow {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
      box-shadow: 0 0 0 0px rgba(230, 126, 34, 0.4);
    }
    50% {
      opacity: 0.8;
      transform: scale(0.9);
      box-shadow: 0 0 0 6px rgba(230, 126, 34, 0);
    }
  }
  .animate-pulse-glow {
    animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
