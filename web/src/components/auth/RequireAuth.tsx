import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

export function RequireAuth({
  roles,
  children,
}: {
  roles?: ('admin' | 'customer')[]
  children: React.ReactNode
}) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const loc = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />
  if (roles && (!user || !roles.includes(user.role)))
    return <Navigate to="/" replace />
  return <>{children}</>
}