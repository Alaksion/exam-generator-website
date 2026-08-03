import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/lib/auth'
import { clearApiKey, hasApiKey, setApiKey } from '@/lib/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [key, setKeyState] = useState<string | null>(() =>
    hasApiKey() ? 'set' : null,
  )

  const setKey = useCallback((k: string) => {
    setApiKey(k)
    setKeyState('set')
  }, [])

  const clearKey = useCallback(() => {
    clearApiKey()
    setKeyState(null)
  }, [])

  useEffect(() => {
    const handler = () => clearKey()
    window.addEventListener('api:unauthorized', handler)
    return () => window.removeEventListener('api:unauthorized', handler)
  }, [clearKey])

  const value = useMemo(
    () => ({ isAuthenticated: key !== null, setKey, clearKey }),
    [key, setKey, clearKey],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}