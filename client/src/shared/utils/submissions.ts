import type { Submission } from '@/data/models/submission'

type SubmissionLike = Submission

export const formatSubmissionDate = (value: number) => {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getAuthorUsername = (submission: SubmissionLike) => {
  return submission.username ?? null
}

export const getAuthorName = (submission: SubmissionLike) => {
  return submission.displayName ?? null
}

export const getAuthorUid = (submission: SubmissionLike) => {
  return submission.uid ?? null
}

export const submissionAuthorLabel = (submission: SubmissionLike) => {
  const username = getAuthorUsername(submission)
  if (username) return `@${username}`
  return getAuthorName(submission) || 'Anonymous'
}

export const submissionAuthorInitial = (submission: SubmissionLike) => {
  const value = (getAuthorUsername(submission) || getAuthorName(submission) || '?').trim()
  return (value[0] || '?').toUpperCase()
}

export const submissionPreviewText = (submission: SubmissionLike, maxLength = 120) => {
  const trimmed = submission.text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 3)}...`
}
