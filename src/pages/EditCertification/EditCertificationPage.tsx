import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { toastOn400 } from '@/lib/error-toast'
import { CertificationForm } from '@/components/certifications/CertificationForm'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { useCertification, useUpdateCertification } from '@/hooks/use-certifications'
import { toFormValues } from '@/lib/certification-form-values'
import type { CreateFormValues } from '@/lib/certification-schema'

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
        onError: toastOn400,
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
