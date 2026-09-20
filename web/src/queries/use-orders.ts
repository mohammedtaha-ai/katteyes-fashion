import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ordersApi,
  type AdminOrdersListParams,
  type CreateOrderPayload,
  type UpdateOrderStatusPayload,
} from '@/api/orders.api'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: AdminOrdersListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (orderNumber: string) => [...orderKeys.details(), orderNumber] as const,
  my: () => [...orderKeys.all, 'my'] as const,
  myList: () => [...orderKeys.my(), 'list'] as const,
  myDetail: (orderNumber: string) => [...orderKeys.my(), orderNumber] as const,
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
  })
}

export const useOrder = (orderNumber: string, email?: string) =>
  useQuery({
    queryKey: [...orderKeys.detail(orderNumber), { email: email ?? null }],
    queryFn: () => ordersApi.show(orderNumber, email),
    enabled: !!orderNumber,
  })

export const useMyOrders = () =>
  useQuery({
    queryKey: orderKeys.myList(),
    queryFn: () => ordersApi.myList(),
  })

export const useMyOrder = (orderNumber: string) =>
  useQuery({
    queryKey: orderKeys.myDetail(orderNumber),
    queryFn: () => ordersApi.myShow(orderNumber),
    enabled: !!orderNumber,
  })

export const useAdminOrders = (params: AdminOrdersListParams = {}) =>
  useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.adminList(params),
  })

export const useAdminOrder = (orderNumber: string) =>
  useQuery({
    queryKey: orderKeys.detail(orderNumber),
    queryFn: () => ordersApi.adminShow(orderNumber),
    enabled: !!orderNumber,
  })

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderNumber, payload }: { orderNumber: string; payload: UpdateOrderStatusPayload }) =>
      ordersApi.adminUpdate(orderNumber, payload),
    onSuccess: (_data, { orderNumber }) => {
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderNumber) })
      qc.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

export const useDeleteOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderNumber: string) => ordersApi.adminDelete(orderNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.lists() }),
  })
}
