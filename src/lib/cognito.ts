import { Amplify } from 'aws-amplify'
import {
  fetchAuthSession,
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  type AuthSession,
} from 'aws-amplify/auth'
import { getAuthConfig, isProviderEnabled } from './auth-config'

export interface CognitoTokens {
  idToken: string
  accessToken: string
  /** null when the session did not carry a refresh token (amplify v6 sessions never do). */
  refreshToken: string | null
}

export interface CognitoClient {
  signIn(username: string, password: string): Promise<CognitoTokens>
  refresh(): Promise<Pick<CognitoTokens, 'idToken' | 'accessToken'>>
  signOut(): Promise<void>
}

let configured = false

export function ensureConfigured(): void {
  if (configured) return
  const poolId = import.meta.env.VITE_USER_POOL_ID as string | undefined
  const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID as string | undefined
  if (!poolId || !clientId) {
    const missing = ['VITE_USER_POOL_ID', 'VITE_USER_POOL_CLIENT_ID']
      .filter((key) => !import.meta.env[key])
      .join(', ')
    throw new Error(
      `Amplify auth is not configured: missing build-time env var(s) ${missing}. ` +
        'Vite inlines VITE_* vars when the app is built, so these must be set where the deployment build runs.',
    )
  }
  const config = getAuthConfig()
  const { userPoolDomain, redirectUri } = config
  const providers = (['Google', 'Apple'] as const).filter((p) =>
    isProviderEnabled(config, p),
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
  configured = true
}

export function toCognitoTokens(tokens: AuthSession['tokens']): CognitoTokens {
  const t = tokens as {
    idToken?: { toString(): string }
    accessToken?: { toString(): string }
    refreshToken?: { toString(): string }
  }
  if (!t?.idToken || !t.accessToken) {
    throw new Error('Sign-in did not yield ID and access tokens.')
  }
  return {
    idToken: t.idToken.toString(),
    accessToken: t.accessToken.toString(),
    refreshToken: t.refreshToken ? t.refreshToken.toString() : null,
  }
}

export const cognitoClient: CognitoClient = {
  async signIn(username, password) {
    ensureConfigured()
    await signOutIfSessionExists()
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

  async signOut() {
    try {
      ensureConfigured()
      await amplifySignOut()
    } catch {
      // Tearing down the local session must never fail the sign-out flow.
    }
  },
}

/** A stale Cognito session makes `amplifySignIn` throw; clear it before a fresh login. */
async function signOutIfSessionExists(): Promise<void> {
  try {
    await getCurrentUser()
    await amplifySignOut()
  } catch {
    // No existing Cognito session — proceed straight to sign-in.
  }
}
