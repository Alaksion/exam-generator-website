import { api } from '@/lib/api'
import type { ExamListParams, ExamPage, ExamStatus, FullExam } from '@/lib/types'

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

export function listExams(params: ExamListParams): Promise<ExamPage> {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.provider) search.set('provider', params.provider)
  if (params.certificationId) {
    search.set('certificationId', params.certificationId)
  }
  const qs = search.toString()
  return api.get<ExamPage>(`/v1/exams${qs ? `?${qs}` : ''}`)
}

export function deleteExam(id: string): Promise<void> {
  return api.delete<void>(`/v1/exams/${id}`)
}

export function getExamStatus(id: string): Promise<ExamStatusInfo> {
  return api.get<ExamStatusInfo>(`/v1/exams/${id}/status`)
}

export function getExam(id: string): Promise<FullExam> {
  return api.get<FullExam>(`/v1/exams/${id}`)
}

export interface ExamDownload {
  downloadUrl: string
  expiresAt: string
}

export function getExamDownload(id: string): Promise<ExamDownload> {
  return api.get<ExamDownload>(`/v1/exams/${id}/download`)
}
