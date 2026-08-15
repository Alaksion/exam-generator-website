import {
  fetchAuthSession,
  signInWithRedirect,
} from 'aws-amplify/auth'
import { ensureConfigured, toCognitoTokens } from './cognito'
import { saveSession } from './session'
import type { SocialProvider } from './auth-config'

export interface SocialSignInService {
  /** Redirect the browser to the Hosted UI authorize endpoint. */
  start(provider: SocialProvider): Promise<void>
  /** Complete an in-flight OAuth flow on the callback and save the session. */
  complete(): Promise<void>
}

export const cognitoSocialSignInService: SocialSignInService = {
  async start(provider) {
    ensureConfigured()
    await signInWithRedirect({ provider })
  },

  async complete() {
    ensureConfigured()
    // Amplify's OAuth listener exchanges the authorization code during
    // configure; fetching the session yields the signed-in tokens.
    const session = await fetchAuthSession()
    saveSession(toCognitoTokens(session.tokens))
  },
}
