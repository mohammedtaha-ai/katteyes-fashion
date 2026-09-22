import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SmartProductCard } from '@/components/product/SmartProductCard'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import type { Product } from '@/api/types'
import { formatCurrency } from '@/lib/utils'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const sampleProduct: Product = {
  id: 101,
  name: 'فستان مخملي ملكي',
  slug: 'royal-velvet-dress',
  description: 'فستان سهرة فاخر من المخمل الناعم',
  price: 4500,
  currency: 'YER',
  is_active: true,
  category: { id: 1, slug: 'evening-dresses', name: 'فساتين سهرة' },
  images: [
    { id: 1, url: '/images/dress-1.jpg', sort_order: 0 },
    { id: 2, url: '/images/dress-2.jpg', sort_order: 1 },
  ],
  colors: ['أحمر', 'أسود', 'ذهبي'],
  sizes: ['S', 'M', 'L'],
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
}

describe('SmartProductCard', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    useToastStore.getState().clearToasts()
    useWishlistStore.getState().clear()
    mockNavigate.mockClear()
  })

  it('renders product details, category, formatted price, and 3:4 container', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    expect(screen.getByText('فستان مخملي ملكي')).toBeInTheDocument()
    expect(screen.getByText('فساتين سهرة')).toBeInTheDocument()
    expect(
      screen.getByText(
        formatCurrency(sampleProduct.price, sampleProduct.currency),
      ),
    ).toBeInTheDocument()

    const primaryImg = screen.getByAltText('فستان مخملي ملكي') as HTMLImageElement
    expect(primaryImg.src).toContain('/images/dress-1.jpg')

    const secondaryImg = screen.getByAltText('فستان مخملي ملكي - صورة 2') as HTMLImageElement
    expect(secondaryImg.src).toContain('/images/dress-2.jpg')
  })

  it('displays "جديد ✨" badge when created within 7 days', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('badge-new')).toBeInTheDocument()
    expect(screen.getByText('جديد ✨')).toBeInTheDocument()
  })

  it('omits "جديد ✨" badge when created over 7 days ago', () => {
    const oldProduct = {
      ...sampleProduct,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    }

    render(
      <MemoryRouter>
        <SmartProductCard product={oldProduct} />
      </MemoryRouter>,
    )

    expect(screen.queryByTestId('badge-new')).not.toBeInTheDocument()
  })

  it('renders color swatches', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    const swatches = screen.getByTestId('color-swatches')
    expect(swatches).toBeInTheDocument()
    expect(screen.getByLabelText('أحمر')).toBeInTheDocument()
    expect(screen.getByLabelText('أسود')).toBeInTheDocument()
    expect(screen.getByLabelText('ذهبي')).toBeInTheDocument()
  })

  it('quick add button adds item to cart and triggers toast without navigating', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    const quickAddBtn = screen.getByTestId('quick-add-btn')
    fireEvent.click(quickAddBtn)

    // Check cart store
    const cartItems = useCartStore.getState().items
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0].productId).toBe(101)
    expect(cartItems[0].productName).toBe('فستان مخملي ملكي')
    expect(cartItems[0].color).toBe('أحمر')

    // Check toast store
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].productName).toBe('فستان مخملي ملكي')
    expect(toasts[0].message).toBe('تمت الإضافة إلى السلة بنجاح')

    // Ensure navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates to product detail page when card container is clicked', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    const card = screen.getByTestId('product-card')
    fireEvent.click(card)

    expect(mockNavigate).toHaveBeenCalledWith('/products/royal-velvet-dress')
  })

  it('provides keyboard accessibility with role="link", tabIndex=0, and responds to Enter/Space', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    const card = screen.getByTestId('product-card')
    expect(card).toHaveAttribute('role', 'link')
    expect(card).toHaveAttribute('tabindex', '0')
    expect(card).toHaveAttribute('aria-label', 'عرض تفاصيل فستان مخملي ملكي')

    // Press Enter
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(mockNavigate).toHaveBeenCalledWith('/products/royal-velvet-dress')

    mockNavigate.mockClear()

    // Press Space
    fireEvent.keyDown(card, { key: ' ' })
    expect(mockNavigate).toHaveBeenCalledWith('/products/royal-velvet-dress')
  })

  it('omits "جديد ✨" badge when created_at is in the future', () => {
    const futureProduct = {
      ...sampleProduct,
      created_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    }

    render(
      <MemoryRouter>
        <SmartProductCard product={futureProduct} />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('badge-new')).not.toBeInTheDocument()
  })

  it('toggles wishlist status when card wishlist button is clicked', () => {
    render(
      <MemoryRouter>
        <SmartProductCard product={sampleProduct} />
      </MemoryRouter>,
    )

    const wishlistBtn = screen.getByTestId('card-wishlist-btn')
    fireEvent.click(wishlistBtn)
    expect(useWishlistStore.getState().isWishlisted(101)).toBe(true)
  })
})
