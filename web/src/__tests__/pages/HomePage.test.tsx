import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HomePage } from '@/pages/storefront/HomePage'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'
import { useWishlistStore } from '@/stores/wishlist-store'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

function wrap(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <HomePage />
    </MemoryRouter>,
    { wrapper: makeWrapper() },
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    useToastStore.getState().clearToasts()
    useWishlistStore.getState().clear()
  })

  it('renders hero, search, brand trust features, and product grid from MSW', async () => {
    wrap()
    expect(screen.getByText(/أزياء عصرية/)).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(await screen.findByTestId('category-story-all')).toBeInTheDocument()
    expect(screen.getByTestId('brand-trust-features')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter-section')).toBeInTheDocument()

    // MSW returns one product
    await waitFor(() =>
      expect(screen.getByText('فستان أحمر')).toBeInTheDocument(),
    )
  })

  it('debounced search filters products', async () => {
    wrap()
    const input = screen.getByTestId('search-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'red-dress' } })
    // After debounce (~300ms), the MSW handler filters and still returns the product
    await waitFor(
      () => expect(screen.getByText('فستان أحمر')).toBeInTheDocument(),
      { timeout: 1000 },
    )
  })

  it('filters by category when clicking category story circle', async () => {
    wrap()
    const fashionStoryBtn = await screen.findByTestId('category-story-fashion')
    fireEvent.click(fashionStoryBtn)

    await waitFor(() => {
      expect(screen.getByText('فستان أحمر')).toBeInTheDocument()
    })
  })

  it('allows quick adding a product to the cart from the home page', async () => {
    wrap()
    await waitFor(() => {
      expect(screen.getByText('فستان أحمر')).toBeInTheDocument()
    })

    const quickAddBtn = screen.getByTestId('quick-add-btn')
    fireEvent.click(quickAddBtn)

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it('toggles wishlist filter and shows empty state when wishlist is empty', async () => {
    wrap()
    await waitFor(() => {
      expect(screen.getByText('فستان أحمر')).toBeInTheDocument()
    })

    const wishlistFilterBtn = screen.getByTestId('wishlist-filter-toggle')
    fireEvent.click(wishlistFilterBtn)

    await waitFor(() => {
      expect(screen.getByTestId('empty-wishlist')).toBeInTheDocument()
    })
  })

  it('shows wishlisted products when wishlist filter is active and item is saved', async () => {
    // Save product id 1 to wishlist
    useWishlistStore.getState().toggleWishlist(1)

    wrap(['/?wishlist=1'])
    await waitFor(() => {
      expect(screen.getByText('فستان أحمر')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('empty-wishlist')).not.toBeInTheDocument()
  })

  it('submits VIP newsletter signup and reveals coupon', async () => {
    wrap()
    const input = screen.getByPlaceholderText(/أدخلي رقم الواتساب أو بريدكِ/)
    fireEvent.change(input, { target: { value: 'vip@katteyes.com' } })

    const submitBtn = screen.getByText('انضمام وتفعيل الخصم')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-success')).toBeInTheDocument()
      expect(screen.getByText(/VIP10/)).toBeInTheDocument()
    })
  })

  it('changes sorting option via sort select', async () => {
    wrap()
    const sortSelect = screen.getByTestId('sort-select') as HTMLSelectElement
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } })
    expect(sortSelect.value).toBe('price_asc')

    fireEvent.change(sortSelect, { target: { value: 'price_desc' } })
    expect(sortSelect.value).toBe('price_desc')
  })
})
