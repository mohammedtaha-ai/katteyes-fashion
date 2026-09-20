import { useCategories } from '@/queries/use-categories'
import { cn } from '@/lib/utils'

export function CategoryTabs({
  active,
  onChange,
}: {
  active: string
  onChange: (slug: string) => void
}) {
  const { data } = useCategories()
  const categories = data?.data?.data ?? []

  return (
    <div className="flex gap-2 overflow-x-auto bg-white px-4 py-2 sticky top-[53px] z-40 border-b">
      <button
        onClick={() => onChange('')}
        className={cn(
          'rounded-full text-xs px-3 py-1 whitespace-nowrap',
          active === ''
            ? 'bg-black text-white font-bold'
            : 'bg-zinc-100 text-zinc-600',
        )}
      >
        الكل
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          onClick={() => onChange(c.slug)}
          className={cn(
            'rounded-full text-xs px-3 py-1 whitespace-nowrap',
            active === c.slug
              ? 'bg-black text-white font-bold'
              : 'bg-zinc-100 text-zinc-600',
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}
