import { useCartStore } from '@/stores/cart-store'

beforeEach(() => {
  // @ts-ignore — reset between tests
  useCartStore.setState({ items: [] } as any)
})

const sampleItem = {
  productId: 1,
  productName: 'فستان',
  price: 3500,
  currency: 'YER',
  img: '/x.webp',
  color: 'أحمر',
  size: 'M',
}

it('addItem adds new item with quantity 1', () => {
  useCartStore.getState().addItem(sampleItem)
  expect(useCartStore.getState().items).toHaveLength(1)
  expect(useCartStore.getState().items[0].quantity).toBe(1)
})

it('addItem increments quantity for same product+color+size', () => {
  useCartStore.getState().addItem(sampleItem)
  useCartStore.getState().addItem(sampleItem)
  expect(useCartStore.getState().items).toHaveLength(1)
  expect(useCartStore.getState().items[0].quantity).toBe(2)
})

it('addItem adds separate line for different size', () => {
  useCartStore.getState().addItem(sampleItem)
  useCartStore.getState().addItem({ ...sampleItem, size: 'L' })
  expect(useCartStore.getState().items).toHaveLength(2)
})

it('updateQty increments then removes at 0', () => {
  useCartStore.getState().addItem(sampleItem)
  useCartStore.getState().updateQty(0, 1) // +1 -> 2
  expect(useCartStore.getState().items[0].quantity).toBe(2)
  useCartStore.getState().updateQty(0, -2) // -2 -> 0 -> removed
  expect(useCartStore.getState().items).toHaveLength(0)
})

it('removeItem removes specific line', () => {
  useCartStore.getState().addItem(sampleItem)
  useCartStore.getState().addItem({ ...sampleItem, size: 'L' })
  useCartStore.getState().removeItem(0)
  expect(useCartStore.getState().items).toHaveLength(1)
  expect(useCartStore.getState().items[0].size).toBe('L')
})

it('totalPrice + totalItems computed correctly', () => {
  useCartStore.getState().addItem(sampleItem) // 1 x 3500
  // distinct line (different size -> productId+color+size no longer matches)
  useCartStore.getState().addItem({ ...sampleItem, price: 1750, size: 'L' }) // 1 x 1750
  expect(useCartStore.getState().totalPrice()).toBe(5250)
  expect(useCartStore.getState().totalItems()).toBe(2)
})

it('clear removes all items', () => {
  useCartStore.getState().addItem(sampleItem)
  useCartStore.getState().clear()
  expect(useCartStore.getState().items).toHaveLength(0)
})