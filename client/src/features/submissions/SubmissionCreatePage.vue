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
  <main     class="relative w-full min-h-screen bg-gray-50 dot-pattern pt-24   font-sans text-gray-900 transition-all duration-300"
>

    <div class="max-w-[1600px] mx-auto border-l border-r border-gray-200">

      <div class="grid lg:grid-cols-12 border-b border-gray-200">
        <div class="lg:col-span-12 p-12 lg:p-20 bg-gray-50">
           <div class="max-w-3xl">
              <span class="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                 <span class="w-1.5 h-1.5 rounded-full bg-carrotOrange-500 animate-pulse"></span>
                 New Entry
              </span>
              <h1 class="text-5xl md:text-7xl font-serif tracking-tighter text-gray-900 mb-6">
                Contribute to History.
              </h1>
              <p class="text-xl text-gray-500 font-light leading-relaxed">
                Help us build the digital library by preserving a poem, proverb, or piece of wisdom.
              </p>
           </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">

        <div class="grid lg:grid-cols-12 border-b border-gray-200">
           <div class="lg:col-span-4 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <span class="text-xs font-mono text-gray-400 block mb-2">01. Classification</span>
              <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Record Type</h3>
              <p class="mt-4 text-sm text-gray-500 leading-relaxed">
                Define the structure of this entry. Is it a short proverb or a long-form poem?
              </p>
           </div>

           <div class="lg:col-span-8 p-10 lg:p-12 bg-white grid md:grid-cols-2 gap-10">
              <div class="group">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Category</label>
                <div class="relative">
                   <select
                     v-model="draft.type"
                     class="block w-full appearance-none bg-transparent border-b-2 border-gray-200 py-3 text-xl font-serif text-gray-900 focus:border-carrotOrange-500 focus:outline-none transition-colors cursor-pointer rounded-none"
                   >
                     <option value="Proverb">Proverb (Maahmaah)</option>
                     <option value="Poetry">Poetry (Gabay)</option>
                   </select>
                   <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                   </div>
                </div>
                <p v-if="showErrors && errors.type" data-error-for="type" class="mt-2 text-xs font-mono text-red-500 uppercase">
                  /// Error: {{ errors.type }}
                </p>
              </div>

              <div class="group">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Language</label>
                <div class="relative">
                   <select
                     v-model="draft.language"
                     class="block w-full appearance-none bg-transparent border-b-2 border-gray-200 py-3 text-xl font-serif text-gray-900 focus:border-carrotOrange-500 focus:outline-none transition-colors cursor-pointer rounded-none"
                   >
                     <option value="">Select Language</option>
                     <option value="so">Somali</option>
                     <option value="en">English</option>
                   </select>
                   <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                   </div>
                </div>
                <p v-if="showErrors && errors.language" data-error-for="language" class="mt-2 text-xs font-mono text-red-500 uppercase">
                   /// Error: {{ errors.language }}
                </p>
              </div>
           </div>
        </div>

        <div class="grid lg:grid-cols-12 border-b border-gray-200">
           <div class="lg:col-span-4 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <span class="text-xs font-mono text-gray-400 block mb-2">02. The Manuscript</span>
              <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Content Entry</h3>
              <p class="mt-4 text-sm text-gray-500 leading-relaxed">
                Enter the text exactly as it is spoken or written.
              </p>
           </div>

           <div class="lg:col-span-8 p-10 lg:p-12 bg-white space-y-10">
              <div v-if="isPoetry" class="group">
                 <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title</label>
                 <input
                   v-model="draft.title"
                   type="text"
                   placeholder="Enter title..."
                   class="block w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-serif text-gray-900 placeholder:text-gray-200 focus:border-carrotOrange-500 focus:outline-none transition-colors rounded-none"
                 />
                 <p v-if="showErrors && errors.title" data-error-for="title" class="mt-2 text-xs font-mono text-red-500 uppercase">
                    /// Error: {{ errors.title }}
                 </p>
              </div>

              <div class="group">
                 <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                    {{ isPoetry ? 'Verses' : 'Proverb Text' }}
                 </label>
                 <textarea
                   v-model="draft.text"
                   rows="8"
                   placeholder="Begin writing here..."
                   class="block w-full resize-y bg-gray-50/30 p-6 text-xl md:text-2xl font-serif text-gray-900 placeholder:text-gray-300 border border-gray-200 focus:border-carrotOrange-500 focus:ring-1 focus:ring-carrotOrange-500 focus:outline-none transition-all leading-loose"
                 ></textarea>
                 <p v-if="showErrors && errors.text" data-error-for="text" class="mt-2 text-xs font-mono text-red-500 uppercase">
                    /// Error: {{ errors.text }}
                 </p>
              </div>
           </div>
        </div>

        <div class="grid lg:grid-cols-12 border-b border-gray-200">
           <div class="lg:col-span-4 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <span class="text-xs font-mono text-gray-400 block mb-2">03. Context</span>
              <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Meaning</h3>
              <p class="mt-4 text-sm text-gray-500 leading-relaxed">
                The hidden meaning or translation of this piece.
              </p>
           </div>

           <div class="lg:col-span-8 p-10 lg:p-12 bg-white grid gap-10">
              <div class="group">
                 <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Hidden Meaning / Context</label>
                 <textarea
                   v-model="draft.meaning"
                   rows="3"
                   placeholder="Explain the context..."
                   class="block w-full bg-transparent border-b border-gray-200 py-2 text-lg text-gray-700 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors resize-none rounded-none"
                 ></textarea>
                 <p v-if="showErrors && errors.meaning" data-error-for="meaning" class="mt-2 text-xs font-mono text-red-500 uppercase">
                    /// Error: {{ errors.meaning }}
                 </p>
              </div>

              <div class="group">
                 <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">English Translation</label>
                 <textarea
                   v-model="draft.translation"
                   rows="3"
                   placeholder="Literal translation..."
                   class="block w-full bg-transparent border-b border-gray-200 py-2 text-lg text-gray-700 placeholder:text-gray-300 focus:border-carrotOrange-500 focus:outline-none transition-colors resize-none rounded-none"
                 ></textarea>
                 <p v-if="showErrors && errors.translation" data-error-for="translation" class="mt-2 text-xs font-mono text-red-500 uppercase">
                    /// Error: {{ errors.translation }}
                 </p>
              </div>
           </div>
        </div>

        <div class="grid lg:grid-cols-12 border-b border-gray-200">
           <div class="lg:col-span-4 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <span class="text-xs font-mono text-gray-400 block mb-2">04. Provenance</span>
              <h3 class="text-xl font-bold uppercase tracking-widest text-gray-900">Source</h3>
              <p class="mt-4 text-sm text-gray-500 leading-relaxed">
                Where did this come from? Crediting the original author is vital for the archive.
              </p>
           </div>

           <div class="lg:col-span-8 p-10 lg:p-12 bg-white">
              <div class="group max-w-sm mb-8">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Origin Type</label>
                <div class="relative">
                   <select
                     v-model="draft.origin"
                     class="block w-full appearance-none bg-transparent border-b-2 border-gray-200 py-3 text-xl font-serif text-gray-900 focus:border-carrotOrange-500 focus:outline-none transition-colors cursor-pointer rounded-none"
                   >
                     <option value="">Select Origin</option>
                     <option value="original">Original (My own work)</option>
                     <option value="attributed">Attributed (Known author)</option>
                     <option value="unknown">Unknown (Folklore)</option>
                   </select>
                   <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                   </div>
                </div>
                <p v-if="showErrors && errors.origin" data-error-for="origin" class="mt-2 text-xs font-mono text-red-500 uppercase">
                   /// Error: {{ errors.origin }}
                </p>
              </div>

              <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="transform -translate-y-4 opacity-0"
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="transform translate-y-0 opacity-100"
                leave-to-class="transform -translate-y-4 opacity-0"
              >
                <div v-if="showSource" class="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                   <div class="group">
                      <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Original Author Name</label>
                      <input
                        v-model="draft.source.name"
                        type="text"
                        class="block w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:border-carrotOrange-500 focus:outline-none"
                      />
                      <p v-if="showErrors && errors['source.name']" data-error-for="source.name" class="mt-2 text-xs font-mono text-red-500 uppercase">
                         /// Error: {{ errors['source.name'] }}
                      </p>
                   </div>

                   <div class="group">
                      <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Reference URL</label>
                      <input
                        v-model="draft.source.url"
                        type="url"
                        class="block w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:border-carrotOrange-500 focus:outline-none"
                      />
                      <p v-if="showErrors && errors['source.url']" data-error-for="source.url" class="mt-2 text-xs font-mono text-red-500 uppercase">
                         /// Error: {{ errors['source.url'] }}
                      </p>
                   </div>

                   <div class="group md:col-span-2">
                      <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Additional Notes</label>
                      <textarea
                        v-model="draft.source.notes"
                        rows="2"
                        class="block w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:border-carrotOrange-500 focus:outline-none resize-none"
                      ></textarea>
                      <p v-if="showErrors && errors['source.notes']" data-error-for="source.notes" class="mt-2 text-xs font-mono text-red-500 uppercase">
                         /// Error: {{ errors['source.notes'] }}
                      </p>
                   </div>
                </div>
              </transition>
           </div>
        </div>

        <div class="grid lg:grid-cols-12 bg-gray-900 text-white">
           <div class="lg:col-span-4 border-r border-gray-800 hidden lg:block"></div>
           <div class="lg:col-span-8">
              <button
                type="submit"
                :disabled="!canSubmit"
                class="w-full py-8 md:py-10 flex items-center justify-between px-12 hover:bg-carrotOrange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                 <span class="text-xs font-bold uppercase tracking-widest">
                    {{ canSubmit ? 'Confirm & Publish' : 'Complete all fields' }}
                 </span>
                 <span class="text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </button>
           </div>
        </div>

      </form>
    </div>
  </main>
</template>
