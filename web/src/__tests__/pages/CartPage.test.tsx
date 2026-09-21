import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartPage } from '@/pages/storefront/CartPage'
import { useCartStore } from '@/stores/cart-store'

beforeEach(() => {
  useCartStore.setState({ items: [] } as any)
})

it('shows empty state when no items', () => {
  render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  )
  expect(screen.getByTestId('empty-cart')).toBeInTheDocument()
})

it('renders one row per cart line', () => {
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
      <CartPage />
    </MemoryRouter>,
  )
  expect(screen.getByTestId('cart-row-1')).toBeInTheDocument()
  expect(screen.getByTestId('cart-row-2')).toBeInTheDocument()
})
