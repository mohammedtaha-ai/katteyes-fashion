import { useNavigate } from 'react-router-dom'
import { ShoppingBag, X } from 'lucide-react'
import { useToastStore } from '@/stores/toast-store'

export function ToastNotification() {
  const navigate = useNavigate()
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <aside
      aria-live="polite"
      aria-label="إشعارات المتجر"
      className="fixed bottom-4 start-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border border-zinc-200/80 shadow-xl rounded-2xl p-3 flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          role="status"
        >
          {toast.thumbnail ? (
            <img
              src={toast.thumbnail}
              alt={toast.productName || 'صورة المنتج'}
              className="w-12 h-12 object-cover rounded-xl border border-zinc-100 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center text-brand-accent flex-shrink-0">
              <ShoppingBag size={20} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {toast.productName ? (
              <>
                <p className="text-sm font-bold text-zinc-900 truncate">
                  {toast.productName}
                </p>
                <p className="text-xs text-zinc-500 truncate">{toast.message}</p>
              </>
            ) : (
              <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                {toast.message}
              </p>
            )}
            <button
              onClick={() => {
                navigate('/cart')
                removeToast(toast.id)
              }}
              className="text-xs font-semibold text-brand-accent hover:text-brand-accent-dark hover:underline mt-1 inline-flex items-center gap-1 transition-colors"
            >
              عرض السلة ←
            </button>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors flex-shrink-0"
            aria-label="إغلاق"
            title="إغلاق"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </aside>
  )
}
