import { apiClient } from './client'
import type { User } from './types'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<{ data: { token: string; user: User } }>('/auth/login', data),
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    apiClient.post<{ data: { token: string; user: User } }>('/auth/register', data),
  me: () => apiClient.get<{ data: { user: User } }>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout'),
}
