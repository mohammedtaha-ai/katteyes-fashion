import { render, screen } from '@testing-library/react'
import { ProductSlider } from '@/components/product/ProductSlider'
import type { ProductImage } from '@/api/types'

it('renders placeholder when no images', () => {
  render(<ProductSlider images={[]} />)
  const img = screen.getByTestId('product-slider') as HTMLImageElement
  expect(img.src).toContain('data:image/svg+xml')
})

it('renders one dot per image when multiple', () => {
  const images: ProductImage[] = [
    { id: 1, url: '/a.webp', sort_order: 0 },
    { id: 2, url: '/b.webp', sort_order: 1 },
    { id: 3, url: '/c.webp', sort_order: 2 },
  ]
  render(<ProductSlider images={images} />)
  expect(screen.getByTestId('dot-0')).toBeInTheDocument()
  expect(screen.getByTestId('dot-1')).toBeInTheDocument()
  expect(screen.getByTestId('dot-2')).toBeInTheDocument()
})

it('does not render dots when only one image', () => {
  const images: ProductImage[] = [{ id: 1, url: '/a.webp', sort_order: 0 }]
  render(<ProductSlider images={images} />)
  expect(screen.queryByTestId('dot-0')).not.toBeInTheDocument()
})
