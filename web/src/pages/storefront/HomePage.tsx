import { useEffect, useState } from 'react'
import { Search, ShoppingBag } from 'lucide-react'
import { useProducts } from '@/queries/use-products'
import { HeroPromoSlider } from '@/components/storefront/HeroPromoSlider'
import { CategoryStoryBar } from '@/components/storefront/CategoryStoryBar'
import { SmartProductCard } from '@/components/product/SmartProductCard'
import { ProductGridSkeleton } from '@/components/shared/ProductGridSkeleton'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function HomePage() {
  const [category, setCategory] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounced(searchInput, 300)

  const { data, isLoading } = useProducts({
    category: category || undefined,
    q: debouncedSearch || undefined,
  })

  const products = data?.data?.data ?? []

  return (
    <div className="min-h-screen bg-brand-light pb-16">
      {/* Hero Promo Slider */}
      <ErrorBoundary>
        <HeroPromoSlider />
      </ErrorBoundary>

      {/* Debounced Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-zinc-100 shadow-xs">
        <div className="max-w-2xl mx-auto relative">
          <Search
            size={18}
            className="absolute top-1/2 -translate-y-1/2 start-3.5 text-zinc-400 pointer-events-none"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحثي عن منتج..."
            data-testid="search-input"
            className="w-full h-11 ps-10 pe-4 rounded-full bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Instagram Story-styled Category Bar */}
      <ErrorBoundary>
        <CategoryStoryBar
          activeCategory={category}
          onSelectCategory={setCategory}
        />
      </ErrorBoundary>

      {/* Main Products Section */}
      <main className="max-w-7xl mx-auto px-4 py-6" id="products">
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div
            data-testid="empty-products"
            className="p-12 text-center text-zinc-500 bg-white rounded-2xl border border-zinc-100 shadow-xs max-w-md mx-auto my-8"
          >
            <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
            <h3 className="font-bold text-base text-zinc-800">لا توجد منتجات</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchInput
                ? `لم يتم العثور على أي نتائج مطابقة لـ "${searchInput}". جربي كلمات أخرى.`
                : 'لا توجد منتجات متوفرة في هذا القسم حالياً.'}
            </p>
          </div>
        ) : (
          <div
            data-testid="product-grid"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {products.map((p) => (
              <ErrorBoundary key={p.id}>
                <SmartProductCard product={p} />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
