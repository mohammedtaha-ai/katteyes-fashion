import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { ProductGallery } from '@/components/product/ProductGallery'
import { useWishlistStore } from '@/stores/wishlist-store'

const sampleImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1', sort_order: 0 },
  { id: 2, url: 'https://images.unsplash.com/photo-2', sort_order: 1 },
]

describe('ProductGallery', () => {
  beforeEach(() => {
    useWishlistStore.getState().clear()
  })

  it('renders main image, thumbnails, and handles image selection', () => {
    render(
      <ProductGallery
        productId={10}
        productName="فستان ملكي"
        images={sampleImages}
      />,
    )

    const mainImg = screen.getByTestId('main-gallery-image')
    expect(mainImg).toHaveAttribute('src', sampleImages[0].url)

    const thumb1 = screen.getByTestId('gallery-thumb-1')
    fireEvent.click(thumb1)

    expect(mainImg).toHaveAttribute('src', sampleImages[1].url)
  })

  it('toggles wishlist status on heart click', () => {
    render(
      <ProductGallery
        productId={10}
        productName="فستان ملكي"
        images={sampleImages}
      />,
    )

    const heartBtn = screen.getByTestId('gallery-wishlist-btn')
    fireEvent.click(heartBtn)

    expect(useWishlistStore.getState().isWishlisted(10)).toBe(true)
  })
})
