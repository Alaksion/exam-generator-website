import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/lib/auth'
import { cognitoClient, type CognitoClient } from '@/lib/cognito'
import { getMe } from '@/lib/me'
import {
  clearSession,
  getStoredRefreshToken,
  saveIdAccess,
  saveSession,
} from '@/lib/session'
import type { Me } from '@/lib/types'

function bootstrap(): boolean {
  return getStoredRefreshToken() !== null
}

export function AuthProvider({
  children,
  client = cognitoClient,
}: {
  children: React.ReactNode
  client?: CognitoClient
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => bootstrap())
  const [user, setUser] = useState<Me | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    const restore = async () => {
      try {
        const refreshToken = getStoredRefreshToken()
        if (refreshToken) {
          const refreshed = await client.refresh(refreshToken)
          saveIdAccess(refreshed)
        }
        const me = await getMe()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) {
          clearSession()
          setIsAuthenticated(false)
        }
      }
    }
    restore()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, client])

  const signOut = useCallback(() => {
    clearSession()
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const tokens = await client.signIn(email, password)
      saveSession(tokens)
      const me = await getMe()
      setUser(me)
      setIsAuthenticated(true)
    },
    [client],
  )

  useEffect(() => {
    const handler = () => signOut()
    window.addEventListener('api:unauthorized', handler)
    return () => window.removeEventListener('api:unauthorized', handler)
  }, [signOut])

  const value = useMemo(
    () => ({ isAuthenticated, user, signIn, signOut }),
    [isAuthenticated, user, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}