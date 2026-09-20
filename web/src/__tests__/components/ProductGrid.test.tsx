import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { Product } from '@/api/types'

const sample: Product = {
  id: 1,
  name: 'فستان',
  slug: 'a',
  description: null,
  price: 100,
  currency: 'YER',
  is_active: true,
  images: [],
  colors: [],
  sizes: [],
}

it('renders empty state when no products', () => {
  render(
    <MemoryRouter>
      <ProductGrid products={[]} />
    </MemoryRouter>,
  )
  expect(screen.getByText('لا توجد منتجات')).toBeInTheDocument()
})

it('renders a card per product', () => {
  render(
    <MemoryRouter>
      <ProductGrid products={[sample, { ...sample, id: 2, slug: 'b' }]} />
    </MemoryRouter>,
  )
  expect(screen.getAllByTestId('product-card')).toHaveLength(2)
})
