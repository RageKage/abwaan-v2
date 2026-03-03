import { httpsCallable } from 'firebase/functions'
import type { NewSubmissionInput, Submission } from '@/data/models/submission'
import { functions } from '@/data/firebase/client'

export const createSubmission = async (input: NewSubmissionInput) => {
  const call = httpsCallable(functions, 'createSubmission')
  const res = await call(input)
  return res.data as { ok: boolean; submission: Submission }
}

export type UpdateSubmissionInput = {
  id: string
  patch: Partial<{
    type: string
    title: string | null
    text: string
    meaning: string
    translation: string | null
    language: string
    origin: string
    source: { name: string; url?: string | null; notes?: string | null } | null
  }>
}

export const updateSubmissionCallable = async (input: UpdateSubmissionInput) => {
  const call = httpsCallable(functions, 'updateSubmission')
  const res = await call(input)
  return res.data as { ok: boolean; submission: Submission }
}
