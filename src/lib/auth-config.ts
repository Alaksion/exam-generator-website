export type SocialProvider = 'Google' | 'Apple'

export interface AuthConfig {
  /** Hosted UI domain from the Cognito stack outputs, if configured. */
  userPoolDomain: string | null
  /** Absolute OAuth callback (redirect) URI, derived from callbackPath. */
  redirectUri: string | null
  /** Browser route that receives the OAuth authorization code. */
  callbackPath: string
  googleEnabled: boolean
  appleEnabled: boolean
}

const DEFAULT_CALLBACK_PATH = '/auth/callback'

function asBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true'
}

/**
 * Build the auth configuration from raw env values plus the runtime origin so
 * the OAuth redirect URI can be derived (origin + callback path). Pure so it is
 * unit-testable.
 */
export function buildAuthConfig(
  env: Record<string, string | undefined>,
  origin: string,
): AuthConfig {
  const callbackPath = env.VITE_OAUTH_CALLBACK_PATH ?? DEFAULT_CALLBACK_PATH
  const userPoolDomain =
    env.VITE_USER_POOL_DOMAIN?.trim() || (null as string | null)

  return {
    userPoolDomain,
    redirectUri: userPoolDomain ? `${origin}${callbackPath}` : null,
    callbackPath,
    googleEnabled: asBoolean(env.VITE_SOCIAL_GOOGLE_ENABLED),
    appleEnabled: asBoolean(env.VITE_SOCIAL_APPLE_ENABLED),
  }
}

const env = import.meta.env as Record<string, string | undefined>

export function getAuthConfig(): AuthConfig {
  return buildAuthConfig(env, typeof window !== 'undefined' ? window.location.origin : '')
}

/**
 * A provider is offered only when it is both toggled on by config and the
 * Hosted UI domain is configured — otherwise the Hosted UI flow cannot run.
 */
export function isProviderEnabled(config: AuthConfig, provider: SocialProvider): boolean {
  if (!config.userPoolDomain || !config.redirectUri) return false
  if (provider === 'Google') return config.googleEnabled
  return config.appleEnabled
}
