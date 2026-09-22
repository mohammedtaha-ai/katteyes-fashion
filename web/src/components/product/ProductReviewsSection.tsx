import { Star, CheckCircle2 } from 'lucide-react'

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'ريم الكبسي',
    city: 'صنعاء',
    rating: 5,
    date: 'منذ يومين',
    comment:
      'الفستان قمة في الفخامة وخامة التفته ثقيلة وراقية والتطريز متقن جداً، التوصيل وصلني في صنعاء بنفس اليوم. شكراً كات آيز! ❤️',
    verified: true,
  },
  {
    id: 2,
    name: 'سارة الحكيمي',
    city: 'تعز',
    rating: 5,
    date: 'منذ أسبوع',
    comment:
      'مقاس مضبوط 100% والتغليف فخم ينفع هدية مباشرة، شكراً لتعاملكم الراقي وسرعة التجاوب في الواتساب.',
    verified: true,
  },
  {
    id: 3,
    name: 'أروى العولقي',
    city: 'عدن',
    rating: 5,
    date: 'منذ أسبوعين',
    comment:
      'اللون في الواقع أجمل من الصور بكثير وخياطة نظيفة ومرتبة، سعيدة جداً بالتعامل معكم وسأكرر التجربة بإذن الله.',
    verified: true,
  },
]

export function ProductReviewsSection() {
  return (
    <section className="border-t border-zinc-200 pt-8 mt-10" data-testid="product-reviews-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900">
            تقييمات وآراء العملاء ✨
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            تجارب حقيقية من متسوقات موثقات عبر متجرنا
          </p>
        </div>

        {/* Rating Summary Box */}
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="text-2xl font-black text-zinc-900">4.9</div>
          <div>
            <div className="flex text-brand-accent">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} className="fill-brand-accent" />
              ))}
            </div>
            <span className="text-[11px] text-zinc-500">من 128 تقييم موثق</span>
          </div>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/60 p-4 sm:p-6 rounded-2xl border border-zinc-100 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-12 text-zinc-600 font-medium">5 نجوم</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
              <div className="h-full bg-brand-accent rounded-full" style={{ width: '92%' }} />
            </div>
            <span className="w-8 text-end text-zinc-500 font-bold">92%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-12 text-zinc-600 font-medium">4 نجوم</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
              <div className="h-full bg-brand-accent rounded-full" style={{ width: '6%' }} />
            </div>
            <span className="w-8 text-end text-zinc-500 font-bold">6%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-12 text-zinc-600 font-medium">3 نجوم</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
              <div className="h-full bg-brand-accent rounded-full" style={{ width: '2%' }} />
            </div>
            <span className="w-8 text-end text-zinc-500 font-bold">2%</span>
          </div>
        </div>

        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-s border-zinc-200 pt-3 md:pt-0 md:ps-6 text-xs text-zinc-600 space-y-1.5">
          <p className="font-bold text-zinc-800">معايير جودة Katteyes Fashion المعتمدة:</p>
          <p>✓ مطابقة 100% للصور والخامات الأصلية</p>
          <p>✓ ضمان الفحص اليدوي قبل الشحن للعميل</p>
          <p>✓ إمكانية المعاينة عند استلام الشحنة</p>
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex text-brand-accent">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-accent" />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400">{rev.date}</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                "{rev.comment}"
              </p>
            </div>

            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-zinc-100 text-xs">
              <span className="font-bold text-zinc-900">{rev.name}</span>
              <span className="text-zinc-400">• {rev.city}</span>
              {rev.verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold ms-auto">
                  <CheckCircle2 size={12} />
                  مشتري موثق
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
