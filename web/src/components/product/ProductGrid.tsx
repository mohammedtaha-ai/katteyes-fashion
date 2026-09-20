import type { Product } from '@/api/types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">لا توجد منتجات</div>
    )
  }
  return (
    <div
      data-testid="product-grid"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4"
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
