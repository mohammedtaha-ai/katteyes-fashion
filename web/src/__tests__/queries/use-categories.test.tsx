import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { useCategories } from '@/queries/use-categories'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useCategories', () => {
  it('fetches category list and exposes data array', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // result.current.data is the AxiosResponse; .data is the server payload { data: Category[], meta }
    const items = result.current.data?.data?.data
    expect(Array.isArray(items)).toBe(true)
    expect(items).toHaveLength(1)
    expect(items?.[0]?.slug).toBe('fashion')
  })

  it('passes with_trashed flag through to the API', async () => {
    const { result } = renderHook(() => useCategories(true), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data?.data?.[0]?.is_active).toBe(true)
  })
})
