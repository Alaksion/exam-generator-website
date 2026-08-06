import { afterEach, describe, expect, it } from 'vitest'
import type { Question } from '@/lib/types'
import { clearAttempt, loadAttempt, saveAttempt, scoreExam } from '@/lib/attempts'

const q = (
  id: string,
  domainId: string,
  domain: string,
  correctId: string,
  wrongId: string,
): Question => ({
  id,
  number: Number(id.slice(1)),
  domain,
  domainId,
  topic: 'Topic',
  topicId: 't1',
  difficulty: 'easy',
  text: `Question ${id}?`,
  options: [
    { id: correctId, label: 'A', text: 'Correct', isCorrect: true },
    { id: wrongId, label: 'B', text: 'Wrong', isCorrect: false },
  ],
  explanation: 'explanation',
})

describe('scoreExam', () => {
  it('computes the percentage score across all questions', () => {
    const questions = [
      q('q1', 'd1', 'Domain A', 'a1', 'b1'),
      q('q2', 'd1', 'Domain A', 'a2', 'b2'),
      q('q3', 'd2', 'Domain B', 'a3', 'b3'),
      q('q4', 'd2', 'Domain B', 'a4', 'b4'),
    ]
    const { score } = scoreExam(questions, { q1: 'a1', q2: 'b2', q3: 'a3', q4: 'b4' })
    expect(score).toBe(50)
  })

  it('builds a per-domain breakdown of correct and total', () => {
    const questions = [
      q('q1', 'd1', 'Domain A', 'a1', 'b1'),
      q('q2', 'd1', 'Domain A', 'a2', 'b2'),
      q('q3', 'd2', 'Domain B', 'a3', 'b3'),
    ]
    const { breakdown } = scoreExam(questions, { q1: 'a1', q2: 'b2', q3: 'a3' })
    expect(breakdown).toEqual([
      { domainId: 'd1', domain: 'Domain A', correct: 1, total: 2 },
      { domainId: 'd2', domain: 'Domain B', correct: 1, total: 1 },
    ])
  })

  it('counts unanswered questions as incorrect', () => {
    const questions = [
      q('q1', 'd1', 'Domain A', 'a1', 'b1'),
      q('q2', 'd1', 'Domain A', 'a2', 'b2'),
    ]
    const { score, breakdown } = scoreExam(questions, { q1: 'a1' })
    expect(score).toBe(50)
    expect(breakdown[0]).toEqual({ domainId: 'd1', domain: 'Domain A', correct: 1, total: 2 })
  })
})

describe('attempt storage', () => {
  afterEach(() => clearAttempt())

  it('round-trips an attempt through localStorage', () => {
    const attempt = {
      examId: 'e1',
      submittedAt: '2026-01-01T00:00:00Z',
      answers: { q1: 'a1' },
      score: 100,
      breakdown: [{ domainId: 'd1', domain: 'Domain A', correct: 1, total: 1 }],
    }
    saveAttempt(attempt)
    expect(loadAttempt()).toEqual(attempt)
  })

  it('returns null when nothing is stored', () => {
    expect(loadAttempt()).toBeNull()
  })

  it('clears the stored attempt', () => {
    saveAttempt({
      examId: 'e1',
      submittedAt: '2026-01-01T00:00:00Z',
      answers: {},
      score: 0,
      breakdown: [],
    })
    clearAttempt()
    expect(loadAttempt()).toBeNull()
  })
})