import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Star,
  Ruler,
  Plus,
  Minus,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useProduct } from '@/queries/use-products'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'
import { formatCurrency } from '@/lib/utils'
import { StorefrontBreadcrumbs } from '@/components/storefront/StorefrontBreadcrumbs'
import { ProductGallery } from '@/components/product/ProductGallery'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'
import { MobileStickyBuyBar } from '@/components/product/MobileStickyBuyBar'
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection'
import { RelatedProductsSection } from '@/components/product/RelatedProductsSection'
import { colorToHex } from '@/components/product/SmartProductCard'

export function ProductDetailPage() {
  const { slug } = useParams()
  const { data, isLoading } = useProduct(slug ?? '')
  const addItem = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)

  const [color, setColor] = useState<string>('')
  const [size, setSize] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs')

  const product = data?.data?.data

  const colorOpts = useMemo(() => {
    return product?.colors?.length ? product.colors : ['الافتراضي']
  }, [product])

  const sizeOpts = useMemo(() => {
    return product?.sizes?.length ? product.sizes : ['مقاس موحد']
  }, [product])

  const selColor = color || colorOpts[0]
  const selSize = size || sizeOpts[0]

  if (isLoading) {
    return (
      <main className="container max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-10 bg-zinc-100 rounded-xl mb-6 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] bg-zinc-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-zinc-100 rounded w-1/4" />
            <div className="h-9 bg-zinc-100 rounded w-3/4" />
            <div className="h-8 bg-zinc-100 rounded w-1/3" />
            <div className="h-24 bg-zinc-100 rounded" />
            <div className="h-12 bg-zinc-100 rounded" />
            <div className="h-12 bg-zinc-100 rounded" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-black text-zinc-900 mb-2">المنتج غير موجود</h1>
        <p className="text-sm text-zinc-500 mb-6">قد يكون المنتج قد نفذ أو تم تغيير الرابط.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-accent text-slate-950 font-bold hover:bg-brand-accent-hover transition-colors"
        >
          العودة للمتجر
        </Link>
      </main>
    )
  }

  // Calculate simulated 20% discount original price for luxury presentation
  const originalPrice = product.price * 1.25
  const primaryImage = product.images?.[0]?.url || ''

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        productName: product.name,
        price: product.price,
        currency: product.currency,
        img: primaryImage,
        color: selColor,
        size: selSize,
      })
    }

    // Trigger luxury confetti animation
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e5a83b', '#0f172a', '#d97706', '#f59e0b'],
      })
    } catch {
      // Confetti fallback
    }

    addToast({
      message: `تمت إضافة (${quantity}) قطعة بنجاح إلى حقيبة التسوق ✨`,
      productName: product.name,
      thumbnail: primaryImage,
      type: 'success',
    })
  }

  const handleWhatsAppOrder = () => {
    const text = `مرحباً Katteyes Fashion 🛍️\nأود طلب هذا المنتج فوراً:\n- المنتج: ${product.name}\n- المقاس: ${selSize}\n- اللون: ${selColor}\n- الكمية: ${quantity}\n- السعر: ${formatCurrency(product.price * quantity, product.currency)}\n- رابط المنتج: ${window.location.href}`
    window.open(`https://wa.me/967777000000?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <main className="bg-white min-h-screen pb-20 md:pb-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Smart Breadcrumbs & Back Navigation */}
        <StorefrontBreadcrumbs
          categoryName={product.category?.name}
          categorySlug={product.category?.slug}
          productName={product.name}
        />

        {/* Main Product Section: Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Gallery Showcase (7 Cols on desktop) */}
          <div className="lg:col-span-7">
            <ProductGallery
              productId={product.id}
              productName={product.name}
              images={product.images}
            />
          </div>

          {/* Product Purchasing Info (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Category Pill & Rating Badge */}
            <div className="flex items-center justify-between gap-2">
              {product.category?.name && (
                <Link
                  to={`/?category=${product.category.slug || ''}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-surface text-brand-accent hover:bg-brand-accent hover:text-slate-950 transition-colors"
                >
                  <Sparkles size={13} />
                  <span>{product.category.name}</span>
                </Link>
              )}

              <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <span>4.9</span>
                <span className="text-zinc-400">(128 تقييم)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 leading-tight">
              {product.name}
            </h1>

            {/* Price Block with Discount Strikethrough */}
            <div className="flex items-baseline gap-3 py-1">
              <span
                data-testid="detail-price"
                className="text-2xl sm:text-3xl font-black text-brand-accent"
              >
                {formatCurrency(product.price, product.currency)}
              </span>
              <span className="text-sm sm:text-base text-zinc-400 line-through font-semibold">
                {formatCurrency(originalPrice, product.currency)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200">
                وفر 20% 🔥
              </span>
            </div>

            {/* Scarcity Urgency Callout */}
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>متبقي 3 قطع فقط في المخزون! سارع بالطلب قبل نفاد الكمية.</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-1">
              {product.description ?? 'منتج فاخر مصمم بأعلى معايير الجودة والأناقة.'}
            </p>

            <hr className="border-zinc-100" />

            {/* Color Swatch Picker */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-2">
                <span>اختر اللون:</span>
                <span className="text-brand-accent font-black">{selColor}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5" data-testid="color-picker">
                {colorOpts.map((c) => {
                  const hex = colorToHex[c.trim().toLowerCase()] || '#cbd5e1'
                  const isSelected = selColor === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      title={c}
                      data-testid={`opt-${c}`}
                      aria-label={`اللون ${c}`}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-accent bg-black text-white shadow-xs ring-2 ring-brand-accent/20'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{c}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Size Picker + Size Guide Modal Trigger */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-2">
                <span>اختر المقاس:</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-brand-accent font-bold hover:underline cursor-pointer"
                >
                  <Ruler size={14} />
                  <span>دليل المقاسات 📏</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2" data-testid="size-picker">
                {sizeOpts.map((s) => {
                  const isSelected = selSize === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      data-testid={`opt-${s}`}
                      className={`min-w-12 h-10 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-accent/30'
                          : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-zinc-800">الكمية:</span>
              <div className="inline-flex items-center border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="تقليل الكمية"
                  className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center font-bold text-xs text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="زيادة الكمية"
                  className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & WhatsApp Order */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                data-testid="add-to-cart"
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-accent text-slate-950 font-black text-sm sm:text-base shadow-lg hover:bg-brand-accent-hover hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={20} />
                <span>أضف إلى حقيبة التسوق</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                data-testid="whatsapp-order-btn"
                className="w-full py-3 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>اطلب فوراً عبر واتساب 💬</span>
              </button>
            </div>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-xs">
                <Truck size={18} className="text-brand-accent shrink-0" />
                <span>توصيل سريع لجميع المحافظات</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-xs">
                <ShieldCheck size={18} className="text-brand-accent shrink-0" />
                <span>خامات أصلية وفاخرة 100%</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-xs">
                <RotateCcw size={18} className="text-brand-accent shrink-0" />
                <span>استبدال وإرجاع مجاني خلال 3 أيام</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 text-xs">
                <Sparkles size={18} className="text-brand-accent shrink-0" />
                <span>الدفع عند الاستلام متاح</span>
              </div>
            </div>

            {/* Collapsible Accordions (Specs, Care, Shipping) */}
            <div className="border border-zinc-200/80 rounded-2xl overflow-hidden divide-y divide-zinc-200/80 mt-2">
              {/* Accordion 1: Specs */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion((cur) => (cur === 'specs' ? null : 'specs'))}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
                >
                  <span>تفاصيل الموديل والمواصفات</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'specs' ? 'rotate-180 text-brand-accent' : 'text-zinc-400'
                    }`}
                  />
                </button>
                {openAccordion === 'specs' && (
                  <div className="p-3.5 text-xs text-zinc-600 leading-relaxed bg-white space-y-1">
                    <p>• القماش: خامات فاخرة منتقاة بعناية فائقة تلائم ذوق المرأة الراقية.</p>
                    <p>• القصة: تصميم محتشم ومريح يمنحك انسيابية وحرية في الحركة.</p>
                    <p>• الملحقات: متوفر بكافة المقاسات والألوان المعروضة.</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Care */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion((cur) => (cur === 'care' ? null : 'care'))}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
                >
                  <span>إرشادات الغسيل والعناية</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'care' ? 'rotate-180 text-brand-accent' : 'text-zinc-400'
                    }`}
                  />
                </button>
                {openAccordion === 'care' && (
                  <div className="p-3.5 text-xs text-zinc-600 leading-relaxed bg-white space-y-1">
                    <p>• يفضل الغسيل الجاف (Dry Clean) للأقمشة المطرزة والمخملية.</p>
                    <p>• الكي بحرارة منخفضة أو باستخدام مكواة البخار العمودية للحفاظ على لمعان القماش.</p>
                    <p>• تجنبي استخدام المبيضات أو مساحيق الغسيل القوية.</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Delivery */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion((cur) => (cur === 'shipping' ? null : 'shipping'))}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
                >
                  <span>الشحن والتوصيل لكافة المحافظات</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'shipping' ? 'rotate-180 text-brand-accent' : 'text-zinc-400'
                    }`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="p-3.5 text-xs text-zinc-600 leading-relaxed bg-white space-y-1">
                    <p>• صنعاء وعدن: التوصيل خلال 24 ساعة عبر مندوب خاص مع ميزة المعاينة قبل الاستلام.</p>
                    <p>• بقية المحافظات: التوصيل السريع خلال 24 - 48 ساعة عبر أفضل شركات النقل المعتمدة.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Social Proof */}
        <ProductReviewsSection />

        {/* Related Products Carousel */}
        <RelatedProductsSection
          currentProductId={product.id}
          categorySlug={product.category?.slug}
        />
      </div>

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Mobile Sticky Action Bar */}
      <MobileStickyBuyBar
        productName={product.name}
        price={product.price}
        currency={product.currency}
        thumbnail={primaryImage}
        onAddToCart={handleAddToCart}
      />
    </main>
  )
}
