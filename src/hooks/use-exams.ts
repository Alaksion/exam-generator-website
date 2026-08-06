import { useMutation, useQuery } from '@tanstack/react-query'
import { createExam, getExam } from '@/lib/exams-api'

export function useCreateExam() {
  return useMutation({
    mutationFn: (certificationId: string) => createExam(certificationId),
  })
}

export function useExam(id: string | undefined) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => getExam(id as string),
    enabled: Boolean(id),
  })
}
