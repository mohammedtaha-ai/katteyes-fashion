import { ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MobileStickyBuyBarProps {
  productName: string
  price: number
  currency: string
  thumbnail: string
  onAddToCart: () => void
}

export function MobileStickyBuyBar({
  productName,
  price,
  currency,
  thumbnail,
  onAddToCart,
}: MobileStickyBuyBarProps) {
  return (
    <div
      data-testid="mobile-sticky-buy-bar"
      className="md:hidden fixed bottom-0 start-0 end-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="w-11 h-11 rounded-lg object-cover border border-zinc-200 shrink-0"
          />
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-zinc-900 truncate">
            {productName}
          </span>
          <span className="text-sm font-black text-brand-accent">
            {formatCurrency(price, currency)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        data-testid="sticky-add-to-cart"
        className="shrink-0 px-5 py-2.5 bg-brand-accent text-slate-950 font-black text-xs rounded-xl shadow-md hover:bg-brand-accent-hover flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <ShoppingBag size={16} />
        <span>أضف للسلة</span>
      </button>
    </div>
  )
}
