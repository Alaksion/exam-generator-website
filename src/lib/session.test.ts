import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  getBearerToken,
  getSession,
  hasStoredSession,
  refreshSession,
  registerSessionRefresher,
  saveIdAccess,
  saveSession,
  subscribeSession,
} from '@/lib/session'

describe('session store', () => {
  beforeEach(() => {
    clearSession()
    registerSessionRefresher(null)
  })
  afterEach(() => {
    clearSession()
    registerSessionRefresher(null)
  })

  it('is empty by default', () => {
    expect(getSession()).toEqual({ idToken: null, accessToken: null })
    expect(getBearerToken()).toBeNull()
    expect(hasStoredSession()).toBe(false)
  })

  it('saves the id and access tokens in memory and marks a stored session', () => {
    saveSession({ idToken: 'i', accessToken: 'a' })

    expect(getSession()).toEqual({ idToken: 'i', accessToken: 'a' })
    expect(getBearerToken()).toBe('i')
    expect(hasStoredSession()).toBe(true)
  })

  it('treats a persisted marker as a stored session', () => {
    sessionStorage.setItem('mock-exams.session', '1')
    expect(hasStoredSession()).toBe(true)
  })

  it('clears memory and the stored-session marker on clearSession', () => {
    saveSession({ idToken: 'i', accessToken: 'a' })
    clearSession()
    expect(getSession().idToken).toBeNull()
    expect(hasStoredSession()).toBe(false)
  })

  it('notifies subscribers on save and clear', () => {
    const seen: string[] = []
    const unsubscribe = subscribeSession(() => seen.push('change'))

    saveSession({ idToken: 'i', accessToken: 'a' })
    clearSession()
    unsubscribe()
    saveIdAccess({ idToken: 'x', accessToken: 'y' })

    expect(seen).toEqual(['change', 'change'])
  })

  it('refreshSession returns false when no refresher is registered', async () => {
    expect(await refreshSession()).toBe(false)
  })

  it('refreshSession invokes the registered refresher and returns its result', async () => {
    registerSessionRefresher(() => Promise.resolve(true))
    expect(await refreshSession()).toBe(true)
  })

  it('refreshSession returns false when the refresher throws', async () => {
    registerSessionRefresher(() => Promise.reject(new Error('boom')))
    expect(await refreshSession()).toBe(false)
  })
})