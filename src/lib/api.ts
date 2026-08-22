import { getBearerToken, refreshSession } from '@/lib/session'

export interface ApiError {
  error: string
  message: string
  status: number
}

export class ApiRequestError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

export function apiErrorMessage(status: number): string {
  switch (status) {
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
      return 'An unexpected error occurred.'
  }
}

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

interface AttemptOptions extends RequestInit {
  retryOn401?: boolean
}

async function attempt<T>(path: string, options: AttemptOptions = {}): Promise<T> {
  const token = getBearerToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(Object.fromEntries(
      new Headers(options.headers).entries(),
    ) as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      if (options.retryOn401 && (await refreshSession())) {
        return attempt<T>(path, { ...options, retryOn401: false })
      }
      window.dispatchEvent(new CustomEvent('api:unauthorized'))
    }

    let body: ApiError | null = null
    try {
      body = (await res.json()) as ApiError
    } catch {
      // ignore parse failures
    }

    throw new ApiRequestError(
      res.status,
      body?.error ?? 'UnknownError',
      body?.message ?? res.statusText,
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return attempt<T>(path, { ...options, retryOn401: true })
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}