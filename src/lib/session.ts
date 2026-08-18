import type { CognitoTokens } from '@/lib/cognito'

const SESSION_KEY = 'mock-exams.session'

let idToken: string | null = null
let accessToken: string | null = null

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
}

function setTokens(id: string | null, access: string | null): void {
  idToken = id
  accessToken = access
}

export function saveSession(
  tokens: Pick<CognitoTokens, 'idToken' | 'accessToken'>,
): void {
  setTokens(tokens.idToken, tokens.accessToken)
  sessionStorage.setItem(SESSION_KEY, '1')
  notify()
}

export function saveIdAccess(
  tokens: Pick<CognitoTokens, 'idToken' | 'accessToken'>,
): void {
  setTokens(tokens.idToken, tokens.accessToken)
  notify()
}

export function getSession(): SessionSnapshot {
  return { idToken, accessToken }
}

export function getBearerToken(): string | null {
  return idToken
}

/** True when a session was previously saved, so a reload can try to restore it. */
export function hasStoredSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) !== null
}

export function clearSession(): void {
  idToken = null
  accessToken = null
  sessionStorage.removeItem(SESSION_KEY)
  notify()
}

export type SessionRefresher = () => Promise<boolean>

let refresher: SessionRefresher | null = null

export function registerSessionRefresher(fn: SessionRefresher | null): void {
  refresher = fn
}

/** Refresh the session once. Returns true on success, false on failure. */
export async function refreshSession(): Promise<boolean> {
  if (!refresher) return false
  try {
    return await refresher()
  } catch {
    return false
  }
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}