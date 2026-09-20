import { http, HttpResponse } from 'msw'

const API = '*/api/v1'

const emptyMeta = { current_page: 1, per_page: 12, total: 0, last_page: 1 }
const emptyLinks = { first: null, last: null, prev: null, next: null }

function paginated<T>(data: T[], perPage = 12) {
  return { data, meta: { ...emptyMeta, per_page: perPage, total: data.length }, links: emptyLinks }
}

const sampleUser = { id: 1, name: 'a', email: 'a@b.c', role: 'admin' as const }
const sampleCategory = {
  id: 1, name: 'فساتين', slug: 'fashion', is_active: true, sort_order: 1,
}
const sampleProduct = {
  id: 1,
  name: 'فستان أحمر',
  slug: 'red-dress',
  description: 'وصف',
  price: 3500,
  currency: 'YER',
  category: { id: 1, slug: 'fashion', name: 'فساتين' },
  is_active: true,
  images: [{ id: 1, url: '/img.webp', sort_order: 0 }],
  colors: ['أحمر'],
  sizes: ['M'],
}
const sampleOrder = {
  order_number: 'ORD-001',
  status: 'new' as const,
  customer_name: 'محمد',
  customer_email: null,
  customer_address: 'صنعاء',
  customer_notes: null,
  subtotal: 3500,
  total: 3500,
  currency: 'YER',
  whatsapp_link: 'https://wa.me/123',
  created_at: '2026-01-01T00:00:00Z',
  items: [
    {
      product_name: 'فستان',
      price: 3500,
      color: 'أحمر',
      size: 'M',
      quantity: 1,
      subtotal: 3500,
    },
  ],
}

export const handlers = [
  // ---- ping (kept from Task 7.2) ----
  http.get(`${API}/ping`, () => HttpResponse.json({ data: { ok: true } })),

  // ---- auth ----
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({ data: { token: 'tok', user: sampleUser } })),
  http.post(`${API}/auth/register`, () =>
    HttpResponse.json({ data: { token: 'tok', user: sampleUser } }, { status: 201 })),
  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({ data: { user: sampleUser } })),
  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  // ---- categories (public) ----
  http.get(`${API}/categories`, () =>
    HttpResponse.json(paginated([sampleCategory]))),

  // ---- products (public) ----
  http.get(`${API}/products`, () =>
    HttpResponse.json(paginated([sampleProduct]))),
  http.get(`${API}/products/:slug`, () =>
    HttpResponse.json({ data: sampleProduct })),

  // ---- orders (public) ----
  http.post(`${API}/orders`, () =>
    HttpResponse.json({ data: sampleOrder }, { status: 201 })),
  http.get(`${API}/orders/:orderNumber`, () =>
    HttpResponse.json({ data: sampleOrder })),

  // ---- my orders (auth) ----
  http.get(`${API}/my/orders`, () =>
    HttpResponse.json({ data: [sampleOrder] })),
  http.get(`${API}/my/orders/:orderNumber`, () =>
    HttpResponse.json({ data: sampleOrder })),

  // ---- admin categories ----
  http.get(`${API}/admin/categories`, () =>
    HttpResponse.json(paginated([sampleCategory], 50))),
  http.post(`${API}/admin/categories`, () =>
    HttpResponse.json({ data: sampleCategory }, { status: 201 })),
  http.put(`${API}/admin/categories/:id`, () =>
    HttpResponse.json({ data: sampleCategory })),
  http.delete(`${API}/admin/categories/:id`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${API}/admin/categories/:id/restore`, () =>
    HttpResponse.json({ data: sampleCategory })),

  // ---- admin products ----
  http.get(`${API}/admin/products`, () =>
    HttpResponse.json(paginated([sampleProduct], 20))),
  http.post(`${API}/admin/products`, () =>
    HttpResponse.json({ data: sampleProduct }, { status: 201 })),
  http.patch(`${API}/admin/products/:id`, () =>
    HttpResponse.json({ data: sampleProduct })),
  http.delete(`${API}/admin/products/:id`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${API}/admin/products/:id/restore`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${API}/admin/products/:id/images`, () =>
    HttpResponse.json({ data: sampleProduct.images })),
  http.delete(`${API}/admin/products/:productId/images/:imageId`, () =>
    new HttpResponse(null, { status: 204 })),
  http.post(`${API}/admin/products/:id/images/reorder`, () =>
    new HttpResponse(null, { status: 204 })),

  // ---- admin orders ----
  http.get(`${API}/admin/orders`, () =>
    HttpResponse.json({ data: [sampleOrder] })),
  http.get(`${API}/admin/orders/:orderNumber`, () =>
    HttpResponse.json({ data: sampleOrder })),
  http.patch(`${API}/admin/orders/:orderNumber`, () =>
    HttpResponse.json({ data: sampleOrder })),
  http.delete(`${API}/admin/orders/:orderNumber`, () =>
    new HttpResponse(null, { status: 204 })),
]
