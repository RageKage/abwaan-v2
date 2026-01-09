<script setup lang="ts">
import { useDialog } from '@/shared/utils/useDialog'

const { state, confirm, cancel } = useDialog()
</script>

<template>
  <transition name="dialog-fade" appear>
    <div v-if="state.isOpen" class="fixed inset-0 z-[9999]">
      <div class="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" @click="cancel" />

      <div class="relative flex min-h-full items-center justify-center p-4 text-center">
        <transition name="dialog-panel" appear>
          <div
            class="w-full max-w-md transform overflow-hidden bg-white text-left align-middle shadow-2xl transition-all border border-gray-100 rounded-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-dialog-title"
          >
            <div class="p-8 text-center">
              <div
                v-if="state.type === 'warning'"
                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 mb-6"
              >
                <svg
                  class="h-6 w-6 text-[#eb932e]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              <h3 id="global-dialog-title" class="text-3xl font-serif leading-tight text-gray-900 mb-2">
                {{ state.title }}
              </h3>

              <div class="mt-2">
                <p class="text-sm text-gray-500 leading-relaxed">
                  {{ state.message }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100">
              <button
                type="button"
                class="flex w-full items-center justify-center bg-white px-4 py-6 text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                @click="cancel"
              >
                {{ state.cancelText }}
              </button>

              <button
                type="button"
                class="flex w-full items-center justify-center bg-[#eb932e] px-4 py-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-orange-600 transition-colors duration-200"
                @click="confirm"
              >
                {{ state.confirmText }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
.dialog-panel-enter-active,
.dialog-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.dialog-panel-enter-from,
.dialog-panel-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
