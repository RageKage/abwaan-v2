export interface Comment {
  id: string
  submissionId: string
  uid: string
  displayName: string
  username: string | null
  body: string
  createdAt: number
  updatedAt?: number | null
}
