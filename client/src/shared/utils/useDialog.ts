import { reactive, ref } from 'vue'

const state = reactive({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'CONFIRM',
  cancelText: 'CANCEL',
  type: 'warning' as 'warning' | 'info' | 'error' | 'success',
})

// We hold the 'resolve' function here so we can call it when buttons are clicked
const resolver = ref<((value: boolean) => void) | null>(null)

export function useDialog() {
  const open = (
    title: string,
    message: string,
    options: { confirmText?: string; cancelText?: string; type?: typeof state.type } = {},
  ) => {
    state.title = title
    state.message = message
    state.confirmText = options.confirmText || 'CONFIRM'
    state.cancelText = options.cancelText || 'CANCEL'
    state.type = options.type || 'warning'
    state.isOpen = true

    return new Promise<boolean>((resolve) => {
      resolver.value = resolve
    })
  }

  const confirm = () => {
    if (resolver.value) resolver.value(true)
    close()
  }

  const cancel = () => {
    if (resolver.value) resolver.value(false)
    close()
  }

  const close = () => {
    state.isOpen = false
    resolver.value = null
  }

  return {
    state,
    open,
    confirm,
    cancel,
  }
}
