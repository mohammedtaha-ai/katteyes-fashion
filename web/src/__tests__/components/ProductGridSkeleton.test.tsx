import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProductGridSkeleton } from '@/components/shared/ProductGridSkeleton'

describe('ProductGridSkeleton', () => {
  it('renders default of 8 skeleton placeholders', () => {
    render(<ProductGridSkeleton />)
    const skeleton = screen.getByTestId('product-grid-skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton.children).toHaveLength(8)
  })

  it('renders custom number of skeleton placeholders', () => {
    render(<ProductGridSkeleton count={4} />)
    const skeleton = screen.getByTestId('product-grid-skeleton')
    expect(skeleton.children).toHaveLength(4)
  })
})
