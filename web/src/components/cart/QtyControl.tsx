import { useCartStore } from '@/stores/cart-store'

export function QtyControl({ index }: { index: number }) {
  const updateQty = useCartStore((s) => s.updateQty)
  const qty = useCartStore((s) => s.items[index]?.quantity ?? 0)
  return (
    <div className="flex items-center border rounded overflow-hidden bg-white">
      <button
        onClick={() => updateQty(index, -1)}
        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200"
        data-testid="qty-minus"
        aria-label="إنقاص الكمية"
      >
        −
      </button>
      <span
        className="px-2 text-xs font-bold min-w-[1.5rem] text-center"
        data-testid="qty-value"
      >
        {qty}
      </span>
      <button
        onClick={() => updateQty(index, 1)}
        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200"
        data-testid="qty-plus"
        aria-label="زيادة الكمية"
      >
        +
      </button>
    </div>
  )
}