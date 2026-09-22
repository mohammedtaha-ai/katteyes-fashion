import { Truck, CreditCard, ShieldCheck, Gift } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'توصيل سريع لكافة المحافظات',
    description: 'شحن آمن وفوري إلى باب منزلك في صنعاء وعدن وجميع المحافظات مع إمكانية تتبع الطلب.',
  },
  {
    icon: CreditCard,
    title: 'طرق دفع متعددة ومرنة',
    description: 'تسوقي بكل راحة مع خيار الدفع عند الاستلام، أو عبر حسابات الكريمي وخدمة ون كاش.',
  },
  {
    icon: ShieldCheck,
    title: 'خامات ملكية أصلية 100%',
    description: 'نختار أجود أنواع أقمشة الكريب والمخمل والحرير بتطريز يدوي متقن يضمن لكِ فخامة تدوم.',
  },
  {
    icon: Gift,
    title: 'تغليف هدايا فاخر واستبدال ميسر',
    description: 'يصلك كل طلب في بوكس فاخر أنيق، مع ضمان حق المعاينة وسياسة استبدال سلسة وسريعة.',
  },
]

export function BrandTrustFeatures() {
  return (
    <section
      data-testid="brand-trust-features"
      className="max-w-7xl mx-auto px-4 py-10"
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold text-brand-accent tracking-widest uppercase">
          تجربة تسوق استثنائية
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mt-1">
          لماذا تختارين Katteyes Fashion؟
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
          نحرص على تقديم تجربة فاخرة لا تقتصر على التصاميم الأنيقة، بل تمتد لتشمل كل تفاصيل طلبك من الاختيار حتى الوصول.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-zinc-200/80 hover:border-brand-accent/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-brand-accent flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-slate-950 transition-all duration-300">
                <Icon size={26} strokeWidth={2} />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
