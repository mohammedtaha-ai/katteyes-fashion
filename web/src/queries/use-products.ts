import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi, type ProductListParams } from '@/api/products.api'
import type { Product } from '@/api/types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductListParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
}

export interface UseProductsFilters {
  category?: string
  q?: string
}

export const useProducts = (filters: UseProductsFilters = {}) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.list({ ...filters, page: 1 }),
  })

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.show(slug),
    enabled: !!slug,
  })

export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => productsApi.adminCreate(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: number; form: FormData }) =>
      productsApi.adminUpdate(id, form),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.all })
      qc.invalidateQueries({ queryKey: productKeys.details() })
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.adminDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}

export const useRestoreProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.adminRestore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}

export const useAppendImages = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: number; form: FormData }) =>
      productsApi.appendImages(id, form),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.detail(id.toString()) })
      qc.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export const useDeleteImage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      productsApi.deleteImage(productId, imageId),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: productKeys.detail(productId.toString()) })
      qc.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export const useReorderImages = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ids }: { id: number; ids: number[] }) =>
      productsApi.reorderImages(id, ids),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.detail(id.toString()) })
    },
  })
}

export type { Product }
