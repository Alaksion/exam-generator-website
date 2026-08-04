import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import { NewCertificationPage } from '@/pages/NewCertificationPage'
import { ManagementListPage } from '@/pages/ManagementListPage'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

function renderRoutes(path = '/manage/certifications/new') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/manage/certifications/new" element={<NewCertificationPage />} />
          <Route path="/manage/certifications" element={<ManagementListPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Code/), 'NEW-01')
  await user.type(screen.getByLabelText(/Name/), 'New Certification')
  await user.type(screen.getByPlaceholderText('Domain 1 name'), 'Cloud Concepts')
  await user.type(screen.getByPlaceholderText('Topic 1 name'), 'Compute')
}

describe('NewCertificationPage', () => {
  it('renders the create form fields', () => {
    renderRoutes()
    expect(screen.getByLabelText(/Code/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Question count/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Active/)).toBeInTheDocument()
  })

  it('disables submit until the form is valid', async () => {
    const user = userEvent.setup()
    renderRoutes()

    expect(
      screen.getByRole('button', { name: /create certification/i }),
    ).toBeDisabled()

    await fillValidForm(user)
    expect(
      screen.getByRole('button', { name: /create certification/i }),
    ).toBeEnabled()
  })

  it('blocks submit when domain weights do not sum to 100', async () => {
    const user = userEvent.setup()
    renderRoutes()

    await fillValidForm(user)
    const weightInput = screen.getByLabelText(/Weight/)
    await user.clear(weightInput)
    await user.type(weightInput, '50')

    expect(
      screen.getByText(/Domain weights must sum to 100/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create certification/i }),
    ).toBeDisabled()
  })

  it('allows adding and removing domains', async () => {
    const user = userEvent.setup()
    renderRoutes()

    expect(screen.getAllByPlaceholderText('Domain 1 name')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /add domain/i }))
    expect(screen.getAllByPlaceholderText('Domain 2 name')).toHaveLength(1)

    const removeButtons = screen.getAllByRole('button', { name: /remove domain/i })
    await user.click(removeButtons[removeButtons.length - 1])
    expect(screen.queryByPlaceholderText('Domain 2 name')).not.toBeInTheDocument()
  })

  it('submits the form and redirects to the management list', async () => {
    const user = userEvent.setup()
    renderRoutes()

    await fillValidForm(user)
    await user.click(
      screen.getByRole('button', { name: /create certification/i }),
    )

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /certification management/i }),
      ).toBeInTheDocument(),
    )
  })
})

describe('ManagementListPage', () => {
  it('shows the seeded certification from the mock server', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ManagementListPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(
      await screen.findByText(/AWS Certified Cloud Practitioner/i),
    ).toBeInTheDocument()
  })
})
