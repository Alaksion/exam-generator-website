import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getExamStatus } from '@/lib/exams-api'
import type { ExamStatus } from '@/lib/types'

const BASE_DELAY_MS = 2000
const MAX_DELAY_MS = 10_000

export function statusPollDelayMs(attempt: number): number {
  const delay = BASE_DELAY_MS * 2 ** attempt
  return Math.min(delay, MAX_DELAY_MS)
}

const TERMINAL: ReadonlySet<ExamStatus> = new Set(['READY', 'FAILED'])

interface ExamStatusData {
  status: ExamStatus | null
  error: Error | null
}

export function useExamStatus(id: string | undefined): ExamStatusData {
  const attemptRef = useRef(0)

  useEffect(() => {
    attemptRef.current = 0
  }, [id])

  const query = useQuery({
    queryKey: ['exam', id, 'status'],
    queryFn: () => getExamStatus(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status || TERMINAL.has(status) || query.state.error) return false
      return statusPollDelayMs(attemptRef.current++)
    },
  })

  return { status: query.data?.status ?? null, error: query.error ?? null }
}