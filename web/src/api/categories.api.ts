import { apiClient } from './client'
import type { Category } from './types'

export interface CategoryResponse {
  data: Category
}

export interface CategoriesListResponse {
  data: Category[]
}

export interface CategoryUpsertPayload {
  name: string
  slug: string
  is_active?: boolean
  sort_order?: number
}

export interface CategoryListParams {
  with_trashed?: boolean
}

export const categoriesApi = {
  list: (params: CategoryListParams = {}) => {
    const qs = params.with_trashed ? '?with_trashed=1' : ''
    return apiClient.get<CategoriesListResponse>(`/categories${qs}`)
  },
  show: (id: number) =>
    apiClient.get<CategoryResponse>(`/categories/${id}`),
  adminList: (params: CategoryListParams = {}) => {
    const qs = params.with_trashed ? '?with_trashed=1' : ''
    return apiClient.get<CategoriesListResponse>(`/admin/categories${qs}`)
  },
  adminCreate: (payload: CategoryUpsertPayload) =>
    apiClient.post<CategoryResponse>('/admin/categories', payload),
  adminUpdate: (id: number, payload: CategoryUpsertPayload) =>
    apiClient.put<CategoryResponse>(`/admin/categories/${id}`, payload),
  adminDelete: (id: number) =>
    apiClient.delete<void>(`/admin/categories/${id}`),
  adminRestore: (id: number) =>
    apiClient.post<CategoryResponse>(`/admin/categories/${id}/restore`),
}
