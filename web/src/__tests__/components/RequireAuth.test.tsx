import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuthStore } from '@/stores/auth-store'

function renderAt(initial: string, el: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
        <Route path="/" element={<div>HOME_PAGE</div>} />
        <Route path="/protected" element={el} />
        <Route path="/admin" element={el} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null } as any)
})

it('redirects to /login when not authenticated', () => {
  renderAt('/protected', <RequireAuth><div>SECRET</div></RequireAuth>)
  expect(screen.getByText('LOGIN_PAGE')).toBeInTheDocument()
  expect(screen.queryByText('SECRET')).not.toBeInTheDocument()
})

it('renders children when authenticated', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'customer' },
  })
  renderAt('/protected', <RequireAuth><div>SECRET</div></RequireAuth>)
  expect(screen.getByText('SECRET')).toBeInTheDocument()
})

it('redirects to / when role not allowed', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'customer' },
  })
  renderAt(
    '/admin',
    <RequireAuth roles={['admin']}><div>ADMIN</div></RequireAuth>,
  )
  expect(screen.getByText('HOME_PAGE')).toBeInTheDocument()
  expect(screen.queryByText('ADMIN')).not.toBeInTheDocument()
})

it('renders children when role is allowed', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
  })
  renderAt(
    '/admin',
    <RequireAuth roles={['admin']}><div>ADMIN</div></RequireAuth>,
  )
  expect(screen.getByText('ADMIN')).toBeInTheDocument()
})