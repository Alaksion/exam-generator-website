import { api } from '@/lib/api'

export interface NewExam {
  id: string
  status: 'GENERATING'
}

export function createExam(certificationId: string): Promise<NewExam> {
  return api.post<NewExam>('/v1/exams', { certificationId })
}
