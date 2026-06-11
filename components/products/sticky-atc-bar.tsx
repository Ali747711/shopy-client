'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useCart, type CartAddInput } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

interface StickyAtcBarProps {
  /** Ref pointing to the primary AddToCart button on the page — used with
   *  IntersectionObserver so the bar only appears when that button is off-screen. */
  anchorRef: React.RefObject<HTMLElement | null>
  product: CartAddInput
  price: number
  currency: string
}

export function StickyAtcBar({ anchorRef, product, price, currency }: StickyAtcBarProps) {
  const { addItem } = useCart()
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock <= 0

  // Only show bar once the primary ATC button has scrolled OUT of view
  useEffect(() => {
    const el = anchorRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry is non-null because we're observing exactly one element
        setVisible(!entry!.isIntersecting)
      },
      // A small negative root margin ensures the bar hides before the button
      // is fully visible, preventing a flicker on the boundary.
      { rootMargin: '-60px 0px 0px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [anchorRef])

  const onAdd = () => {
    addItem(product, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    // md:hidden — hidden on desktop, only shown on mobile
    <div className="md:hidden" aria-hidden={!visible}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'fixed inset-x-0 z-40',
              'border-t border-border bg-background/95 backdrop-blur-md',
              // Sit above the mobile bottom tab bar (h-14 + safe area); on sm+
              // the nav is the top dock, so the bar can sit flush at the bottom.
              'bottom-[calc(3.5rem+env(safe-area-inset-bottom))] sm:bottom-0 sm:pb-[env(safe-area-inset-bottom)]',
            )}
            role="region"
            aria-label="Quick add to cart"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Product name + price */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground leading-tight">
                  {product.productName}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                  {formatPrice(price, currency)}
                </p>
              </div>

              {/* ATC button — mirrors the primary button's styles exactly */}
              <Button
                size="lg"
                disabled={outOfStock}
                onClick={onAdd}
                className="shrink-0"
              >
                <HugeiconsIcon
                  icon={added ? Tick02Icon : ShoppingCart01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                {outOfStock ? 'Unavailable' : added ? 'Added!' : 'Add to cart'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
