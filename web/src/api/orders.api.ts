import { apiClient } from './client'
import type { Order, OrderStatus } from './types'

export interface OrderResponse {
  data: Order
}

export interface OrderItemPayload {
  product_id: number
  color: string
  size: string
  quantity: number
}

export interface CreateOrderPayload {
  items: OrderItemPayload[]
  customer_name: string
  customer_email?: string
  customer_address: string
  customer_notes?: string
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
}

export interface AdminOrdersListParams {
  status?: OrderStatus
  from?: string
  to?: string
}

export const ordersApi = {
  // Public
  create: (payload: CreateOrderPayload) =>
    apiClient.post<OrderResponse>('/orders', payload),
  show: (orderNumber: string, email?: string) => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : ''
    return apiClient.get<OrderResponse>(`/orders/${orderNumber}${qs}`)
  },

  // Authenticated customer
  myList: () => apiClient.get<{ data: Order[] }>('/my/orders'),
  myShow: (orderNumber: string) =>
    apiClient.get<OrderResponse>(`/my/orders/${orderNumber}`),

  // Admin
  adminList: (params: AdminOrdersListParams = {}) => {
    const entries = Object.entries(params).filter(([, v]) => v != null) as [string, string][]
    const qs = new URLSearchParams(entries).toString()
    return apiClient.get<{ data: Order[] }>(`/admin/orders${qs ? `?${qs}` : ''}`)
  },
  adminShow: (orderNumber: string) =>
    apiClient.get<OrderResponse>(`/admin/orders/${orderNumber}`),
  adminUpdate: (orderNumber: string, payload: UpdateOrderStatusPayload) =>
    apiClient.patch<OrderResponse>(`/admin/orders/${orderNumber}`, payload),
  adminDelete: (orderNumber: string) =>
    apiClient.delete<void>(`/admin/orders/${orderNumber}`),
}
