import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrandTrustFeatures } from '@/components/storefront/BrandTrustFeatures'

describe('BrandTrustFeatures', () => {
  it('renders all 4 luxury value props', () => {
    render(<BrandTrustFeatures />)

    expect(screen.getByTestId('brand-trust-features')).toBeInTheDocument()
    expect(screen.getByText('لماذا تختارين Katteyes Fashion؟')).toBeInTheDocument()
    expect(screen.getByText('توصيل سريع لكافة المحافظات')).toBeInTheDocument()
    expect(screen.getByText('طرق دفع متعددة ومرنة')).toBeInTheDocument()
    expect(screen.getByText('خامات ملكية أصلية 100%')).toBeInTheDocument()
    expect(screen.getByText('تغليف هدايا فاخر واستبدال ميسر')).toBeInTheDocument()
  })
})
