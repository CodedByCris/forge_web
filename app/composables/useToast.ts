interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

// Module-level singleton — safe for client-only (ssr:false) train pages
const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(
    message: string,
    type: Toast['type'] = 'info',
    duration = 3500,
  ): void {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      const idx = toasts.value.findIndex((t) => t.id === id)
      if (idx !== -1) toasts.value.splice(idx, 1)
    }, duration)
  }

  return { toasts: readonly(toasts), show }
}
