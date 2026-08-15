import { describe, expect, it } from 'vitest'
import { buildAuthConfig } from './auth-config'

describe('buildAuthConfig', () => {
  const origin = 'https://app.example.com'

  it('falls back gracefully when stack outputs are absent', () => {
    const config = buildAuthConfig({}, origin)
    expect(config.userPoolDomain).toBeNull()
    expect(config.redirectUri).toBeNull()
    expect(config.googleEnabled).toBe(false)
    expect(config.appleEnabled).toBe(false)
    expect(config.callbackPath).toBe('/auth/callback')
  })

  it('derives the OAuth redirect URI from origin and callback path', () => {
    const config = buildAuthConfig(
      { VITE_USER_POOL_DOMAIN: 'mock-exams.auth.us-east-1.amazoncognito.com' },
      origin,
    )
    expect(config.userPoolDomain).toBe('mock-exams.auth.us-east-1.amazoncognito.com')
    expect(config.redirectUri).toBe(`${origin}/auth/callback`)
  })

  it('respects a custom callback path', () => {
    const config = buildAuthConfig(
      {
        VITE_USER_POOL_DOMAIN: 'mock-exams.auth.us-east-1.amazoncognito.com',
        VITE_OAUTH_CALLBACK_PATH: '/auth/hosted-callback',
      },
      origin,
    )
    expect(config.callbackPath).toBe('/auth/hosted-callback')
    expect(config.redirectUri).toBe(`${origin}/auth/hosted-callback`)
  })

  it('turns providers on only when {@code true}', () => {
    const config = buildAuthConfig(
      {
        VITE_SOCIAL_GOOGLE_ENABLED: 'true',
        VITE_SOCIAL_APPLE_ENABLED: 'false',
      },
      origin,
    )
    expect(config.googleEnabled).toBe(true)
    expect(config.appleEnabled).toBe(false)
  })
})