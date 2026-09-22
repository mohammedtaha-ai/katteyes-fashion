import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { NewsletterSignup } from '@/components/storefront/NewsletterSignup'
import { useToastStore } from '@/stores/toast-store'

describe('NewsletterSignup', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
  })

  it('renders form and handles VIP membership subscription', async () => {
    render(<NewsletterSignup />)

    expect(screen.getByTestId('newsletter-section')).toBeInTheDocument()
    expect(screen.getByText('نادي Katteyes Fashion VIP')).toBeInTheDocument()
    expect(screen.getByText(/انضمي إلى عالم الأناقة/)).toBeInTheDocument()

    const input = screen.getByRole('textbox', { name: /البريد الإلكتروني أو رقم الهاتف/ })
    fireEvent.change(input, { target: { value: '777123456' } })

    const submitBtn = screen.getByRole('button', { name: /انضمام وتفعيل الخصم/ })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-success')).toBeInTheDocument()
      expect(screen.getByText(/VIP10/)).toBeInTheDocument()
    })

    expect(useToastStore.getState().toasts).toHaveLength(1)
  })
})
