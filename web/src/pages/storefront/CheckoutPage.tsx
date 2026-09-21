import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { ordersApi } from '@/api/orders.api'
import { CheckoutForm, type CheckoutInput } from '@/components/checkout/CheckoutForm'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const user = useAuthStore((s) => s.user)
  const clearCart = useCartStore((s) => s.clear)

  useEffect(() => {
    if (items.length === 0) navigate('/cart')
  }, [items, navigate])

  const mutation = useMutation({
    mutationFn: (data: CheckoutInput) =>
      ordersApi.create({
        items: items.map((it) => ({
          product_id: it.productId,
          color: it.color,
          size: it.size,
          quantity: it.quantity,
        })),
        customer_name: data.customer_name,
        customer_email: data.customer_email || user?.email,
        customer_address: data.customer_address,
        customer_notes: data.customer_notes,
      }),
    onSuccess: (res) => {
      window.open(res.data.data.whatsapp_link, '_blank', 'noopener,noreferrer')
      clearCart()
      navigate(`/order-confirmed/${res.data.data.order_number}`)
    },
  })

  return (
    <main className="container max-w-md mx-auto p-2">
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="font-bold mb-3">معلومات الشحن</h2>
        <CheckoutForm
          items={items}
          submitting={mutation.isPending}
          onSubmit={(d) => mutation.mutate(d)}
        />
        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2" data-testid="checkout-error">
            {(mutation.error as any)?.response?.data?.message ?? 'خطأ في الإرسال'}
          </p>
        )}
      </div>
    </main>
  )
}
