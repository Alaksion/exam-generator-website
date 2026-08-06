import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { setApiKey, clearApiKey, ApiRequestError } from '@/lib/api'
import { createExam, getExam, getExamStatus } from '@/lib/exams-api'

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

describe('getExamStatus', () => {
  it('GETs the exam status by id', async () => {
    setApiKey('my-key')
    let capturedPath = ''

    server.use(
      http.get('/v1/exams/:id/status', ({ params }) => {
        capturedPath = new URL(
          `/v1/exams/${params.id}/status`,
          'http://test',
        ).pathname
        return HttpResponse.json(
          { id: params.id, status: 'GENERATING', createdAt: '2026-01-01T00:00:00Z', finishedAt: null },
        )
      }),
    )

    const result = await getExamStatus('e0000000-0000-0000-0000-000000000001')

    expect(capturedPath).toBe('/v1/exams/e0000000-0000-0000-0000-000000000001/status')
    expect(result).toEqual({
      id: 'e0000000-0000-0000-0000-000000000001',
      status: 'GENERATING',
      createdAt: '2026-01-01T00:00:00Z',
      finishedAt: null,
    })
  })

  it('throws ApiRequestError with status 404 when the exam is unknown', async () => {
    server.use(
      http.get('/v1/exams/:id/status', () =>
        HttpResponse.json(
          { error: 'NotFound', message: 'Exam not found.' },
          { status: 404 },
        ),
      ),
    )

    const err = await getExamStatus('nope').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(404)
  })
})

describe('getExam', () => {
  it('GETs the full ready exam by id', async () => {
    setApiKey('my-key')
    let capturedPath = ''

    server.use(
      http.get('/v1/exams/:id', ({ params }) => {
        capturedPath = new URL(`/v1/exams/${params.id}`, 'http://test').pathname
        return HttpResponse.json(
          {
            schemaVersion: '1.0.0',
            id: params.id,
            certificationId: 'c1',
            title: 'AWS - Practice Exam',
            status: 'READY',
            createdAt: '2026-01-01T00:00:00Z',
            finishedAt: '2026-01-01T00:00:01Z',
            questions: [],
          },
          { status: 200 },
        )
      }),
    )

    const result = await getExam('e0000000-0000-0000-0000-000000000001')

    expect(capturedPath).toBe('/v1/exams/e0000000-0000-0000-0000-000000000001')
    expect(result.status).toBe('READY')
    expect(result.title).toBe('AWS - Practice Exam')
  })

  it('throws ApiRequestError with status 409 when the exam is not ready', async () => {
    server.use(
      http.get('/v1/exams/:id', () =>
        HttpResponse.json(
          { error: 'ExamNotReady', message: 'The exam is not ready yet.' },
          { status: 409 },
        ),
      ),
    )

    const err = await getExam('nope').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(409)
  })
})
