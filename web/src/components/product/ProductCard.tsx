import { useNavigate } from 'react-router-dom'
import type { Product } from '@/api/types'
import { formatCurrency } from '@/lib/utils'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="#eee" width="400" height="400"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#999" text-anchor="middle" dominant-baseline="middle">لا توجد صورة</text></svg>',
  )

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const img = product.images?.[0]?.url ?? PLACEHOLDER
  return (
    <div
      onClick={() => navigate(`/products/${product.slug}`)}
      data-testid="product-card"
      className="bg-white rounded-md overflow-hidden shadow-sm cursor-pointer hover:-translate-y-1 transition"
    >
      <img
        src={img}
        alt={product.name}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      <div className="p-2">
        {product.category?.name && (
          <div className="text-[10px] text-brand-accent font-bold mb-0.5">
            {product.category.name}
          </div>
        )}
        <div className="text-xs font-semibold mb-1 truncate">{product.name}</div>
        <div className="text-sm font-bold">
          {formatCurrency(product.price, product.currency)}
        </div>
      </div>
    </div>
  )
}
