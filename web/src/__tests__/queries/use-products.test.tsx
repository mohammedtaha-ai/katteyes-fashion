import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { useProduct, useProducts } from '@/queries/use-products'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useProducts / useProduct', () => {
  it('useProducts fetches product list and exposes data array', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // result.current.data is the AxiosResponse; .data is the server payload { data: Product[], meta }
    const items = result.current.data?.data?.data
    expect(Array.isArray(items)).toBe(true)
    expect(items).toHaveLength(1)
    expect(items?.[0]?.slug).toBe('red-dress')
  })

  it('useProduct fetches a single product by slug', async () => {
    const { result } = renderHook(() => useProduct('red-dress'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // result.current.data?.data is the server payload { data: Product }
    const product = result.current.data?.data?.data
    expect(product?.slug).toBe('red-dress')
    expect(product?.price).toBe(3500)
  })
})
