import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (type: ToastType, message: string) => void
  dismiss: (id: number) => void
}

/** Duración en pantalla: los errores se quedan un poco más para poder leerlos */
const DURATION: Record<ToastType, number> = { success: 3500, info: 4000, error: 6000 }
const MAX_VISIBLE = 4

let nextId = 1

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (type, message) => {
    // Evita apilar el mismo mensaje si el usuario repite la acción
    const existing = get().toasts.find((t) => t.type === type && t.message === message)
    if (existing) get().dismiss(existing.id)

    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, type, message }].slice(-MAX_VISIBLE) }))
    setTimeout(() => get().dismiss(id), DURATION[type])
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Atajo para usar fuera de componentes: `toast.error('…')` */
export const toast = {
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
  info: (message: string) => useToastStore.getState().push('info', message),
}
