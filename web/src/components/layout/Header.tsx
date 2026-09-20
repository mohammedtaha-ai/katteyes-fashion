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
    <header className="bg-white px-4 py-3 sticky top-0 z-50 flex justify-between items-center shadow-sm">
      <button
        onClick={() => navigate('/')}
        className="font-black text-brand-accent text-lg"
      >
        Katteyes <span className="text-black">Fashion</span>
      </button>
      <div className="flex gap-4 items-center">
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/products')}
            title="لوحة التحكم"
            aria-label="لوحة التحكم"
          >
            <Settings size={20} />
          </button>
        )}
        {isAuthenticated && (
          <button
            onClick={() => navigate('/my-orders')}
            title="طلباتي"
            aria-label="طلباتي"
            className="text-sm"
          >
            {user?.name}
          </button>
        )}
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            className="text-sm"
          >
            دخول
          </button>
        )}
        <button
          onClick={() => navigate('/cart')}
          className="relative"
          title="السلة"
          aria-label="السلة"
        >
          <ShoppingBag size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -end-1 bg-brand-accent text-white text-xs px-1 rounded-full">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
