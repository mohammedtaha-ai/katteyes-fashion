import { Phone, MapPin, Mail, ShieldCheck, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 pt-14 pb-8" data-testid="storefront-footer">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Intro */}
          <div className="space-y-4">
            <Link to="/" className="inline-block text-2xl font-black tracking-tight">
              <span className="text-brand-accent">Katteyes</span>
              <span className="text-white">Fashion</span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              وجهتك الأولى لأرقى أزياء السهرات الملكية والعبايات الخليجية الفاخرة. نبتكر تصاميم تجمع بين الحشمة والعصرية وأعلى معايير الجودة لتكوني دائماً استثنائية.
            </p>
            <div className="flex items-center gap-3 text-zinc-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-brand-accent hover:text-slate-950 flex items-center justify-center transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-brand-accent hover:text-slate-950 flex items-center justify-center transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wider">
              أقسام المتجر
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link to="/?category=فساتين-سهرة" className="hover:text-brand-accent transition-colors">
                  فساتين سهرة ملكية
                </Link>
              </li>
              <li>
                <Link to="/?category=عبايات-خليجية" className="hover:text-brand-accent transition-colors">
                  عبايات خليجية ومناسبات
                </Link>
              </li>
              <li>
                <Link to="/?category=ملابس-كاجوال" className="hover:text-brand-accent transition-colors">
                  أطقم وفساتين كاجوال
                </Link>
              </li>
              <li>
                <Link to="/?category=أحذية-وحقائب" className="hover:text-brand-accent transition-colors">
                  أحذية كعب وحقائب يد فاخرة
                </Link>
              </li>
              <li>
                <Link to="/?category=إكسسوارات" className="hover:text-brand-accent transition-colors">
                  مجوهرات وشالات كشميرية
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wider">
              خدمة العملاء
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <span className="hover:text-brand-accent transition-colors cursor-pointer">
                  سياسة الشحن والتوصيل للمحافظات
                </span>
              </li>
              <li>
                <span className="hover:text-brand-accent transition-colors cursor-pointer">
                  الاستبدال والاسترجاع المجاني
                </span>
              </li>
              <li>
                <span className="hover:text-brand-accent transition-colors cursor-pointer">
                  دليل المقاسات المعتمد
                </span>
              </li>
              <li>
                <span className="hover:text-brand-accent transition-colors cursor-pointer">
                  الأسئلة الشائعة
                </span>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-brand-accent transition-colors">
                  متابعة حالة الطلب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wider">
              تواصل معنا
            </h3>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-brand-accent shrink-0" />
                <span>اليمن — صنعاء / عدن</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-brand-accent shrink-0" />
                <span dir="ltr">+967 777 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brand-accent shrink-0" />
                <span>support@katteyesfashion.com</span>
              </div>
              <div className="flex items-center gap-1.5 pt-2 text-[11px] text-emerald-400 font-bold">
                <ShieldCheck size={16} />
                <span>متجر معتمد ومسجل رسمياً</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © 2026 Katteyes Fashion. صُنِع بـ</span>
            <Heart size={13} className="text-rose-500 fill-rose-500 inline" />
            <span>لأرقى إطلالة.</span>
          </p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>طرق الدفع:</span>
            <span className="font-bold text-white">الدفع عند الاستلام</span>
            <span>•</span>
            <span className="font-bold text-white">الكريمي</span>
            <span>•</span>
            <span className="font-bold text-white">ون كاش</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
