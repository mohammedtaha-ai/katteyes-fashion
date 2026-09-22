import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react'

export interface PromoSlide {
  id: number
  badge: string
  title: string
  subtitle: string
  ctaText: string
  ctaHref?: string
  gradient: string
  accentColor: string
  imageUrl?: string
}

const defaultSlides: PromoSlide[] = [
  {
    id: 1,
    badge: 'تشكيلة الموسم الحصرية ✨',
    title: 'أزياء عصرية بأناقة لا تُضاهى',
    subtitle: 'اكتشفي أرقى فساتين السهرة والعبايات الملكية المصممة بعناية فائقة لتتألقي في كل مناسبة.',
    ctaText: 'تسوقي التشكيلة الآن',
    ctaHref: '#products',
    gradient: 'from-slate-950 via-slate-900 to-black',
    accentColor: 'text-brand-accent',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 2,
    badge: 'تخفيضات استثنائية 🏷️',
    title: 'تألقي بخصومات صيف 2026',
    subtitle: 'خصومات مميزة على تشكيلة مختارة من العبايات والجلابيات الشرقية الفاخرة لفترة محدودة.',
    ctaText: 'استكشفي العروض',
    ctaHref: '#products',
    gradient: 'from-slate-950 via-amber-950 to-slate-900',
    accentColor: 'text-amber-400',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 3,
    badge: 'إطلالات ملكية 👑',
    title: 'تصاميم ملكية لكل مناسبة',
    subtitle: 'أقمشة كريب وتفته ومخمل مع تطريز يدوي فاخر لتعكس فخامة حضورك وتميز ذوقك.',
    ctaText: 'اكتشفي الجديد',
    ctaHref: '#products',
    gradient: 'from-black via-slate-900 to-purple-950',
    accentColor: 'text-purple-300',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=85',
  },
]

export interface HeroPromoSliderProps {
  slides?: PromoSlide[]
  intervalMs?: number
}

export function HeroPromoSlider({
  slides = defaultSlides,
  intervalMs = 5000,
}: HeroPromoSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const count = slides.length

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count)
  }, [count])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + count) % count)
  }, [count])

  useEffect(() => {
    if (isPaused || count <= 1) return

    const timer = setInterval(() => {
      nextSlide()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPaused, intervalMs, count, nextSlide])

  if (count === 0) return null

  const activeSlide = slides[current]

  const handleCtaClick = () => {
    if (activeSlide.ctaHref?.startsWith('#')) {
      const el = document.querySelector(activeSlide.ctaHref)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div
      data-testid="hero-promo-slider"
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div
        className={`relative w-full bg-gradient-to-r ${activeSlide.gradient} text-white min-h-[320px] sm:min-h-[380px] md:min-h-[440px] flex items-center justify-center transition-colors duration-700 ease-in-out px-6 py-12 md:py-16 overflow-hidden`}
      >
        {/* High-Resolution Fashion Background Image with Subtle Parallax/Zoom */}
        {activeSlide.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-all duration-1000 ease-out"
            style={{ backgroundImage: `url(${activeSlide.imageUrl})` }}
          />
        )}

        {/* Subtle decorative glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

        {/* Slide Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-3.5 md:gap-5 transition-all duration-500">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-brand-accent shadow-sm">
            <Sparkles size={14} />
            <span>{activeSlide.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight md:leading-tight drop-shadow-md">
            {activeSlide.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-200 max-w-xl font-normal leading-relaxed drop-shadow-xs">
            {activeSlide.subtitle}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleCtaClick}
              data-testid="hero-cta-btn"
              className="inline-flex items-center gap-2 px-7 py-3 sm:px-9 sm:py-3.5 rounded-full bg-brand-accent text-slate-950 font-black text-xs sm:text-sm hover:bg-amber-400 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="الشريحة السابقة"
              data-testid="hero-prev-btn"
              className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10 shadow-md cursor-pointer active:scale-90"
            >
              <ChevronRight size={22} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="الشريحة التالية"
              data-testid="hero-next-btn"
              className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/10 shadow-md cursor-pointer active:scale-90"
            >
              <ChevronLeft size={22} />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {count > 1 && (
          <div
            data-testid="hero-dots"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
          >
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
                data-testid={`hero-dot-${idx}`}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  current === idx
                    ? 'w-8 bg-brand-accent shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
