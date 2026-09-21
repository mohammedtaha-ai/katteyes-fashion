import { useParams, useNavigate } from 'react-router-dom'
import { useAdminOrder, useUpdateOrderStatus } from '@/queries/use-orders'
import { formatCurrency } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'new', label: 'جديد' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' },
]

export function AdminOrderDetailPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useAdminOrder(orderNumber ?? '')
  const updateStatus = useUpdateOrderStatus()

  const order = data?.data?.data

  const onUpdateStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!order) return
    updateStatus.mutate({
      orderNumber: order.order_number,
      payload: { status: e.target.value as any },
    })
  }

  if (isLoading) return <p className="text-zinc-500">جاري التحميل...</p>
  if (!order) return <p className="text-zinc-500">الطلب غير موجود</p>

  return (
    <div>
      <button
        onClick={() => navigate('/admin/orders')}
        className="text-xs text-zinc-500 mb-3"
      >
        ← العودة للطلبات
      </button>

      <div className="bg-white rounded-md shadow-sm p-4 mb-3">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-zinc-500">رقم الطلب</div>
            <div className="text-base font-bold">{order.order_number}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {new Date(order.created_at).toLocaleString('ar-YE')}
            </div>
          </div>
          <select
            value={order.status}
            onChange={onUpdateStatus}
            disabled={updateStatus.isPending}
            className="border rounded p-1 text-xs"
            data-testid="status-select"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs grid grid-cols-2 gap-2 border-t pt-3">
          <div>
            <div className="text-zinc-500">الاسم</div>
            <div>{order.customer_name}</div>
          </div>
          <div>
            <div className="text-zinc-500">البريد</div>
            <div>{order.customer_email ?? '-'}</div>
          </div>
          <div className="col-span-2">
            <div className="text-zinc-500">العنوان</div>
            <div>{order.customer_address}</div>
          </div>
          {order.customer_notes && (
            <div className="col-span-2">
              <div className="text-zinc-500">ملاحظات</div>
              <div>{order.customer_notes}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-sm font-bold mb-2">المنتجات</h2>
        <table className="w-full text-xs">
          <thead className="text-zinc-500 border-b">
            <tr>
              <th className="p-1 text-right">المنتج</th>
              <th className="p-1 text-right">اللون</th>
              <th className="p-1 text-right">المقاس</th>
              <th className="p-1 text-right">الكمية</th>
              <th className="p-1 text-right">السعر</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="p-1">{it.product_name}</td>
                <td className="p-1">{it.color}</td>
                <td className="p-1">{it.size}</td>
                <td className="p-1">{it.quantity}</td>
                <td className="p-1">{formatCurrency(it.subtotal, order.currency)}</td>
              </tr>
            ))}
            <tr className="border-t font-bold">
              <td className="p-1" colSpan={4}>المجموع</td>
              <td className="p-1">{formatCurrency(order.total, order.currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}