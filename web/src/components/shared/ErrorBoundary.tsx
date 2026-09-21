import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export interface ErrorBoundaryProps {
  children?: ReactNode
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode)
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  public render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error ?? new Error('Unknown error'),
          reset: this.handleReset,
        })
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          data-testid="error-boundary-fallback"
          className="rounded-xl p-6 bg-rose-50/70 border border-rose-200 text-center my-4 flex flex-col items-center justify-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              حدث خطأ أثناء عرض هذا المحتوى
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {this.state.error?.message || 'تعذر تحميل المحتوى بشكل سليم.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            data-testid="error-retry-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95"
          >
            <RefreshCw size={14} />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
