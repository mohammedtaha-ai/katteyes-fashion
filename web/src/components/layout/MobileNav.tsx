import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Sparkles, Heart, ShoppingBag, Package } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'

export function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useCartStore((s) => s.totalItems())
  const wishlistCount = useWishlistStore((s) => s.count())

  const isHome = location.pathname === '/' && !location.search.includes('wishlist')
  const isWishlist = location.search.includes('wishlist=1')
  const isCart = location.pathname === '/cart'
  const isOrders = location.pathname === '/my-orders'

  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 start-0 end-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 py-1.5 px-3 flex justify-around items-center shadow-lg"
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          isHome ? 'text-brand-accent font-bold' : 'text-zinc-500 hover:text-zinc-900'
        }`}
      >
        <Home size={20} />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      {/* Categories / Discover */}
      <button
        type="button"
        onClick={() => {
          navigate('/')
          const el = document.querySelector('#categories-bar')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
        className="flex flex-col items-center gap-1 p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <Sparkles size={20} />
        <span className="text-[10px]">الأقسام</span>
      </button>

      {/* Wishlist */}
      <button
        type="button"
        onClick={() => navigate('/?wishlist=1')}
        className={`relative flex flex-col items-center gap-1 p-1 transition-colors ${
          isWishlist ? 'text-rose-500 font-bold' : 'text-zinc-500 hover:text-zinc-900'
        }`}
      >
        <Heart size={20} className={wishlistCount > 0 ? "text-rose-500 fill-rose-500" : ""} />
        <span className="text-[10px]">المفضلة</span>
        {wishlistCount > 0 && (
          <span className="absolute top-0 end-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </button>

      {/* Cart */}
      <button
        type="button"
        onClick={() => navigate('/cart')}
        className={`relative flex flex-col items-center gap-1 p-1 transition-colors ${
          isCart ? 'text-brand-accent font-bold' : 'text-zinc-500 hover:text-zinc-900'
        }`}
      >
        <ShoppingBag size={20} />
        <span className="text-[10px]">السلة</span>
        {cartCount > 0 && (
          <span className="absolute top-0 end-1 w-4 h-4 rounded-full bg-brand-accent text-slate-950 text-[9px] font-black flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* Orders */}
      <button
        type="button"
        onClick={() => navigate('/my-orders')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          isOrders ? 'text-brand-accent font-bold' : 'text-zinc-500 hover:text-zinc-900'
        }`}
      >
        <Package size={20} />
        <span className="text-[10px]">طلباتي</span>
      </button>
    </nav>
  )
}
