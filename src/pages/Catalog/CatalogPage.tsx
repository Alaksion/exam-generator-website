import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCertifications } from '@/hooks/use-certifications'
import { useCreateExam } from '@/hooks/use-exams'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { Button } from '@/components/ui/button'

export function CatalogPage() {
  const navigate = useNavigate()
  const { data, error, isPending, refetch } = useCertifications()
  const createExam = useCreateExam()

  const active = (data?.items ?? []).filter((cert) => cert.isActive)
  const handleGenerate = (certificationId: string) => {
    createExam.mutate(certificationId, {
      onSuccess: (exam) => {
        toast.success('Preparing your exam')
        navigate(`/exams/${exam.id}/status`)
      },
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium">Catalog</h1>
        <p className="text-sm text-muted-foreground">
          Generate a new practice exam from an active certification.
        </p>
      </div>

      {createExam.error && (
        <NetworkErrorBlock
          error={createExam.error}
          onRetry={() => createExam.reset()}
        />
      )}

      {isPending ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading certifications…
        </p>
      ) : error ? (
        <NetworkErrorBlock error={error} onRetry={() => refetch()} />
      ) : active.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No active certifications are available yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col justify-between rounded-lg border p-5"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {cert.provider}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {cert.code}
                  </span>
                </div>
                <h2 className="text-lg font-medium">{cert.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cert.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {cert.config.questionCount} questions
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => handleGenerate(cert.id)}
                disabled={createExam.isPending}
              >
                {createExam.isPending ? 'Preparing…' : 'Generate exam'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
