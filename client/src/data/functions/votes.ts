import { httpsCallable } from 'firebase/functions'
import { fn } from '@/data/firebase/client'

export async function voteSubmission(submissionId: string, value: 1 | -1 | 0) {
  const call = httpsCallable(fn, 'voteSubmission')
  const res = await call({ submissionId, value })
  return res.data as { ok: boolean }
}
