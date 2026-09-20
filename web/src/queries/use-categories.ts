import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  categoriesApi,
  type CategoryUpsertPayload,
} from '@/api/categories.api'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (withTrashed: boolean) => [...categoryKeys.lists(), { withTrashed }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
}

export const useCategories = (withTrashed = false) =>
  useQuery({
    queryKey: categoryKeys.list(withTrashed),
    queryFn: () => categoriesApi.list({ with_trashed: withTrashed || undefined }),
  })

export const useAdminCategories = (withTrashed = false) =>
  useQuery({
    queryKey: [...categoryKeys.all, 'admin', { withTrashed }],
    queryFn: () => categoriesApi.adminList({ with_trashed: withTrashed || undefined }),
  })

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoryUpsertPayload) => categoriesApi.adminCreate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export const useUpdateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryUpsertPayload }) =>
      categoriesApi.adminUpdate(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriesApi.adminDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export const useRestoreCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriesApi.adminRestore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}
