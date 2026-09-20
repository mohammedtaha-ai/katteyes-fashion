import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  // @ts-ignore — reset between tests
  useAuthStore.setState({ user: null, token: null } as any)
})

it('setAuth stores token + user', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
  })
  expect(useAuthStore.getState().token).toBe('tok')
  expect(useAuthStore.getState().isAuthenticated()).toBe(true)
})

it('clear removes token + user', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
  })
  useAuthStore.getState().clear()
  expect(useAuthStore.getState().token).toBeNull()
  expect(useAuthStore.getState().isAuthenticated()).toBe(false)
})

it('isAdmin returns true for admin role', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
  })
  expect(useAuthStore.getState().isAdmin()).toBe(true)
})

it('isAdmin returns false for customer role', () => {
  useAuthStore.getState().setAuth({
    token: 'tok',
    user: { id: 1, name: 'a', email: 'a@b.c', role: 'customer' },
  })
  expect(useAuthStore.getState().isAdmin()).toBe(false)
})