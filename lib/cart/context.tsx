'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { CartAddInput, CartItem } from './types'

const STORAGE_KEY = 'shopy.cart.v1'

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  currency: string
  hydrated: boolean
  addItem: (product: CartAddInput, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const clampQty = (qty: number, stock: number) => Math.max(1, Math.min(qty, Math.max(1, stock)))

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // localStorage is client-only, so load after mount (initial state must match
  // the server render to avoid a hydration mismatch).
  useEffect(() => {
    let stored: CartItem[] = []
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

  const addItem = useCallback((product: CartAddInput, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                price: product.price,
                stock: product.stock,
                qty: clampQty(item.qty + qty, product.stock),
              }
            : item,
        )
      }
      return [...prev, { ...product, qty: clampQty(qty, product.stock) }]
    })
    toast.success('Added to cart', { description: product.productName })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
    toast('Removed from cart')
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, qty: clampQty(qty, item.stock) } : item,
      ),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const derived = useMemo(
    () => ({
      count: items.reduce((total, item) => total + item.qty, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.qty, 0),
      currency: items[0]?.currency ?? 'USD',
    }),
    [items],
  )

  const value = useMemo<CartContextValue>(
    () => ({ items, hydrated, ...derived, addItem, removeItem, updateQty, clear }),
    [items, hydrated, derived, addItem, removeItem, updateQty, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
