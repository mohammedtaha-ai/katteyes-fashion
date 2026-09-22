import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ArrowRight, Home } from 'lucide-react'

interface BreadcrumbsProps {
  categoryName?: string
  categorySlug?: string
  productName: string
}

export function StorefrontBreadcrumbs({
  categoryName,
  categorySlug,
  productName,
}: BreadcrumbsProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 py-3 px-4 sm:px-6 bg-zinc-50/80 border-b border-zinc-200/70 text-xs sm:text-sm text-zinc-600 mb-4 sm:mb-6 rounded-xl">
      {/* Smart Back Button */}
      <button
        type="button"
        onClick={handleBack}
        data-testid="back-button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-800 font-bold hover:bg-brand-accent hover:text-slate-950 hover:border-brand-accent transition-all duration-200 shadow-xs cursor-pointer active:scale-95"
      >
        <ArrowRight size={16} />
        <span>العودة للتسوق</span>
      </button>

      {/* Breadcrumb Links */}
      <nav aria-label="مسار التصفح" className="flex items-center gap-1.5 flex-wrap">
        <Link
          to="/"
          className="inline-flex items-center gap-1 hover:text-brand-accent transition-colors font-medium text-zinc-600"
          title="الرئيسية"
        >
          <Home size={14} />
          <span>الرئيسية</span>
        </Link>

        {categoryName && (
          <>
            <ChevronLeft size={14} className="text-zinc-400" />
            <Link
              to={`/?category=${categorySlug || ''}`}
              className="hover:text-brand-accent transition-colors font-medium text-zinc-600 truncate max-w-[120px] sm:max-w-none"
            >
              {categoryName}
            </Link>
          </>
        )}

        <ChevronLeft size={14} className="text-zinc-400" />
        <span className="font-bold text-zinc-900 truncate max-w-[160px] sm:max-w-[280px]">
          {productName}
        </span>
      </nav>
    </div>
  )
}
