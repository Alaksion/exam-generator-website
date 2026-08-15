import { api } from '@/lib/api'
import type { Me } from '@/lib/types'

export function getMe(): Promise<Me> {
  return api.get<Me>('/v1/me')
}