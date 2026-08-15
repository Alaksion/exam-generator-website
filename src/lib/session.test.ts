import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  getBearerToken,
  getSession,
  getStoredRefreshToken,
  saveIdAccess,
  saveSession,
  subscribeSession,
} from '@/lib/session'

describe('session store', () => {
  beforeEach(() => clearSession())
  afterEach(() => clearSession())

  it('is empty by default', () => {
    expect(getSession()).toEqual({
      idToken: null,
      accessToken: null,
      refreshToken: null,
    })
    expect(getBearerToken()).toBeNull()
  })

  it('saves a full token set in memory and persists the refresh token', () => {
    saveSession({ idToken: 'i', accessToken: 'a', refreshToken: 'r' })

    expect(getSession()).toEqual({
      idToken: 'i',
      accessToken: 'a',
      refreshToken: 'r',
    })
    expect(getBearerToken()).toBe('i')
    expect(sessionStorage.getItem('mock-exams.refreshToken')).toBe('r')
  })

  it('rehydrates the in-memory refresh token from sessionStorage', () => {
    sessionStorage.setItem('mock-exams.refreshToken', 'persisted-refresh')
    expect(getStoredRefreshToken()).toBe('persisted-refresh')
    expect(getSession().refreshToken).toBe('persisted-refresh')
  })

  it('clears memory and sessionStorage on clearSession', () => {
    saveSession({ idToken: 'i', accessToken: 'a', refreshToken: 'r' })
    clearSession()
    expect(getSession().idToken).toBeNull()
    expect(sessionStorage.getItem('mock-exams.refreshToken')).toBeNull()
  })

  it('notifies subscribers on save and clear', () => {
    const seen: string[] = []
    const unsubscribe = subscribeSession(() => seen.push('change'))

    saveSession({ idToken: 'i', accessToken: 'a', refreshToken: 'r' })
    clearSession()
    unsubscribe()
    saveIdAccess({ idToken: 'x', accessToken: 'y' })

    expect(seen).toEqual(['change', 'change'])
  })
})