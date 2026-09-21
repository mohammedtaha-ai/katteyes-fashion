import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrder } from '@/queries/use-orders'

export function OrderConfirmedPage() {
  const { orderNumber } = useParams()
  const { data } = useOrder(orderNumber ?? '')

  useEffect(() => {
    const link = data?.data?.data?.whatsapp_link
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }, [data])

  return (
    <main className="container max-w-md mx-auto p-6 text-center bg-white rounded-md shadow-sm mt-6">
      <h1 className="text-xl font-black mb-2">تم إرسال الطلب ✅</h1>
      <p className="text-sm text-zinc-600">
        رقم الطلب: <b data-testid="order-number">{orderNumber}</b>
      </p>
      <p className="text-xs text-zinc-500 mt-2">
        سيتم فتح تطبيق واتساب تلقائياً لإكمال الطلب.
      </p>
      <Link to="/" className="text-brand-accent text-xs mt-4 inline-block">
        العودة للمتجر
      </Link>
    </main>
  )
}
