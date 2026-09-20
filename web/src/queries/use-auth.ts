import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth-store'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (res) => {
      const { token, user } = res.data.data
      setAuth({ token, user })
    },
  })
}

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (res) => {
      const { token, user } = res.data.data
      setAuth({ token, user })
    },
  })
}

export const useMe = (enabled = true) => {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: () => authApi.me(),
    enabled: enabled && !!token,
    staleTime: 60_000,
  })
}

export const useLogout = () => {
  const clear = useAuthStore((s) => s.clear)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clear()
      qc.clear()
    },
  })
}
