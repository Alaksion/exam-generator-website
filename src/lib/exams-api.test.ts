import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { setApiKey, clearApiKey, ApiRequestError } from '@/lib/api'
import { createExam } from '@/lib/exams-api'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  clearApiKey()
})
afterAll(() => server.close())

describe('createExam', () => {
  it('POSTs the certification id and returns the new exam id and status', async () => {
    setApiKey('my-key')
    let capturedBody: unknown
    let capturedMethod = ''
    let capturedPath = ''

    server.use(
      http.post('/v1/exams', async ({ request }) => {
        capturedMethod = request.method
        capturedPath = new URL(request.url).pathname
        capturedBody = await request.json()
        return HttpResponse.json(
          { id: 'e0000000-0000-0000-0000-000000000001', status: 'GENERATING' },
          { status: 201 },
        )
      }),
    )

    const result = await createExam('c0000000-0000-0000-0000-000000000001')

    expect(capturedMethod).toBe('POST')
    expect(capturedPath).toBe('/v1/exams')
    expect(capturedBody).toEqual({
      certificationId: 'c0000000-0000-0000-0000-000000000001',
    })
    expect(result).toEqual({
      id: 'e0000000-0000-0000-0000-000000000001',
      status: 'GENERATING',
    })
  })

  it('throws ApiRequestError with status 404 when certification is unknown', async () => {
    server.use(
      http.post('/v1/exams', () =>
        HttpResponse.json(
          { error: 'NotFound', message: 'Certification does not exist or is inactive.' },
          { status: 404 },
        ),
      ),
    )

    const err = await createExam('c0000000-0000-0000-0000-000000000001').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(404)
    expect((err as ApiRequestError).code).toBe('NotFound')
  })

  it('throws ApiRequestError with status 409 when generation conflicts', async () => {
    server.use(
      http.post('/v1/exams', () =>
        HttpResponse.json(
          { error: 'Conflict', message: 'A conflict occurred.' },
          { status: 409 },
        ),
      ),
    )

    const err = await createExam('c0000000-0000-0000-0000-000000000001').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(409)
  })
})
