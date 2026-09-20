import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/mocks/server'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/stores/auth-store'

afterEach(() => {
  useAuthStore.getState().clear()
})

/**
 * jsdom makes `window.location.assign` a non-configurable, non-writable own
 * property of the Location instance, so the standard stubbing mechanisms
 * (Object.defineProperty, vi.spyOn, Proxy, Reflect.deleteProperty) cannot
 * replace it. The trick that works is to intercept the underlying jsdom
 * implementation: jsdom's `assign` dispatches to `_locationObjectNavigate`
 * on the Location's internal impl symbol. Wrapping that method gives us a
 * reliable observation point without modifying the production code.
 */
function spyLocationNavigate(): {
  navigations: string[]
  restore: () => void
} {
  const symbols = Object.getOwnPropertySymbols(window.location)
  const implSymbol = symbols[0]
  // jsdom passes a parsed URL record to _locationObjectNavigate with
  // properties: scheme, host, port, path (array), query, fragment.
  // We re-serialize to a string by concatenating path segments. That is
  // sufficient for asserting "/login" vs no-call, which is all the
  // interceptor cares about.
  type JsdomUrl = { scheme: string; host: string; port: number | null; path: string[] }
  const impl = (window.location as unknown as Record<symbol, { _locationObjectNavigate: (url: JsdomUrl) => void }>)[implSymbol]
  const orig = impl._locationObjectNavigate
  const navigations: string[] = []
  impl._locationObjectNavigate = function (url: JsdomUrl) {
    navigations.push('/' + url.path.filter((p) => p !== '').join('/'))
  }
  return {
    navigations,
    restore() { impl._locationObjectNavigate = orig },
  }
}

describe('apiClient', () => {
  it('attaches Bearer token from auth-store', async () => {
    useAuthStore.getState().setAuth({
      token: 'tok123',
      user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
    })

    let captured: string | null = null
    server.use(
      http.get('*/api/v1/ping', ({ request }) => {
        captured = request.headers.get('Authorization')
        return HttpResponse.json({ data: { ok: true } })
      }),
    )

    await apiClient.get('/ping')
    expect(captured).toBe('Bearer tok123')
  })

  it('clears auth-store on 401 and redirects to /login', async () => {
    server.use(
      http.get('*/api/v1/protected', () =>
        new HttpResponse(null, { status: 401 })),
    )

    useAuthStore.getState().setAuth({
      token: 'old',
      user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
    })

    const nav = spyLocationNavigate()

    await expect(apiClient.get('/protected')).rejects.toBeTruthy()
    expect(useAuthStore.getState().token).toBeNull()
    expect(nav.navigations).toEqual(['/login'])

    nav.restore()
  })

  it('does NOT redirect on 401 from /auth/login', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        new HttpResponse(null, { status: 401 })),
    )

    useAuthStore.getState().setAuth({
      token: 'old',
      user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' },
    })

    const nav = spyLocationNavigate()

    await expect(apiClient.post('/auth/login', {})).rejects.toBeTruthy()
    // token MAY be cleared (acceptable behavior) but NO navigation
    expect(nav.navigations).toEqual([])

    nav.restore()
  })
})
