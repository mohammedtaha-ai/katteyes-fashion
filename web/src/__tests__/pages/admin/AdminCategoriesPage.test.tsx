import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('renders new-category input + add button', () => {
  wrap()
  expect(screen.getByTestId('new-category-name')).toBeInTheDocument()
  expect(screen.getByTestId('add-category')).toBeInTheDocument()
})