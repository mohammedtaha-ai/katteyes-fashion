import { describe, it, expect, beforeEach } from 'vitest'
import { useWishlistStore } from '@/stores/wishlist-store'

describe('useWishlistStore', () => {
  beforeEach(() => {
    useWishlistStore.getState().clear()
  })

  it('starts with empty wishlist', () => {
    expect(useWishlistStore.getState().items).toEqual([])
    expect(useWishlistStore.getState().count()).toBe(0)
  })

  it('toggles product in and out of wishlist', () => {
    const added = useWishlistStore.getState().toggleWishlist(101)
    expect(added).toBe(true)
    expect(useWishlistStore.getState().isWishlisted(101)).toBe(true)
    expect(useWishlistStore.getState().count()).toBe(1)

    const removed = useWishlistStore.getState().toggleWishlist(101)
    expect(removed).toBe(false)
    expect(useWishlistStore.getState().isWishlisted(101)).toBe(false)
    expect(useWishlistStore.getState().count()).toBe(0)
  })

  it('clears all wishlisted items', () => {
    useWishlistStore.getState().toggleWishlist(1)
    useWishlistStore.getState().toggleWishlist(2)
    expect(useWishlistStore.getState().count()).toBe(2)

    useWishlistStore.getState().clear()
    expect(useWishlistStore.getState().count()).toBe(0)
  })
})
