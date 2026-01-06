import type { SubmissionType } from './submission'

export type ReportReason = 'spam' | 'abuse' | 'plagiarism' | 'inaccurate' | 'other'
export type ReportStatus = 'open' | 'reviewed' | 'dismissed'

export interface Report {
  id: string
  submissionId: string
  submissionType: SubmissionType
  submissionTitle: string
  submissionAuthorUid: string
  submissionAuthorUsername: string | null
  reporterUid: string
  reporterUsername: string | null
  reason: ReportReason
  details: string | null
  status: ReportStatus
  createdAt: number
  reviewedAt?: number | null
  reviewedBy?: string | null
}
