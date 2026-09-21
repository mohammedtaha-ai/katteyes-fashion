import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HomePage } from '@/pages/storefront/HomePage'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

function wrap() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
    { wrapper: makeWrapper() },
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    useToastStore.getState().clearToasts()
  })

  it('renders hero, search, and product grid from MSW', async () => {
    wrap()
    expect(screen.getByText(/أزياء عصرية/)).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(await screen.findByTestId('category-story-all')).toBeInTheDocument()
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
})
