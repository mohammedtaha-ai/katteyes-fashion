import { X, Ruler } from 'lucide-react'

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
          <div className="flex items-center gap-2 text-zinc-900">
            <Ruler size={22} className="text-brand-accent" />
            <h3 id="size-guide-title" className="text-lg font-black">
              دليل المقاسات المعتمد — Katteyes Fashion
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
          جميع المقاسات تقريبية ومحددة بالسنتيمتر (سم). نوصي باستخدام شريط قياس مرن وأخذ القياسات فوق الملابس الداخلية مباشرة.
        </p>

        {/* Dress Sizes Table */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-zinc-800 mb-2">
            جدول مقاسات الفساتين والملابس الكاجوال:
          </h4>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-xs text-center divide-y divide-zinc-200">
              <thead className="bg-zinc-50 text-zinc-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3">المقاس</th>
                  <th className="py-2.5 px-3">محيط الصدر (سم)</th>
                  <th className="py-2.5 px-3">محيط الخصر (سم)</th>
                  <th className="py-2.5 px-3">محيط الأرداف (سم)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">S</td>
                  <td className="py-2.5 px-3 text-zinc-600">84 - 88</td>
                  <td className="py-2.5 px-3 text-zinc-600">66 - 70</td>
                  <td className="py-2.5 px-3 text-zinc-600">90 - 94</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">M</td>
                  <td className="py-2.5 px-3 text-zinc-600">89 - 93</td>
                  <td className="py-2.5 px-3 text-zinc-600">71 - 75</td>
                  <td className="py-2.5 px-3 text-zinc-600">95 - 99</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">L</td>
                  <td className="py-2.5 px-3 text-zinc-600">94 - 99</td>
                  <td className="py-2.5 px-3 text-zinc-600">76 - 81</td>
                  <td className="py-2.5 px-3 text-zinc-600">100 - 105</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">XL</td>
                  <td className="py-2.5 px-3 text-zinc-600">100 - 106</td>
                  <td className="py-2.5 px-3 text-zinc-600">82 - 88</td>
                  <td className="py-2.5 px-3 text-zinc-600">106 - 112</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Abaya Sizes Table */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-zinc-800 mb-2">
            جدول مقاسات العبايات الخليجية (حسب الطول):
          </h4>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-xs text-center divide-y divide-zinc-200">
              <thead className="bg-zinc-50 text-zinc-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3">مقاس العباية</th>
                  <th className="py-2.5 px-3">طول المرأة المناسب (سم)</th>
                  <th className="py-2.5 px-3">طول الكم (سم)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">52</td>
                  <td className="py-2.5 px-3 text-zinc-600">150 - 155</td>
                  <td className="py-2.5 px-3 text-zinc-600">66</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">54</td>
                  <td className="py-2.5 px-3 text-zinc-600">156 - 161</td>
                  <td className="py-2.5 px-3 text-zinc-600">68</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">56</td>
                  <td className="py-2.5 px-3 text-zinc-600">162 - 167</td>
                  <td className="py-2.5 px-3 text-zinc-600">70</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-brand-accent">58</td>
                  <td className="py-2.5 px-3 text-zinc-600">168 - 173</td>
                  <td className="py-2.5 px-3 text-zinc-600">72</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-brand-surface/40 p-3 rounded-xl text-center">
          <p className="text-[11px] text-zinc-700 font-medium">
            هل تحتاجين لمساعدة في اختيار المقاس؟ تواصلي معنا عبر خدمة العملاء في الواتساب وسيسعدنا إرشادك فوراً! 💬
          </p>
        </div>
      </div>
    </div>
  )
}
