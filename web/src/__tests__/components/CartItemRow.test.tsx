import { render, screen, fireEvent } from '@testing-library/react'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { useCartStore } from '@/stores/cart-store'

beforeEach(() => {
  useCartStore.setState({ items: [] } as any)
})

it('renders subtotal and removes row on trash click', () => {
  useCartStore.getState().addItem({
    productId: 1,
    productName: 'فستان',
    price: 3500,
    currency: 'YER',
    img: '',
    color: 'أحمر',
    size: 'M',
  })
  render(<CartItemRow index={0} />)
  const subtotal = screen.getByTestId('row-subtotal')
  expect(subtotal.textContent).toContain('YER')
  fireEvent.click(screen.getByTestId('row-remove'))
  expect(useCartStore.getState().items).toHaveLength(0)
})

it('returns null when item does not exist', () => {
  const { container } = render(<CartItemRow index={0} />)
  expect(container.firstChild).toBeNull()
})
