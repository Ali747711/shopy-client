'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { isApiError } from '@/lib/api'

import * as authApi from './api'
import type { AuthUser, LoginInput, RegisterInput } from './schema'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const me = await authApi.getMe()
        if (!cancelled) {
          setUser(me)
          setStatus('authenticated')
        }
      } catch (error) {
        // The 15m access cookie may have expired — try one refresh, then retry.
        if (isApiError(error) && error.status === 401) {
          try {
            await authApi.refreshSession()
            const me = await authApi.getMe()
            if (!cancelled) {
              setUser(me)
              setStatus('authenticated')
            }
            return
          } catch {
            /* fall through to unauthenticated */
          }
        }
        if (!cancelled) {
          setUser(null)
          setStatus('unauthenticated')
        }
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const me = await authApi.login(input)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const me = await authApi.register(input)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* clear local state regardless of the network result */
    }
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
