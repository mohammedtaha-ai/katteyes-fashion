import { useParams } from 'react-router-dom'
export function OrderConfirmedPage() {
  const { orderNumber } = useParams()
  return <h1 className="p-8 text-2xl">تم تأكيد الطلب {orderNumber}</h1>
}