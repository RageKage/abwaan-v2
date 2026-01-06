import Swal from 'sweetalert2'
import { toast } from 'vue-sonner'

// Base configuration to match the site's theme (for Modals/Dialogs)
const baseConfig = Swal.mixin({
  customClass: {
    popup: 'rounded-[2rem] border border-gray-100 shadow-xl font-sans',
    title: 'text-2xl font-bold text-gray-900 font-Kalam',
    htmlContainer: 'text-gray-600',
    confirmButton: 'rounded-full px-6 py-2.5 text-sm font-bold shadow-md transition-all',
    cancelButton: 'rounded-full px-6 py-2.5 text-sm font-bold shadow-md transition-all',
  },
  buttonsStyling: false,
})

// Toast Notifications using Vue Sonner
export const toastSuccess = (title: string) => {
  toast.success(title, {
    duration: 3000,
  })
}

export const toastError = (title: string) => {
  toast.error(title, {
    duration: 4000,
  })
}

// Dialogs (Confirmations/Alerts) using SweetAlert2
export const confirmAction = async (
  title: string,
  text: string,
  confirmButtonText = 'Yes, do it',
): Promise<boolean> => {
  const result = await baseConfig.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#eb932e', // carrotOrange-500
    cancelButtonColor: '#d84c1e', // redDamask-600
    customClass: {
      popup: 'rounded-[2rem] border border-gray-100 shadow-xl font-sans',
      title: 'text-2xl font-bold text-gray-900 font-Kalam',
      htmlContainer: 'text-gray-600',
      confirmButton: 'bg-carrotOrange-500 text-white hover:bg-carrotOrange-600 rounded-full px-6 py-3 mx-2',
      cancelButton: 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full px-6 py-3 mx-2',
    },
  })
  return result.isConfirmed
}

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  return baseConfig.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Okay',
    customClass: {
      popup: 'rounded-[2rem] border border-gray-100 shadow-xl font-sans',
      title: 'text-2xl font-bold text-gray-900 font-Kalam',
      htmlContainer: 'text-gray-600',
      confirmButton: 'bg-carrotOrange-500 text-white hover:bg-carrotOrange-600 rounded-full px-6 py-3 mx-2',
    },
  })
}
