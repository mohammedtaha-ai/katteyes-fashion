import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null } as any)
  useCartStore.setState({ items: [] })
})

function wrap(el: React.ReactNode) {
  return render(<MemoryRouter>{el}</MemoryRouter>)
}

it('renders promo bar announcement', () => {
  wrap(<Header />)
  expect(
    screen.getByText(/مجموعة صيف 2026 الجديدة \| توصيل سريع لجميع المحافظات/),
  ).toBeInTheDocument()
})

it('renders Katteyes and Fashion brand logo', () => {
  wrap(<Header />)
  expect(screen.getByText('Katteyes')).toBeInTheDocument()
  expect(screen.getByText('Fashion')).toBeInTheDocument()
})

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

it('shows cart badge with totalItems count and pulse animation', () => {
  // Default cart is empty
  const { rerender } = wrap(<Header />)
  // No badge rendered when 0
  expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()

  // Add item to cart
  act(() => {
    useCartStore.setState({
      items: [
        {
          productId: 1,
          productName: 'قميص',
          price: 150,
          currency: 'EGP',
          img: '',
          color: 'أزرق',
          size: 'M',
          quantity: 3,
        },
      ],
    })
  })

  rerender(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )

  const badge = screen.getByText('3')
  expect(badge).toBeInTheDocument()
  expect(badge).toHaveClass('animate-pulse')
})
