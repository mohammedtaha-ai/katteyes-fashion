import { useState } from 'react'
import { Crown, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useToastStore } from '@/stores/toast-store'

export function NewsletterSignup() {
  const [input, setInput] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setSubscribed(true)

    // Trigger confetti if supported and not in test
    try {
      if (
        typeof window !== 'undefined' &&
        import.meta.env.MODE !== 'test' &&
        typeof document?.createElement === 'function'
      ) {
        const testCanvas = document.createElement('canvas')
        if (testCanvas.getContext && testCanvas.getContext('2d')) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#e5a83b', '#0f172a', '#f59e0b', '#ffffff'],
          })
        }
      }
    } catch {
      // Confetti fallback
    }

    addToast({
      message: 'مرحباً بكِ في نادي Katteyes VIP! كود الخصم: VIP10',
      type: 'success',
    })
  }

  return (
    <section
      data-testid="newsletter-section"
      className="max-w-7xl mx-auto px-4 py-10"
    >
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-amber-500/20">
        {/* Ambient background glows */}
        <div className="absolute top-0 start-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 end-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs sm:text-sm font-bold text-brand-accent">
            <Crown size={15} />
            <span>نادي Katteyes Fashion VIP</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center justify-center gap-2">
            <span>انضمي إلى عالم الأناقة والتميز</span>
            <Sparkles size={22} className="text-brand-accent" />
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
            كوني أول من يكتشف التشكيلات الحصرية وأحدث تصاميم السهرة والعبايات، واحصلي فوراً على كوبون خصم <span className="text-brand-accent font-bold">10%</span> على أول طلب.
          </p>

          {subscribed ? (
            <div
              data-testid="newsletter-success"
              className="mt-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-brand-accent flex items-center justify-center gap-3 animate-fade-in"
            >
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
              <div className="text-sm font-bold">
                تم انضمامكِ بنجاح! استخدمي كود الخصم: <span className="underline font-black text-white px-2 py-0.5 bg-black/40 rounded-md">VIP10</span> عند إتمام الطلب.
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto"
            >
              <input
                type="text"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="أدخلي رقم الواتساب أو بريدكِ الإلكتروني..."
                aria-label="البريد الإلكتروني أو رقم الهاتف"
                className="w-full sm:flex-1 h-12 px-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition shadow-inner"
              />
              <button
                type="submit"
                className="w-full sm:w-auto h-12 px-7 rounded-full bg-brand-accent hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <span>انضمام وتفعيل الخصم</span>
                <ArrowLeft size={16} />
              </button>
            </form>
          )}

          <p className="text-[11px] text-zinc-400">
            * لن نشارك بياناتكِ مع أي طرف ثالث. يمكنكِ إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </section>
  )
}
