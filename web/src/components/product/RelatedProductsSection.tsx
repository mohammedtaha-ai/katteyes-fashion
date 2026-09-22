import { useProducts } from '@/queries/use-products'
import { SmartProductCard } from '@/components/product/SmartProductCard'

interface RelatedProductsSectionProps {
  currentProductId: number
  categorySlug?: string
}

export function RelatedProductsSection({
  currentProductId,
  categorySlug,
}: RelatedProductsSectionProps) {
  const { data, isLoading } = useProducts(categorySlug ? { category: categorySlug } : {})

  const products = (data?.data?.data ?? [])
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4)

  if (isLoading || products.length === 0) {
    return null
  }

  return (
    <section className="border-t border-zinc-200 pt-10 mt-10" data-testid="related-products-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
            تشكيلة مختارة
          </span>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 mt-0.5">
            إطلالات مشابهة قد تعجبك ✨
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {products.map((prod) => (
          <SmartProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  )
}
