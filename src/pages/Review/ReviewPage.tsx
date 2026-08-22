import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useExam, useExamDownload } from '@/hooks/use-exams'
import { loadAttempt, clearAttempt } from '@/lib/attempts'
import { NetworkErrorBlock } from '@/components/NetworkErrorBlock'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DomainBreakdown, Question } from '@/lib/types'

export function ReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const examQuery = useExam(id)
  const download = useExamDownload()
  const attempt = loadAttempt()

  if (!id) {
    return null
  }

  if (!attempt || attempt.examId !== id) {
    clearAttempt()
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No submitted attempt found for this exam.
        </p>
        <Button className="mt-4" onClick={() => navigate(`/exams/${id}`)}>
          Start exam
        </Button>
      </div>
    )
  }

  if (examQuery.isPending) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading results…
      </p>
    )
  }

  if (examQuery.error || !examQuery.data) {
    return (
      <NetworkErrorBlock
        error={examQuery.error}
        onRetry={() => examQuery.refetch()}
      />
    )
  }

  const exam = examQuery.data
  const questions: Question[] = exam.questions ?? []
  const breakdown: DomainBreakdown[] = attempt.breakdown

  const handleDownload = () => {
    if (!id) return
    download.mutate(id, {
      onSuccess: ({ downloadUrl }) => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer')
      },
      onError: () => {
        toast.error('Unable to download the PDF right now.')
      },
    })
  }

  const handleStartNew = () => {
    clearAttempt()
    navigate(`/exams/${id}`)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            Score: {attempt.score}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={download.isPending}
          >
            {download.isPending ? 'Preparing…' : 'Download PDF'}
          </Button>
          <Button onClick={handleStartNew}>Start new attempt</Button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">Breakdown by domain</h2>
        {breakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No breakdown available.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {breakdown.map((d) => (
              <li
                key={d.domainId}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <span className="font-medium">{d.domain}</span>
                <span className="text-sm text-muted-foreground">
                  {d.correct}/{d.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Review answers</h2>
        <ol className="flex flex-col gap-4">
          {questions.map((question) => {
            const selectedOptionId = attempt.answers[question.id]
            const selected = question.options.find(
              (o) => o.id === selectedOptionId,
            )
            const correct = question.options.find((o) => o.isCorrect)
            return (
              <li key={question.id} className="rounded-lg border p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {question.domain} · {question.number}
                </p>
                <h3 className="mt-1 font-medium">{question.text}</h3>

                <ul className="mt-3 flex flex-col gap-1.5">
                  {question.options.map((option) => {
                    const isSelected = option.id === selectedOptionId
                    const isCorrect = option.isCorrect
                    return (
                      <li
                        key={option.id}
                        className={cn(
                          'rounded-md border px-3 py-2 text-sm',
                          isSelected && isCorrect && 'border-green-600 bg-green-50',
                          isSelected && !isCorrect && 'border-red-600 bg-red-50',
                          !isSelected && isCorrect &&
                            'border-green-200 bg-green-50/50',
                        )}
                      >
                        <span className="font-medium">{option.label}.</span>{' '}
                        {option.text}
                        {isSelected && (
                          <span className="ml-2 text-xs font-semibold text-muted-foreground">
                            Your answer
                          </span>
                        )}
                        {!isSelected && isCorrect && (
                          <span className="ml-2 text-xs font-semibold text-green-800">
                            Correct answer
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>

                <p className="mt-3 text-sm text-muted-foreground">
                  {selected
                    ? `You answered: ${selected.label}. ${selected.text}`
                    : 'You did not answer this question.'}
                </p>
                {correct && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Answer: </span>
                    {correct.label}. {correct.text}
                  </p>
                )}
                <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="font-medium">Explanation: </span>
                  {question.explanation}
                </p>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}