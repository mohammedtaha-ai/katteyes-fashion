import { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Share2, ZoomIn, X } from 'lucide-react'
import type { ProductImage } from '@/api/types'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useToastStore } from '@/stores/toast-store'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect fill="#f8fafc" width="600" height="800"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#cbd5e1" text-anchor="middle" dominant-baseline="middle">Katteyes Fashion</text></svg>',
  )

interface ProductGalleryProps {
  productId: number
  productName: string
  images: ProductImage[]
}

export function ProductGallery({
  productId,
  productName,
  images,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId))
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const addToast = useToastStore((s) => s.addToast)

  const galleryImages = images && images.length > 0 ? images : [{ id: 0, url: PLACEHOLDER, sort_order: 0 }]
  const activeImage = galleryImages[activeIndex] || galleryImages[0]

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const added = toggleWishlist(productId)
    addToast({
      message: added ? 'تمت إضافة المنتج إلى قائمة رغباتك ❤️' : 'تمت إزالة المنتج من قائمة الرغبات',
      productName,
      thumbnail: activeImage.url,
      type: added ? 'success' : 'info',
    })
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `شاهد ${productName} على Katteyes Fashion`,
          url: window.location.href,
        })
      } catch {
        // User dismissed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      addToast({
        message: 'تم نسخ رابط المنتج إلى الحافظة بنجاح ✨',
        productName,
        thumbnail: activeImage.url,
        type: 'success',
      })
    }
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 w-full" data-testid="product-slider">
      {/* Thumbnail Strip (Vertical on Desktop, Horizontal on Mobile) */}
      {galleryImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[580px] pb-2 md:pb-0 scrollbar-none shrink-0 justify-start md:w-20">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`عرض الصورة ${idx + 1}`}
              data-testid={`gallery-thumb-${idx}`}
              className={`relative aspect-[3/4] w-16 md:w-full rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-zinc-100 shrink-0 ${
                activeIndex === idx
                  ? 'border-brand-accent shadow-sm scale-102'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Portrait Showcase (3:4 aspect ratio) */}
      <div className="relative flex-1 aspect-[3/4] max-h-[620px] rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm group">
        <img
          src={activeImage.url}
          alt={productName}
          onClick={() => setIsLightboxOpen(true)}
          data-testid="main-gallery-image"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
        />

        {/* Zoom Hint */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          title="تكبير الصورة"
          aria-label="تكبير الصورة"
          className="absolute bottom-3 start-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs text-zinc-700 hover:bg-white flex items-center justify-center shadow-md transition-transform active:scale-95"
        >
          <ZoomIn size={18} />
        </button>

        {/* Floating Quick Action Buttons (Wishlist & Share) */}
        <div className="absolute top-3 end-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWishlistToggle}
            data-testid="gallery-wishlist-btn"
            title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            aria-label="إضافة للمفضلة"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs text-zinc-700 hover:text-rose-500 shadow-md flex items-center justify-center transition-all duration-200 active:scale-90"
          >
            <Heart
              size={20}
              className={isWishlisted ? 'text-rose-500 fill-rose-500' : ''}
            />
          </button>
          <button
            type="button"
            onClick={handleShare}
            title="مشاركة المنتج"
            aria-label="مشاركة المنتج"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs text-zinc-700 hover:text-brand-accent shadow-md flex items-center justify-center transition-all duration-200 active:scale-90"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Next / Prev Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="الصورة السابقة"
              className="absolute start-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs text-zinc-800 hover:bg-white shadow-md flex items-center justify-center transition-transform active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="الصورة التالية"
              className="absolute end-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs text-zinc-800 hover:bg-white shadow-md flex items-center justify-center transition-transform active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Counter Badge */}
            <div className="absolute bottom-3 end-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
              {activeIndex + 1} / {galleryImages.length}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="إغلاق"
            className="absolute top-4 end-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          <img
            src={activeImage.url}
            alt={productName}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
