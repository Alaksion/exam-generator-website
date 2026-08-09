import type { CertificationConfig, Difficulty } from '@/lib/types'

export interface DomainPlanRow {
  name: string
  weight: number
  topics: string[]
  approximateQuestions: number
}

export interface DifficultyPlanRow {
  difficulty: Difficulty
  percent: number
  approximateQuestions: number
}

export interface ExamPlan {
  questionCount: number
  domains: DomainPlanRow[]
  difficulties: DifficultyPlanRow[]
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

function approximateCount(questionCount: number, percent: number): number {
  return Math.round((percent / 100) * questionCount)
}

export function deriveExamPlan(config: CertificationConfig): ExamPlan {
  return {
    questionCount: config.questionCount,
    domains: config.domains.map((domain) => ({
      name: domain.name,
      weight: domain.weight,
      topics: domain.topics.map((topic) => topic.name),
      approximateQuestions: approximateCount(
        config.questionCount,
        domain.weight,
      ),
    })),
    difficulties: DIFFICULTIES.map((difficulty) => ({
      difficulty,
      percent: config.difficultyDistribution[difficulty],
      approximateQuestions: approximateCount(
        config.questionCount,
        config.difficultyDistribution[difficulty],
      ),
    })),
  }
}