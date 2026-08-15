import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ApiRequestError } from '@/lib/api'

interface Props {
  children: ReactNode
}

interface State {
  error: ApiRequestError | Error | null
}

function messageForError(error: ApiRequestError): string {
  switch (error.status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.'
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'A conflict occurred. The resource may already exist or is not ready.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'An unexpected server error occurred. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Global error boundary caught:', error, info.componentStack)
  }

  componentDidMount() {
    window.addEventListener('api:globalerror', this.handleGlobalError)
  }

  componentWillUnmount() {
    window.removeEventListener('api:globalerror', this.handleGlobalError)
  }

  private handleGlobalError = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail
    this.setState({
      error: detail instanceof Error ? detail : new Error(String(detail)),
    })
  }

  private handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      const error = this.state.error
      const isApiError = error instanceof ApiRequestError
      const title = isApiError ? `Error ${error.status}` : 'Something went wrong'
      const message = isApiError
        ? messageForError(error)
        : error.message || 'An unexpected error occurred. Please refresh the page.'
      const canRetry = !isApiError || error.status !== 401

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
            <h1 className="text-xl font-semibold mb-2">{title}</h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}