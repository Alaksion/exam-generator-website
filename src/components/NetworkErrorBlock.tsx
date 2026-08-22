import { ApiRequestError, apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface NetworkErrorProps {
  error: Error | null
  onRetry?: () => void
}

export function NetworkErrorBlock({ error, onRetry }: NetworkErrorProps) {
  if (!error) return null

  const message = error instanceof ApiRequestError
    ? apiErrorMessage(error.status)
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