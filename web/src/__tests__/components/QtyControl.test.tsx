import { render, screen, fireEvent } from '@testing-library/react'
import { QtyControl } from '@/components/cart/QtyControl'
import { useCartStore } from '@/stores/cart-store'

beforeEach(() => {
  useCartStore.setState({ items: [] } as any)
})

it('increments qty on plus click', () => {
  useCartStore.getState().addItem({
    productId: 1,
    productName: 'فستان',
    price: 100,
    currency: 'YER',
    img: '',
    color: 'أحمر',
    size: 'M',
  })
  render(<QtyControl index={0} />)
  fireEvent.click(screen.getByTestId('qty-plus'))
  expect(useCartStore.getState().items[0].quantity).toBe(2)
})

it('decrements qty on minus click', () => {
  useCartStore.getState().addItem({
    productId: 1,
    productName: 'فستان',
    price: 100,
    currency: 'YER',
    img: '',
    color: 'أحمر',
    size: 'M',
  })
  useCartStore.getState().updateQty(0, 1) // qty=2
  render(<QtyControl index={0} />)
  fireEvent.click(screen.getByTestId('qty-minus'))
  expect(useCartStore.getState().items[0].quantity).toBe(1)
})

it('removes item when qty hits 0', () => {
  useCartStore.getState().addItem({
    productId: 1,
    productName: 'فستان',
    price: 100,
    currency: 'YER',
    img: '',
    color: 'أحمر',
    size: 'M',
  })
  render(<QtyControl index={0} />)
  fireEvent.click(screen.getByTestId('qty-minus'))
  expect(useCartStore.getState().items).toHaveLength(0)
})