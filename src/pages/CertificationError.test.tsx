import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MutationCache } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { NewCertificationPage } from '@/pages/NewCertificationPage'

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const mutationCache = new MutationCache({
  onError: (error) => {
    window.dispatchEvent(new CustomEvent('api:globalerror', { detail: error }))
  },
})

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

async function renderPage() {
  render(
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/manage/certifications/new']}>
          <Routes>
            <Route
              path="/manage/certifications/new"
              element={<NewCertificationPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>,
  )
}

describe('create certification error handling', () => {
  it('surfaces a 409 conflict through the global error handler', async () => {
    server.use(
      http.post('/v1/certifications', () =>
        HttpResponse.json(
          {
            error: 'Conflict',
            message: 'Certification (aws, CLF-C02) already exists.',
          },
          { status: 409 },
        ),
      ),
    )

    const user = userEvent.setup()
    await renderPage()

    await user.type(screen.getByLabelText(/Code/), 'CLF-C02')
    await user.type(screen.getByLabelText(/Name/), 'Duplicate')
    await user.type(
      screen.getByPlaceholderText('Domain 1 name'),
      'Cloud Concepts',
    )
    await user.type(screen.getByPlaceholderText('Topic 1 name'), 'Compute')

    await user.click(
      screen.getByRole('button', { name: /create certification/i }),
    )

    await waitFor(() =>
      expect(screen.getByText(/Error 409/i)).toBeInTheDocument(),
    )
    expect(
      screen.getByText(/A conflict occurred/i),
    ).toBeInTheDocument()
  })
})
