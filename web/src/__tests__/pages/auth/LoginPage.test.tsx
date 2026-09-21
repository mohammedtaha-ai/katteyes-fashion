import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/mocks/server'
import { LoginPage } from '@/pages/auth/LoginPage'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null } as any)
})

function renderLogin() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>HOME</div>} />
          <Route path="/admin/products" element={<div>ADMIN_PRODUCTS</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

it('calls /auth/login and stores token on success', async () => {
  let called = false
  server.use(
    http.post('*/api/v1/auth/login', () => {
      called = true
      return HttpResponse.json({
        data: {
          token: 'tok-123',
          user: { id: 1, name: 'a', email: 'a@b.c', role: 'customer' },
        },
      })
    }),
  )
  renderLogin()
  fireEvent.change(screen.getByTestId('input-email'), {
    target: { value: 'a@b.c' },
  })
  fireEvent.change(screen.getByTestId('input-password'), {
    target: { value: 'password1234' },
  })
  fireEvent.click(screen.getByTestId('login-submit'))
  await waitFor(() => expect(called).toBe(true))
  await waitFor(() =>
    expect(useAuthStore.getState().token).toBe('tok-123'),
  )
})

it('redirects admin to /admin/products on login', async () => {
  server.use(
    http.post('*/api/v1/auth/login', () =>
      HttpResponse.json({
        data: {
          token: 'tok-admin',
          user: { id: 1, name: 'مدير', email: 'a@b.c', role: 'admin' },
        },
      }),
    ),
  )
  renderLogin()
  fireEvent.change(screen.getByTestId('input-email'), {
    target: { value: 'admin@b.c' },
  })
  fireEvent.change(screen.getByTestId('input-password'), {
    target: { value: 'password1234' },
  })
  fireEvent.click(screen.getByTestId('login-submit'))
  await waitFor(() =>
    expect(screen.getByText('ADMIN_PRODUCTS')).toBeInTheDocument(),
  )
})

it('redirects customer to /', async () => {
  server.use(
    http.post('*/api/v1/auth/login', () =>
      HttpResponse.json({
        data: {
          token: 'tok-c',
          user: { id: 1, name: 'x', email: 'a@b.c', role: 'customer' },
        },
      }),
    ),
  )
  renderLogin()
  fireEvent.change(screen.getByTestId('input-email'), {
    target: { value: 'x@b.c' },
  })
  fireEvent.change(screen.getByTestId('input-password'), {
    target: { value: 'password1234' },
  })
  fireEvent.click(screen.getByTestId('login-submit'))
  await waitFor(() => expect(screen.getByText('HOME')).toBeInTheDocument())
})

it('shows error message on login failure', async () => {
  server.use(
    http.post('*/api/v1/auth/login', () =>
      new HttpResponse(null, { status: 401 }),
    ),
  )
  renderLogin()
  fireEvent.change(screen.getByTestId('input-email'), {
    target: { value: 'x@b.c' },
  })
  fireEvent.change(screen.getByTestId('input-password'), {
    target: { value: 'password1234' },
  })
  fireEvent.click(screen.getByTestId('login-submit'))
  // Note: with no message in 401 response, falls back to "خطأ"
  await waitFor(() => screen.getByTestId('login-error'))
})
