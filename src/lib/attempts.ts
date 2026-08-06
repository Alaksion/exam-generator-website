import type { Attempt, DomainBreakdown, Question } from '@/lib/types'

export function scoreExam(
  questions: Question[],
  answers: Record<string, string>,
): { score: number; breakdown: DomainBreakdown[] } {
  const domains = new Map<
    string,
    { domainId: string; domain: string; correct: number; total: number }
  >()

  for (const question of questions) {
    const bucket = domains.get(question.domainId) ?? {
      domainId: question.domainId,
      domain: question.domain,
      correct: 0,
      total: 0,
    }
    bucket.total += 1
    if (answers[question.id] !== undefined) {
      const option = question.options.find((o) => o.id === answers[question.id])
      if (option?.isCorrect) bucket.correct += 1
    }
    domains.set(question.domainId, bucket)
  }

  const breakdown: DomainBreakdown[] = [...domains.values()].map(
    ({ domainId, domain, correct, total }) => ({ domainId, domain, correct, total }),
  )

  const total = questions.length
  const correct = breakdown.reduce((sum, d) => sum + d.correct, 0)
  const score = total === 0 ? 0 : Math.round((correct / total) * 100)

  return { score, breakdown }
}

const STORAGE_KEY = 'attempt'

export function saveAttempt(attempt: Attempt): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempt))
}

export function loadAttempt(): Attempt | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Attempt
  } catch {
    return null
  }
}

export function clearAttempt(): void {
  localStorage.removeItem(STORAGE_KEY)
}