import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { toastOn400 } from '@/lib/error-toast'
import { CertificationForm } from '@/components/certifications/CertificationForm'
import { useCreateCertification } from '@/hooks/use-certifications'
import type { CreateFormValues } from '@/lib/certification-schema'

export function NewCertificationPage() {
  const navigate = useNavigate()
  const createCertification = useCreateCertification()

  function handleSubmit(values: CreateFormValues) {
    createCertification.mutate(values, {
      onSuccess: () => {
        toast.success('Certification created')
        navigate('/manage/certifications')
      },
      onError: toastOn400,
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium">New certification</h1>
        <p className="text-sm text-muted-foreground">
          Define the certification settings and how generated exams are configured.
        </p>
      </div>
      <CertificationForm
        onSubmit={handleSubmit}
        isSubmitting={createCertification.isPending}
      />
    </div>
  )
}
