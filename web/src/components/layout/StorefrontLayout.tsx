import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ToastNotification } from '@/components/storefront/ToastNotification'

export function StorefrontLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-brand-light text-zinc-900">
      <Header />
      <main>
        <Outlet />
      </main>
      <ToastNotification />
    </div>
  )
}
