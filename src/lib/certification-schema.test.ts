import { describe, expect, it } from 'vitest'
import { createFormSchema } from '@/lib/certification-schema'

const VALID_CONTEXT =
  'Amazon S3 is AWS persistent object storage. Covers the storage classes, bucket policies, versioning, lifecycle rules, and encryption at rest and in transit.'

function validForm() {
  return {
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
          name: 'Cloud Concepts',
          weight: 100,
          topics: [{ name: 'Amazon S3', context: VALID_CONTEXT }],
        },
      ],
    },
  }
}

describe('createFormSchema topics', () => {
  it('accepts topics as { name, context } objects with a valid context', () => {
    const result = createFormSchema.safeParse(validForm())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.config.domains[0].topics).toEqual([
        { name: 'Amazon S3', context: VALID_CONTEXT },
      ])
    }
  })

  it('rejects a topic with an empty name', () => {
    const form = validForm()
    form.config.domains[0].topics[0].name = ''
    const result = createFormSchema.safeParse(form)
    expect(result.success).toBe(false)
  })

  it('rejects a topic whose context is under 20 characters after trimming', () => {
    const form = validForm()
    form.config.domains[0].topics[0].context = 'Short context'
    const result = createFormSchema.safeParse(form)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Topic context must be at least 20 characters')
    }
  })

  it('rejects a whitespace-only context as too short', () => {
    const form = validForm()
    form.config.domains[0].topics[0].context = '     '
    const result = createFormSchema.safeParse(form)
    expect(result.success).toBe(false)
  })

  it('rejects a topic whose context exceeds 1500 characters', () => {
    const form = validForm()
    form.config.domains[0].topics[0].context = 'x'.repeat(1501)
    const result = createFormSchema.safeParse(form)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Topic context must be at most 1500 characters')
    }
  })

  it('accepts a context of exactly 20 characters after trimming', () => {
    const form = validForm()
    form.config.domains[0].topics[0].context = '01234567890123456789'
    expect(createFormSchema.safeParse(form).success).toBe(true)
  })

  it('trims context whitespace in the parsed output', () => {
    const form = validForm()
    form.config.domains[0].topics[0].context = `  ${VALID_CONTEXT}  `
    const result = createFormSchema.safeParse(form)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.config.domains[0].topics[0].context).toBe(VALID_CONTEXT)
    }
  })
})