import { http, HttpResponse } from 'msw'

type Provider = 'aws' | 'azure' | 'gcp'
type Difficulty = 'easy' | 'medium' | 'hard'
type ExamStatus = 'GENERATING' | 'READY' | 'FAILED'

interface Topic {
  id: string
  name: string
  context: string
}

interface TopicInput {
  name: string
  context: string
}

interface KnowledgeDomain {
  id: string
  name: string
  weight: number
  topics: Topic[]
}

interface CertificationConfig {
  questionCount: number
  difficultyDistribution: Record<Difficulty, number>
  domains: KnowledgeDomain[]
}

interface Certification {
  id: string
  provider: Provider
  code: string
  name: string
  description: string
  isActive: boolean
  config: CertificationConfig
}

interface CertificationInput {
  provider: Provider
  code: string
  name: string
  description: string
  isActive: boolean
  config: {
    questionCount: number
    difficultyDistribution: Record<Difficulty, number>
    domains: Array<{ name: string; weight: number; topics: TopicInput[] }>
  }
}

interface AnswerOption {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  number: number
  domain: string
  domainId: string
  topic: string
  topicId: string
  difficulty: Difficulty
  text: string
  options: AnswerOption[]
  explanation: string
  reference?: string
}

interface Exam {
  id: string
  certificationId: string
  provider: Provider
  title: string
  status: ExamStatus
  createdAt: string
  finishedAt: string | null
  s3KeyJson?: string
  s3KeyPdf?: string
  questions?: Question[]
}

const uuid = () => crypto.randomUUID()

interface MockUser {
  sub: string
  email: string
  role: 'customer' | 'admin'
  createdAt: string
}

const users: MockUser[] = [
  {
    sub: 'u0000000-0000-0000-0000-000000000001',
    email: 'admin@exam.io',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    sub: 'u0000000-0000-0000-0000-000000000002',
    email: 'customer@exam.io',
    role: 'customer',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
]

function tokenToSub(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice('Bearer '.length)
}

function resolveUser(request: Request): MockUser | null {
  const sub = tokenToSub(request)
  if (!sub) return null
  return users.find((u) => u.sub === sub) ?? null
}

const providers: Provider[] = ['aws', 'azure', 'gcp']
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

function buildTopics(topics: TopicInput[], existing: Topic[] = []): Topic[] {
  return topics.map((topic) => {
    const match = existing.find((et) => et.name === topic.name)
    return match
      ? { ...match, name: topic.name, context: topic.context }
      : { id: uuid(), name: topic.name, context: topic.context }
  })
}

function buildCertification(input: CertificationInput): Certification {
  const domains: KnowledgeDomain[] = input.config.domains.map((d) => ({
    id: uuid(),
    name: d.name,
    weight: d.weight,
    topics: buildTopics(d.topics),
  }))

  return {
    id: uuid(),
    provider: input.provider,
    code: input.code,
    name: input.name,
    description: input.description,
    isActive: input.isActive,
    config: {
      questionCount: input.config.questionCount,
      difficultyDistribution: input.config.difficultyDistribution,
      domains,
    },
  }
}

let certifications: Certification[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    provider: 'aws',
    code: 'CLF-C02',
    name: 'AWS Certified Cloud Practitioner',
    description: 'Foundational AWS cloud certification.',
    isActive: true,
    config: {
      questionCount: 10,
      difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
      domains: [
        {
          id: 'd0000000-0000-0000-0000-000000000001',
          name: 'Cloud Concepts',
          weight: 40,
          topics: [
            {
              id: 't0000000-0000-0000-0000-000000000001',
              name: 'Cloud Value Proposition',
              context:
                'The core benefits of cloud computing: pay-as-you-go pricing, elasticity, and the ability to scale compute and storage on demand.',
            },
            {
              id: 't0000000-0000-0000-0000-000000000002',
              name: 'AWS Global Infrastructure',
              context:
                'AWS regions, Availability Zones, edge locations, and how the global network delivers low-latency and highly available services.',
            },
          ],
        },
        {
          id: 'd0000000-0000-0000-0000-000000000002',
          name: 'Technology',
          weight: 30,
          topics: [
            {
              id: 't0000000-0000-0000-0000-000000000003',
              name: 'Compute',
              context:
                'Amazon EC2 instance families and purchasing options, plus how compute, storage, and networking services fit together.',
            },
            {
              id: 't0000000-0000-0000-0000-000000000004',
              name: 'Storage',
              context:
                'Object, block, and file storage services including Amazon S3, EBS, and EFS, and when each is the right choice.',
            },
          ],
        },
      ],
    },
  },
]

const exams: Exam[] = []

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

function validateCertificationInput(
  input: CertificationInput,
  allowImmutables: boolean,
): string | null {
  if (!allowImmutables) {
    if (
      Object.prototype.hasOwnProperty.call(input, 'provider') ||
      Object.prototype.hasOwnProperty.call(input, 'code')
    ) {
      return 'provider and code are immutable and may not be present'
    }
  } else if (!providers.includes(input.provider) || !input.code) {
    return 'provider and code are required'
  }

  if (
    input.config == null ||
    typeof input.name !== 'string' ||
    !input.name ||
    typeof input.description !== 'string' ||
    typeof input.isActive !== 'boolean'
  ) {
    return 'name, description, isActive, and config are required'
  }

  const { questionCount, difficultyDistribution, domains } = input.config
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > 100
  ) {
    return 'questionCount must be an integer between 1 and 100'
  }

  const diffTotal = sum(difficulties.map((d) => difficultyDistribution[d]))
  if (
    !difficulties.every(
      (d) => Number.isInteger(difficultyDistribution[d]) && difficultyDistribution[d] >= 0,
    ) ||
    diffTotal !== 100
  ) {
    return 'difficultyDistribution must be integers that sum to 100'
  }

  if (!Array.isArray(domains) || domains.length < 1) {
    return 'at least one domain is required'
  }
  const weightTotal = sum(domains.map((d) => d.weight))
  if (
    domains.some((d) => !Number.isInteger(d.weight) || d.weight < 1 || d.topics.length < 1) ||
    weightTotal !== 100
  ) {
    return 'domain weights must be integers that sum to 100, each with at least one topic'
  }

  const topicIssues: string[] = []
  domains.forEach((domain, domainIndex) => {
    domain.topics.forEach((topic, topicIndex) => {
      const path = (field?: string) =>
        ['config', 'domains', String(domainIndex), 'topics', String(topicIndex), ...(field ? [field] : [])].join('.')
      if (typeof topic !== 'object' || topic === null || Array.isArray(topic)) {
        topicIssues.push(`${path()}: Expected string, received object`)
        return
      }
      const name = (topic as TopicInput).name
      const context = (topic as TopicInput).context
      if (typeof name !== 'string' || !name.trim()) {
        topicIssues.push(`${path('name')}: Required`)
      }
      if (context === undefined) {
        topicIssues.push(`${path('context')}: Required`)
      } else if (typeof context !== 'string') {
        topicIssues.push(`${path('context')}: Expected string, received ${typeof context}`)
      } else {
        const trimmed = context.trim()
        if (trimmed.length < 20) {
          topicIssues.push(`${path('context')}: String must contain at least 20 character(s)`)
        } else if (trimmed.length > 1500) {
          topicIssues.push(`${path('context')}: String must contain at most 1500 character(s)`)
        }
      }
    })
  })
  if (topicIssues.length > 0) {
    return topicIssues.join('; ')
  }

  return null
}

function buildQuestions(cert: Certification): Question[] {
  const questions: Question[] = []
  for (let i = 0; i < cert.config.questionCount; i++) {
    const domain = cert.config.domains[i % cert.config.domains.length]
    const topic = domain.topics[i % domain.topics.length]
    const difficulty = difficulties[i % difficulties.length]
    questions.push({
      id: uuid(),
      number: i + 1,
      domain: domain.name,
      domainId: domain.id,
      topic: topic.name,
      topicId: topic.id,
      difficulty,
      text: `Sample ${difficulty} question for ${domain.name}/${topic.name}?`,
      options: [
        { id: uuid(), label: 'A', text: 'Correct answer', isCorrect: true },
        { id: uuid(), label: 'B', text: 'Incorrect option', isCorrect: false },
        { id: uuid(), label: 'C', text: 'Incorrect option', isCorrect: false },
        { id: uuid(), label: 'D', text: 'Incorrect option', isCorrect: false },
      ],
      explanation: 'Sample explanation.',
    })
  }
  return questions
}

function completeExam(exam: Exam): void {
  exam.status = 'READY'
  exam.finishedAt = new Date().toISOString()
  const cert = certifications.find((c) => c.id === exam.certificationId)
  if (cert) {
    exam.questions = buildQuestions(cert)
    exam.provider = cert.provider
    exam.title = `${cert.name} - Practice Exam ${exam.createdAt}`
    exam.s3KeyJson = `exams/${exam.id}/exam.json`
    exam.s3KeyPdf = `exams/${exam.id}/exam.pdf`
  }
}

export const handlers = [
  http.get('/v1/health', () => HttpResponse.json({ status: 'ok' })),

  http.get('/v1/me', ({ request }) => {
    const user = resolveUser(request)
    if (!user) {
      return HttpResponse.json(
        { error: 'Unauthorized', message: 'Missing or invalid bearer token.' },
        { status: 401 },
      )
    }
    return HttpResponse.json(user)
  }),

  http.get('/v1/certifications', () =>
    HttpResponse.json({ items: certifications }),
  ),

  http.get('/v1/certifications/:id', ({ params }) => {
    const cert = certifications.find((c) => c.id === params.id)
    if (!cert) {
      return HttpResponse.json(
        { error: 'NotFound', message: 'Certification not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(cert)
  }),

  http.post('/v1/certifications', async ({ request }) => {
    const input = (await request.json()) as CertificationInput
    const invalid = validateCertificationInput(input, true)
    if (invalid) {
      return HttpResponse.json({ error: 'InvalidRequest', message: invalid }, { status: 400 })
    }
    if (
      certifications.some(
        (c) => c.provider === input.provider && c.code === input.code,
      )
    ) {
      return HttpResponse.json(
        {
          error: 'Conflict',
          message: `Certification (${input.provider}, ${input.code}) already exists.`,
        },
        { status: 409 },
      )
    }
    const cert = buildCertification(input)
    certifications.push(cert)
    return HttpResponse.json(cert, { status: 201 })
  }),

  http.put('/v1/certifications/:id', async ({ params, request }) => {
    const cert = certifications.find((c) => c.id === params.id)
    if (!cert) {
      return HttpResponse.json(
        { error: 'NotFound', message: 'Certification not found.' },
        { status: 404 },
      )
    }
    const input = (await request.json()) as CertificationInput
    const invalid = validateCertificationInput(input, false)
    if (invalid) {
      return HttpResponse.json({ error: 'InvalidRequest', message: invalid }, { status: 400 })
    }
    const config = input.config
    const domains: KnowledgeDomain[] = config.domains.map((d) => {
      const existingDomain = cert.config.domains.find((ed) => ed.name === d.name)
      return {
        id: existingDomain ? existingDomain.id : uuid(),
        name: d.name,
        weight: d.weight,
        topics: buildTopics(d.topics, existingDomain?.topics),
      }
    })
    cert.name = input.name
    cert.description = input.description
    cert.isActive = input.isActive
    cert.config = {
      questionCount: config.questionCount,
      difficultyDistribution: config.difficultyDistribution,
      domains,
    }
    return HttpResponse.json(cert)
  }),

  http.post('/v1/exams', async ({ request }) => {
    const body = (await request.json()) as { certificationId: string }
    const cert = certifications.find((c) => c.id === body.certificationId)
    if (!cert || !cert.isActive) {
      return HttpResponse.json(
        { error: 'NotFound', message: 'Certification does not exist or is inactive.' },
        { status: 404 },
      )
    }
    const now = new Date().toISOString()
    const exam: Exam = {
      id: uuid(),
      certificationId: cert.id,
      provider: cert.provider,
      title: `${cert.name} - Practice Exam ${now}`,
      status: 'GENERATING',
      createdAt: now,
      finishedAt: null,
    }
    exams.push(exam)
    setTimeout(() => completeExam(exam), 1200)
    return HttpResponse.json(
      { id: exam.id, status: exam.status },
      { status: 201 },
    )
  }),

  http.get('/v1/exams', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? 'READY'
    const provider = url.searchParams.get('provider')
    const certificationId = url.searchParams.get('certificationId')
    const limit = Number(url.searchParams.get('limit') ?? '20')

    let items = exams.filter((e) => e.status === status)
    if (provider) items = items.filter((e) => e.provider === provider)
    if (certificationId) {
      items = items.filter((e) => e.certificationId === certificationId)
    }

    const page = items.slice(0, limit).map(({ questions: _questions, ...meta }) => meta)
    return HttpResponse.json({
      items: page,
      cursor: { nextCursor: null, hasNextPage: items.length > limit },
    })
  }),

  http.get('/v1/exams/:id', ({ params }) => {
    const exam = exams.find((e) => e.id === params.id)
    if (!exam) {
      return HttpResponse.json({ error: 'NotFound', message: 'Exam not found.' }, { status: 404 })
    }
    if (exam.status !== 'READY') {
      return HttpResponse.json(
        { error: 'ExamNotReady', message: 'The exam is not ready yet.' },
        { status: 409 },
      )
    }
    return HttpResponse.json({
      schemaVersion: '1.0.0',
      id: exam.id,
      certificationId: exam.certificationId,
      title: exam.title,
      status: exam.status,
      createdAt: exam.createdAt,
      finishedAt: exam.finishedAt,
      questions: exam.questions,
    })
  }),

  http.get('/v1/exams/:id/status', ({ params }) => {
    const exam = exams.find((e) => e.id === params.id)
    if (!exam) {
      return HttpResponse.json({ error: 'NotFound', message: 'Exam not found.' }, { status: 404 })
    }
    return HttpResponse.json({
      id: exam.id,
      status: exam.status,
      createdAt: exam.createdAt,
      finishedAt: exam.finishedAt,
    })
  }),

  http.get('/v1/exams/:id/download', ({ params }) => {
    const exam = exams.find((e) => e.id === params.id)
    if (!exam) {
      return HttpResponse.json({ error: 'NotFound', message: 'Exam not found.' }, { status: 404 })
    }
    if (exam.status !== 'READY') {
      return HttpResponse.json(
        { error: 'ExamNotReady', message: 'The exam is not ready yet.' },
        { status: 409 },
      )
    }
    return HttpResponse.json({
      downloadUrl: `https://example.com/${exam.s3KeyPdf}?signature=mock`,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    })
  }),

  http.delete('/v1/exams/:id', ({ params }) => {
    const index = exams.findIndex((e) => e.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'NotFound', message: 'Exam not found.' }, { status: 404 })
    }
    exams.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
