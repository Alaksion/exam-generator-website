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

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

function getApiKey(): string | null {
  return localStorage.getItem('x-api-key')
}

export function clearApiKey(): void {
  localStorage.removeItem('x-api-key')
}

export function setApiKey(key: string): void {
  localStorage.setItem('x-api-key', key)
}

export function hasApiKey(): boolean {
  return getApiKey() !== null
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const key = getApiKey()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (key) {
    headers['x-api-key'] = key
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      clearApiKey()
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

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}