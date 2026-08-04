import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createCertification,
  listCertifications,
} from '@/lib/certifications-api'
import type { CertificationInput } from '@/lib/types'

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: listCertifications,
  })
}

export function useCreateCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CertificationInput) => createCertification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] })
    },
  })
}
