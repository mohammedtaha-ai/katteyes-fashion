import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import type { CartItem } from '@/stores/cart-store'

const schema = z.object({
  customer_name: z.string().min(1, 'الاسم مطلوب').max(100),
  customer_email: z
    .string()
    .email('بريد غير صالح')
    .optional()
    .or(z.literal('')),
  customer_address: z.string().min(1, 'العنوان مطلوب').max(1000),
  customer_notes: z.string().max(1000).optional(),
})

export type CheckoutInput = z.infer<typeof schema>

export function CheckoutForm({
  items,
  onSubmit,
  submitting,
}: {
  items: CartItem[]
  onSubmit: (data: CheckoutInput) => void
  submitting: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({ resolver: zodResolver(schema) })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2"
      data-testid="checkout-form"
    >
      <input
        {...register('customer_name')}
        placeholder="الاسم"
        className="border rounded p-2 text-xs"
        data-testid="input-name"
      />
      {errors.customer_name && (
        <span className="text-red-500 text-[10px]">
          {errors.customer_name.message}
        </span>
      )}
      <input
        {...register('customer_email')}
        type="email"
        placeholder="البريد (اختياري إذا عندك حساب)"
        className="border rounded p-2 text-xs"
        data-testid="input-email"
      />
      {errors.customer_email && (
        <span className="text-red-500 text-[10px]">
          {errors.customer_email.message}
        </span>
      )}
      <textarea
        {...register('customer_address')}
        placeholder="العنوان بالتفصيل"
        rows={2}
        className="border rounded p-2 text-xs"
        data-testid="input-address"
      />
      {errors.customer_address && (
        <span className="text-red-500 text-[10px]">
          {errors.customer_address.message}
        </span>
      )}
      <textarea
        {...register('customer_notes')}
        placeholder="ملاحظات إضافية..."
        rows={2}
        className="border rounded p-2 text-xs"
        data-testid="input-notes"
      />
      <Button
        type="submit"
        disabled={submitting || items.length === 0}
        data-testid="submit-order"
      >
        {submitting ? 'جاري الإرسال...' : 'إرسال الطلب عبر الواتساب'}
      </Button>
    </form>
  )
}
