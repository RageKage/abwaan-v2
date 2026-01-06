import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Report, ReportStatus } from '@/data/models/report'
import { listReports, updateReportStatus } from '@/data/firestore/reports.repo'
import { useAuthStore } from '@/features/auth/auth.store'

export const useReportsStore = defineStore('reports', () => {
  const items = ref<Report[]>([])
  const busy = ref(false)
  const error = ref<string | null>(null)

  const load = async (status: ReportStatus) => {
    busy.value = true
    error.value = null
    try {
      items.value = await listReports(status)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load reports'
    } finally {
      busy.value = false
    }
  }

  const setStatus = async (id: string, status: ReportStatus) => {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('Please log in again.')
    }
    busy.value = true
    error.value = null
    try {
      await updateReportStatus(id, status, authStore.user.uid)
      items.value = items.value.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              reviewedAt: Date.now(),
              reviewedBy: authStore.user?.uid ?? null,
            }
          : item,
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update report'
      throw err
    } finally {
      busy.value = false
    }
  }

  return {
    items,
    busy,
    error,
    load,
    setStatus,
  }
})
