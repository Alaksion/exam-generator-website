import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCreateExam } from '@/hooks/use-exams'
import { useExamStatus } from '@/hooks/use-exam-status'
import { Button } from '@/components/ui/button'

interface StatusLocationState {
  certificationId?: string
}

export function ExamStatusPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as StatusLocationState | null
  const certificationId = state?.certificationId

  const { status, error } = useExamStatus(id)
  const createExam = useCreateExam()

  useEffect(() => {
    if (status === 'READY' && id) {
      navigate(`/exams/${id}`, { replace: true })
    }
  }, [status, id, navigate])

  const handleGenerateNew = () => {
    if (!certificationId) return
    createExam.mutate(certificationId, {
      onSuccess: (exam) => {
        toast.success('Preparing your exam')
        navigate(`/exams/${exam.id}/status`, {
          replace: true,
          state: { certificationId },
        })
      },
    })
  }

  return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-medium">Preparing your exam</h1>

      {status === 'FAILED' || error ? (
        <div className="mx-auto mt-6 max-w-sm rounded-lg border border-dashed p-6">
          <p className="text-sm text-muted-foreground">
            We couldn't finish generating this exam.
          </p>
          {certificationId ? (
            <Button
              className="mt-4"
              onClick={handleGenerateNew}
              disabled={createExam.isPending}
            >
              {createExam.isPending ? 'Preparing…' : 'Generate new exam'}
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Back to catalog
            </button>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait a moment while we generate your exam.
        </p>
      )}
    </div>
  )
}
