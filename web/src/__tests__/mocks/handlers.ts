import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('*/api/v1/ping', () =>
    HttpResponse.json({ data: { ok: true } })),
  http.post('*/api/v1/auth/login', () =>
    HttpResponse.json({ data: { token: 'tok', user: { id: 1, name: 'a', email: 'a@b.c', role: 'admin' } } })),
]
