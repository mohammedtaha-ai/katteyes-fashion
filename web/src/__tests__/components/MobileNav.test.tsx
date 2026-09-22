import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { MobileNav } from '@/components/layout/MobileNav'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'

describe('MobileNav', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    useWishlistStore.getState().clear()
  })

  it('renders all 5 navigation buttons (Home, Categories, Wishlist, Cart, Orders)', () => {
    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument()
    expect(screen.getByText('الرئيسية')).toBeInTheDocument()
    expect(screen.getByText('الأقسام')).toBeInTheDocument()
    expect(screen.getByText('المفضلة')).toBeInTheDocument()
    expect(screen.getByText('السلة')).toBeInTheDocument()
    expect(screen.getByText('طلباتي')).toBeInTheDocument()
  })

  it('displays badge count when items exist in cart or wishlist', () => {
    useCartStore.getState().addItem({
      productId: 1,
      productName: 'فستان مخمل',
      price: 15000,
      currency: 'YER',
      img: '',
      color: 'أسود',
      size: 'M',
    })
    useWishlistStore.getState().toggleWishlist(1)

    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('1')).toHaveLength(2)
  })
})
