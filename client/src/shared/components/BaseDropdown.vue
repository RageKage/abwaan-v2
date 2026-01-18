<script setup lang="ts" generic="T extends string | number | symbol">
import { ref, onMounted, onUnmounted, nextTick, watch, toRefs } from 'vue'

const props = defineProps<{
  options: ReadonlyArray<{ key: T; label: string }>
  modelValue: T
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()

const { options, modelValue, label } = toRefs(props)

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const optionRefs = ref<HTMLButtonElement[]>([])
const activeIndex = ref(-1)
const listboxId = `dropdown-${Math.random().toString(36).slice(2)}`
const buttonId = `${listboxId}-button`

const toggle = () => {
  isOpen.value = !isOpen.value
}

const select = (value: T) => {
  emit('update:modelValue', value)
  isOpen.value = false
  buttonRef.value?.focus()
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const getSelectedIndex = () =>
  options.value.findIndex((option) => option.key === modelValue.value)

const focusOptionAt = async (index: number) => {
  const maxIndex = options.value.length - 1
  if (maxIndex < 0) return
  const bounded = Math.max(0, Math.min(index, maxIndex))
  activeIndex.value = bounded
  await nextTick()
  optionRefs.value[bounded]?.focus()
}

const handleTriggerKeydown = async (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!isOpen.value) isOpen.value = true
    const nextIndex = Math.min(
      Math.max(getSelectedIndex(), 0) + 1,
      options.value.length - 1,
    )
    await focusOptionAt(nextIndex)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) isOpen.value = true
    const prevIndex = Math.max(Math.max(getSelectedIndex(), 0) - 1, 0)
    await focusOptionAt(prevIndex)
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle()
    if (isOpen.value) {
      await focusOptionAt(Math.max(getSelectedIndex(), 0))
    }
  }
}

const handleListKeydown = async (event: KeyboardEvent) => {
  const maxIndex = options.value.length - 1
  if (maxIndex < 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const nextIndex = activeIndex.value >= maxIndex ? 0 : activeIndex.value + 1
    await focusOptionAt(nextIndex)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const nextIndex = activeIndex.value <= 0 ? maxIndex : activeIndex.value - 1
    await focusOptionAt(nextIndex)
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    await focusOptionAt(0)
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    await focusOptionAt(maxIndex)
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const option = options.value[activeIndex.value]
    if (option) select(option.key)
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    isOpen.value = false
    buttonRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(isOpen, async (open) => {
  if (open) {
    await focusOptionAt(Math.max(getSelectedIndex(), 0))
    return
  }
  activeIndex.value = -1
})
</script>

<template>
  <div class="relative h-full z-0" ref="containerRef">
    <button
      type="button"
      ref="buttonRef"
      :id="buttonId"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      class="h-full flex items-center gap-x-3 px-8 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-carrotOrange-600 hover:bg-gray-50 transition-colors focus:outline-none whitespace-nowrap"
      @click="toggle"
      @keydown="handleTriggerKeydown"
    >
      <span class="text-gray-400" v-if="label">{{ label }}:</span>
      <span>{{ options.find((o) => o.key === modelValue)?.label }}</span>
      <svg
        class="h-3 w-3 transition-transform duration-300"
        :class="isOpen ? 'rotate-180 text-carrotOrange-600' : 'text-gray-300'"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full z-[100] w-56 bg-white border border-gray-200 shadow-2xl ring-1 ring-black/5"
        role="listbox"
        :id="listboxId"
        :aria-labelledby="buttonId"
        @keydown="handleListKeydown"
      >
        <div class="flex flex-col">
          <button
            v-for="(option, optionIndex) in options"
            :key="String(option.key)"
            ref="optionRefs"
            role="option"
            :id="`${listboxId}-option-${String(option.key)}`"
            :aria-selected="modelValue === option.key"
            :tabindex="optionIndex === activeIndex ? 0 : -1"
            class="flex items-center justify-between px-6 py-4 text-xs font-bold uppercase tracking-widest text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            :class="[modelValue === option.key ? 'text-carrotOrange-600 bg-gray-50/50' : 'text-gray-500']"
            @click.stop="select(option.key)"
            @focus="activeIndex = optionIndex"
          >
            {{ option.label }}
            <span v-if="modelValue === option.key" class="w-1.5 h-1.5 rounded-full bg-carrotOrange-600"></span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
