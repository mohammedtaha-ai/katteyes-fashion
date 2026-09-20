import { apiClient } from './client'
import type { Product, ProductImage } from './types'

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ProductsListResponse {
  data: Product[]
  meta: Pagination
}

export interface ProductResponse {
  data: Product
}

export interface ProductImagesResponse {
  data: ProductImage[]
}

export interface ProductListParams {
  category?: string
  q?: string
  page?: number
}

function buildQuery(params: ProductListParams): string {
  const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  const qs = new URLSearchParams(entries).toString()
  return qs ? `?${qs}` : ''
}

export const productsApi = {
  list: (params: ProductListParams = {}) =>
    apiClient.get<ProductsListResponse>(`/products${buildQuery(params)}`),
  show: (slug: string) =>
    apiClient.get<ProductResponse>(`/products/${slug}`),
  adminCreate: (form: FormData) =>
    apiClient.post<ProductResponse>('/admin/products', form),
  adminUpdate: (id: number, form: FormData) =>
    apiClient.patch<ProductResponse>(`/admin/products/${id}`, form),
  adminDelete: (id: number) =>
    apiClient.delete<void>(`/admin/products/${id}`),
  adminRestore: (id: number) =>
    apiClient.post<void>(`/admin/products/${id}/restore`),
  appendImages: (id: number, form: FormData) =>
    apiClient.post<ProductImagesResponse>(`/admin/products/${id}/images`, form),
  deleteImage: (productId: number, imageId: number) =>
    apiClient.delete<void>(`/admin/products/${productId}/images/${imageId}`),
  reorderImages: (id: number, ids: number[]) =>
    apiClient.post<void>(`/admin/products/${id}/images/reorder`, { ids }),
}
