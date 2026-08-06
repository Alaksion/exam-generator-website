import { api } from '@/lib/api'
import type { ExamStatus, FullExam } from '@/lib/types'

export interface NewExam {
  id: string
  status: ExamStatus
}

export interface ExamStatusInfo {
  id: string
  status: ExamStatus
  createdAt: string
  finishedAt: string | null
}

export function createExam(certificationId: string): Promise<NewExam> {
  return api.post<NewExam>('/v1/exams', { certificationId })
}

export function getExamStatus(id: string): Promise<ExamStatusInfo> {
  return api.get<ExamStatusInfo>(`/v1/exams/${id}/status`)
}

export function getExam(id: string): Promise<FullExam> {
  return api.get<FullExam>(`/v1/exams/${id}`)
}
