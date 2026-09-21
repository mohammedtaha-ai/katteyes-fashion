import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'

export function Header() {
  const navigate = useNavigate()
  const count = useCartStore((s) => s.totalItems())
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => !!s.token)

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white">
      {/* Top Promo Announcement Bar */}
      <div className="bg-brand text-brand-light text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide">
        ✨ مجموعة صيف 2026 الجديدة | توصيل سريع لجميع المحافظات 🚚
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-brand-surface/60">
        <button
          onClick={() => navigate('/')}
          className="font-black text-xl tracking-tight focus:outline-none flex items-center gap-1"
        >
          <span className="text-brand-accent">Katteyes</span>
          <span className="text-brand">Fashion</span>
        </button>

        <div className="flex gap-3 sm:gap-4 items-center">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin/products')}
              title="لوحة التحكم"
              aria-label="لوحة التحكم"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-brand hover:bg-brand-surface transition-colors"
            >
              <Settings size={20} />
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => navigate('/my-orders')}
              title="طلباتي"
              aria-label="طلباتي"
              className="text-sm font-medium text-zinc-700 hover:text-brand px-2 py-1 rounded-lg hover:bg-brand-surface transition-colors"
            >
              {user?.name}
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-zinc-700 hover:text-brand px-2 py-1 rounded-lg hover:bg-brand-surface transition-colors"
            >
              دخول
            </button>
          )}

          <button
            onClick={() => navigate('/cart')}
            className="relative p-1.5 rounded-lg text-zinc-700 hover:text-brand hover:bg-brand-surface transition-colors"
            title="السلة"
            aria-label="السلة"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 bg-brand-accent text-white text-xs font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full animate-pulse shadow-sm">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
