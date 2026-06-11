'use client'

// Propagates the selected currency to product API calls by appending
// ?currency=XXX to the URL whenever the user changes their preference.
// This is a non-rendering component — it only calls router.replace.

import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useCurrency } from '@/lib/currency'

export function CurrencySync() {
  const { currency, hydrated } = useCurrency()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Track the previous value to avoid no-op navigation on mount
  const prevCurrency = useRef<string | null>(null)

  useEffect(() => {
    if (!hydrated) return
    // Only navigate if the currency actually changed — not on first hydration
    // if it already matches what's in the URL.
    const currentUrlCurrency = searchParams.get('currency')
    if (prevCurrency.current === null) {
      prevCurrency.current = currency
      // If the URL already has the correct currency, skip the navigation
      if (currentUrlCurrency === currency) return
    }
    if (prevCurrency.current === currency && currentUrlCurrency === currency) return

    prevCurrency.current = currency
    const params = new URLSearchParams(searchParams.toString())
    params.set('currency', currency)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [currency, hydrated, pathname, router, searchParams])

  return null
}
