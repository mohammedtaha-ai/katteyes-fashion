import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/api/types'

const sample: Product = {
  id: 1,
  name: 'فستان أحمر',
  slug: 'red-dress',
  description: null,
  price: 3500,
  currency: 'YER',
  is_active: true,
  category: { id: 1, slug: 'fashion', name: 'فساتين' },
  images: [{ id: 1, url: '/dress.webp', sort_order: 0 }],
  colors: ['أحمر'],
  sizes: ['M'],
}

it('renders product name, price, category', () => {
  render(
    <MemoryRouter>
      <ProductCard product={sample} />
    </MemoryRouter>,
  )
  expect(screen.getByText('فستان أحمر')).toBeInTheDocument()
  expect(screen.getByText(/YER/)).toBeInTheDocument()
  expect(screen.getByText('فساتين')).toBeInTheDocument()
})

it('falls back to placeholder when no images', () => {
  render(
    <MemoryRouter>
      <ProductCard product={{ ...sample, images: [] }} />
    </MemoryRouter>,
  )
  const img = screen.getByAltText('فستان أحمر') as HTMLImageElement
  expect(img.src).toContain('data:image/svg+xml')
})
