import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { CategoryStoryBar } from '@/components/storefront/CategoryStoryBar'
import { describe, it, expect, vi } from 'vitest'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('CategoryStoryBar', () => {
  it('renders "الكل" story item and MSW categories', async () => {
    render(<CategoryStoryBar activeCategory="" onSelectCategory={() => {}} />, {
      wrapper: makeWrapper(),
    })

    // Initially shows loading skeleton or resolves to categories
    expect(await screen.findByTestId('category-story-all')).toBeInTheDocument()
    expect(screen.getByText('الكل')).toBeInTheDocument()

    // MSW returns category 'فساتين'
    const categoryBtn = await screen.findByTestId('category-story-fashion')
    expect(categoryBtn).toBeInTheDocument()
    expect(screen.getByText('فساتين')).toBeInTheDocument()
  })

  it('calls onSelectCategory with slug when a circle is clicked', async () => {
    const onSelect = vi.fn()
    render(<CategoryStoryBar activeCategory="" onSelectCategory={onSelect} />, {
      wrapper: makeWrapper(),
    })

    const categoryBtn = await screen.findByTestId('category-story-fashion')
    fireEvent.click(categoryBtn)
    expect(onSelect).toHaveBeenCalledWith('fashion')

    const allBtn = await screen.findByTestId('category-story-all')
    fireEvent.click(allBtn)
    expect(onSelect).toHaveBeenCalledWith('')
  })

  it('applies active ring classes to the active category', async () => {
    render(<CategoryStoryBar activeCategory="fashion" onSelectCategory={() => {}} />, {
      wrapper: makeWrapper(),
    })

    const categoryBtn = await screen.findByTestId('category-story-fashion')
    const circle = categoryBtn.querySelector('div')
    expect(circle?.className).toContain('ring-brand-accent')
  })
})
