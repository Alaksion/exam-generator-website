export type Provider = 'aws' | 'azure' | 'gcp'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ExamStatus = 'GENERATING' | 'READY' | 'FAILED'

export interface AnswerOption {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

export interface Question {
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

export interface FullExam {
  schemaVersion: string
  id: string
  certificationId: string
  title: string
  status: ExamStatus
  createdAt: string
  finishedAt: string | null
  questions: Question[]
}

export interface ExamListItem {
  id: string
  certificationId: string
  provider: Provider
  title: string
  status: ExamStatus
  createdAt: string
  finishedAt: string | null
}

export interface ExamPage {
  items: ExamListItem[]
  cursor: { nextCursor: string | null; hasNextPage: boolean }
}

export interface ExamListParams {
  status?: string
  provider?: Provider
  certificationId?: string
}

export interface DomainBreakdown {
  domain: string
  domainId: string
  correct: number
  total: number
}

export interface Attempt {
  examId: string
  submittedAt: string
  answers: Record<string, string>
  score: number
  breakdown: DomainBreakdown[]
}

export interface Topic {
  id: string
  name: string
}

export interface KnowledgeDomain {
  id: string
  name: string
  weight: number
  topics: Topic[]
}

export interface CertificationConfig {
  questionCount: number
  difficultyDistribution: Record<Difficulty, number>
  domains: KnowledgeDomain[]
}

export interface Certification {
  id: string
  provider: Provider
  code: string
  name: string
  description: string
  isActive: boolean
  config: CertificationConfig
}

export interface DomainInput {
  name: string
  weight: number
  topics: string[]
}

export interface CertificationConfigInput {
  questionCount: number
  difficultyDistribution: Record<Difficulty, number>
  domains: DomainInput[]
}

export interface CertificationInput {
  provider: Provider
  code: string
  name: string
  description: string
  isActive: boolean
  config: CertificationConfigInput
}

export interface CertificationUpdate {
  name: string
  description: string
  isActive: boolean
  config: CertificationConfigInput
}
