import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { CategoryTabs } from '@/components/layout/CategoryTabs'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

it('renders "All" tab + one button per category', async () => {
  render(<CategoryTabs active="" onChange={() => {}} />, {
    wrapper: makeWrapper(),
  })
  expect(await screen.findByText('الكل')).toBeInTheDocument()
  // Wait for MSW category to appear (more than the All button)
  await waitFor(() => {
    const cats = screen.getAllByRole('button')
    expect(cats.find((b) => b.textContent === 'فساتين')).toBeDefined()
  })
})

it('calls onChange with slug when category clicked', async () => {
  let last = ''
  render(
    <CategoryTabs active="" onChange={(s) => (last = s)} />,
    { wrapper: makeWrapper() },
  )
  // Wait for MSW category to appear (MSW returns slug: fashion)
  const dressBtn = await screen.findByText('فساتين')
  fireEvent.click(dressBtn)
  expect(last).toBe('fashion')
})

it('applies active style to the matching tab', async () => {
  render(<CategoryTabs active="fashion" onChange={() => {}} />, {
    wrapper: makeWrapper(),
  })
  const dressBtn = await screen.findByText('فساتين')
  expect(dressBtn.className).toMatch(/bg-black/)
})
