import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { ProductDetailPage } from '@/pages/storefront/ProductDetailPage'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

function wrap(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<div>CART_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: makeWrapper() },
  )
}

it('renders product name + price + slider + options from MSW', async () => {
  wrap('/products/red-dress')
  await waitFor(() =>
    expect(screen.getByText('فستان أحمر')).toBeInTheDocument(),
  )
  expect(screen.getByTestId('detail-price')).toBeInTheDocument()
  expect(screen.getByTestId('product-slider')).toBeInTheDocument()
  expect(screen.getByTestId('opt-أحمر')).toBeInTheDocument()
  expect(screen.getByTestId('opt-أحمر').className).toMatch(/bg-black/)
})

it('shows fallback message when product not found', async () => {
  server.use(
    http.get('*/api/v1/products/:slug', () =>
      new HttpResponse(null, { status: 404 }),
    ),
  )
  wrap('/products/does-not-exist')
  await waitFor(() =>
    expect(screen.getByText('المنتج غير موجود')).toBeInTheDocument(),
  )
})
