'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { clearPriceSnapshot, savePriceSnapshot } from './price-tracker'

const STORAGE_KEY = 'shopy.wishlist.v1'

/** Optional price context when adding/toggling an item. */
interface PriceInfo {
  price: number
  currency: string
}

interface WishlistContextType {
  items: string[]
  /** price is optional so all existing call-sites stay backward-compatible. */
  addItem: (productId: string, priceInfo?: PriceInfo) => void
  removeItem: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  /** price is optional so all existing call-sites stay backward-compatible. */
  toggle: (productId: string, priceInfo?: PriceInfo) => void
  hydrated: boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // localStorage is client-only, so load after mount to avoid hydration mismatch.
  useEffect(() => {
    let stored: string[] = []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (Array.isArray(parsed)) stored = parsed
    } catch {
      /* ignore corrupt storage */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(stored)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [items, hydrated])

  const addItem = useCallback((productId: string, priceInfo?: PriceInfo) => {
    setItems((prev) => {
      if (prev.includes(productId)) return prev
      // Snapshot the price so the wishlist page can detect drops later.
      if (priceInfo) {
        savePriceSnapshot(productId, priceInfo.price, priceInfo.currency)
      }
      return [...prev, productId]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId))
    // Clean up the stored price snapshot when the item is removed.
    clearPriceSnapshot(productId)
  }, [])

  const isWishlisted = useCallback(
    (productId: string) => items.includes(productId),
    [items],
  )

  const toggle = useCallback((productId: string, priceInfo?: PriceInfo) => {
    setItems((prev) => {
      const wishlisted = prev.includes(productId)
      if (wishlisted) {
        clearPriceSnapshot(productId)
        return prev.filter((id) => id !== productId)
      }
      if (priceInfo) {
        savePriceSnapshot(productId, priceInfo.price, priceInfo.currency)
      }
      return [...prev, productId]
    })
  }, [])

  const value = useMemo<WishlistContextType>(
    () => ({ items, hydrated, addItem, removeItem, isWishlisted, toggle }),
    [items, hydrated, addItem, removeItem, isWishlisted, toggle],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
