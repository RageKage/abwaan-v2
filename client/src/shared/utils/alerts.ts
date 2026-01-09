import { toast } from 'vue-sonner'
import { useDialog } from './useDialog'

// Toast Notifications (Keep Vue Sonner, it's great)
export const toastSuccess = (title: string) => {
  toast.success(title, { duration: 3000 })
}

export const toastError = (title: string) => {
  toast.error(title, { duration: 4000 })
}

// Dialogs - Now using our custom "GlobalDialog" component
const dialog = useDialog()

export const confirmAction = async (title: string, text: string, confirmButtonText = 'CONFIRM'): Promise<boolean> => {
  // Triggers the global component to open
  return await dialog.open(title, text, {
    confirmText: confirmButtonText,
    cancelText: 'CANCEL',
    type: 'warning',
  })
}

export const showAlert = async (title: string, text: string) => {
  // Reusing the same structure but maybe with just one button if you extended the composable
  // For now, confirmAction works as a generic modal
  return await dialog.open(title, text, {
    confirmText: 'OKAY',
    cancelText: 'CLOSE',
    type: 'info',
  })
}
