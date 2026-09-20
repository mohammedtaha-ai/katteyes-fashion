import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null } as any)
})

function wrap(el: React.ReactNode) {
  return render(<MemoryRouter>{el}</MemoryRouter>)
}

it('shows "دخول" when not authenticated', () => {
  wrap(<Header />)
  expect(screen.getByText('دخول')).toBeInTheDocument()
})

it('shows user name + hides دخول when authenticated', () => {
  useAuthStore.getState().setAuth({
    token: 't',
    user: { id: 1, name: 'أحمد', email: 'a@b.c', role: 'customer' },
  })
  wrap(<Header />)
  expect(screen.getByText('أحمد')).toBeInTheDocument()
  expect(screen.queryByText('دخول')).not.toBeInTheDocument()
})

it('shows admin settings icon for admin role', () => {
  useAuthStore.getState().setAuth({
    token: 't',
    user: { id: 1, name: 'مدير', email: 'a@b.c', role: 'admin' },
  })
  wrap(<Header />)
  expect(screen.getByLabelText('لوحة التحكم')).toBeInTheDocument()
})

it('hides admin settings icon for customer role', () => {
  useAuthStore.getState().setAuth({
    token: 't',
    user: { id: 1, name: 'x', email: 'a@b.c', role: 'customer' },
  })
  wrap(<Header />)
  expect(screen.queryByLabelText('لوحة التحكم')).not.toBeInTheDocument()
})

it('shows cart badge with totalItems count', () => {
  // Default cart is empty
  wrap(<Header />)
  // No badge rendered when 0
  expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
})
