import { describe, expect, it } from 'vitest'
import { deriveExamPlan } from '@/lib/exam-plan'
import type { CertificationConfig } from '@/lib/types'

function exampleConfig(): CertificationConfig {
  return {
    questionCount: 10,
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
    domains: [
      {
        id: 'd1',
        name: 'Cloud Concepts',
        weight: 40,
        topics: [
          { id: 't1', name: 'Cloud Value Proposition' },
          { id: 't2', name: 'AWS Global Infrastructure' },
        ],
      },
      {
        id: 'd2',
        name: 'Technology',
        weight: 20,
        topics: [{ id: 't3', name: 'Compute' }],
      },
    ],
  }
}

describe('deriveExamPlan', () => {
  it('carries through the question count', () => {
    expect(deriveExamPlan(exampleConfig()).questionCount).toBe(10)
  })

  it('derives an approximate question count per domain from its weight', () => {
    const plan = deriveExamPlan(exampleConfig())
    expect(plan.domains).toHaveLength(2)
    expect(plan.domains[0]).toMatchObject({
      name: 'Cloud Concepts',
      weight: 40,
      approximateQuestions: 4,
    })
    expect(plan.domains[1]).toMatchObject({
      name: 'Technology',
      weight: 20,
      approximateQuestions: 2,
    })
  })

  it('rounds derived counts to whole questions', () => {
    const config = exampleConfig()
    config.questionCount = 10
    config.domains[0].weight = 33
    config.domains[1].weight = 17
    const plan = deriveExamPlan(config)
    expect(plan.domains[0].approximateQuestions).toBe(3)
    expect(plan.domains[1].approximateQuestions).toBe(2)
  })

  it('derives an approximate question count per difficulty from the split', () => {
    const plan = deriveExamPlan(exampleConfig())
    expect(plan.difficulties).toEqual([
      { difficulty: 'easy', percent: 40, approximateQuestions: 4 },
      { difficulty: 'medium', percent: 40, approximateQuestions: 4 },
      { difficulty: 'hard', percent: 20, approximateQuestions: 2 },
    ])
  })

  it('flattens a domain to its topic names', () => {
    const plan = deriveExamPlan(exampleConfig())
    expect(plan.domains[0].topics).toEqual([
      'Cloud Value Proposition',
      'AWS Global Infrastructure',
    ])
  })
})