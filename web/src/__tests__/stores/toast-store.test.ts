import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToastStore } from '@/stores/toast-store'

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('adds a toast with generated id and defaults type to info', () => {
    useToastStore.getState().addToast({
      message: 'تمت إضافة المنتج إلى السلة',
      productName: 'فستان صيفي',
    })

    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('تمت إضافة المنتج إلى السلة')
    expect(toasts[0].productName).toBe('فستان صيفي')
    expect(toasts[0].id).toBeDefined()
    expect(toasts[0].type).toBe('info')
  })

  it('keeps maximum 2 toasts simultaneously (slice -2)', () => {
    useToastStore.getState().addToast({ message: 'Toast 1' })
    useToastStore.getState().addToast({ message: 'Toast 2' })
    useToastStore.getState().addToast({ message: 'Toast 3' })

    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(2)
    expect(toasts[0].message).toBe('Toast 2')
    expect(toasts[1].message).toBe('Toast 3')
  })

  it('removes a toast by id', () => {
    useToastStore.getState().addToast({ id: 't1', message: 'Toast 1' })
    useToastStore.getState().addToast({ id: 't2', message: 'Toast 2' })

    useToastStore.getState().removeToast('t1')

    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].id).toBe('t2')
  })

  it('auto-dismisses toast after 4000ms', () => {
    useToastStore.getState().addToast({ id: 'auto-1', message: 'Auto dismiss me' })
    expect(useToastStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(3999)
    expect(useToastStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
