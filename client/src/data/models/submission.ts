export type SubmissionType = 'Proverb' | 'Poetry'
export type LanguageCode = 'so' | 'en'
export type SubmissionOrigin = 'original' | 'shared' | 'unknown'
export type SubmissionStatus = 'published' | 'pending' | 'hidden'

export type SubmissionSource = {
  name: string
  url: string | null
  notes: string | null
}

export interface Submission {
  id: string
  uid: string
  displayName: string
  username: string | null
  type: SubmissionType
  language: LanguageCode
  origin: SubmissionOrigin
  status: SubmissionStatus
  statusChangedAt?: number | null
  statusChangedBy?: string | null
  statusReason?: string | null
  title: string | null
  text: string
  meaning: string
  translation: string | null
  source: SubmissionSource | null
  createdAt: number
  updatedAt: number | null
  voteUp: number
  voteDown: number
  voteScore: number
  searchIndex: string
  searchKeywords: string[]
}

export interface NewSubmissionInput {
  type: SubmissionType
  language: LanguageCode
  origin: SubmissionOrigin
  title?: string
  text: string
  meaning: string
  translation?: string
  source?: {
    name: string
    url?: string | null
    notes?: string | null
  }
}
