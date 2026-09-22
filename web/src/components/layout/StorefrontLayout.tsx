import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { ToastNotification } from '@/components/storefront/ToastNotification'

export function StorefrontLayout() {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-brand-light text-zinc-900 pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <ToastNotification />
    </div>
  )
}

