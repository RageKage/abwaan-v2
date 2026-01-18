import { httpsCallable } from 'firebase/functions'
import type { NewSubmissionInput, Submission } from '@/data/models/submission'
import { fn } from '@/data/firebase/client'

export const createSubmission = async (input: NewSubmissionInput) => {
  const call = httpsCallable(fn, 'createSubmission')
  const res = await call(input)
  return res.data as { ok: boolean; submission: Submission }
}
