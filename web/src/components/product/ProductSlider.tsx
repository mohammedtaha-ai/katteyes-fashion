import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/api/types'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="#eee" width="400" height="400"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#999" text-anchor="middle" dominant-baseline="middle">لا توجد صورة</text></svg>',
  )

export function ProductSlider({ images }: { images: ProductImage[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  if (!images?.length) {
    return (
      <img
        src={PLACEHOLDER}
        alt=""
        data-testid="product-slider"
        className="w-full h-72 object-cover"
      />
    )
  }

  const go = (dir: -1 | 1) => {
    if (!ref.current) return
    const w = ref.current.clientWidth
    ref.current.scrollBy({ left: dir * w, behavior: 'smooth' })
    setI((x) => Math.max(0, Math.min(images.length - 1, x + dir)))
  }
  const jump = (n: number) => {
    if (!ref.current) return
    ref.current.scrollTo({
      left: n * ref.current.clientWidth,
      behavior: 'smooth',
    })
    setI(n)
  }
  return (
    <div
      className="relative w-full bg-black flex items-center justify-center overflow-hidden"
      data-testid="product-slider"
    >
      {images.length > 1 && (
        <>
          <button
            onClick={() => go(1)}
            aria-label="التالي"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-9 h-9 rounded-full flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => go(-1)}
            aria-label="السابق"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-9 h-9 rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, n) => (
              <button
                key={n}
                onClick={() => jump(n)}
                data-testid={`dot-${n}`}
                aria-label={`الصورة ${n + 1}`}
                className={`h-2 rounded-full transition-all ${
                  n === i ? 'bg-brand-accent w-5' : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
      <div
        ref={ref}
        className="flex overflow-x-auto snap-x snap-mandatory w-full h-72"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt=""
            className="snap-start shrink-0 w-full h-full object-cover"
          />
        ))}
      </div>
    </div>
  )
}
