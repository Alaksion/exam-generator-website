import { useLocation } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'

interface StatusLocationState {
  certificationName?: string
}

export function ExamStatusPage() {
  const location = useLocation()
  const state = location.state as StatusLocationState | null
  const certificationName = state?.certificationName

  return (
    <div className="py-12 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <Loader2Icon
          role="status"
          aria-label={
            certificationName
              ? `Preparing your ${certificationName} exam`
              : 'Preparing your exam'
          }
          className="mb-6 size-8 animate-spin text-muted-foreground"
        />
        <h1 className="text-2xl font-medium">
          {certificationName
            ? `Preparing your ${certificationName} exam`
            : 'Preparing your exam'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Exam generation usually takes a few minutes and can take longer. You
          don't need to stay on this page — we'll notify you as soon as your
          exam is ready.
        </p>
      </div>
    </div>
  )
}