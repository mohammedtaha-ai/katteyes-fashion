import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/Button'
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation Bar with Back Button */}
      <div className="max-w-4xl w-full mx-auto mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 hover:text-brand-accent transition-colors bg-white hover:bg-zinc-100/80 px-4 py-2.5 rounded-xl shadow-xs border border-zinc-200"
          data-testid="back-to-home-btn"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمتجر</span>
        </Link>

        <Link to="/" className="text-xl font-black tracking-tight text-brand flex items-center gap-1.5">
          <span className="text-brand-accent">Katteyes</span> Fashion
        </Link>
      </div>

      {/* Main Luxury Auth Card */}
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Editorial Fashion Side (Visible on desktop) */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-brand text-white overflow-hidden min-h-[560px]">
          {/* Background Image with Dark Fashion Overlay */}
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
            alt="Katteyes Fashion Collection"
            className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-brand via-brand/70 to-transparent" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>عضوية Katteyes VIP الحصرية</span>
            </span>
          </div>

          {/* Middle Value Proposition */}
          <div className="relative z-10 my-auto py-6">
            <h2 className="text-3xl font-black leading-tight mb-3">
              انضمي إلى أرقى بيوت الأزياء الخليجية 👑
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              أنشئي حسابكِ الآن واستمتعي بتجربة تسوق راقية مع إمكانية حفظ مقاساتكِ ومتابعة أحدث التشكيلات أولاً بأول.
            </p>

            <ul className="space-y-3 text-xs text-zinc-200">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
                <span>كوبون ترحيبي خصم 10% فور إتمام التسجيل</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
                <span>خدمة استبدال وإرجاع مجانية وميسرة خلال 3 أيام</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
                <span>دعم مباشر واستشارات تنسيق أزياء عبر واتساب</span>
              </li>
            </ul>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-brand-accent" />
            <span>بياناتكِ محمية ومحفوظة بسرية تامة 100%</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-brand mb-1">حساب جديد</h1>
            <p className="text-zinc-500 text-xs sm:text-sm">
              أنشئي حسابكِ للتمتع بكافة مزايا التسوق الملكي
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              m.mutate()
            }}
            className="flex flex-col gap-3.5"
            data-testid="register-form"
          >
            {/* Name Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-700">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ريم الكبسي"
                  required
                  data-testid="input-name"
                  className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-xl text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-hidden transition-all text-zinc-800"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-700">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  required
                  data-testid="input-email"
                  className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-xl text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-hidden transition-all text-zinc-800"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-700">
                كلمة المرور (8 أحرف أو أكثر) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  data-testid="input-password"
                  className="w-full pr-10 pl-10 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-xl text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-hidden transition-all text-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-700">
                تأكيد كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  data-testid="input-confirm"
                  className="w-full pr-10 pl-4 py-2.5 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-xl text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-hidden transition-all text-zinc-800"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={m.isPending}
              data-testid="register-submit"
              className="w-full py-3.5 rounded-xl font-bold bg-linear-to-r from-brand-accent to-brand-accent-dark hover:brightness-105 shadow-md shadow-amber-500/20 text-white transition-all transform active:scale-[0.99] mt-2"
            >
              {m.isPending ? '...' : 'تسجيل'}
            </Button>

            {/* Error Message */}
            {m.isError && (
              <div
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2"
                data-testid="register-error"
              >
                <span>⚠️ {(m.error as any)?.response?.data?.message ?? 'خطأ أثناء إنشاء الحساب'}</span>
              </div>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-xs mt-6 text-zinc-500">
            لديكِ حساب بالفعل؟{' '}
            <Link to="/login" className="text-brand-accent font-bold hover:underline">
              سجلي دخولكِ هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
