import { toast } from 'sonner'
import { ApiRequestError } from '@/lib/api'

export function toastOn400(error: unknown): void {
  if (error instanceof ApiRequestError && error.status === 400) {
    toast.error(error.message)
  }
}