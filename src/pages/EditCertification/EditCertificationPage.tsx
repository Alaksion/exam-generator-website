import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CertificationForm } from '@/components/certifications/CertificationForm'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { useCertification, useUpdateCertification } from '@/hooks/use-certifications'
import type { CreateFormValues } from '@/lib/certification-schema'
import type { Certification } from '@/lib/types'

function toFormValues(cert: Certification): CreateFormValues {
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
          context: topic.context,
        })),
      })),
    },
  }
}

export function EditCertificationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, isPending, refetch } = useCertification(id)
  const updateCertification = useUpdateCertification()

  const initialValues = useMemo(
    () => (data ? toFormValues(data) : undefined),
    [data],
  )

  function handleSubmit(values: CreateFormValues) {
    const { provider: _provider, code: _code, ...input } = values
    updateCertification.mutate(
      { id: id as string, input },
      {
        onSuccess: () => {
          toast.success('Certification updated')
          navigate('/manage/certifications')
        },
      },
    )
  }

  if (isPending) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading certification…
      </p>
    )
  }

  if (error || !data) {
    return <NetworkErrorBlock error={error ?? new Error('Not found')} onRetry={refetch} />
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium">Edit certification</h1>
        <p className="text-sm text-muted-foreground">
          Update the certification settings and exam configuration.
        </p>
      </div>
      <CertificationForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={updateCertification.isPending}
      />
    </div>
  )
}
