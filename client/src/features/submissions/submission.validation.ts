export type SubmissionType = 'Proverb' | 'Poetry'
export type OriginType = 'original' | 'attributed' | 'unknown'

export type SubmissionDraft = {
  type: SubmissionType | ''
  title: string
  text: string
  meaning: string
  translation: string
  language: string
  origin: OriginType | ''
  source: {
    name: string
    url: string
    notes: string
  }
}

const MAX_TITLE = 120
const MAX_TEXT = 4000
const MAX_MEANING = 2000
const MAX_TRANSLATION = 2000
const MIN_TITLE = 3

const isValidUrl = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const validateSubmissionDraft = (draft: SubmissionDraft) => {
  const errors: Record<string, string> = {}

  const type = draft.type.trim()
  const title = draft.title.trim()
  const text = draft.text.trim()
  const meaning = draft.meaning.trim()
  const translation = draft.translation.trim()
  const language = draft.language.trim()
  const origin = draft.origin.trim()
  const sourceName = draft.source?.name?.trim() ?? ''
  const sourceUrl = draft.source?.url?.trim() ?? ''

  if (!type) {
    errors.type = 'Type is required.'
  } else if (!['Proverb', 'Poetry'].includes(type)) {
    errors.type = 'Type must be Proverb or Poetry.'
  }

  // Title logic: required for Poetry, hidden/ignored for Proverb.
  if (type === 'Poetry') {
    if (!title) {
      errors.title = 'Title is required for Poetry.'
    } else if (title.length < MIN_TITLE) {
      errors.title = `Title must be at least ${MIN_TITLE} characters.`
    } else if (title.length > MAX_TITLE) {
      errors.title = `Title must be ${MAX_TITLE} characters or fewer.`
    }
  }

  if (!text) {
    errors.text = 'Text is required.'
  } else if (text.length > MAX_TEXT) {
    errors.text = `Text must be ${MAX_TEXT} characters or fewer.`
  }

  if (meaning.length > MAX_MEANING) {
    errors.meaning = `Meaning must be ${MAX_MEANING} characters or fewer.`
  }

  if (translation.length > MAX_TRANSLATION) {
    errors.translation = `Translation must be ${MAX_TRANSLATION} characters or fewer.`
  }

  if (language) {
    if (language.length < 2 || language.length > 8) {
      errors.language = 'Language must be 2-8 characters.'
    }
  }

  if (origin && !['original', 'attributed', 'unknown'].includes(origin)) {
    errors.origin = 'Origin must be original, attributed, or unknown.'
  }

  if (origin === 'attributed') {
    if (!sourceName) {
      errors['source.name'] = 'Source name is required.'
    }
    if (sourceUrl && !isValidUrl(sourceUrl)) {
      errors['source.url'] = 'Source URL is invalid.'
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
