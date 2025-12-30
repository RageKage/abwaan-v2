<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type {
  LanguageCode,
  SubmissionOrigin,
  SubmissionType as ModelSubmissionType,
} from '@/data/models/submission'
import { useSubmissionsStore } from '@/features/submissions/submissions.store'
import {
  validateSubmissionDraft,
  type OriginType,
  type SubmissionDraft,
  type SubmissionType,
} from '@/features/submissions/submission.validation'
import { toastError, toastSuccess } from '@/shared/utils/alerts'
const router = useRouter()
const submissionsStore = useSubmissionsStore()

const draft = reactive<SubmissionDraft>({
  type: 'Proverb' as SubmissionType,
  title: '',
  text: '',
  meaning: '',
  translation: '',
  language: 'so', // Default to Somali
  origin: 'original', // Default to Original
  source: {
    name: '',
    url: '',
    notes: '',
  },
})

const validation = computed(() => validateSubmissionDraft(draft))
const errors = computed(() => validation.value.errors)
const canSubmit = computed(() => validation.value.ok && !submissionsStore.busy)

const showSource = computed(() => draft.origin === 'attributed')
const isPoetry = computed(() => draft.type === 'Poetry')
const showErrors = ref(false)

const errorOrder = [
  'type',
  'title',
  'text',
  'meaning',
  'translation',
  'language',
  'origin',
  'source.name',
  'source.url',
  'source.notes',
]

const scrollToFirstError = (errs: Record<string, string>) => {
  for (const key of errorOrder) {
    if (errs[key]) {
      const el = document.querySelector(`[data-error-for="${key}"]`)
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      break
    }
  }
}

const normalizeLanguage = (value: string): LanguageCode => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'en' || normalized === 'so') return normalized
  return 'so'
}

const normalizeOrigin = (value: OriginType | ''): SubmissionOrigin => {
  if (value === 'attributed') return 'shared'
  if (value === 'original' || value === 'unknown') return value
  return 'unknown'
}

const handleSubmit = async () => {
  showErrors.value = true
  const result = validateSubmissionDraft(draft)
  if (!result.ok) {
    await nextTick()
    scrollToFirstError(result.errors)
    return
  }

  try {
    const createdId = await submissionsStore.create({
      type: draft.type as ModelSubmissionType,
      language: normalizeLanguage(draft.language),
      origin: normalizeOrigin(draft.origin),
      title: draft.title.trim(),
      text: draft.text.trim(),
      meaning: draft.meaning.trim(),
      translation: draft.translation.trim() || undefined,
      source: showSource.value
        ? {
            name: draft.source.name.trim(),
            url: draft.source.url.trim() || null,
            notes: draft.source.notes.trim() || null,
          }
        : undefined,
    })
    if (createdId) {
      toastSuccess('Contribution submitted successfully!')
      await router.push(`/s/${createdId}`)
    } else {
      toastError(submissionsStore.error ?? 'Unable to create submission.')
    }
  } catch (err) {
    toastError(err instanceof Error ? err.message : 'Unable to create submission.')
  }
}
</script>

<template>
  <main
    class="min-h-screen w-full bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-carrotOrange-100 selection:text-carrotOrange-900 pb-24"
  >
    <div class="mx-auto max-w-4xl">
      <div class="mb-12 text-center max-w-2xl mx-auto">
        <span class="text-xs font-bold text-carrotOrange-600 uppercase tracking-[0.2em] mb-4 block">
          New Entry
        </span>
        <h1 class="font-serif text-4xl sm:text-5xl font-medium text-gray-900 mb-6">
          Contribute to the Archive.
        </h1>
        <p class="text-lg text-gray-500 leading-relaxed font-light">
          Help us build the digital library by preserving a poem, proverb, or piece of wisdom for
          the next generation.
        </p>
      </div>

      <form
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative"
        @submit.prevent="handleSubmit"
      >

        <div class="p-8 sm:p-12 space-y-12">
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <span class="h-px w-6 bg-gray-300"></span>
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Classification
              </h3>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <div class="group">
                <label class="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500"
                  >Record Type</label
                >
                <div class="relative">
                  <select
                    v-model="draft.type"
                    class="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
                  >
                    <option value="Proverb">Proverb (Maahmaah)</option>
                    <option value="Poetry">Poetry (Gabay)</option>
                  </select>
                  <div
                    class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  v-if="showErrors && errors.type"
                  data-error-for="type"
                  class="mt-2 text-xs text-red-500 font-bold"
                >
                  {{ errors.type }}
                </p>
              </div>

              <div class="group">
                <label class="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500"
                  >Language</label
                >
                <div class="relative">
                  <select
                    v-model="draft.language"
                    class="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
                  >
                    <option value="">Select Language</option>
                    <option value="so">Somali</option>
                    <option value="en">English</option>
                  </select>
                  <div
                    class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  v-if="showErrors && errors.language"
                  data-error-for="language"
                  class="mt-2 text-xs text-red-500 font-bold"
                >
                  {{ errors.language }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <span class="h-px w-6 bg-carrotOrange-400"></span>
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                The Manuscript
              </h3>
            </div>

            <div v-if="isPoetry" class="group">
              <label class="mb-2 block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-carrotOrange-600">
                Title
              </label>
              <input
                v-model="draft.title"
                type="text"
                required
                placeholder="Title of the Piece..."
                class="block w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-2xl font-serif text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 focus:outline-none transition-all"
              />
              <p
                v-if="showErrors && errors.title"
                data-error-for="title"
                class="mt-2 text-xs text-red-500 font-bold"
              >
                {{ errors.title }}
              </p>
            </div>

            <div class="group relative">
              <textarea
                v-model="draft.text"
                rows="6"
                required
                placeholder="Begin writing..."
                class="block w-full resize-y rounded-xl border border-gray-200 bg-white px-5 py-5 text-xl font-serif italic text-gray-800 placeholder:text-gray-300 focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 focus:outline-none transition-all leading-relaxed"
              ></textarea>
              <div class="absolute top-4 right-4 pointer-events-none opacity-20">
                <svg
                  class="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <p
                v-if="showErrors && errors.text"
                data-error-for="text"
                class="mt-2 text-xs text-red-500 font-bold"
              >
                {{ errors.text }}
              </p>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <span class="h-px w-6 bg-blue-300"></span>
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Context & Translation
              </h3>
            </div>

            <div class="grid gap-6">
              <div class="group">
                <label class="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500"
                  >Hidden Meaning</label
                >
                <textarea
                  v-model="draft.meaning"
                  rows="3"
                  placeholder="Explain the deeper meaning or cultural context..."
                  class="block w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all"
                ></textarea>
                <p
                  v-if="showErrors && errors.meaning"
                  data-error-for="meaning"
                  class="mt-2 text-xs text-red-500 font-bold"
                >
                  {{ errors.meaning }}
                </p>
              </div>

              <div class="group">
                <label class="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500"
                  >English Translation</label
                >
                <textarea
                  v-model="draft.translation"
                  rows="3"
                  placeholder="A literal or poetic translation..."
                  class="block w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-300 focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all"
                ></textarea>
                <p
                  v-if="showErrors && errors.translation"
                  data-error-for="translation"
                  class="mt-2 text-xs text-red-500 font-bold"
                >
                  {{ errors.translation }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <span class="h-px w-6 bg-gray-300"></span>
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Provenance</h3>
            </div>

            <div class="group max-w-sm">
              <label class="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500"
                >Origin Source</label
              >
              <div class="relative">
                <select
                  v-model="draft.origin"
                  class="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 focus:bg-white focus:border-carrotOrange-400 focus:ring-4 focus:ring-carrotOrange-50/50 transition-all font-medium"
                >
                  <option value="">Select Origin</option>
                  <option value="original">Original (My own work)</option>
                  <option value="attributed">Attributed (Known author)</option>
                  <option value="unknown">Unknown (Folklore)</option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p
                v-if="showErrors && errors.origin"
                data-error-for="origin"
                class="mt-2 text-xs text-red-500 font-bold"
              >
                {{ errors.origin }}
              </p>
            </div>

            <transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-2 opacity-0"
            >
              <div
                v-if="showSource"
                class="mt-6 rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8 space-y-6"
              >
                <div class="grid gap-6 md:grid-cols-2">
                  <div class="group">
                    <label
                      class="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >Author Name</label
                    >
                    <input
                      v-model="draft.source.name"
                      type="text"
                      class="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-carrotOrange-400 focus:ring-2 focus:ring-carrotOrange-50/50 transition-all"
                    />
                    <p
                      v-if="showErrors && errors['source.name']"
                      data-error-for="source.name"
                      class="mt-1 text-xs text-red-500 font-bold"
                    >
                      {{ errors['source.name'] }}
                    </p>
                  </div>
                  <div class="group">
                    <label
                      class="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >Reference URL</label
                    >
                    <input
                      v-model="draft.source.url"
                      type="url"
                      class="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-carrotOrange-400 focus:ring-2 focus:ring-carrotOrange-50/50 transition-all"
                    />
                    <p
                      v-if="showErrors && errors['source.url']"
                      data-error-for="source.url"
                      class="mt-1 text-xs text-red-500 font-bold"
                    >
                      {{ errors['source.url'] }}
                    </p>
                  </div>
                </div>

                <div class="group">
                  <label class="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >Source Notes</label
                  >
                  <textarea
                    v-model="draft.source.notes"
                    rows="2"
                    class="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-carrotOrange-400 focus:ring-2 focus:ring-carrotOrange-50/50 transition-all"
                  ></textarea>
                  <p
                    v-if="showErrors && errors['source.notes']"
                    data-error-for="source.notes"
                    class="mt-1 text-xs text-red-500 font-bold"
                  >
                    {{ errors['source.notes'] }}
                  </p>
                </div>
              </div>
            </transition>
          </div>
        </div>


        <div
          class="bg-gray-50 px-8 py-8 sm:px-12 flex flex-col sm:flex-row items-center justify-end gap-6 border-t border-gray-100"
        >
          <button
            type="submit"
            :disabled="!canSubmit"
            class="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-xl hover:bg-carrotOrange-500 hover:-translate-y-1 transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span>Submit Entry</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
