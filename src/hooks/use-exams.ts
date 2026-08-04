import { useMutation } from '@tanstack/react-query'
import { createExam } from '@/lib/exams-api'

export function useCreateExam() {
  return useMutation({
    mutationFn: (certificationId: string) => createExam(certificationId),
  })
}
