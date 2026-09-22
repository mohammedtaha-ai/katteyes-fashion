import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { StorefrontBreadcrumbs } from '@/components/storefront/StorefrontBreadcrumbs'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('StorefrontBreadcrumbs', () => {
  it('renders breadcrumb trail and navigates on back button click', () => {
    render(
      <MemoryRouter>
        <StorefrontBreadcrumbs
          categoryName="فساتين سهرة"
          categorySlug="evening-dresses"
          productName="فستان سهرة كحلي"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('الرئيسية')).toBeInTheDocument()
    expect(screen.getByText('فساتين سهرة')).toBeInTheDocument()
    expect(screen.getByText('فستان سهرة كحلي')).toBeInTheDocument()

    const backBtn = screen.getByTestId('back-button')
    fireEvent.click(backBtn)
    expect(mockNavigate).toHaveBeenCalled()
  })
})
