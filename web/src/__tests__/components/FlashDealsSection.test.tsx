import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { FlashDealsSection } from '@/components/storefront/FlashDealsSection'
import type { Product } from '@/api/types'

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'فستان سهرة ملكي مرصع بالكرستال',
    slug: 'royal-evening-dress',
    description: 'فستان سهرة فاخر',
    price: 35000,
    currency: 'YER',
    is_active: true,
    colors: ['أسود', 'ذهبي'],
    sizes: ['S', 'M', 'L'],
    images: [{ id: 1, url: 'https://images.unsplash.com/dress.jpg', sort_order: 0 }],
  },
]

describe('FlashDealsSection', () => {
  it('renders countdown clock, title, and products', () => {
    render(
      <MemoryRouter>
        <FlashDealsSection products={mockProducts} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('flash-deals-section')).toBeInTheDocument()
    expect(screen.getByText('تخفيضات اليوم الخاطفة')).toBeInTheDocument()
    expect(screen.getByText('ينتهي خلال:')).toBeInTheDocument()
    expect(screen.getByText('ساعة')).toBeInTheDocument()
    expect(screen.getByText('دقيقة')).toBeInTheDocument()
    expect(screen.getByText('ثانية')).toBeInTheDocument()
    expect(screen.getByText('فستان سهرة ملكي مرصع بالكرستال')).toBeInTheDocument()
  })

  it('returns null when product list is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <FlashDealsSection products={[]} />
      </MemoryRouter>,
    )

    expect(container.firstChild).toBeNull()
  })
})
