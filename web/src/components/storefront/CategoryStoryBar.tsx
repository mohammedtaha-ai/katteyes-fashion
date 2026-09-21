import { useCategories } from '@/queries/use-categories'
import { cn } from '@/lib/utils'

export interface CategoryStoryBarProps {
  activeCategory?: string
  onSelectCategory?: (slug: string) => void
  active?: string
  onChange?: (slug: string) => void
}

const emojiMap: Record<string, string> = {
  all: '🛍️',
  'الكل': '🛍️',
  'فساتين سهرة': '👗',
  'فساتين': '👗',
  dresses: '👗',
  fashion: '👗',
  'عبايات خليجية': '🧕',
  'عبايات': '🧕',
  abayas: '🧕',
  'جلابيات': '👘',
  jalabiyas: '👘',
  'أحذية': '👠',
  shoes: '👠',
  'حقائب': '👜',
  bags: '👜',
  'اكسسوارات': '✨',
  accessories: '✨',
  'مجوهرات': '💍',
  jewelry: '💍',
  'عطور': '🌸',
  perfumes: '🌸',
}

export function getCategoryEmoji(name: string, slug: string): string {
  const normName = name.trim().toLowerCase()
  if (emojiMap[normName]) return emojiMap[normName]

  const normSlug = slug.trim().toLowerCase()
  if (emojiMap[normSlug]) return emojiMap[normSlug]

  if (normName.includes('فستان') || normName.includes('فساتين')) return '👗'
  if (normName.includes('عباي')) return '🧕'
  if (normName.includes('جلابي')) return '👘'
  if (normName.includes('حذاء') || normName.includes('أحذية')) return '👠'
  if (normName.includes('حقيب') || normName.includes('حقائب') || normName.includes('شنط')) return '👜'
  if (normName.includes('مجوهر') || normName.includes('ذهب') || normName.includes('فضة')) return '💍'
  if (normName.includes('اكسسوار')) return '✨'
  if (normName.includes('عطر') || normName.includes('عطور')) return '🌸'

  return '✨'
}

export function CategoryStoryBar({
  activeCategory,
  onSelectCategory,
  active,
  onChange,
}: CategoryStoryBarProps) {
  const { data, isLoading } = useCategories()
  const categories = data?.data?.data ?? []

  const currentActive = activeCategory ?? active ?? ''
  const handleSelect = (slug: string) => {
    onSelectCategory?.(slug)
    onChange?.(slug)
  }

  if (isLoading) {
    return (
      <div
        data-testid="category-story-skeleton"
        className="w-full bg-white border-b border-zinc-100 py-4 px-4 overflow-x-auto scrollbar-none"
      >
        <div className="flex gap-4 sm:gap-6 items-center max-w-7xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-zinc-200" />
              <div className="h-3 w-12 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const items = [
    { id: 0, name: 'الكل', slug: '', emoji: '🛍️' },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      emoji: getCategoryEmoji(c.name, c.slug),
    })),
  ]

  return (
    <div
      data-testid="category-story-bar"
      className="w-full bg-white border-b border-zinc-100 py-3.5 px-4 shadow-xs"
    >
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 items-start max-w-7xl mx-auto scrollbar-none">
        {items.map((cat) => {
          const isActive = currentActive === cat.slug

          return (
            <button
              key={cat.slug || 'all'}
              type="button"
              onClick={() => handleSelect(cat.slug)}
              data-testid={`category-story-${cat.slug || 'all'}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none cursor-pointer"
            >
              <div
                className={cn(
                  'w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-2xl transition-all duration-200 shadow-xs select-none',
                  isActive
                    ? 'ring-2 ring-brand-accent ring-offset-2 bg-brand-accent/10 scale-105'
                    : 'ring-2 ring-zinc-200 hover:ring-brand-accent/60 bg-zinc-50 group-hover:scale-105',
                )}
              >
                <span>{cat.emoji}</span>
              </div>
              <span
                className={cn(
                  'text-xs max-w-[80px] truncate transition-colors text-center',
                  isActive
                    ? 'font-bold text-brand-accent'
                    : 'text-zinc-700 font-medium group-hover:text-zinc-900',
                )}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
