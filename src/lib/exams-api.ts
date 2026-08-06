import { api } from '@/lib/api'

export type ExamStatus = 'GENERATING' | 'READY' | 'FAILED'

export interface NewExam {
  id: string
  status: 'GENERATING'
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
