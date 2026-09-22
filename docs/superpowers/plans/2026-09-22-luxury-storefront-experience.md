# Luxury Storefront Experience & World-Class UI/UX — Implementation Plan

> **Goal:** Transform Katteyes Fashion storefront into a top-tier luxury e-commerce experience (matching or exceeding Zara, SHEIN, Farfetch, and Amazon) with smooth Framer Motion animations, breadcrumbs, back buttons, high-res curated Arabic fashion photography, rich product details with size guides, reviews, WhatsApp instant orders, mobile sticky buy bar, and wishlist.

**Branch:** `feature/luxury-storefront-experience`

---

## 1. High-Resolution Curated Fashion Catalog (Seeders)
- [x] **Task 1: Update Product & Category Seeders with Direct High-Res Fashion CDN URLs**
  - Replace random `picsum.photos` with curated Unsplash fashion URLs (royal evening gowns, luxury modest abayas, chic linen casual wear, premium leather bags, designer heels, gold & zircon jewelry, cashmere silk scarves).
  - Seed 12 realistic products with high-definition primary and secondary images.
  - Re-run database seeding inside Docker: `docker compose exec api php artisan db:seed --class=ProductSeeder --force`.
  - Verify images load properly and return HTTP 200.

---

## 2. Wishlist System & Global State
- [x] **Task 2: Implement Wishlist State Store (`useWishlistStore.ts`)**
  - Zustand store persisted in `localStorage`.
  - Actions: `toggleWishlist(product)`, `isWishlisted(productId)`, `getWishlistCount()`.
  - Add Wishlist Heart icon with counter badge in `Header.tsx`.

---

## 3. World-Class Product Detail Page (`ProductDetailPage.tsx`)
- [x] **Task 3: Breadcrumbs & Back Navigation Component (`StorefrontBreadcrumbs.tsx`)**
  - "← العودة إلى المنتجات" smart back button (history aware: `navigate(-1)` with fallback to `/`).
  - Breadcrumbs trail: `الرئيسية / {Category Name} / {Product Name}` with clickable category filter links.
- [x] **Task 4: Luxury Portrait Fashion Gallery (`ProductGallery.tsx`)**
  - 3:4 portrait aspect ratio (fashion industry standard).
  - Thumbnail preview strip on side (desktop) or bottom (mobile).
  - Smooth image transition and swipe support with navigation arrows.
  - Wishlist toggle heart button on image corner.
  - Share button with native Web Share API and clipboard copy toast.
- [x] **Task 5: Product Purchasing & Conversion Booster**
  - Category pill + "وصلنا حديثاً ✨" or "الأكثر طلباً ⭐".
  - Review score summary (`★ 4.9 (128 تقييم)`).
  - Dynamic pricing block with strike-through original price and "وفر 20%" discount badge.
  - Elegant circular color swatches with active ring and color title label.
  - Size button chips + "جدول المقاسات 📏" opening an interactive Size Guide modal with measurements table.
  - Interactive quantity selector (`-` / `1` / `+`) with stock urgency indicator ("متبقي 3 قطع فقط!").
  - "أضف إلى حقيبة التسوق" button with Framer Motion tap animation and confetti effect on add.
  - "اطلب فوري عبر واتساب 💬" button pre-filling customer's chosen color, size, and product link directly to store WhatsApp.
  - Trust perks grid: 🚚 شحن سريع لكافة المحافظات | 💵 دفع عند الاستلام | 🔄 استبدال مجاني | ✨ جودة أصلية 100%.
  - Collapsible accordions for: مواصفات وخامة المنتج, تعليمات العناية والغسيل, سياسة الشحن والتوصيل.
- [x] **Task 6: Mobile Sticky Bottom Action Bar (`MobileStickyBuyBar.tsx`)**
  - Appears on mobile when scrolling past the main Buy button.
  - Shows product thumbnail, title, price, and full-width "أضف للسلة" button for seamless 1-thumb purchasing.
- [x] **Task 7: Customer Reviews & Social Proof Section (`ProductReviewsSection.tsx`)**
  - Rating breakdown (5 stars to 1 star percentage bars).
  - Verified buyer review cards with Arabic customer testimonials and dates.
- [x] **Task 8: Related Products Carousel ("إطلالات مشابهة قد تعجبك")**
  - Queries and displays products from the same category using `SmartProductCard`.

---

## 4. Modern Storefront & Homepage Revamp
- [x] **Task 9: SmartProductCard Enhancements (`SmartProductCard.tsx`)**
  - High-res 3:4 portrait card with secondary image hover flip.
  - Wishlist heart icon toggle button with scale pop animation.
  - Badges: "جديد ✨", "خصم 20% 🔥", or star rating.
  - Price format with optional original price discount.
  - Color swatches with border highlight.
  - Quick Add to Cart button with confetti/toast feedback.
  - Image error fallback handling gracefully (never blank white).
- [x] **Task 10: Homepage Fashion Overhaul (`HomePage.tsx`)**
  - Luxury `HeroPromoSlider` with Framer Motion slide animations, luxury typography, and CTA buttons.
  - `CategoryStoryBar` with luxury gradient rings, smooth scroll, and active state.
  - "عروض حصرية لفترة محدودة 🔥" (Flash Deals) section with animated countdown timer (`ساعات : دقائق : ثواني`).
  - Search & Sorting filter bar (الأحدث، الأقل سعراً، الأكثر مبيعاً).
  - "لماذا Katteyes Fashion؟" luxury brand value proposition banner.
  - Newsletter discount signup banner ("انضمي لنادي Katteyes واحصلي على 10% خصم").
  - Luxury E-Commerce Footer (`Footer.tsx`) with brand story, customer care, delivery info, payment methods, and copyright.

---

## 5. Mobile App Navigation (`MobileNav.tsx`)
- [x] **Task 11: Bottom Mobile App Navigation Bar**
  - Floating bottom bar on mobile: الرئيسية 🏠, الأقسام 🛍️, المفضلة ❤️, السلة 🛒.

---

## 6. Verification & Automated Testing
- [x] **Task 12: Comprehensive Verification**
  - Run Vitest frontend test suite: `docker compose exec web npm test -- --run` (40/40 test files passed, 123/123 tests passed)
  - Run TypeScript compile check: `docker compose exec web npx tsc --noEmit` (0 errors)
  - Run Production Build: `docker compose exec web npm run build` (built in 3.08s)
  - Run Backend test suite: `docker compose exec api php artisan test` (119/119 tests passed, 347 assertions)
  - Validate mobile responsive layouts and desktop layouts.
