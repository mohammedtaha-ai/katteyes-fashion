import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminOrders } from '@/queries/use-orders'
import { formatCurrency } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

export function AdminOrdersPage() {
  const [status, setStatus] = useState<string>('')
  const { data, isLoading } = useAdminOrders(status ? { status: status as any } : {})
  const navigate = useNavigate()

  const orders = data?.data?.data ?? []

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">الطلبات</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded p-1 text-xs"
          data-testid="status-filter"
        >
          <option value="">الكل</option>
          <option value="new">جديد</option>
          <option value="confirmed">مؤكد</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم التسليم</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-zinc-500">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <p className="text-zinc-500">لا توجد طلبات.</p>
      ) : (
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-xs" data-testid="admin-orders-table">
            <thead className="bg-zinc-100 text-zinc-600">
              <tr>
                <th className="p-2 text-right">رقم</th>
                <th className="p-2 text-right">العميل</th>
                <th className="p-2 text-right">المبلغ</th>
                <th className="p-2 text-right">الحالة</th>
                <th className="p-2 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr
                  key={o.order_number}
                  className="border-t cursor-pointer hover:bg-zinc-50"
                  onClick={() => navigate(`/admin/orders/${o.order_number}`)}
                  data-testid={`admin-order-row-${o.order_number}`}
                >
                  <td className="p-2">{o.order_number}</td>
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2">
                    {formatCurrency(o.total, o.currency)}
                  </td>
                  <td className="p-2">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </td>
                  <td className="p-2 text-zinc-500">
                    {new Date(o.created_at).toLocaleDateString('ar-YE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}