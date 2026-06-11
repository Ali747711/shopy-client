'use client'

import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useWishlist } from '@/lib/wishlist'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  /** Pass these to capture a price snapshot at wishlist time for drop detection. */
  price?: number
  currency?: string
}

export function WishlistButton({ productId, price, currency }: WishlistButtonProps) {
  const { isWishlisted, toggle, hydrated } = useWishlist()

  if (!hydrated) return null

  const wishlisted = isWishlisted(productId)

  return (
    <button
      type="button"
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Pass price info when available so the wishlist page can detect drops.
        const priceInfo =
          price !== undefined && currency !== undefined
            ? { price, currency }
            : undefined
        toggle(productId, priceInfo)
      }}
      className={cn(
        'absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-full bg-background/80 shadow-sm ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-background',
        wishlisted ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
      )}
    >
      <Heart
        className="size-4"
        strokeWidth={2}
        fill={wishlisted ? 'currentColor' : 'none'}
      />
    </button>
  )
}
