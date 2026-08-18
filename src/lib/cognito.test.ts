import { describe, expect, it } from 'vitest'
import { toCognitoTokens } from './cognito'

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
