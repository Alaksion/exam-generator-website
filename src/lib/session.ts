import type { CognitoTokens } from '@/lib/cognito'

const REFRESH_KEY = 'mock-exams.refreshToken'

let idToken: string | null = null
let accessToken: string | null = null
let refreshToken: string | null = null

type Listener = () => void
const listeners = new Set<Listener>()

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

export interface SessionSnapshot {
  idToken: string | null
  accessToken: string | null
  refreshToken: string | null
}

export function saveSession(tokens: CognitoTokens): void {
  idToken = tokens.idToken
  accessToken = tokens.accessToken
  refreshToken = tokens.refreshToken
  sessionStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  notify()
}

export function saveIdAccess(
  tokens: Pick<CognitoTokens, 'idToken' | 'accessToken'>,
): void {
  idToken = tokens.idToken
  accessToken = tokens.accessToken
  notify()
}

export function getSession(): SessionSnapshot {
  return { idToken, accessToken, refreshToken }
}

export function getBearerToken(): string | null {
  return idToken
}

/** Rehydrate the in-memory tokens from a persisted refresh token, if any. */
export function getStoredRefreshToken(): string | null {
  const stored = sessionStorage.getItem(REFRESH_KEY)
  if (stored) {
    refreshToken = stored
  }
  return refreshToken
}

export function clearSession(): void {
  idToken = null
  accessToken = null
  refreshToken = null
  sessionStorage.removeItem(REFRESH_KEY)
  notify()
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}