import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test crash in component')
  }
  return <div>محتوى سليم</div>
}

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('محتوى سليم')).toBeInTheDocument()
  })

  it('catches error and displays default error fallback with retry button', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    expect(screen.getByText('حدث خطأ أثناء عرض هذا المحتوى')).toBeInTheDocument()
    expect(screen.getByText('Test crash in component')).toBeInTheDocument()
    expect(screen.getByTestId('error-retry-btn')).toBeInTheDocument()
  })

  it('invokes onReset callback when retry button is clicked', () => {
    const onReset = vi.fn()
    render(
      <ErrorBoundary onReset={onReset}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByTestId('error-retry-btn'))
    expect(onReset).toHaveBeenCalled()
  })

  it('renders custom fallback if provided', () => {
    render(
      <ErrorBoundary fallback={<div>عذراً، حدث خطأ خاص</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('عذراً، حدث خطأ خاص')).toBeInTheDocument()
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument()
  })
})
