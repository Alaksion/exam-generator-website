import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/components/AuthProvider'
import { useAuth } from '@/lib/auth'
import type { Me } from '@/lib/types'

const mocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/me', () => ({ getMe: mocks.getMe }))
vi.mock('@/lib/cognito', () => ({
  cognitoClient: {},
  ensureConfigured: () => {},
  toCognitoTokens: () => ({ idToken: 'id', accessToken: 'acc', refreshToken: null }),
}))

const client = {
  signIn: vi.fn(),
  refresh: mocks.refresh,
  signOut: vi.fn().mockResolvedValue(undefined),
}

const me: Me = {
  sub: 'u1',
  email: 'customer@exam.io',
  role: 'customer',
  createdAt: '2024-01-01T00:00:00.000Z',
}

function Probe() {
  const { isAuthenticated, user } = useAuth()
  return (
    <div>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
    mocks.refresh.mockResolvedValue({ idToken: 'fresh-id', accessToken: 'fresh-acc' })
  })

  it('restores a session on reload by refreshing before resolving identity', async () => {
    sessionStorage.setItem('mock-exams.session', '1')
    mocks.getMe.mockResolvedValue(me)

    render(
      <AuthProvider client={client as Parameters<typeof AuthProvider>[0]['client']}>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(mocks.getMe).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('authed').textContent).toBe('true')
    expect(screen.getByTestId('email').textContent).toBe('customer@exam.io')
  })

  it('stays signed out when no session is stored', async () => {
    render(
      <AuthProvider client={client as Parameters<typeof AuthProvider>[0]['client']}>
        <Probe />
      </AuthProvider>,
    )

    expect(mocks.refresh).not.toHaveBeenCalled()
    expect(mocks.getMe).not.toHaveBeenCalled()
    expect(screen.getByTestId('authed').textContent).toBe('false')
  })

  it('tears down the Amplify session and clears the marker when identity resolution fails', async () => {
    sessionStorage.setItem('mock-exams.session', '1')
    mocks.getMe.mockRejectedValue(new Error('401 from /v1/me'))

    render(
      <AuthProvider client={client as Parameters<typeof AuthProvider>[0]['client']}>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(client.signOut).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('false'))
    expect(sessionStorage.getItem('mock-exams.session')).toBeNull()
  })

  it('signs out of Amplify and clears the session on api:unauthorized', async () => {
    sessionStorage.setItem('mock-exams.session', '1')
    mocks.getMe.mockResolvedValue(me)

    render(
      <AuthProvider client={client as Parameters<typeof AuthProvider>[0]['client']}>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('true'))

    window.dispatchEvent(new Event('api:unauthorized'))

    await waitFor(() => expect(client.signOut).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('false'))
    expect(sessionStorage.getItem('mock-exams.session')).toBeNull()
  })
})
