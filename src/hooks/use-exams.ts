import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createExam,
  deleteExam,
  getExam,
  getExamDownload,
  listExams,
} from '@/lib/exams-api'
import type { ExamListParams } from '@/lib/types'

export function useCreateExam() {
  return useMutation({
    mutationFn: (certificationId: string) => createExam(certificationId),
  })
}

export function useExams(params: ExamListParams) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => listExams(params),
  })
}

export function useExam(id: string | undefined) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => getExam(id as string),
    enabled: Boolean(id),
  })
}

export function useExamDownload() {
  return useMutation({
    mutationFn: (id: string) => getExamDownload(id),
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}