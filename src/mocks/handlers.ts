import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/v1/health', () => HttpResponse.json({ status: 'ok' })),
]