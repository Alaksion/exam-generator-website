import { z } from 'zod'

export const difficultyTotalFor = (d: {
  easy: number
  medium: number
  hard: number
}): number => d.easy + d.medium + d.hard

export const difficultySumMessage = (total: number): string =>
  `Difficulty distribution must sum to 100 (currently ${total})`

export const domainWeightTotalFor = (
  domains: Array<{ weight: number }>,
): number => domains.reduce((sum, d) => sum + (Number(d.weight) || 0), 0)

export const domainWeightMessage = (total: number): string =>
  `Domain weights must sum to 100 (currently ${total})`

export const difficultyDistributionSchema = z.object({
  easy: z.coerce.number().int().min(0),
  medium: z.coerce.number().int().min(0),
  hard: z.coerce.number().int().min(0),
})

export const domainSchema = z.object({
  name: z.string().min(1, 'Domain name is required'),
  weight: z.coerce.number().int().min(1, 'Weight must be at least 1'),
  topics: z
    .array(z.string().min(1, 'Topic name is required'))
    .min(1, 'Add at least one topic'),
})

export const configSchema = z
  .object({
    questionCount: z.coerce
      .number()
      .int('Must be a whole number')
      .min(1, 'Must be at least 1')
      .max(100, 'Must be at most 100'),
    difficultyDistribution: difficultyDistributionSchema,
    domains: z.array(domainSchema).min(1, 'Add at least one domain'),
  })
  .superRefine((config, ctx) => {
    const difficultyTotal = difficultyTotalFor(config.difficultyDistribution)
    if (difficultyTotal !== 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['difficultyDistribution'],
        message: difficultySumMessage(difficultyTotal),
      })
    }

    const weightTotal = domainWeightTotalFor(config.domains)
    if (weightTotal !== 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['domains'],
        message: domainWeightMessage(weightTotal),
      })
    }
  })

export const createFormSchema = z.object({
  provider: z.enum(['aws', 'azure', 'gcp']),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  isActive: z.boolean(),
  config: configSchema,
})

export type CreateFormValues = z.infer<typeof createFormSchema>

export const PROVIDERS = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
] as const
