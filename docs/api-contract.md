# API contract — Katteyes Fashion

All endpoints live under `/api/v1`. JSON in, JSON out.
Auth via `Authorization: Bearer <token>` (Sanctum PAT) where marked.

Legend: `[A]` = requires admin role · `[U]` = requires authenticated user

## Auth

| Method | Path                  | Body                                            | Returns                          | Auth |
|--------|-----------------------|-------------------------------------------------|----------------------------------|------|
| POST   | `/auth/register`      | `{name, email, password, password_confirmation}`| `{data: {token, user}}`          | —    |
| POST   | `/auth/login`         | `{email, password}`                             | `{data: {token, user}}`          | —    |
| POST   | `/auth/logout`        | —                                               | `{message: '...'}`               | U    |
| GET    | `/auth/me`            | —                                               | `{data: {user}}`                 | U    |

Rate limit: 60 req/min on all `/auth/*` (via Laravel `throttle:auth`).

## Categories (public)

| Method | Path           | Body | Returns                  |
|--------|----------------|------|--------------------------|
| GET    | `/categories`  | —    | `{data: Category[]}`     |

## Categories (admin) `[A]`

| Method | Path                                    | Body                       | Returns                          |
|--------|-----------------------------------------|----------------------------|----------------------------------|
| GET    | `/admin/categories`                     | —                          | `{data: Category[], meta, links}`|
| GET    | `/admin/categories?with_trashed=1`      | —                          | (includes soft-deleted)          |
| POST   | `/admin/categories`                     | `{name, is_active?, sort_order?}` | `{data: Category}`          |
| GET    | `/admin/categories/{id}`                | —                          | `{data: Category}`               |
| PUT    | `/admin/categories/{id}`                | `{name?, is_active?, sort_order?}` | `{data: Category}`         |
| DELETE | `/admin/categories/{id}`                | —                          | 204 No Content (soft delete)     |
| POST   | `/admin/categories/{id}/restore`        | —                          | `{data: Category}`               |

## Products (public)

| Method | Path                        | Query params                  | Returns                |
|--------|-----------------------------|-------------------------------|------------------------|
| GET    | `/products`                 | `category?, q?, page?`        | `{data: Product[], meta}` |
| GET    | `/products/{slug}`          | —                             | `{data: Product}`      |

`Product` shape includes: id, name, slug, description, price, currency,
is_active, category{id,slug,name}, images[{id,url,sort_order}],
colors[], sizes[].

## Products (admin) `[A]`

| Method | Path                                            | Body (FormData)                                                       | Returns                |
|--------|-------------------------------------------------|-----------------------------------------------------------------------|------------------------|
| GET    | `/admin/products`                               | —                                                                     | `{data, meta}`         |
| POST   | `/admin/products`                               | `name, description, price, currency, is_active, category_id, colors[], sizes[], images[]` | `{data: Product}` |
| GET    | `/admin/products/{id}`                          | —                                                                     | `{data: Product}`      |
| PATCH  | `/admin/products/{id}`                          | (same as POST, all optional)                                          | `{data: Product}`      |
| DELETE | `/admin/products/{id}`                          | —                                                                     | 204                    |
| POST   | `/admin/products/{id}/restore`                  | —                                                                     | `{data: Product}`      |
| POST   | `/admin/products/{id}/images`                   | `images[]` (multipart, multiple)                                      | `{data: ProductImage[]}` |
| DELETE | `/admin/products/{id}/images/{imageId}`         | —                                                                     | 204                    |
| PATCH  | `/admin/products/{id}/images/reorder`           | `order: number[]` (image ids in desired order)                        | `{data: ProductImage[]}` |

## Orders

| Method | Path                          | Body                                                                                          | Returns                  | Auth |
|--------|-------------------------------|-----------------------------------------------------------------------------------------------|--------------------------|------|
| POST   | `/orders`                     | `{items: [{product_id, color, size, quantity}], customer_name, customer_email?, customer_address, customer_notes?}` | `{data: Order}`         | —    |
| GET    | `/orders/{orderNumber}`       | — (optionally `?email=` for guest lookup)                                                     | `{data: Order}`          | —    |
| GET    | `/my/orders`                  | —                                                                                             | `{data: Order[], meta}`  | U    |
| GET    | `/my/orders/{orderNumber}`    | —                                                                                             | `{data: Order}`          | U    |

`Order` shape: `order_number, status, customer_name, customer_email, customer_address, customer_notes, subtotal, total, currency, whatsapp_link, created_at, items[]`.

`items[]`: `{product_name, price, color, size, quantity, subtotal}` (snapshot — product edits don't affect existing orders).

## Orders (admin) `[A]`

| Method | Path                                  | Body                  | Returns                |
|--------|---------------------------------------|-----------------------|------------------------|
| GET    | `/admin/orders`                       | query `status?`       | `{data: Order[], meta}` |
| GET    | `/admin/orders/{orderNumber}`         | —                     | `{data: Order}`        |
| PATCH  | `/admin/orders/{orderNumber}/status`  | `{status}`            | `{data: Order}`        |
| DELETE | `/admin/orders/{orderNumber}`         | —                     | 204                    |

`status` enum: `new`, `confirmed`, `shipped`, `delivered`, `cancelled`.

## Error format

All errors return:

```json
{
  "message": "رسالة الخطأ بالعربية",
  "errors": { "field": ["validation message"] }
}
```

Standard Arabic messages (per spec §7.4):

- `"لا يمكن إرسال طلب فارغ"` — empty items
- `"أحد المنتجات غير متوفر"` — product not found or inactive
- `"خيار اللون/المقاس غير صالح"` — invalid color/size
- `"البريد مطلوب للطلبات بدون حساب"` — guest without email
- `"ممنوع"` — 403 / not admin

## Pagination

List endpoints return `{data, meta: {current_page, per_page, total, last_page}, links}`.
Default per_page: 12 (storefront) / 20 (admin).

## File uploads

All admin upload endpoints accept `multipart/form-data`. Images are
auto-processed server-side:

- Resized to max 1600px width (preserves aspect ratio)
- Re-encoded as WebP at quality 85
- Saved under `products/{YYYY}/{MM}/{uuid}.webp`

Client code does NOT need to resize or convert — just POST the raw file.