import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { Product } from '@/api/types'
import { formatCurrency, cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'
import { useWishlistStore } from '@/stores/wishlist-store'

export const colorToHex: Record<string, string> = {
  'أحمر': '#ef4444',
  red: '#ef4444',
  'أزرق': '#3b82f6',
  blue: '#3b82f6',
  'أخضر': '#10b981',
  green: '#10b981',
  'أسود': '#18181b',
  black: '#18181b',
  'أبيض': '#ffffff',
  white: '#ffffff',
  'وردي': '#ec4899',
  pink: '#ec4899',
  'ذهبي': '#e5a83b',
  gold: '#e5a83b',
  'فضي': '#94a3b8',
  silver: '#94a3b8',
  'بيج': '#f5f5dc',
  beige: '#f5f5dc',
  'بني': '#78350f',
  brown: '#78350f',
  'بنفسجي': '#8b5cf6',
  purple: '#8b5cf6',
  'كحلي': '#1e3a8a',
  navy: '#1e3a8a',
  'رمادي': '#64748b',
  gray: '#64748b',
  grey: '#64748b',
  'زيتي': '#556b2f',
  olive: '#556b2f',
  'برتقالي': '#f97316',
  orange: '#f97316',
  'عنابي': '#800020',
  maroon: '#800020',
  'عسلي': '#d97706',
  'كريمي': '#fffdd0',
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533"><rect fill="#f8fafc" width="400" height="533"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">Katteyes Fashion</text></svg>',
  )

export function SmartProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id))
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)

  const primaryImg = product.images?.[0]?.url ?? PLACEHOLDER
  const secondaryImg = product.images?.[1]?.url

  const originalPrice = product.price * 1.25

  const isNew = (() => {
    if (!product.created_at) return false
    const time = new Date(product.created_at).getTime()
    if (isNaN(time)) return false
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const diff = Date.now() - time
    return diff >= 0 && diff <= sevenDaysMs
  })()

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    const color = product.colors?.[0] || 'الافتراضي'
    const size = product.sizes?.[0] || 'مقاس واحد'
    const img = product.images?.[0]?.url || ''

    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      currency: product.currency,
      img,
      color,
      size,
    })

    try {
      if (
        typeof window !== 'undefined' &&
        import.meta.env.MODE !== 'test' &&
        typeof document?.createElement === 'function'
      ) {
        const testCanvas = document.createElement('canvas')
        if (testCanvas.getContext && testCanvas.getContext('2d')) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.85 },
            colors: ['#e5a83b', '#0f172a', '#f59e0b'],
          })
        }
      }
    } catch {
      // Confetti fallback
    }

    addToast({
      message: 'تمت الإضافة إلى السلة بنجاح',
      productName: product.name,
      thumbnail: img,
      type: 'success',
    })
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const added = toggleWishlist(product.id)
    addToast({
      message: added ? 'تمت إضافة المنتج إلى المفضلة ❤️' : 'تمت إزالة المنتج من المفضلة',
      productName: product.name,
      thumbnail: primaryImg,
      type: added ? 'success' : 'info',
    })
  }

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`)
  }

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`عرض تفاصيل ${product.name}`}
      data-testid="product-card"
      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-zinc-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-brand-accent"
    >
      {/* 3:4 Aspect Ratio Image Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-50">
        {/* Primary Image */}
        <img
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-all duration-500 ease-out',
            secondaryImg ? 'group-hover:opacity-0' : 'group-hover:scale-108',
          )}
        />

        {/* Secondary Image for Hover Flip */}
        {secondaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.name} - صورة 2`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-105"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 start-2.5 z-10 flex flex-col gap-1">
          {isNew && (
            <span
              data-testid="badge-new"
              className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-black bg-brand-accent text-slate-950 rounded-full shadow-sm"
            >
              جديد ✨
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-full shadow-sm">
            وفر 20% 🔥
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          data-testid="card-wishlist-btn"
          className="absolute top-2.5 end-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs text-zinc-700 shadow-sm hover:text-rose-500 hover:scale-110 active:scale-90 flex items-center justify-center transition-all duration-200"
        >
          <Heart
            size={16}
            className={isWishlisted ? 'text-rose-500 fill-rose-500' : ''}
          />
        </button>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          data-testid="quick-add-btn"
          aria-label="إضافة سريعة إلى السلة"
          title="إضافة سريعة للسلة"
          className="absolute bottom-2.5 end-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs text-zinc-800 shadow-md hover:bg-brand-accent hover:text-slate-950 flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            {product.category?.name && (
              <span className="text-[11px] font-bold text-brand-accent truncate">
                {product.category.name}
              </span>
            )}
            <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-bold ms-auto">
              <Star size={12} className="fill-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div
            className="flex items-center gap-1.5 py-0.5"
            data-testid="color-swatches"
          >
            {product.colors.slice(0, 4).map((c, idx) => {
              const hex = colorToHex[c.trim().toLowerCase()] || '#cbd5e1'
              return (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs inline-block"
                  style={{ backgroundColor: hex }}
                  title={c}
                  aria-label={c}
                />
              )
            })}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-zinc-400 font-medium">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Dual Price Display */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm sm:text-base font-black text-zinc-900">
            {formatCurrency(product.price, product.currency)}
          </span>
          <span className="text-xs text-zinc-400 line-through font-semibold">
            {formatCurrency(originalPrice, product.currency)}
          </span>
        </div>
      </div>
    </div>
  )
}
