import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export type DbStatus = 'checking' | 'online' | 'offline'

export const useDatabaseStatus = () => {
  const status = ref<DbStatus>('checking')
  const lastChecked = ref<Date | null>(null)

  const isOnline = computed(() => status.value === 'online')
  const isOffline = computed(() => status.value === 'offline')

  const refreshStatus = () => {
    const browserOnline = typeof navigator === 'undefined' ? true : navigator.onLine
    status.value = browserOnline ? 'online' : 'offline'
    lastChecked.value = new Date()
  }

  const handleOnline = () => refreshStatus()
  const handleOffline = () => refreshStatus()

  onMounted(() => {
    refreshStatus()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    status,
    lastChecked,
    isOnline,
    isOffline,
    refreshStatus,
  }
}
