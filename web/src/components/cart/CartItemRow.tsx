import { Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { QtyControl } from './QtyControl'

export function CartItemRow({ index }: { index: number }) {
  const item = useCartStore((s) => s.items[index])
  const remove = useCartStore((s) => s.removeItem)

  if (!item) return null
  const subtotal = item.price * item.quantity

  return (
    <div
      className="flex items-center justify-between py-3 border-b gap-2"
      data-testid={`cart-row-${item.productId}`}
    >
      <img
        src={item.img || undefined}
        className="w-12 h-12 object-cover rounded bg-zinc-100"
        alt={item.productName}
      />
      <div className="flex-1 text-right text-[11px]">
        <b>{item.productName}</b>
        <br />
        اللون: {item.color} | المقاس: {item.size}
        <br />
        <span data-testid="row-subtotal">
          {formatCurrency(item.price, item.currency)} × {item.quantity} ={' '}
          <b>{formatCurrency(subtotal, item.currency)}</b>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <QtyControl index={index} />
        <button
          onClick={() => remove(index)}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          data-testid="row-remove"
          aria-label="حذف"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}