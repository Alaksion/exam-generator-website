import { AuthFlowError } from '@/lib/auth-errors'

const DEBUG_LOGGING = import.meta.env.VITE_DEBUG_LOGGING === 'true'

function safeErrorRecord(err: unknown): Record<string, string> | null {
  if (err instanceof AuthFlowError) {
    return { kind: err.kind, message: err.message }
  }
  if (err instanceof Error) {
    return { name: err.name, message: err.message }
  }
  return null
}

export function logError(operation: string, err: unknown): void {
  if (!DEBUG_LOGGING) return
  const record = safeErrorRecord(err)
  console.error(
    JSON.stringify(
      {
        operation,
        error: record ?? 'non-error value logged as unknown',
      },
      null,
      2,
    ),
  )
}