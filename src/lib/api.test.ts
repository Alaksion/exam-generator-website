import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { apiRequest, ApiRequestError, apiErrorMessage } from '@/lib/api'
import {
  clearSession,
  registerSessionRefresher,
  saveIdAccess,
} from '@/lib/session'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  clearSession()
  registerSessionRefresher(null)
})
afterAll(() => server.close())

describe('apiRequest', () => {
  it('sends the bearer id token when the session has one', async () => {
    saveIdAccess({ idToken: 'id-token', accessToken: 'access-token' })
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get('/v1/health', ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries())
        return HttpResponse.json({ status: 'ok' })
      }),
    )

    await apiRequest('/v1/health')

    expect(capturedHeaders['authorization']).toBe('Bearer id-token')
  })

  it('sends no auth header when no session exists', async () => {
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get('/v1/health', ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries())
        return HttpResponse.json({ status: 'ok' })
      }),
    )

    await apiRequest('/v1/health')

    expect(capturedHeaders['authorization']).toBeUndefined()
  })

  it('throws ApiRequestError with status on 401', async () => {
    server.use(
      http.get('/v1/test', () =>
        HttpResponse.json(
          { error: 'Unauthorized', message: 'Invalid token' },
          { status: 401 },
        ),
      ),
    )

    const err = await apiRequest('/v1/test').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(401)
    expect((err as ApiRequestError).code).toBe('Unauthorized')
  })

  it('throws ApiRequestError on 429', async () => {
    server.use(
      http.get('/v1/test', () =>
        HttpResponse.json(
          { error: 'RateLimitExceeded', message: 'Too fast' },
          { status: 429 },
        ),
      ),
    )

    const err = await apiRequest('/v1/test').catch((e: unknown) => e)
    expect(err).instanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(429)
  })

  it('throws ApiRequestError on 403 without clearing the session', async () => {
    saveIdAccess({ idToken: 'id-token', accessToken: 'access-token' })

    server.use(
      http.get('/v1/test', () =>
        HttpResponse.json(
          { error: 'Forbidden', message: 'Not allowed' },
          { status: 403 },
        ),
      ),
    )

    const err = await apiRequest('/v1/test').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(403)
    expect((err as ApiRequestError).code).toBe('Forbidden')
  })

  it('refreshes once and retries on 401, then succeeds with the new token', async () => {
    saveIdAccess({ idToken: 'expired-token', accessToken: 'expired-access' })
    let requestCount = 0
    let refreshCount = 0
    const headersPerRequest: string[] = []

    registerSessionRefresher(() => {
      refreshCount++
      saveIdAccess({ idToken: 'fresh-token', accessToken: 'fresh-access' })
      return Promise.resolve(true)
    })

    server.use(
      http.get('/v1/test', ({ request }) => {
        requestCount++
        headersPerRequest.push(request.headers.get('authorization') ?? '')
        if (requestCount === 1) {
          return HttpResponse.json(
            { error: 'Unauthorized', message: 'Expired' },
            { status: 401 },
          )
        }
        return HttpResponse.json({ ok: true })
      }),
    )

    const result = await apiRequest('/v1/test')

    expect(requestCount).toBe(2)
    expect(refreshCount).toBe(1)
    expect(result).toEqual({ ok: true })
    expect(headersPerRequest[0]).toBe('Bearer expired-token')
    expect(headersPerRequest[1]).toBe('Bearer fresh-token')
  })

  it('dispatches api:unauthorized and throws when refresh fails on 401', async () => {
    saveIdAccess({ idToken: 'expired-token', accessToken: 'expired-access' })
    let requestCount = 0
    const unauthorizedEvent = vi.fn()
    window.addEventListener('api:unauthorized', unauthorizedEvent)

    registerSessionRefresher(() => Promise.resolve(false))

    server.use(
      http.get('/v1/test', () => {
        requestCount++
        return HttpResponse.json(
          { error: 'Unauthorized', message: 'Expired' },
          { status: 401 },
        )
      }),
    )

    const err = await apiRequest('/v1/test').catch((e: unknown) => e)

    expect(requestCount).toBe(1)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(401)
    expect(unauthorizedEvent).toHaveBeenCalledTimes(1)
    window.removeEventListener('api:unauthorized', unauthorizedEvent)
  })

  it('does not refresh on 403', async () => {
    saveIdAccess({ idToken: 'id-token', accessToken: 'access-token' })
    const refresh = vi.fn(() => Promise.resolve(false))
    registerSessionRefresher(refresh)

    server.use(
      http.get('/v1/test', () =>
        HttpResponse.json(
          { error: 'Forbidden', message: 'Not allowed' },
          { status: 403 },
        ),
      ),
    )

    await apiRequest('/v1/test').catch(() => {})

    expect(refresh).not.toHaveBeenCalled()
  })
})

describe('apiErrorMessage', () => {
  it('returns a human message for known status codes', () => {
    for (const status of [400, 401, 404, 409, 429, 500]) {
      const message = apiErrorMessage(status)
      expect(message.length).toBeGreaterThan(0)
      expect(apiErrorMessage(status)).not.toBe('An unexpected error occurred.')
    }
  })

  it('falls back to a generic message for unknown statuses', () => {
    expect(apiErrorMessage(418)).toBe('An unexpected error occurred.')
  })
})