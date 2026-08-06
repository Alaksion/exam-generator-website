import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createCertification,
  getCertification,
  listCertifications,
  updateCertification,
} from '@/lib/certifications-api'
import type { CertificationInput, CertificationUpdate } from '@/lib/types'

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: listCertifications,
  })
}

export function useCertification(id: string | undefined) {
  return useQuery({
    queryKey: ['certification', id],
    queryFn: () => getCertification(id as string),
    enabled: Boolean(id),
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

export function useUpdateCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CertificationUpdate }) =>
      updateCertification(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] })
      queryClient.invalidateQueries({ queryKey: ['certification', id] })
    },
  })
}
