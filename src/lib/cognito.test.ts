import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cognitoClient, toCognitoTokens } from './cognito'

const mocks = vi.hoisted(() => ({
  fetchAuthSession: vi.fn(),
  getCurrentUser: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: mocks.fetchAuthSession,
  getCurrentUser: mocks.getCurrentUser,
  signIn: mocks.signIn,
  signOut: mocks.signOut,
}))

function token(v: string) {
  return { payload: {}, toString: () => v }
}

type TokenSet = Parameters<typeof toCognitoTokens>[0]

describe('toCognitoTokens', () => {
  it('accepts an amplify v6 session without a refresh token', () => {
    const tokens = toCognitoTokens({
      idToken: token('id'),
      accessToken: token('acc'),
    } as TokenSet)
    expect(tokens).toEqual({ idToken: 'id', accessToken: 'acc', refreshToken: null })
  })

  it('keeps a refresh token when the session carries one', () => {
    const tokens = toCognitoTokens({
      idToken: token('id'),
      accessToken: token('acc'),
      refreshToken: token('ref'),
    } as TokenSet)
    expect(tokens).toEqual({ idToken: 'id', accessToken: 'acc', refreshToken: 'ref' })
  })

  it('rejects a session missing an id token', () => {
    expect(() => toCognitoTokens({ accessToken: token('acc') } as TokenSet)).toThrow(
      'Sign-in did not yield ID and access tokens.',
    )
  })

  it('rejects a session missing an access token', () => {
    expect(() => toCognitoTokens({ idToken: token('id') } as unknown as TokenSet)).toThrow(
      'Sign-in did not yield ID and access tokens.',
    )
  })

  it('rejects an undefined token set', () => {
    expect(() => toCognitoTokens(undefined)).toThrow(
      'Sign-in did not yield ID and access tokens.',
    )
  })
})

describe('cognitoClient', () => {
  beforeEach(() => {
    mocks.fetchAuthSession.mockReset()
    mocks.getCurrentUser.mockReset()
    mocks.signIn.mockReset()
    mocks.signOut.mockReset()
    mocks.signIn.mockResolvedValue(undefined)
    mocks.signOut.mockResolvedValue(undefined)
  })

  it('clears a stale Cognito session before signing in', async () => {
    mocks.getCurrentUser.mockResolvedValue({ username: 'user', userId: 'u1' })
    mocks.fetchAuthSession.mockResolvedValue({
      tokens: { idToken: token('id'), accessToken: token('acc') },
    })

    await cognitoClient.signIn('user@exam.io', 'pw')

    expect(mocks.signOut).toHaveBeenCalledTimes(1)
    expect(mocks.signIn).toHaveBeenCalledWith({ username: 'user@exam.io', password: 'pw' })
  })

  it('skips the stale-session teardown when no Cognito user exists', async () => {
    mocks.getCurrentUser.mockRejectedValue(new Error('no user'))
    mocks.fetchAuthSession.mockResolvedValue({
      tokens: { idToken: token('id'), accessToken: token('acc') },
    })

    await cognitoClient.signIn('user@exam.io', 'pw')

    expect(mocks.signOut).not.toHaveBeenCalled()
    expect(mocks.signIn).toHaveBeenCalledWith({ username: 'user@exam.io', password: 'pw' })
  })

  it('signOut never throws even when Amplify teardown fails', async () => {
    mocks.signOut.mockRejectedValue(new Error('boom'))

    await expect(cognitoClient.signOut()).resolves.toBeUndefined()
  })
})
