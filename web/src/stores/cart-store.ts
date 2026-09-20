import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: number
  productName: string
  price: number
  currency: string
  img: string
  color: string
  size: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (i: Omit<CartItem, 'quantity'>) => void
  updateQty: (idx: number, delta: number) => void
  removeItem: (idx: number) => void
  clear: () => void
  totalPrice: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (i) =>
        set((s) => {
          const ex = s.items.findIndex(
            (x) =>
              x.productId === i.productId &&
              x.color === i.color &&
              x.size === i.size,
          )
          if (ex >= 0) {
            const items = [...s.items]
            items[ex] = { ...items[ex], quantity: items[ex].quantity + 1 }
            return { items }
          }
          return { items: [...s.items, { ...i, quantity: 1 }] }
        }),
      updateQty: (idx, delta) =>
        set((s) => {
          const items = [...s.items]
          items[idx] = { ...items[idx], quantity: items[idx].quantity + delta }
          if (items[idx].quantity <= 0) items.splice(idx, 1)
          return { items }
        }),
      removeItem: (idx) =>
        set((s) => ({ items: s.items.filter((_, i) => i !== idx) })),
      clear: () => set({ items: [] }),
      totalPrice: () =>
        get().items.reduce((sum, it) => sum + it.price * it.quantity, 0),
      totalItems: () =>
        get().items.reduce((sum, it) => sum + it.quantity, 0),
    }),
    { name: 'katteyes_cart' },
  ),
)