import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MyOrdersPage } from '@/pages/account/MyOrdersPage'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null } as any)
})

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <MyOrdersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('renders the empty state when no orders', async () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'customer' },
  })
  const { http, HttpResponse } = await import('msw')
  const { server } = await import('@/__tests__/mocks/server')
  server.use(
    http.get('*/api/v1/my/orders', () =>
      HttpResponse.json({ data: [] }),
    ),
  )
  wrap()
  await waitFor(() =>
    expect(screen.getByTestId('empty-orders')).toBeInTheDocument(),
  )
})

it('renders order rows when MSW returns orders', async () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'customer' },
  })
  wrap()
  await waitFor(() =>
    expect(screen.getByTestId('orders-list')).toBeInTheDocument(),
  )
  // MSW default handler returns sampleOrder with order_number 'ORD-001'
  expect(screen.getByTestId('order-row-ORD-001')).toBeInTheDocument()
  expect(screen.getByText('ORD-001')).toBeInTheDocument()
  // Total renders currency code (Arabic-Indic digits, so match /YER/)
  expect(screen.getByText(/YER/)).toBeInTheDocument()
})
