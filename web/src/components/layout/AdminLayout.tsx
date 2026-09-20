import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { LogOut, Package, FolderTree, ShoppingCart, Users } from 'lucide-react'

const navItems = [
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/categories', icon: FolderTree, label: 'الأقسام' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
  { to: '/admin/users', icon: Users, label: 'المستخدمون' },
]

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const navigate = useNavigate()

  const onLogout = () => {
    clear()
    navigate('/login')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-brand-light text-zinc-900 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow-md p-4 flex flex-col gap-1 sticky top-0 h-screen">
        <h1 className="font-black text-brand-accent text-lg mb-4">
          Katteyes <span className="text-black">Admin</span>
        </h1>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                isActive
                  ? 'bg-brand-accent text-white'
                  : 'text-zinc-700 hover:bg-zinc-100',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4 border-t">
          <p className="text-xs text-zinc-500 mb-2">{user?.name}</p>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-md w-full"
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
