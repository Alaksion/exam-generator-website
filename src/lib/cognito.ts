import { Amplify } from 'aws-amplify'
import {
  fetchAuthSession,
  getCurrentUser,
  signIn as amplifySignIn,
  type AuthSession,
} from 'aws-amplify/auth'
import { getAuthConfig } from './auth-config'

export interface CognitoTokens {
  idToken: string
  accessToken: string
  refreshToken: string
}

export interface CognitoClient {
  signIn(username: string, password: string): Promise<CognitoTokens>
  refresh(refreshToken: string): Promise<Pick<CognitoTokens, 'idToken' | 'accessToken'>>
}

let configured = false

export function ensureConfigured(): void {
  if (configured) return
  const poolId = import.meta.env.VITE_USER_POOL_ID as string | undefined
  const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID as string | undefined
  const { userPoolDomain, redirectUri, googleEnabled, appleEnabled } = getAuthConfig()
  if (poolId && clientId) {
    const providers = (['Google', 'Apple'] as const).filter((p) =>
      p === 'Google' ? googleEnabled : appleEnabled,
    )
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: poolId,
          userPoolClientId: clientId,
          loginWith:
            userPoolDomain && redirectUri
              ? {
                  oauth: {
                    domain: userPoolDomain,
                    scopes: ['email', 'openid', 'profile'],
                    redirectSignIn: [redirectUri],
                    redirectSignOut: [redirectUri],
                    responseType: 'code',
                    providers,
                  },
                }
              : undefined,
        },
      },
    })
  }
  configured = true
}

export function toCognitoTokens(tokens: AuthSession['tokens']): CognitoTokens {
  const t = tokens as {
    idToken?: { toString(): string }
    accessToken?: { toString(): string }
    refreshToken?: { toString(): string }
  }
  if (!t?.idToken || !t.accessToken || !t.refreshToken) {
    throw new Error('Sign-in did not yield a full token set.')
  }
  return {
    idToken: t.idToken.toString(),
    accessToken: t.accessToken.toString(),
    refreshToken: t.refreshToken.toString(),
  }
}

export const cognitoClient: CognitoClient = {
  async signIn(username, password) {
    ensureConfigured()
    await amplifySignIn({ username, password })
    const session = await fetchAuthSession()
    return toCognitoTokens(session.tokens)
  },

  async refresh() {
    ensureConfigured()
    await getCurrentUser()
    const session = await fetchAuthSession({ forceRefresh: true })
    const tokens = toCognitoTokens(session.tokens)
    return { idToken: tokens.idToken, accessToken: tokens.accessToken }
  },
}