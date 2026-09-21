import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import type { CartItem } from '@/stores/cart-store'

const sampleItem: CartItem = {
  productId: 1,
  productName: 'فستان',
  price: 3500,
  currency: 'YER',
  img: '',
  color: 'أحمر',
  size: 'M',
  quantity: 1,
}

it('shows "الاسم مطلوب" when name missing on submit', async () => {
  render(
    <CheckoutForm
      items={[sampleItem]}
      onSubmit={() => {}}
      submitting={false}
    />,
  )
  fireEvent.click(screen.getByTestId('submit-order'))
  await waitFor(() =>
    expect(screen.getByText(/الاسم مطلوب/)).toBeInTheDocument(),
  )
})

it('shows "العنوان مطلوب" when address missing', async () => {
  render(
    <CheckoutForm
      items={[sampleItem]}
      onSubmit={() => {}}
      submitting={false}
    />,
  )
  fireEvent.input(screen.getByTestId('input-name'), {
    target: { value: 'أحمد' },
  })
  fireEvent.click(screen.getByTestId('submit-order'))
  await waitFor(() =>
    expect(screen.getByText(/العنوان مطلوب/)).toBeInTheDocument(),
  )
})

it('submits valid form data', async () => {
  const onSubmit = vi.fn()
  render(
    <CheckoutForm
      items={[sampleItem]}
      onSubmit={onSubmit}
      submitting={false}
    />,
  )
  fireEvent.input(screen.getByTestId('input-name'), {
    target: { value: 'أحمد' },
  })
  fireEvent.input(screen.getByTestId('input-address'), {
    target: { value: 'صنعاء' },
  })
  fireEvent.click(screen.getByTestId('submit-order'))
  await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    customer_name: 'أحمد',
    customer_address: 'صنعاء',
  })
})

it('disables submit while submitting', () => {
  render(
    <CheckoutForm
      items={[sampleItem]}
      onSubmit={() => {}}
      submitting={true}
    />,
  )
  expect(
    (screen.getByTestId('submit-order') as HTMLButtonElement).disabled,
  ).toBe(true)
})

it('disables submit when cart is empty', () => {
  render(<CheckoutForm items={[]} onSubmit={() => {}} submitting={false} />)
  expect(
    (screen.getByTestId('submit-order') as HTMLButtonElement).disabled,
  ).toBe(true)
})
