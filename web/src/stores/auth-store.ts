import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/api/types'

interface AuthState {
  user: User | null
  token: string | null
  isAdmin: () => boolean
  isAuthenticated: () => boolean
  setAuth: (a: { token: string; user: User }) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: null,
  token: null,
  isAdmin: () => get().user?.role === 'admin',
  isAuthenticated: () => !!get().token,
  setAuth: ({ token, user }) => set({ token, user }),
  clear: () => set({ token: null, user: null }),
}), { name: 'katteyes_auth' }))
