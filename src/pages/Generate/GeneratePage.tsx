import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { useCertification } from '@/hooks/use-certifications'
import { useCreateExam } from '@/hooks/use-exams'
import { deriveExamPlan } from '@/lib/exam-plan'
import type { Difficulty } from '@/lib/types'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function GeneratePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: cert, error, isPending, refetch } = useCertification(id)
  const createExam = useCreateExam()

  const plan = cert ? deriveExamPlan(cert.config) : null

  const handleConfirm = () => {
    if (!id) return
    createExam.mutate(id, {
      onSuccess: (exam) => {
        toast.success('Exam generation started')
        navigate(`/exams/${exam.id}/status`, {
          state: { certificationId: id, certificationName: cert?.name },
        })
      },
    })
  }

  if (isPending) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading certification…
      </p>
    )
  }

  if (error || !cert || !plan) {
    return (
      <NetworkErrorBlock
        error={error ?? new Error('Certification not found')}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Catalog
        </Link>
      </div>

      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {cert.provider}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {cert.code}
          </span>
        </div>
        <h1 className="text-2xl font-medium">{cert.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{cert.description}</p>
      </div>

      {!cert.isActive && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100"
        >
          This certification is no longer active, so exam generation is disabled
          for it.
        </div>
      )}

      {createExam.error && (
        <div className="mb-6 rounded-lg border border-dashed p-4">
          <NetworkErrorBlock
            error={createExam.error}
            onRetry={handleConfirm}
          />
        </div>
      )}

      <section className="rounded-lg border p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">What's in your exam</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.questionCount} questions, broken down below.
            </p>
          </div>
          <Badge variant="secondary">{plan.questionCount} questions</Badge>
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Difficulty
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.difficulties.map((row) => (
              <div
                key={row.difficulty}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  {DIFFICULTY_LABELS[row.difficulty]}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {row.percent}% · ~{row.approximateQuestions} questions
                </span>
              </div>
            ))}
          </div>
        </div>

        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Knowledge domains
        </h3>
        <ul className="space-y-3">
          {plan.domains.map((domain) => (
            <li key={domain.name} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{domain.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {domain.weight}% · ~{domain.approximateQuestions} questions
                </Badge>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {domain.topics.map((topic) => (
                  <li
                    key={topic}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Question counts are approximate — the final exam composition can vary.
        </p>
      </section>

      <div className="mt-6 rounded-lg border bg-muted/30 p-5">
        <Button
          size="lg"
          className="w-full"
          onClick={handleConfirm}
          disabled={!cert.isActive || createExam.isPending}
        >
          {createExam.isPending
            ? 'Preparing…'
            : cert.isActive
              ? 'Generate exam'
              : 'Generation disabled'}
        </Button>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Generation usually takes a few minutes. You can leave this page — we'll
          notify you when your exam is ready.
        </p>
      </div>
    </div>
  )
}