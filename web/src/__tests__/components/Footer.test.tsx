import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('renders brand identity, links, contact info, and payment methods', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('storefront-footer')).toBeInTheDocument()
    expect(screen.getByText('Katteyes')).toBeInTheDocument()
    expect(screen.getByText('فساتين سهرة ملكية')).toBeInTheDocument()
    expect(screen.getByText('عبايات خليجية ومناسبات')).toBeInTheDocument()
    expect(screen.getByText(/اليمن — صنعاء/)).toBeInTheDocument()
    expect(screen.getByText(/الكريمي/)).toBeInTheDocument()
    expect(screen.getByText(/ون كاش/)).toBeInTheDocument()
    expect(screen.getByText(/الدفع عند الاستلام/)).toBeInTheDocument()
  })
})
