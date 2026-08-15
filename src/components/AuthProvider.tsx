import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/lib/auth'
import { cognitoClient, type CognitoClient } from '@/lib/cognito'
import { getMe } from '@/lib/me'
import {
  clearSession,
  getStoredRefreshToken,
  refreshSession,
  registerSessionRefresher,
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
        if (getStoredRefreshToken() && !(await refreshSession())) {
          throw new Error('session refresh failed')
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
  }, [isAuthenticated])

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

  useEffect(() => {
    registerSessionRefresher(async () => {
      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) return false
      try {
        const tokens = await client.refresh(refreshToken)
        saveIdAccess(tokens)
        return true
      } catch {
        return false
      }
    })
    return () => registerSessionRefresher(null)
  }, [client])

  const value = useMemo(
    () => ({ isAuthenticated, user, signIn, signOut }),
    [isAuthenticated, user, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}