import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('renders products table from MSW', async () => {
  wrap()
  await waitFor(() =>
    expect(screen.getByTestId('admin-products-table')).toBeInTheDocument(),
  )
  // MSW default returns the sample product 'فستان أحمر'
  expect(screen.getByText('فستان أحمر')).toBeInTheDocument()
})

it('renders add button', () => {
  wrap()
  expect(screen.getByTestId('add-product')).toBeInTheDocument()
})