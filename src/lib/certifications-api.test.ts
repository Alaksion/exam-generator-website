import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { ApiRequestError } from '@/lib/api'
import { getCertification, updateCertification } from '@/lib/certifications-api'
import type { CertificationUpdate } from '@/lib/types'
import { clearSession, saveIdAccess } from '@/lib/session'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  clearSession()
})
afterAll(() => server.close())

const cert = {
  id: 'c0000000-0000-0000-0000-000000000001',
  provider: 'aws' as const,
  code: 'CLF-C02',
  name: 'AWS Certified Cloud Practitioner',
  description: 'Foundational AWS cloud certification.',
  isActive: true,
  config: {
    questionCount: 10,
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
    domains: [
      {
        id: 'd1',
        name: 'Cloud Concepts',
        weight: 100,
        topics: [
          {
            id: 't1',
            name: 'Cloud Value Proposition',
            context:
              'Covers the core value proposition of cloud computing, including cost efficiency and scalability.',
          },
        ],
      },
    ],
  },
}

const update: CertificationUpdate = {
  name: 'Renamed',
  description: 'Updated description',
  isActive: false,
  config: {
    questionCount: 20,
    difficultyDistribution: { easy: 50, medium: 30, hard: 20 },
    domains: [
      {
        name: 'Security',
        weight: 100,
        topics: [
          {
            name: 'Shared Responsibility',
            context:
              'Explains the shared responsibility model between the cloud provider and the customer.',
          },
        ],
      },
    ],
  },
}

describe('getCertification', () => {
  it('GETs a certification by id', async () => {
    saveIdAccess({ idToken: 'id-token', accessToken: 'access-token' })
    let capturedPath = ''

    server.use(
      http.get('/v1/certifications/:id', ({ params }) => {
        capturedPath = new URL(
          `/v1/certifications/${params.id}`,
          'http://test',
        ).pathname
        return HttpResponse.json(cert)
      }),
    )

    const result = await getCertification(cert.id)

    expect(capturedPath).toBe(
      '/v1/certifications/c0000000-0000-0000-0000-000000000001',
    )
    expect(result).toEqual(cert)
  })

  it('throws ApiRequestError with status 404 when the certification is unknown', async () => {
    server.use(
      http.get('/v1/certifications/:id', () =>
        HttpResponse.json(
          { error: 'NotFound', message: 'Certification not found.' },
          { status: 404 },
        ),
      ),
    )

    const err = await getCertification('nope').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(404)
  })
})

describe('updateCertification', () => {
  it('PUTs only the mutable fields to /v1/certifications/:id', async () => {
    saveIdAccess({ idToken: 'id-token', accessToken: 'access-token' })
    let capturedPath = ''
    let capturedMethod = ''
    let capturedBody: unknown

    server.use(
      http.put('/v1/certifications/:id', async ({ params, request }) => {
        capturedPath = new URL(
          `/v1/certifications/${params.id}`,
          'http://test',
        ).pathname
        capturedMethod = request.method
        capturedBody = await request.json()
        return HttpResponse.json(cert)
      }),
    )

    const result = await updateCertification(cert.id, update)

    expect(capturedMethod).toBe('PUT')
    expect(capturedPath).toBe(
      '/v1/certifications/c0000000-0000-0000-0000-000000000001',
    )
    expect(capturedBody).toEqual(update)
    expect(capturedBody).not.toHaveProperty('provider')
    expect(capturedBody).not.toHaveProperty('code')
    expect(result).toEqual(cert)
  })

  it('throws ApiRequestError with status 404 when the certification is unknown', async () => {
    server.use(
      http.put('/v1/certifications/:id', () =>
        HttpResponse.json(
          { error: 'NotFound', message: 'Certification not found.' },
          { status: 404 },
        ),
      ),
    )

    const err = await updateCertification('nope', update).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(404)
  })

  it('throws ApiRequestError with status 400 on an invalid request', async () => {
    server.use(
      http.put('/v1/certifications/:id', () =>
        HttpResponse.json(
          { error: 'InvalidRequest', message: 'name is required' },
          { status: 400 },
        ),
      ),
    )

    const err = await updateCertification(cert.id, update).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiRequestError)
    expect((err as ApiRequestError).status).toBe(400)
    expect((err as ApiRequestError).code).toBe('InvalidRequest')
  })
})
