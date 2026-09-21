import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/Button'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const m = useMutation({
    mutationFn: () =>
      authApi.register({
        name,
        email,
        password,
        password_confirmation: confirm,
      }),
    onSuccess: (res) => {
      setAuth(res.data.data)
      navigate('/', { replace: true })
    },
  })

  return (
    <main className="container max-w-sm mx-auto p-4">
      <div className="bg-white rounded-md shadow-sm p-6">
        <h1 className="text-xl font-black text-center mb-4">حساب جديد</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            m.mutate()
          }}
          className="flex flex-col gap-3"
          data-testid="register-form"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم الكامل"
            required
            data-testid="input-name"
            className="border rounded p-2 text-sm"
          />
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
            placeholder="كلمة المرور (8+)"
            required
            minLength={8}
            data-testid="input-password"
            className="border rounded p-2 text-sm"
          />
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            placeholder="تأكيد كلمة المرور"
            required
            minLength={8}
            data-testid="input-confirm"
            className="border rounded p-2 text-sm"
          />
          <Button
            type="submit"
            disabled={m.isPending}
            data-testid="register-submit"
          >
            {m.isPending ? '...' : 'تسجيل'}
          </Button>
          {m.isError && (
            <p
              className="text-red-500 text-xs"
              data-testid="register-error"
            >
              {(m.error as any)?.response?.data?.message ?? 'خطأ'}
            </p>
          )}
        </form>
        <p className="text-center text-xs mt-4 text-zinc-500">
          عندك حساب؟{' '}
          <Link to="/login" className="text-brand-accent font-bold">
            سجل دخول
          </Link>
        </p>
      </div>
    </main>
  )
}
