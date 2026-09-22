import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Heart,
  ArrowUpDown,
  Sparkles,
  X,
} from 'lucide-react'
import { useProducts } from '@/queries/use-products'
import { useWishlistStore } from '@/stores/wishlist-store'
import { HeroPromoSlider } from '@/components/storefront/HeroPromoSlider'
import { CategoryStoryBar } from '@/components/storefront/CategoryStoryBar'
import { FlashDealsSection } from '@/components/storefront/FlashDealsSection'
import { BrandTrustFeatures } from '@/components/storefront/BrandTrustFeatures'
import { NewsletterSignup } from '@/components/storefront/NewsletterSignup'
import { SmartProductCard } from '@/components/product/SmartProductCard'
import { ProductGridSkeleton } from '@/components/shared/ProductGridSkeleton'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

type SortOption = 'newest' | 'price_asc' | 'price_desc'

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const searchInput = searchParams.get('q') || ''
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const isWishlistOnly = searchParams.get('wishlist') === '1'
  const wishlistItems = useWishlistStore((s) => s.items)
  const wishlistCount = useWishlistStore((s) => s.count())

  const debouncedSearch = useDebounced(searchInput, 300)

  const { data, isLoading } = useProducts({
    category: category || undefined,
    q: debouncedSearch || undefined,
  })

  const rawProducts = data?.data?.data ?? []

  const handleCategorySelect = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (slug) {
      nextParams.set('category', slug)
    } else {
      nextParams.delete('category')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const toggleWishlistFilter = () => {
    const nextParams = new URLSearchParams(searchParams)
    if (isWishlistOnly) {
      nextParams.delete('wishlist')
    } else {
      nextParams.set('wishlist', '1')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    setSearchParams(nextParams, { replace: true })
  }

  // Filter and sort products
  const displayProducts = useMemo(() => {
    let result = [...rawProducts]

    // Wishlist filter
    if (isWishlistOnly) {
      result = result.filter((p) => wishlistItems.includes(p.id))
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else {
      // Default: newest by id descending
      result.sort((a, b) => b.id - a.id)
    }

    return result
  }, [rawProducts, isWishlistOnly, wishlistItems, sortBy])

  return (
    <div className="min-h-screen bg-brand-light pb-16">
      {/* 1. Category Stories Bar (Positioned directly under Header as Sub-header) */}
      <ErrorBoundary>
        <CategoryStoryBar
          activeCategory={category}
          onSelectCategory={handleCategorySelect}
        />
      </ErrorBoundary>

      {/* 2. Luxury Hero Promo Slider */}
      <ErrorBoundary>
        <HeroPromoSlider />
      </ErrorBoundary>

      {/* 3. Limited Time Flash Deals Section (Shown when browsing all products without active filters) */}
      {!isWishlistOnly && !searchInput && !category && rawProducts.length >= 3 && (
        <ErrorBoundary>
          <FlashDealsSection products={rawProducts} />
        </ErrorBoundary>
      )}

      {/* 4. Main Products Catalog */}
      <main className="max-w-7xl mx-auto px-4 py-8" id="products">
        {/* Section Header with Product Count, Active Filters, Sort & Wishlist Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              {isWishlistOnly ? (
                <>
                  <Heart className="text-rose-500 fill-rose-500" size={24} />
                  <span>قائمة أمنياتكِ المفضلة</span>
                </>
              ) : category ? (
                <>
                  <Sparkles className="text-brand-accent" size={22} />
                  <span>مختارات قسم: {category}</span>
                </>
              ) : searchInput ? (
                <>
                  <Search className="text-brand-accent" size={22} />
                  <span>نتائج البحث عن: "{searchInput}"</span>
                </>
              ) : (
                <>
                  <Sparkles className="text-brand-accent" size={22} />
                  <span>أحدث التشكيلات الملكية</span>
                </>
              )}
            </h2>
            <span
              data-testid="product-count-badge"
              className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-bold"
            >
              {displayProducts.length} قطعة
            </span>
          </div>

          {/* Controls: Sorting, Wishlist toggle & Active filter chips */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-start md:justify-end">
            {/* Active Filter Chips */}
            {(category || isWishlistOnly || searchInput) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {isWishlistOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    <span>المفضلة فقط</span>
                    <button
                      type="button"
                      onClick={toggleWishlistFilter}
                      className="hover:text-rose-900 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <span>القسم: {category}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('')}
                      className="hover:text-amber-950 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {searchInput && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200 text-zinc-800 text-xs font-bold">
                    <span>البحث: {searchInput}</span>
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="hover:text-black cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Wishlist filter toggle button */}
            <button
              type="button"
              onClick={toggleWishlistFilter}
              data-testid="wishlist-filter-toggle"
              className={`h-10 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border shrink-0 ${
                isWishlistOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Heart
                size={16}
                className={
                  isWishlistOnly
                    ? 'text-rose-600 fill-rose-600'
                    : wishlistCount > 0
                    ? 'text-rose-500 fill-rose-500'
                    : ''
                }
              />
              <span>المفضلة</span>
              {wishlistCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isWishlistOnly
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Sort Select Dropdown */}
            <div className="relative flex items-center shrink-0">
              <ArrowUpDown
                size={14}
                className="absolute start-3 pointer-events-none text-zinc-400"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="ترتيب المنتجات"
                data-testid="sort-select"
                className="h-10 ps-8 pe-4 rounded-full bg-white border border-zinc-200 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer appearance-none transition shadow-xs"
              >
                <option value="newest">وصل حديثاً (الأحدث)</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : displayProducts.length === 0 ? (
          isWishlistOnly ? (
            <div
              data-testid="empty-wishlist"
              className="p-12 text-center text-zinc-500 bg-white rounded-3xl border border-zinc-200/80 shadow-xs max-w-md mx-auto my-8 space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart size={32} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">
                قائمة أمنياتكِ فارغة حالياً
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                اضغطي على علامة القلب ❤️ بجانب أي منتج ينال إعجابكِ لحفظه والرجوع إليه بسهولة لاحقاً.
              </p>
              <button
                type="button"
                onClick={toggleWishlistFilter}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-accent text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-sm cursor-pointer"
              >
                <span>استكشفي أحدث التشكيلات</span>
              </button>
            </div>
          ) : (
            <div
              data-testid="empty-products"
              className="p-12 text-center text-zinc-500 bg-white rounded-3xl border border-zinc-200/80 shadow-xs max-w-md mx-auto my-8 space-y-3"
            >
              <ShoppingBag className="mx-auto h-14 w-14 text-zinc-300" />
              <h3 className="font-bold text-base text-zinc-800">
                لا توجد منتجات مطابقة
              </h3>
              <p className="text-xs text-zinc-500">
                {searchInput
                  ? `لم نتمكن من العثور على أي قطعة مطابقة لـ "${searchInput}". جربي كلمات أخرى أو تصفحي الأقسام.`
                  : 'لا توجد منتجات متوفرة في هذا القسم حالياً.'}
              </p>
            </div>
          )
        ) : (
          <div
            data-testid="product-grid"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {displayProducts.map((p) => (
              <ErrorBoundary key={p.id}>
                <SmartProductCard product={p} />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </main>

      {/* 5. Brand Trust & Value Proposition Features */}
      <ErrorBoundary>
        <BrandTrustFeatures />
      </ErrorBoundary>

      {/* 6. VIP Club Newsletter Signup Banner */}
      <ErrorBoundary>
        <NewsletterSignup />
      </ErrorBoundary>
    </div>
  )
}
