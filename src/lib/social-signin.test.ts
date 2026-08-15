import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cognitoSocialSignInService } from './social-signin'

const mocks = vi.hoisted(() => ({
  signInWithRedirect: vi.fn(),
  fetchAuthSession: vi.fn(),
  saveSession: vi.fn(),
}))

vi.mock('aws-amplify/auth', () => ({
  signInWithRedirect: mocks.signInWithRedirect,
  fetchAuthSession: mocks.fetchAuthSession,
}))

vi.mock('./session', () => ({
  saveSession: mocks.saveSession,
}))

vi.mock('./cognito', () => ({
  ensureConfigured: () => {},
  toCognitoTokens: (t: { idToken: unknown; accessToken: unknown; refreshToken: unknown }) => ({
    idToken: String(t.idToken),
    accessToken: String(t.accessToken),
    refreshToken: String(t.refreshToken),
  }),
}))

function token(v: string) {
  return { toString: () => v }
}

describe('cognitoSocialSignInService', () => {
  beforeEach(() => {
    mocks.signInWithRedirect.mockReset()
    mocks.fetchAuthSession.mockReset()
    mocks.saveSession.mockReset()
  })

  it('starts a Hosted UI redirect for Google', async () => {
    mocks.signInWithRedirect.mockResolvedValue(undefined)
    await cognitoSocialSignInService.start('Google')
    expect(mocks.signInWithRedirect).toHaveBeenCalledWith({ provider: 'Google' })
  })

  it('starts a Hosted UI redirect for Apple', async () => {
    mocks.signInWithRedirect.mockResolvedValue(undefined)
    await cognitoSocialSignInService.start('Apple')
    expect(mocks.signInWithRedirect).toHaveBeenCalledWith({ provider: 'Apple' })
  })

  it('saves the session from the completed OAuth exchange', async () => {
    mocks.fetchAuthSession.mockResolvedValue({
      tokens: { idToken: token('id'), accessToken: token('acc'), refreshToken: token('ref') },
    })
    await cognitoSocialSignInService.complete()
    expect(mocks.saveSession).toHaveBeenCalledWith({
      idToken: 'id',
      accessToken: 'acc',
      refreshToken: 'ref',
    })
  })
})