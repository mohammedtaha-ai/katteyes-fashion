import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartSummary() {
  const navigate = useNavigate()
  const total = useCartStore((s) => s.totalPrice())
  const count = useCartStore((s) => s.totalItems())
  return (
    <div className="mt-3 bg-white rounded-md shadow-sm p-4">
      <div
        className="flex justify-between text-sm font-bold mb-3"
        data-testid="cart-total"
      >
        <span>المجموع ({count} قطع):</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button
        onClick={() => navigate('/checkout')}
        className="w-full"
        data-testid="goto-checkout"
        disabled={count === 0}
      >
        الذهاب للدفع
      </Button>
    </div>
  )
}