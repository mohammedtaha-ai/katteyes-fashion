import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  productName?: string
  thumbnail?: string
  type?: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id =
      toast.id ||
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9))

    const newToast: Toast = {
      id,
      message: toast.message,
      productName: toast.productName,
      thumbnail: toast.thumbnail,
      type: toast.type || 'info',
    }

    set((s) => ({
      toasts: [...s.toasts, newToast].slice(-2),
    }))

    setTimeout(() => {
      get().removeToast(id)
    }, 4000)
  },
  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}))
