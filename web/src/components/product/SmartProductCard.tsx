import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/api/types'
import { formatCurrency, cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'

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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533"><rect fill="#f1f5f9" width="400" height="533"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">لا توجد صورة</text></svg>',
  )

export function SmartProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)

  const primaryImg = product.images?.[0]?.url ?? PLACEHOLDER
  const secondaryImg = product.images?.[1]?.url

  const isNew = (() => {
    if (!product.created_at) return false
    const time = new Date(product.created_at).getTime()
    if (isNaN(time)) return false
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    return Date.now() - time <= sevenDaysMs
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

    addToast({
      message: 'تمت الإضافة إلى السلة بنجاح',
      productName: product.name,
      thumbnail: img,
      type: 'success',
    })
  }

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`)
  }

  return (
    <div
      onClick={handleCardClick}
      data-testid="product-card"
      className="group bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-zinc-100 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* 3:4 Aspect Ratio Image Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
        {/* Primary Image */}
        <img
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-all duration-500 ease-out',
            secondaryImg ? 'group-hover:opacity-0' : 'group-hover:scale-105',
          )}
        />

        {/* Secondary Image for Hover Flip */}
        {secondaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.name} - صورة 2`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        {/* "جديد ✨" Badge */}
        {isNew && (
          <span
            data-testid="badge-new"
            className="absolute top-2.5 start-2.5 z-10 inline-flex items-center px-2 py-0.5 text-[11px] font-bold bg-brand-accent text-slate-950 rounded-full shadow-sm"
          >
            جديد ✨
          </span>
        )}

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          data-testid="quick-add-btn"
          aria-label="إضافة سريعة إلى السلة"
          title="إضافة سريعة للسلة"
          className="absolute bottom-2.5 end-2.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-xs text-zinc-800 shadow-md hover:bg-brand-accent hover:text-slate-950 flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {product.category?.name && (
            <div className="text-[11px] font-semibold text-brand-accent truncate mb-0.5">
              {product.category.name}
            </div>
          )}
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div
            className="flex items-center gap-1.5 py-1"
            data-testid="color-swatches"
          >
            {product.colors.slice(0, 4).map((c, idx) => {
              const hex = colorToHex[c.trim().toLowerCase()] || '#cbd5e1'
              return (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-xs inline-block"
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

        {/* Price */}
        <div className="text-sm sm:text-base font-black text-zinc-900 pt-1">
          {formatCurrency(product.price, product.currency)}
        </div>
      </div>
    </div>
  )
}
