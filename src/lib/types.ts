export type Provider = 'aws' | 'azure' | 'gcp'
export type Difficulty = 'easy' | 'medium' | 'hard'

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
