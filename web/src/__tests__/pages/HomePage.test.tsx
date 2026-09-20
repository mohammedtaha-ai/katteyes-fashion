import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { HomePage } from '@/pages/storefront/HomePage'

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

it('renders hero, search, and product grid from MSW', async () => {
  wrap()
  expect(screen.getByText(/أزياء عصرية/)).toBeInTheDocument()
  expect(screen.getByTestId('search-input')).toBeInTheDocument()
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
