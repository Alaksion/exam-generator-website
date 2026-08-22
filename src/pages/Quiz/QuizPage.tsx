import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useExam } from '@/hooks/use-exams'
import { ApiRequestError } from '@/lib/api'
import { scoreExam, saveAttempt } from '@/lib/attempts'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'

export function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, isPending, refetch } = useExam(id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [index, setIndex] = useState(0)

  const questions: Question[] = data?.questions ?? []
  const question = questions[index]

  useEffect(() => {
    setAnswers({})
    setIndex(0)
  }, [id])

  useEffect(() => {
    if (error instanceof ApiRequestError && error.status === 409 && id) {
      navigate(`/exams/${id}/status`, { replace: true })
    }
  }, [error, id, navigate])

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = () => {
    if (!data) return
    const { score, breakdown } = scoreExam(questions, answers)
    saveAttempt({
      examId: data.id,
      submittedAt: new Date().toISOString(),
      answers,
      score,
      breakdown,
    })
    toast.success('Exam submitted')
    navigate(`/exams/${data.id}/results`, { replace: true })
  }

  const progress =
    questions.length === 0
      ? 0
      : Math.round(((index + 1) / questions.length) * 100)

  if (isPending) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading exam…
      </p>
    )
  }

  if (error && !(error instanceof ApiRequestError && error.status === 409)) {
    return (
      <NetworkErrorBlock error={error} onRetry={() => refetch()} />
    )
  }

  if (!question) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium">{data?.title}</h1>
        <p className="text-sm text-muted-foreground">
          Question {index + 1} of {questions.length}
        </p>
      </div>

      <div
        className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-lg border p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {question.domain}
        </p>
        <h2 className="mt-2 text-lg font-medium">{question.text}</h2>

        <fieldset className="mt-6 flex flex-col gap-3">
          <legend className="sr-only">Answer options</legend>
          {question.options.map((option) => {
            const selected = answers[question.id] === option.id
            return (
              <label
                key={option.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'hover:bg-muted',
                )}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selected}
                  onChange={() => selectOption(question.id, option.id)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span className="font-medium">{option.label}.</span>
                <span>{option.text}</span>
              </label>
            )
          })}
        </fieldset>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            Previous
          </Button>
          {index === questions.length - 1 ? (
            <Button onClick={handleSubmit}>Submit exam</Button>
          ) : (
            <Button onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}