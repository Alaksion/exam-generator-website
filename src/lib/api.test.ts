import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { apiRequest, ApiRequestError, clearApiKey, setApiKey } from '@/lib/api'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  clearApiKey()
})
afterAll(() => server.close())

describe('apiRequest', () => {
  it('attaches x-api-key header when key is set', async () => {
    setApiKey('my-key')
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get('/v1/health', ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries())
        return HttpResponse.json({ status: 'ok' })
      }),
    )

    await apiRequest('/v1/health')

    expect(capturedHeaders['x-api-key']).toBe('my-key')
  })

  it('throws ApiRequestError with status on 401', async () => {
    server.use(
      http.get('/v1/test', () =>
        HttpResponse.json(
          { error: 'Unauthorized', message: 'Invalid key' },
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

  it('clears key on 401', async () => {
    setApiKey('will-be-cleared')

    server.use(
      http.get('/v1/test', () =>
        HttpResponse.json(
          { error: 'Unauthorized', message: 'Bad key' },
          { status: 401 },
        ),
      ),
    )

    await apiRequest('/v1/test').catch(() => {})

    expect(localStorage.getItem('x-api-key')).toBeNull()
  })
})