import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  limit as limitResults,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/data/firebase/client'
import type { Report, ReportReason, ReportStatus } from '@/data/models/report'
import type { Submission } from '@/data/models/submission'

export const createReport = async ({
  submission,
  reason,
  details,
  reporterUid,
  reporterUsername,
}: {
  submission: Submission
  reason: ReportReason
  details?: string | null
  reporterUid: string
  reporterUsername: string | null
}): Promise<Report> => {
  const reportRef = doc(db, 'submissions', submission.id, 'reports', reporterUid)
  const existing = await getDoc(reportRef)
  if (existing.exists()) {
    throw new Error('You already reported this entry.')
  }

  const payload: Omit<Report, 'id'> = {
    submissionId: submission.id,
    submissionType: submission.type,
    submissionTitle: submission.title || submission.text,
    submissionAuthorUid: submission.uid,
    submissionAuthorUsername: submission.username ?? null,
    reporterUid,
    reporterUsername,
    reason,
    details: details?.trim() || null,
    status: 'open',
    createdAt: Date.now(),
    reviewedAt: null,
    reviewedBy: null,
  }

  await setDoc(reportRef, payload)
  return { id: reportRef.id, ...payload }
}

export const listReports = async (status: ReportStatus = 'open', limit = 25): Promise<Report[]> => {
  const constraints: QueryConstraint[] = [where('status', '==', status), orderBy('createdAt', 'desc')]
  if (limit) {
    constraints.push(limitResults(limit))
  }
  const reportsQuery = query(collectionGroup(db, 'reports'), ...constraints)
  const snapshot = await getDocs(reportsQuery)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Report, 'id'>) }))
}

export const updateReportStatus = async (
  submissionId: string,
  reporterUid: string,
  status: ReportStatus,
  actorUid: string,
): Promise<void> => {
  const reportRef = doc(db, 'submissions', submissionId, 'reports', reporterUid)
  await updateDoc(reportRef, {
    status,
    reviewedAt: Date.now(),
    reviewedBy: actorUid,
  })
}

export const countOpenReportsBySubmissionIds = async (submissionIds: string[]): Promise<Record<string, number>> => {
  const uniqueIds = Array.from(new Set(submissionIds)).filter(Boolean)
  if (uniqueIds.length === 0) return {}

  const counts: Record<string, number> = {}
  const batchSize = 10

  for (let index = 0; index < uniqueIds.length; index += batchSize) {
    const batch = uniqueIds.slice(index, index + batchSize)
    const reportsQuery = query(
      collectionGroup(db, 'reports'),
      where('status', '==', 'open'),
      where('submissionId', 'in', batch),
    )
    const snapshot = await getDocs(reportsQuery)
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as Report
      if (!data.submissionId) return
      counts[data.submissionId] = (counts[data.submissionId] ?? 0) + 1
    })
  }

  return counts
}
