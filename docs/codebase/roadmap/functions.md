# Roadmap functions catalog

This file is the cross-agent knowledge base. Every task appends `ClassName::methodName() → file:line` entries here so the next implementer/reviewer can locate any function without re-reading the codebase.

> Format: `Function/Component → path:line — short description`

## Backend — Laravel 11

### Migrations
- `CreateUsersTable → api/database/migrations/0001_01_01_000000_create_users_table.php:14 — adds `role` enum (admin/customer) default customer`
- `CreateCategoriesTable → api/database/migrations/2026_09_17_120000_create_categories_table.php — soft deletes + slug + is_active + sort_order`
- `CreateProductsTable → api/database/migrations/2026_09_17_121000_create_products_table.php — soft deletes + foreign key category restrictOnDelete`
- `CreateProductImagesTable → api/database/migrations/2026_09_17_130000_create_product_images_table.php — cascadeOnDelete + sort_order`
- `CreateProductOptionsTable → api/database/migrations/2026_09_17_131000_create_product_options_table.php — color/size + cascadeOnDelete`
- `CreateOrdersTable → api/database/migrations/2026_09_17_140000_create_orders_table.php — order_number unique + customer fields + status enum`
- `CreateOrderItemsTable → api/database/migrations/2026_09_17_141000_create_order_items_table.php — snapshots product_name + price + subtotal`

### Models
- `User → api/app/Models/User.php — HasApiTokens + role enum + casts`
- `Category → api/app/Models/Category.php — SoftDeletes + factory + slug auto-generation`
- `Product → api/app/Models/Product.php — SoftDeletes + category()/images()/options() relations + `disk` accessor`
- `ProductImage → api/app/Models/ProductImage.php — belongsTo product + url accessor`
- `ProductOption → api/app/Models/ProductOption.php — belongsTo product + type/color/size`
- `Order → api/app/Models/Order.php — items() relation + status labels`
- `OrderItem → api/app/Models/OrderItem.php — belongsTo order + product snapshot`

### Controllers
- `AuthController@register/login/logout/me → api/app/Http/Controllers/Api/V1/AuthController.php`
- `CategoryController (admin) → api/app/Http/Controllers/Api/V1/Admin/CategoryController.php — index/store/show/update/destroy + slug auto-gen + ->fresh()`
- `CategoryController (public) → api/app/Http/Controllers/Api/V1/CategoryController.php — index only (active+ordered)`
- `ProductController (admin) → api/app/Http/Controllers/Api/V1/Admin/ProductController.php — CRUD with images + options + reorder`
- `ProductController (public) → api/app/Http/Controllers/Api/V1/ProductController.php — index (filter by category + q) + show (by slug)`
- `OrderController (admin) → api/app/Http/Controllers/Api/V1/Admin/OrderController.php — index/show/update`
- `OrderController (public) → api/app/Http/Controllers/Api/V1/OrderController.php — store + show (with email verification)`
- `MyOrderController → api/app/Http/Controllers/Api/V1/MyOrderController.php — authenticated user orders`

### Resources
- `UserResource → api/app/Http/Resources/UserResource.php`
- `CategoryResource → api/app/Http/Resources/CategoryResource.php`
- `ProductResource → api/app/Http/Resources/ProductResource.php — uses whenLoaded('images', callback)`
- `ProductImageResource → api/app/Http/Resources/ProductImageResource.php — Storage::url() builder`
- `OrderResource → api/app/Http/Resources/OrderResource.php`

### Requests (Form Validation)
- `RegisterRequest → api/app/Http/Requests/Auth/RegisterRequest.php`
- `LoginRequest → api/app/Http/Requests/Auth/LoginRequest.php`
- `StoreOrderRequest → api/app/Http/Requests/Order/StoreOrderRequest.php`

### Middleware
- `EnsureRole::handle → api/app/Http/Middleware/EnsureRole.php — role gate for routes (e.g. role:admin)`

### Actions (Business Logic)
- `CreateOrderAction::execute → api/app/Actions/CreateOrderAction.php — validates items + spec §7.4 errors + DB::transaction`
- `UploadImageAction::execute → api/app/Actions/UploadImageAction.php — decode → scaleDown(width:1600) → encodeUsingFileExtension('webp', 85)`

### Services
- `OrderNumberGenerator::generate → api/app/Services/OrderNumberGenerator.php — ORD-YYYY-NNNNNN`
- `WhatsAppMessageBuilder::build → api/app/Services/WhatsAppMessageBuilder.php — formats spec §7.3 message + builds wa.me URL`

### Seeders
- `AdminSeeder → api/database/seeders/AdminSeeder.php — firstOrNew + direct `role = 'admin'` from env (bypasses User::Fillable)`

### Layout (_(populated by Phase 7.6)_)
- (Phase 7.1 foundation): Tailwind CSS v3 + brand palette (#111111, #d4af37, #f9f9f9) + Tajawal font via @fontsource + Radix UI primitives
- `cn(...)` utility at `web/src/lib/utils.ts` (combines clsx + tailwind-merge)
- `formatCurrency(value, currency='YER')` utility at `web/src/lib/utils.ts` (uses ar-YE locale → Arabic-Indic digits)
- `StorefrontLayout` → `web/src/components/layout/StorefrontLayout.tsx` (Task 7.6)
  - `dir="rtl"` + brand-light background; renders `<Header />` + `<Outlet />`
- `AdminLayout` → `web/src/components/layout/AdminLayout.tsx` (Task 7.6)
  - Sidebar (products/categories/orders/users) + `<Outlet />`; logout button clears auth
- `Header` → `web/src/components/layout/Header.tsx` (Task 7.6)
  - Brand logo, admin settings icon (admin only), user name → /my-orders, login button (when guest), cart icon + badge (totalItems)
- `CategoryTabs` → `web/src/components/layout/CategoryTabs.tsx` (Task 7.6)
  - Horizontal scroll tabs with "All" + category pills; controlled active/onChange props

### API layer
- `apiClient` (axios instance) → `web/src/api/client.ts:4`
  - `baseURL` from `VITE_API_URL`
  - Request interceptor: attaches `Bearer <token>` from `useAuthStore`
  - Response interceptor: on 401 → `useAuthStore.clear()` + redirect to `/login` (unless URL contains `/auth/login`)
- `web/src/api/types.ts` → User, Category, Product, ProductImage, Order, OrderItem TypeScript interfaces
- `authApi.login/register/me/logout` → `web/src/api/auth.api.ts`
- `categoriesApi.list` → `web/src/api/categories.api.ts`
- `productsApi.list/show` → `web/src/api/products.api.ts`
- `ordersApi.create/show/myOrders` → `web/src/api/orders.api.ts`
- `useAuthStore` → `web/src/stores/auth-store.ts:10` — Zustand persisted under `katteyes_auth`
- `useCartStore` → `web/src/stores/cart-store.ts` — Zustand persisted under `katteyes_cart` (Task 7.3)
  - State: `items: CartItem[]` where CartItem = {productId, productName, price, currency, img, color, size, quantity}
  - Methods: `addItem(i)`, `updateQty(idx, delta)`, `removeItem(idx)`, `clear()`, `totalPrice()`, `totalItems()`
  - Persisted to localStorage under `katteyes_cart`
  - `addItem` increments quantity for same `productId+color+size`, otherwise adds new line
- MSW mocks at `web/src/__tests__/mocks/handlers.ts` + `mocks/server.ts`
- Vitest setup with jsdom + @testing-library/jest-dom at `web/src/__tests__/setup.ts`

### Stores (Zustand)
- `useAuthStore` → `web/src/stores/auth-store.ts` (Task 7.3)
  - State: `user: User|null`, `token: string|null`
  - Methods: `setAuth({token, user})`, `clear()`, `isAdmin()`, `isAuthenticated()`
  - Persisted to localStorage under `katteyes_auth`

### Routing
- `AppRoutes` → `web/src/routes.tsx` (Task 7.5)
  - Storefront: `/`, `/products/:slug`, `/cart`, `/checkout`, `/order-confirmed/:orderNumber`, `/login`, `/register`, `/my-orders` (RequireAuth)
  - Admin: `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/users` (RequireAuth roles=['admin'])
  - 404: catch-all → NotFoundPage
- `RequireAuth({roles?, children})` → `web/src/components/auth/RequireAuth.tsx`
  - No token → `<Navigate to="/login" state={{ from }} replace />`
  - Roles mismatch → `<Navigate to="/" replace />`
  - Otherwise render children
- Placeholder page components at `web/src/pages/*` + `web/src/pages/admin/*` (filled in by Phase 8)

### UI Components
- `Button` → `web/src/components/ui/Button.tsx` (Task 8.1 — shadcn-style cva)
  - Variants: primary (brand-accent → black hover), ghost, outline
  - Sizes: sm, md, lg

### Product UI
- `ProductCard` → `web/src/components/product/ProductCard.tsx` (Task 8.1)
  - Image (with SVG placeholder fallback), category tag, name, `formatCurrency` price, click navigates to /products/:slug
- `ProductGrid` → `web/src/components/product/ProductGrid.tsx` (Task 8.1)
  - Responsive 2/3/4-column grid; empty-state message
- `ProductDetailPage` → `web/src/pages/storefront/ProductDetailPage.tsx` (Task 8.2)
  - Slider (CSS scroll-snap) + OptionPicker (color + size) + price + description + add-to-cart
  - Defaults: empty colors/sizes → ['الافتراضي'] / ['مقاس واحد']
  - addItem → navigate('/cart')
- `ProductSlider` → `web/src/components/product/ProductSlider.tsx` (Task 8.2)
  - CSS scroll-snap horizontal scroll; prev/next chevron buttons; pagination dots
  - SVG placeholder fallback when images is empty
- `OptionPicker<T extends string>` → `web/src/components/product/OptionPicker.tsx` (Task 8.2)
  - Generic typed option list with selected/unselected visual state

### Cart UI
- `CartPage` → `web/src/pages/storefront/CartPage.tsx` (Task 8.3)
  - Empty state ('السلة فارغة حالياً') or list of CartItemRow + CartSummary
  - Disabled checkout button when cart empty
- `QtyControl` → `web/src/components/cart/QtyControl.tsx` (Task 8.3)
  - +/- buttons wired to cartStore.updateQty; item removed at qty=0
- `CartItemRow` → `web/src/components/cart/CartItemRow.tsx` (Task 8.3)
  - Image + productName + color/size + price×qty subtotal + QtyControl + Trash delete
- `CartSummary` → `web/src/components/cart/CartSummary.tsx` (Task 8.3)
  - Total + count + "go to checkout" button → navigate('/checkout')

### Checkout UI
- `CheckoutForm` → `web/src/components/checkout/CheckoutForm.tsx` (Task 8.4)
  - RHF + Zod schema: customer_name (required, max 100), customer_email (optional, valid email), customer_address (required, max 1000), customer_notes (optional, max 1000)
  - Disabled submit when cart empty or submitting
- `CheckoutPage` → `web/src/pages/storefront/CheckoutPage.tsx` (Task 8.4)
  - useMutation → ordersApi.create → onSuccess: window.open(whatsapp_link) + clearCart + navigate(/order-confirmed/:number)
  - useEffect: empty cart → redirect to /cart
  - RHF + Zod validation via CheckoutForm
- `OrderConfirmedPage` → `web/src/pages/storefront/OrderConfirmedPage.tsx` (Task 8.4)
  - useOrder(orderNumber) → useEffect opens whatsapp_link
  - Shows order number + back-to-home link

### Auth UI
- `LoginPage` → `web/src/pages/auth/LoginPage.tsx` (Task 8.5)
  - useMutation → authApi.login → onSuccess: setAuth + navigate by role (admin → /admin/products, customer → /)
  - TanStack v5: uses m.isError (not m.error)
- `RegisterPage` → `web/src/pages/auth/RegisterPage.tsx` (Task 8.5)
  - useMutation → authApi.register → onSuccess: setAuth + navigate('/', replace)
  - 4 fields: name + email + password + confirm (+ password_confirmation)

### Queries
- `useOrder(orderNumber)` → `web/src/queries/use-orders.ts` (Task 8.4) — single order fetch via ordersApi.show(orderNumber, email?); enabled when orderNumber truthy
- `useMyOrder(orderNumber)` → `web/src/queries/use-orders.ts` — authenticated customer order detail
- `useAdminOrders(params)` / `useAdminOrder(orderNumber)` → admin order list + detail
- `useUpdateOrderStatus()` / `useDeleteOrder()` → admin mutations invalidating orderKeys.detail + orderKeys.lists

### Account UI
- `MyOrdersPage` → `web/src/pages/account/MyOrdersPage.tsx` (Task 8.6)
  - useMyOrders → list of customer orders with order_number + status label (AR) + total + created date
  - Empty state + WhatsApp replay link per order

### Pages
- `HomePage` → `web/src/pages/storefront/HomePage.tsx` (Task 8.1) — hero banner (assets/hero.png), debounced search (300ms), CategoryTabs, ProductGrid fed by `useProducts({category, q})`
- `useDebounced(value, ms=300)` inline hook in HomePage
- `CheckoutPage` → `web/src/pages/storefront/CheckoutPage.tsx` (Task 8.4) — order form (see Checkout UI)
- `OrderConfirmedPage` → `web/src/pages/storefront/OrderConfirmedPage.tsx` (Task 8.4) — confirmation screen + WhatsApp deep-link
