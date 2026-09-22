import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingBag, Settings, Heart, Search, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'

export function Header() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const count = useCartStore((s) => s.totalItems())
  const wishlistCount = useWishlistStore((s) => s.count())
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => !!s.token)

  // Keep search input in sync if URL query parameter changes
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setQuery(value)
    const next = new URLSearchParams(searchParams)
    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // If not on homepage, navigate to homepage with search query
    if (window.location.pathname !== '/') {
      navigate(`/?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 shadow-xs bg-white">
      {/* Top Promo Announcement Bar */}
      <div className="bg-brand text-brand-light text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide">
        ✨ مجموعة صيف 2026 الجديدة | توصيل سريع لجميع المحافظات 🚚
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-2.5 sm:py-3 flex justify-between items-center gap-3 sm:gap-6 border-b border-zinc-100">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/')}
          className="font-black text-xl sm:text-2xl tracking-tight focus:outline-none flex items-center gap-1 shrink-0"
        >
          <span className="text-brand-accent">Katteyes</span>
          <span className="text-brand">Fashion</span>
        </button>

        {/* Global Integrated Search Bar (Desktop & Tablet) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex flex-1 max-w-xl mx-2 relative items-center"
        >
          <Search
            size={18}
            className="absolute top-1/2 -translate-y-1/2 start-3.5 text-zinc-400 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحثي عن فستان سهرة، عباية، حذاء، حقيبة..."
            data-testid="search-input"
            className="w-full h-11 ps-10 pe-10 rounded-full bg-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition text-zinc-900 placeholder:text-zinc-400 border border-transparent focus:border-brand-accent focus:bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 -translate-y-1/2 end-3.5 text-zinc-400 hover:text-zinc-700"
              aria-label="مسح البحث"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Action Controls: Admin, Auth, Wishlist, Cart */}
        <div className="flex gap-2 sm:gap-4 items-center shrink-0">
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
              className="text-xs sm:text-sm font-medium text-zinc-700 hover:text-brand px-2 py-1 rounded-lg hover:bg-brand-surface transition-colors"
            >
              {user?.name}
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm font-bold text-zinc-700 hover:text-brand-accent px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              دخول
            </button>
          )}

          <button
            onClick={() => navigate('/?wishlist=1')}
            className="relative p-1.5 sm:p-2 rounded-xl text-zinc-700 hover:text-brand hover:bg-zinc-100 transition-colors"
            title="المفضلة"
            aria-label="المفضلة"
            data-testid="wishlist-header-btn"
          >
            <Heart size={20} className={wishlistCount > 0 ? "text-rose-500 fill-rose-500" : ""} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -end-1 bg-rose-500 text-white text-[10px] font-bold min-w-4 h-4 sm:min-w-5 sm:h-5 px-1 flex items-center justify-center rounded-full shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="relative p-1.5 sm:p-2 rounded-xl text-zinc-700 hover:text-brand hover:bg-zinc-100 transition-colors"
            title="السلة"
            aria-label="السلة"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 bg-brand-accent text-white text-[10px] font-bold min-w-4 h-4 sm:min-w-5 sm:h-5 px-1 flex items-center justify-center rounded-full animate-pulse shadow-sm">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input Row (visible on small mobile screens) */}
      <div className="sm:hidden px-4 py-2 bg-white border-b border-zinc-100">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3 text-zinc-400 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحثي عن فستان، عباية، حقيبة..."
            className="w-full h-9 ps-9 pe-8 rounded-full bg-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-zinc-900 placeholder:text-zinc-400 border border-transparent focus:border-brand-accent focus:bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-zinc-400 hover:text-zinc-700"
              aria-label="مسح البحث"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>
    </header>
  )
}
