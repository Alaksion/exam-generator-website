import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/lib/auth'
import { cognitoClient, type CognitoClient } from '@/lib/cognito'
import {
  cognitoSocialSignInService,
  type SocialSignInService,
} from '@/lib/social-signin'
import { getMe } from '@/lib/me'
import {
  clearSession,
  getBearerToken,
  hasStoredSession,
  refreshSession,
  registerSessionRefresher,
  saveIdAccess,
  saveSession,
} from '@/lib/session'
import type { Me } from '@/lib/types'

export function AuthProvider({
  children,
  client = cognitoClient,
  social = cognitoSocialSignInService,
}: {
  children: React.ReactNode
  client?: CognitoClient
  social?: SocialSignInService
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => hasStoredSession())
  const [user, setUser] = useState<Me | null>(null)

  // Register the refresher before the identity effect so a reload can refresh
  // the session instead of failing because no refresher exists yet.
  useEffect(() => {
    registerSessionRefresher(async () => {
      // Amplify owns the refresh token and refreshes internally on
      // fetchAuthSession({ forceRefresh }); we just surface the new tokens.
      try {
        const tokens = await client.refresh()
        saveIdAccess(tokens)
        return true
      } catch {
        return false
      }
    })
    return () => registerSessionRefresher(null)
  }, [client])

  const signOut = useCallback(async () => {
    try {
      await client.signOut()
    } finally {
      clearSession()
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [client])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    const resolveIdentity = async () => {
      try {
        // A fresh login already holds an id token; only a reload needs a
        // session refresh (Amplify's own storage) before calling /v1/me.
        if (!getBearerToken() && hasStoredSession() && !(await refreshSession())) {
          throw new Error('session refresh failed')
        }
        const me = await getMe()
        if (!cancelled) setUser(me)
      } catch {
        // Identity failed to resolve: tear down the Amplify session too, so a
        // later sign-in is not rejected as "already signed in".
        if (!cancelled) await signOut()
      }
    }
    resolveIdentity()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, signOut])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const tokens = await client.signIn(email, password)
      saveSession(tokens)
      setIsAuthenticated(true)
    },
    [client],
  )

  const signInWithSocial = useCallback(async () => {
    await social.complete()
    setIsAuthenticated(true)
  }, [social])

  useEffect(() => {
    const handler = () => void signOut()
    window.addEventListener('api:unauthorized', handler)
    return () => window.removeEventListener('api:unauthorized', handler)
  }, [signOut])

  const value = useMemo(
    () => ({ isAuthenticated, user, signIn, signInWithSocial, signOut }),
    [isAuthenticated, user, signIn, signInWithSocial, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
