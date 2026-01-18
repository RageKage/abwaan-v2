<script setup lang="ts">
const appVersion = __APP_VERSION__
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
    ></div>

    <div class="relative z-10 flex flex-col items-center max-w-sm w-full px-8">
      <div class="mb-12 flex flex-col items-center gap-4">
        <div
          class="h-16 w-16 border border-gray-900 rounded-full flex items-center justify-center bg-white shadow-sm relative overflow-hidden"
        >
          <span class="absolute inset-0 bg-carrotOrange-500/10 animate-pulse"></span>
          <img
            src="@/assets/logo/Abwaan_4.svg"
            alt="Abwaan"
            loading="eager"
            decoding="async"
            class="w-8 h-8 opacity-80"
          />
        </div>
        <h1 class="text-3xl font-serif text-gray-900 tracking-tight">Abwaan</h1>
      </div>

      <div class="w-full space-y-2">
        <div class="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-400">
          <span>System</span>
          <span>Initializing...</span>
        </div>

        <div class="h-1 w-full bg-gray-100 overflow-hidden relative">
          <div class="absolute inset-y-0 left-0 bg-carrotOrange-500 w-1/3 animate-progress-indeterminate"></div>
        </div>

        <div class="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-300 pt-1">
          <span>V{{ appVersion }}</span>
          <span>Secure Connection</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes progress-indeterminate {
  0% {
    left: -35%;
    width: 35%;
  }
  100% {
    left: 100%;
    width: 35%;
  }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}
</style>
