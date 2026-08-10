import type { CreateFormValues } from '@/lib/certification-schema'
import type { Certification } from '@/lib/types'

export function toFormValues(cert: Certification): CreateFormValues {
  return {
    provider: cert.provider,
    code: cert.code,
    name: cert.name,
    description: cert.description,
    isActive: cert.isActive,
    config: {
      questionCount: cert.config.questionCount,
      difficultyDistribution: cert.config.difficultyDistribution,
      domains: cert.config.domains.map((domain) => ({
        name: domain.name,
        weight: domain.weight,
        topics: domain.topics.map((topic) => ({
          name: topic.name,
          context: topic.context ?? '',
        })),
      })),
    },
  }
}