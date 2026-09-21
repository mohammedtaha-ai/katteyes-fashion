import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const m = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (res) => {
      setAuth(res.data.data)
      navigate(
        res.data.data.user.role === 'admin' ? '/admin/products' : '/',
        { replace: true },
      )
    },
  })

  return (
    <main className="container max-w-sm mx-auto p-4">
      <div className="bg-white rounded-md shadow-sm p-6">
        <h1 className="text-xl font-black text-center mb-4">تسجيل الدخول</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            m.mutate()
          }}
          className="flex flex-col gap-3"
          data-testid="login-form"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="البريد"
            required
            data-testid="input-email"
            className="border rounded p-2 text-sm"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="كلمة المرور"
            required
            minLength={8}
            data-testid="input-password"
            className="border rounded p-2 text-sm"
          />
          <Button
            type="submit"
            disabled={m.isPending}
            data-testid="login-submit"
          >
            {m.isPending ? '...' : 'دخول'}
          </Button>
          {m.isError && (
            <p
              className="text-red-500 text-xs"
              data-testid="login-error"
            >
              {(m.error as any)?.response?.data?.message ?? 'خطأ'}
            </p>
          )}
        </form>
        <p className="text-center text-xs mt-4 text-zinc-500">
          ما عندك حساب؟{' '}
          <Link to="/register" className="text-brand-accent font-bold">
            سجل الآن
          </Link>
        </p>
      </div>
    </main>
  )
}
