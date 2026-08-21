import { api } from "@/lib/api";
import type {
  Certification,
  CertificationInput,
  CertificationUpdate,
} from "@/lib/types";

interface CertificationList {
  items: Certification[];
}

export function listCertifications(): Promise<CertificationList> {
  return api.get<CertificationList>("/v1/certifications");
}

export function getCertification(id: string): Promise<Certification> {
  return api.get<Certification>(`/v1/certifications/${id}`);
}

export function createCertification(
  input: CertificationInput,
): Promise<Certification> {
  return api.post<Certification>("/v1/admin/certifications", input);
}

export function updateCertification(
  id: string,
  input: CertificationUpdate,
): Promise<Certification> {
  return api.put<Certification>(`/v1/admin/certifications/${id}`, input);
}
