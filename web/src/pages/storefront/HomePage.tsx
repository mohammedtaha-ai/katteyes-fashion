import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import heroImg from '@/assets/hero.png'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProducts } from '@/queries/use-products'

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
  const debouncedSearch = useDebounced(searchInput)

  const { data, isLoading } = useProducts({
    category: category || undefined,
    q: debouncedSearch || undefined,
  })

  const products = data?.data?.data ?? []

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-l from-brand-accent/20 to-white px-4 py-8 text-center">
        <img src={heroImg} alt="Katteyes Fashion" className="mx-auto h-32 mb-4" />
        <h1 className="text-2xl font-black mb-1">أزياء عصرية بأناقة لا تُضاهى</h1>
        <p className="text-sm text-zinc-600">اكتشفي أحدث صيحات الموضة</p>
      </section>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="relative">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3 text-zinc-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحثي عن منتج..."
            data-testid="search-input"
            className="w-full h-10 ps-9 pe-3 rounded-full bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
      </div>

      {/* Category tabs */}
      <CategoryTabs active={category} onChange={setCategory} />

      {/* Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-zinc-500">جاري التحميل...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
