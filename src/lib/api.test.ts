import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { apiRequest, ApiRequestError } from '@/lib/api'
import { clearSession, saveIdAccess } from '@/lib/session'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  clearSession()
})
afterAll(() => server.close())

describe('apiRequest', () => {
  it('attaches', async () => {
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
})