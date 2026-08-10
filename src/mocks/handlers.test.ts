import { setupServer } from 'msw/node'
import { handlers } from './handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const VALID_CONTEXT =
  'The core benefits of cloud computing: pay-as-you-go pricing, elasticity, and the ability to scale compute up and down on demand.'

const MIN = 20
const MAX = 1500

async function createCertification(body: unknown): Promise<Response> {
  return fetch('/v1/certifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function validCreate(
  topics = [{ name: 'Amazon S3', context: VALID_CONTEXT }],
  code = 'CLF-C02',
) {
  return {
    provider: 'aws',
    code,
    name: 'AWS Certified Cloud Practitioner',
    description: 'Foundational AWS cloud certification.',
    isActive: true,
    config: {
      questionCount: 10,
      difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
      domains: [{ name: 'Cloud Concepts', weight: 100, topics }],
    },
  }
}

async function parse<T = unknown>(res: Response): Promise<T> {
  return res.json() as Promise<T>
}

describe('certifications mock - topic context contract', () => {
  it('seeds the catalog with topics that all carry at least 20-char context', async () => {
    const res = await fetch('/v1/certifications')
    const { items } = await parse<{
      items: Array<{ config: { domains: Array<{ topics: Array<{ context: string }> }> } }>
    }>(res)

    const contexts = items.flatMap((cert) =>
      cert.config.domains.flatMap((domain) => domain.topics.map((t) => t.context)),
    )
    expect(contexts.length).toBeGreaterThan(0)
    for (const context of contexts) {
      expect(context.trim().length).toBeGreaterThanOrEqual(MIN)
    }
  })

  it('creates a certification from object topics and returns topics with context', async () => {
    const res = await createCertification(validCreate(undefined, 'CODE-A'))
    expect(res.status).toBe(201)

    const cert = await parse(res)
    const topics = (cert as { config: { domains: Array<{ topics: unknown[] }> } })
      .config.domains[0].topics
    expect(topics[0]).toMatchObject({
      name: 'Amazon S3',
      context: VALID_CONTEXT,
    })
    expect(topics[0]).toHaveProperty('id')
  })

  it('rejects a bare-string topic with a 400', async () => {
    const res = await createCertification(
      validCreate(['Amazon S3'] as unknown as Array<{ name: string; context: string }>),
    )
    expect(res.status).toBe(400)
    const { message } = await parse<{ message: string }>(res)
    expect(message).toContain('config.domains.0.topics.0: Expected string, received object')
  })

  it('rejects a missing context with Required', async () => {
    const res = await createCertification(
      validCreate([{ name: 'Amazon S3' }] as unknown as Array<{
        name: string
        context: string
      }>),
    )
    expect(res.status).toBe(400)
    const { message } = await parse<{ message: string }>(res)
    expect(message).toContain('config.domains.0.topics.0.context: Required')
  })

  it('rejects an under-20 context after trimming', async () => {
    const res = await createCertification(
      validCreate([{ name: 'Amazon S3', context: 'short' }]),
    )
    expect(res.status).toBe(400)
    const { message } = await parse<{ message: string }>(res)
    expect(message).toContain(
      'config.domains.0.topics.0.context: String must contain at least 20 character(s)',
    )
  })

  it('rejects a whitespace-only context as too short', async () => {
    const res = await createCertification(
      validCreate([{ name: 'Amazon S3', context: '     ' }]),
    )
    expect(res.status).toBe(400)
    const { message } = await parse<{ message: string }>(res)
    expect(message).toContain('String must contain at least 20 character(s)')
  })

  it('rejects an over-1500 context', async () => {
    const res = await createCertification(
      validCreate([{ name: 'Amazon S3', context: 'x'.repeat(MAX + 1) }]),
    )
    expect(res.status).toBe(400)
    const { message } = await parse<{ message: string }>(res)
    expect(message).toContain(
      'config.domains.0.topics.0.context: String must contain at most 1500 character(s)',
    )
  })

  it('preserves domain and topic ids on update when names match, and reassigns renamed/new ones', async () => {
    const created = await createCertification(
      validCreate(
        [
          { name: 'Amazon S3', context: VALID_CONTEXT },
          { name: 'Amazon EC2', context: VALID_CONTEXT },
        ],
        'CODE-B',
      ),
    )
    const cert = await parse<{
      id: string
      name: string
      config: { domains: Array<{ id: string; topics: Array<{ id: string }> }> }
    }>(created)

    const domainId = cert.config.domains[0].id
    const s3Id = cert.config.domains[0].topics[0].id
    const ec2Id = cert.config.domains[0].topics[1].id

    const newContext = 'Amazon S3 covers object storage, storage classes, versioning, lifecycle rules, and website hosting.'
    const res = await fetch(`/v1/certifications/${cert.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cert.name,
        description: 'Updated',
        isActive: true,
        config: {
          questionCount: 10,
          difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
          domains: [
            {
              name: 'Cloud Concepts',
              weight: 100,
              topics: [
                { name: 'Amazon S3', context: newContext },
                { name: 'Amazon Lambda', context: VALID_CONTEXT },
              ],
            },
          ],
        },
      }),
    })

    expect(res.status).toBe(200)
    const updated = await parse<{
      config: { domains: Array<{ id: string; topics: Array<{ name: string; id: string; context: string }> }> }
    }>(res)

    const updatedDomain = updated.config.domains[0]
    expect(updatedDomain.id).toBe(domainId)

    const s3 = updatedDomain.topics.find((t) => t.name === 'Amazon S3')
    const lambda = updatedDomain.topics.find((t) => t.name === 'Amazon Lambda')

    expect(s3?.id).toBe(s3Id)
    expect(s3?.context).toBe(newContext)

    expect(lambda?.id).toBeDefined()
    expect(lambda?.id).not.toBe(ec2Id)

    const removed = updatedDomain.topics.find((t) => t.name === 'Amazon EC2')
    expect(removed).toBeUndefined()
  })

  it('round-trips a certification: create then PUT the GET body preserves context', async () => {
    const created = await createCertification(validCreate(undefined, 'CODE-C'))
    const cert = await parse<{ id: string }>(created)

    const getRes = await fetch(`/v1/certifications/${cert.id}`)
    const getBody = await parse<{
      provider: string
      code: string
      name: string
      description: string
      isActive: boolean
      config: unknown
    }>(getRes)

    const { provider: _provider, code: _code, ...roundTripBody } = getBody

    const putRes = await fetch(`/v1/certifications/${cert.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roundTripBody),
    })
    expect(putRes.status).toBe(200)

    const updated = await parse<{
      config: { domains: Array<{ topics: Array<{ context: string }> }> }
    }>(putRes)
    expect(updated.config.domains[0].topics[0].context).toBe(VALID_CONTEXT)
  })
})
