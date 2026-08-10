import { describe, expect, it } from 'vitest'
import { toFormValues } from '@/lib/certification-form-values'
import type { Certification } from '@/lib/types'

function baseCert(): Certification {
  return {
    id: 'c1',
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
          id: 'd1',
          name: 'Cloud Concepts',
          weight: 100,
          topics: [
            {
              id: 't1',
              name: 'Cloud Value Proposition',
              context:
                'Covers the core value proposition of cloud computing, including cost efficiency, elasticity, and on-demand access.',
            },
          ],
        },
      ],
    },
  }
}

function contextIn(values: ReturnType<typeof toFormValues>): string {
  return values.config.domains[0].topics[0].context
}

describe('toFormValues topic context', () => {
  it('carries an existing topic context through to form values', () => {
    const cert = baseCert()
    expect(contextIn(toFormValues(cert))).toBe(
      cert.config.domains[0].topics[0].context,
    )
  })

  it('defaults a missing topic context to an empty string', () => {
    const cert = {
      ...baseCert(),
      config: {
        ...baseCert().config,
        domains: [
          {
            ...baseCert().config.domains[0],
            topics: [{ id: 't1', name: 'Cloud Value Proposition' }],
          },
        ],
      },
    } as unknown as Certification
    expect(contextIn(toFormValues(cert))).toBe('')
  })

  it('defaults a null topic context to an empty string', () => {
    const cert = baseCert()
    cert.config.domains[0].topics[0] = {
      ...cert.config.domains[0].topics[0],
      context: null as unknown as string,
    }
    expect(contextIn(toFormValues(cert))).toBe('')
  })

  it('keeps an empty topic context as an empty string', () => {
    const cert = baseCert()
    cert.config.domains[0].topics[0].context = ''
    expect(contextIn(toFormValues(cert))).toBe('')
  })
})