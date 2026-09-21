import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { HomePage } from '@/pages/storefront/HomePage'
import { ProductDetailPage } from '@/pages/storefront/ProductDetailPage'
import { CartPage } from '@/pages/storefront/CartPage'
import { CheckoutPage } from '@/pages/storefront/CheckoutPage'
import { OrderConfirmedPage } from '@/pages/storefront/OrderConfirmedPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { MyOrdersPage } from '@/pages/MyOrdersPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Standalone pages (no layout chrome) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin (admin layout, all require admin role) */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={['admin']}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* Storefront (storefront layout) */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/order-confirmed/:orderNumber"
          element={<OrderConfirmedPage />}
        />
        <Route
          path="/my-orders"
          element={
            <RequireAuth>
              <MyOrdersPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
