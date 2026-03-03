<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isManualPause = ref(false)
const resumeOnVisibility = ref(false)
const audioSrc = ref<string>('')
const isSlowConnection = ref(false)

// --- CONFIGURATION FOR READING AMBIENCE ---
// Volume: 0.03 is very subtle (3%). Standard audio is usually too loud.
const TARGET_VOLUME = 0.03
// Filter: 800Hz cuts the high pitch hiss, making it sound "warm" and background.
const FILTER_CUTOFF_HZ = 800
const FILTER_Q = 0.7
// Fade: 2 seconds makes the transition unnoticeable.
const FADE_IN_TIME = 2
const FADE_OUT_TIME = 1.5

// Web Audio API Nodes
let audioContext: AudioContext | null = null
let filterNode: BiquadFilterNode | null = null
let gainNode: GainNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let fadeTimeout: number | null = null

const label = computed(() => (isPlaying.value ? 'Sound on' : 'Sound off'))

// Initialize the Audio Context Graph
const ensureAudioGraph = () => {
  const audio = audioRef.value
  if (!audio || audioContext) return

  // Create Context
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  audioContext = new AudioContextClass()

  // Create Nodes
  sourceNode = audioContext.createMediaElementSource(audio)
  filterNode = audioContext.createBiquadFilter()
  gainNode = audioContext.createGain()

  // 1. Configure Filter (The "Lo-Fi" Effect)
  filterNode.type = 'lowpass'
  filterNode.frequency.value = FILTER_CUTOFF_HZ
  filterNode.Q.value = FILTER_Q

  // 2. Configure Volume
  // Start at essentially zero so we can fade in
  gainNode.gain.value = 0.0001

  // 3. Connect: Source -> Filter -> Gain -> Output
  sourceNode
    .connect(filterNode)
    .connect(gainNode)
    .connect(audioContext.destination)
}

// Smoothly changes volume using hardware timing
const fadeVolume = (target: number, duration: number) => {
  if (!audioContext || !gainNode) return

  const now = audioContext.currentTime

  // Cancel any scheduled future changes to avoid conflicts
  gainNode.gain.cancelScheduledValues(now)

  // Set the current value anchor (required for exponential ramp)
  gainNode.gain.setValueAtTime(Math.max(gainNode.gain.value, 0.0001), now)

  // Ramp to target
  gainNode.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), now + duration)
}

const tryPlay = async () => {
  const audio = audioRef.value
  if (!audio) return false

  try {
    ensureAudioGraph()

    // Browsers often suspend audio contexts until user interaction
    if (audioContext?.state === 'suspended') {
      await audioContext.resume()
    }

    // Play the HTML audio element (signal flows through our graph)
    await audio.play()

    isPlaying.value = true

    // Smooth fade in
    fadeVolume(TARGET_VOLUME, FADE_IN_TIME)

    return true
  } catch (err) {
    console.error("Audio play failed (likely autoplay policy):", err)
    isPlaying.value = false
    return false
  }
}

const stopWithFade = () => {
  const audio = audioRef.value
  if (!audio || !isPlaying.value) return

  // 1. Fade out
  fadeVolume(0.0001, FADE_OUT_TIME)

  // 2. Wait for fade to finish, then pause the underlying element
  if (fadeTimeout) clearTimeout(fadeTimeout)

  fadeTimeout = window.setTimeout(() => {
    if (audio) audio.pause()
    isPlaying.value = false
  }, FADE_OUT_TIME * 1000)
}

const handleToggle = async () => {
  // If on slow connection and audio not loaded, load it now
  if (!audioSrc.value) {
    const { default: archiveSound } = await import('@/assets/audio/archive-sound.mp3')
    audioSrc.value = archiveSound
    const audio = audioRef.value
    if (audio) {
      audio.src = archiveSound
      audio.loop = true
    }
  }

  if (isPlaying.value) {
    isManualPause.value = true
    resumeOnVisibility.value = false
    stopWithFade()
  } else {
    isManualPause.value = false
    // Clear any pending pause timeouts so we don't pause right after playing
    if (fadeTimeout) {
      clearTimeout(fadeTimeout)
      fadeTimeout = null
    }
    await tryPlay()
  }
}

const handleVisibility = () => {
  if (document.hidden) {
    // User left the tab
    if (isPlaying.value && !isManualPause.value) {
      resumeOnVisibility.value = true
      stopWithFade()
    }
  } else {
    // User came back
    if (resumeOnVisibility.value && !isManualPause.value) {
      // Clear any pending stops if they came back quickly
      if (fadeTimeout) clearTimeout(fadeTimeout)
      void tryPlay()
      resumeOnVisibility.value = false
    }
  }
}

onMounted(async () => {
  // Check network connection quality
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (connection) {
    const effectiveType = connection.effectiveType
    // Don't load audio on slow connections (2g, slow-2g, 3g)
    isSlowConnection.value = ['slow-2g', '2g', '3g'].includes(effectiveType)
  }

  // Only load audio on fast connections (4g or better, or unknown)
  if (!isSlowConnection.value) {
    // Dynamically import audio file only when needed
    const { default: archiveSound } = await import('@/assets/audio/archive-sound.mp3')
    audioSrc.value = archiveSound

    const audio = audioRef.value
    if (audio) {
      audio.loop = true
      audio.src = archiveSound
      // We do NOT set audio.volume here, as the GainNode controls it now.
    }

    // Attempt autoplay (might be blocked by browser until interaction)
    void tryPlay()
  }

  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('pagehide', handleVisibility)
  window.addEventListener('pageshow', handleVisibility)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('pagehide', handleVisibility)
  window.removeEventListener('pageshow', handleVisibility)

  if (fadeTimeout) clearTimeout(fadeTimeout)

  audioRef.value?.pause()

  if (audioContext) {
    void audioContext.close()
    audioContext = null
    filterNode = null
    sourceNode = null
    gainNode = null
  }
})
</script>

<template>
  <div class="fixed bottom-5 right-5 z-[120]">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 shadow-lg backdrop-blur hover:text-carrotOrange-600 transition-colors"
      :aria-pressed="isPlaying"
      :aria-label="label"
      :title="label"
      @click="handleToggle"
    >
      <span
        class="h-2 w-2 rounded-full transition-colors duration-300"
        :class="isPlaying ? 'bg-carrotOrange-500' : 'bg-gray-300'"
      ></span>
      <span class="hidden sm:inline">Ambient</span>
      <span>{{ isPlaying ? 'On' : 'Off' }}</span>
    </button>
    <audio ref="audioRef" :preload="audioSrc ? 'auto' : 'none'" crossorigin="anonymous"></audio>
  </div>
</template>
