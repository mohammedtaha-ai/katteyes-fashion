import { useState, useEffect } from 'react'
import { Flame, Clock, Sparkles } from 'lucide-react'
import type { Product } from '@/api/types'
import { SmartProductCard } from '@/components/product/SmartProductCard'

interface FlashDealsSectionProps {
  products: Product[]
}

export function FlashDealsSection({ products }: FlashDealsSectionProps) {
  // 12-hour countdown timer that persists nicely
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 19,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 }
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Take first 4 items for flash sale
  const flashProducts = products.slice(0, 4)

  if (flashProducts.length === 0) return null

  const format2 = (n: number) => n.toString().padStart(2, '0')

  return (
    <section
      data-testid="flash-deals-section"
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl overflow-hidden relative">
        {/* Background decorative ambient glow */}
        <div className="absolute top-0 end-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-brand-accent text-xs font-bold mb-2">
              <Flame size={14} className="animate-pulse text-amber-400" />
              <span>عروض حصرية لفترة محدودة</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <span>تخفيضات اليوم الخاطفة</span>
              <Sparkles size={20} className="text-brand-accent" />
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              خصومات مميزة تصل حتى 35% على قطع مختارة من أحدث تشكيلات الموسم.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-inner">
            <Clock size={18} className="text-amber-400 shrink-0" />
            <span className="text-xs text-zinc-300 font-medium ms-1">ينتهي خلال:</span>
            <div className="flex items-center gap-1.5 text-center" dir="ltr">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <span className="w-9 h-9 rounded-lg bg-amber-500/20 text-brand-accent font-black text-base flex items-center justify-center border border-amber-500/30">
                  {format2(timeLeft.hours)}
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">ساعة</span>
              </div>
              <span className="font-bold text-amber-400 text-lg pb-3">:</span>
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <span className="w-9 h-9 rounded-lg bg-amber-500/20 text-brand-accent font-black text-base flex items-center justify-center border border-amber-500/30">
                  {format2(timeLeft.minutes)}
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">دقيقة</span>
              </div>
              <span className="font-bold text-amber-400 text-lg pb-3">:</span>
              {/* Seconds */}
              <div className="flex flex-col items-center">
                <span className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-300 font-black text-base flex items-center justify-center border border-rose-500/30">
                  {format2(timeLeft.seconds)}
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">ثانية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="relative z-10 pt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashProducts.map((product) => (
            <div key={product.id} className="relative group">
              <div className="absolute top-2 start-2 z-20 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Flame size={12} />
                <span>خصم 30%</span>
              </div>
              <SmartProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
