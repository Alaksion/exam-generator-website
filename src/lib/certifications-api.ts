import { api } from '@/lib/api'
import type { Certification, CertificationInput } from '@/lib/types'

interface CertificationList {
  items: Certification[]
}

export function listCertifications(): Promise<CertificationList> {
  return api.get<CertificationList>('/v1/certifications')
}

export function createCertification(
  input: CertificationInput,
): Promise<Certification> {
  return api.post<Certification>('/v1/certifications', input)
}
