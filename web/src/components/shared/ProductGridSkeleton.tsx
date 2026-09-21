export interface ProductGridSkeletonProps {
  count?: number
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div
      data-testid="product-grid-skeleton"
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl overflow-hidden border border-zinc-100 shadow-xs animate-pulse flex flex-col justify-between"
        >
          {/* 3:4 Aspect Ratio Image Box */}
          <div className="aspect-[3/4] w-full bg-zinc-200" />

          {/* Details Skeleton */}
          <div className="p-3 flex flex-col gap-2">
            {/* Category tag */}
            <div className="h-3 w-16 bg-zinc-200 rounded" />

            {/* Title lines */}
            <div className="h-4 w-3/4 bg-zinc-200 rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 rounded" />

            {/* Color swatches */}
            <div className="flex gap-1.5 py-1">
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-200" />
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-200" />
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-200" />
            </div>

            {/* Price */}
            <div className="h-5 w-24 bg-zinc-200 rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  )
}
