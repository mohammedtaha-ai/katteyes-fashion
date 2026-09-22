import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: number[]
  toggleWishlist: (productId: number) => boolean
  isWishlisted: (productId: number) => boolean
  clear: () => void
  count: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (productId: number) => {
        const current = get().items
        const exists = current.includes(productId)
        if (exists) {
          set({ items: current.filter((id) => id !== productId) })
          return false
        } else {
          set({ items: [...current, productId] })
          return true
        }
      },
      isWishlisted: (productId: number) => {
        return get().items.includes(productId)
      },
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: 'katteyes_wishlist' },
  ),
)
