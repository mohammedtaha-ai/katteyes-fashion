import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Laravel parses multipart/form-data from POST reliably but not from PUT/PATCH.
  // Rewrite FormData PUT/PATCH into POST with _method=PUT (or PATCH) appended
  // so the server still sees the original intent. POST and DELETE pass through
  // unchanged.
  if (config.data instanceof FormData) {
    const lower = (config.method ?? '').toLowerCase()
    if (lower === 'put' || lower === 'patch') {
      config.data.append('_method', config.method!.toUpperCase())
      config.method = 'post'
      // After method change, axios will not re-derive Content-Type from data.
      // Drop the header so axios sets multipart/form-data with the correct boundary.
      if (config.headers) {
        delete (config.headers as Record<string, unknown>)['Content-Type']
        delete (config.headers as Record<string, unknown>)['content-type']
      }
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clear()
      const url = err.config?.url ?? ''
      if (!url.includes('/auth/login')) window.location.assign('/login')
    }
    return Promise.reject(err)
  },
)
