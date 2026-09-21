import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'

export function CartPage() {
  const items = useCartStore((s) => s.items)
  return (
    <main className="container max-w-3xl mx-auto p-2">
      <h2 className="text-center font-bold mb-4 flex items-center justify-center gap-2">
        <ShoppingBag size={20} />
        حقيبة التسوق
      </h2>
      {items.length === 0 ? (
        <p
          className="text-center text-zinc-500 py-6 bg-white rounded-md"
          data-testid="empty-cart"
        >
          السلة فارغة حالياً
        </p>
      ) : (
        <div className="bg-white rounded-md shadow-sm p-4">
          {items.map((_, i) => (
            <CartItemRow key={i} index={i} />
          ))}
        </div>
      )}
      <CartSummary />
    </main>
  )
}