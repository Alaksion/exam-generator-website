import { ApiRequestError } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface NetworkErrorProps {
  error: Error | null
  onRetry?: () => void
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'A conflict occurred. The resource may already exist or is not ready.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'An unexpected server error occurred. Please try again later.'
    default:
      return 'An unexpected error occurred.'
  }
}

export function NetworkErrorBlock({ error, onRetry }: NetworkErrorProps) {
  if (!error) return null

  const isApiError = error instanceof ApiRequestError
  const message = isApiError
    ? messageForStatus(error.status)
    : error.message || 'A network error occurred. Please check your connection.'

  return (
    <div role="alert" className="flex flex-col items-center justify-center py-12 text-center">
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}