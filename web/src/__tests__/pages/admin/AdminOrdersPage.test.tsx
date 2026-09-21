import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminOrdersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('renders orders table from MSW', async () => {
  wrap()
  await waitFor(() =>
    expect(screen.getByTestId('admin-orders-table')).toBeInTheDocument(),
  )
  expect(screen.getByTestId('status-filter')).toBeInTheDocument()
})