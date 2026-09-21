import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartSummary } from '@/components/cart/CartSummary'
import { useCartStore } from '@/stores/cart-store'

beforeEach(() => {
  useCartStore.setState({ items: [] } as any)
})

it('shows total and item count', () => {
  useCartStore.getState().addItem({
    productId: 1,
    productName: 'فستان',
    price: 3500,
    currency: 'YER',
    img: '',
    color: 'أحمر',
    size: 'M',
  })
  useCartStore.getState().addItem({
    productId: 2,
    productName: 'حذاء',
    price: 1500,
    currency: 'YER',
    img: '',
    color: 'أسود',
    size: '42',
  })
  render(
    <MemoryRouter>
      <CartSummary />
    </MemoryRouter>,
  )
  const total = screen.getByTestId('cart-total')
  expect(total.textContent).toMatch(/YER/)
  expect(total.textContent).toMatch(/2 قطع/)
})

it('disables checkout button when cart empty', () => {
  render(
    <MemoryRouter>
      <CartSummary />
    </MemoryRouter>,
  )
  const btn = screen.getByTestId('goto-checkout') as HTMLButtonElement
  expect(btn.disabled).toBe(true)
})
