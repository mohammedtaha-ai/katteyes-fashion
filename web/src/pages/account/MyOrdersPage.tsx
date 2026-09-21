import { useMyOrders } from '@/queries/use-orders'
import { formatCurrency } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

export function MyOrdersPage() {
  const { data, isLoading } = useMyOrders()
  const orders = data?.data?.data ?? []

  return (
    <main className="container max-w-3xl mx-auto p-2">
      <h1 className="text-lg font-black mb-3">طلباتي</h1>
      {isLoading ? (
        <p className="text-center text-zinc-500 py-6">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <p
          className="text-center text-zinc-500 py-6 bg-white rounded-md"
          data-testid="empty-orders"
        >
          لا توجد طلبات حتى الآن
        </p>
      ) : (
        <div className="flex flex-col gap-2" data-testid="orders-list">
          {orders.map((order) => (
            <div
              key={order.order_number}
              className="bg-white rounded-md shadow-sm p-4"
              data-testid={`order-row-${order.order_number}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs text-zinc-500">رقم الطلب</div>
                  <div className="text-sm font-bold">{order.order_number}</div>
                </div>
                <span className="text-xs bg-zinc-100 px-2 py-1 rounded">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-600">
                <span>
                  {new Date(order.created_at).toLocaleDateString('ar-YE')}
                </span>
                <span className="font-bold text-brand-accent">
                  {formatCurrency(order.total, order.currency)}
                </span>
              </div>
              {order.whatsapp_link && (
                <a
                  href={order.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-accent text-xs mt-2 inline-block"
                >
                  إعادة فتح في واتساب
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
