'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { DEFAULT_CURRENCY, STORAGE_KEY, type CurrencyCode } from './constants'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  /** True once the stored preference has been read from localStorage. */
  hydrated: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY)
  const [hydrated, setHydrated] = useState(false)

  // Load persisted preference after mount — avoids SSR/client mismatch.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
      if (stored) setCurrencyState(stored)
    } catch {
      /* ignore unavailable storage */
    }
    setHydrated(true)
  }, [])

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [])

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, hydrated }),
    [currency, setCurrency, hydrated],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}
