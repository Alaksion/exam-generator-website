import { createContext, useContext } from 'react'

export interface AuthContextValue {
  isAuthenticated: boolean
  setKey: (key: string) => void
  clearKey: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}