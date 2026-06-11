'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { EyeIcon, Image01Icon, StarIcon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { QuickViewModal } from '@/components/products/quick-view-modal'
import { WishlistButton } from '@/components/products/wishlist-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/products'
import { cn } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const image = product.productImages?.[0]
  const price = product.convertedPrice ?? product.productPrice
  const currency = product.currency ?? product.productCurrency
  const outOfStock = (product.productStock ?? 0) <= 0

  // Null means the modal is closed; a productId opens it.
  const [quickViewId, setQuickViewId] = useState<string | null>(null)

  return (
    <>
      {/* group/card scopes the hover state to this card only */}
      <div className="group/card relative focus-within:outline-none">
        <Link
          href={`/products/${product._id}`}
          className="group/link block focus-visible:outline-none"
        >
          <Card className="h-full transition-all group-hover/link:ring-foreground/25 group-focus-visible/link:ring-2 group-focus-visible/link:ring-ring">
            <div className="relative -mt-4 aspect-square w-full overflow-hidden bg-muted">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  alt={image.alt ?? product.productName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/link:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
                  <HugeiconsIcon
                    icon={Image01Icon}
                    strokeWidth={1.5}
                    className="size-8 text-muted-foreground/40"
                  />
                </div>
              )}
              <WishlistButton productId={product._id} price={price} currency={currency} />
              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                  <Badge variant="secondary" className="uppercase tracking-wide">
                    Out of stock
                  </Badge>
                </div>
              )}

              {/* Quick-view button — appears on hover, stops link navigation */}
              <button
                type="button"
                aria-label={`Quick view ${product.productName}`}
                onClick={(e) => {
                  // Prevent the wrapping Link from navigating
                  e.preventDefault()
                  e.stopPropagation()
                  setQuickViewId(product._id)
                }}
                className={cn(
                  'absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5',
                  'bg-background/90 text-[11px] font-medium text-foreground',
                  'ring-1 ring-border backdrop-blur-sm shadow-sm',
                  'opacity-0 translate-y-1 transition-all duration-200',
                  'group-hover/card:opacity-100 group-hover/card:translate-y-0',
                  'focus-visible:opacity-100 focus-visible:ring-ring',
                )}
              >
                <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-3.5" />
                Quick view
              </button>
            </div>

            <CardContent className="flex flex-1 flex-col gap-2">
              <Badge variant="outline" className="w-fit capitalize">
                {product.productCategory}
              </Badge>
              <h3 className="font-heading line-clamp-2 text-sm leading-snug font-medium">
                {product.productName}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.productDescription}
              </p>
              <div className="mt-auto flex items-center gap-1 pt-1 text-sm text-muted-foreground">
                <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-3.5 text-primary" />
                {(product.productRatingCount ?? 0) > 0 ? (
                  <span>
                    <span className="text-foreground">{(product.productRatingAvg ?? 0).toFixed(1)}</span>{' '}
                    ({product.productRatingCount})
                  </span>
                ) : (
                  <span>No reviews yet</span>
                )}
              </div>
            </CardContent>

            <CardFooter className="justify-between">
              <span className="font-heading text-sm font-semibold">
                {formatPrice(price, currency)}
              </span>
              <span
                className={cn('text-sm', outOfStock ? 'text-destructive' : 'text-muted-foreground')}
              >
                {outOfStock ? 'Unavailable' : `${product.productStock ?? 0} left`}
              </span>
            </CardFooter>
          </Card>
        </Link>
      </div>

      {/* Modal is rendered outside the Link to avoid nesting interactive elements */}
      <QuickViewModal
        productId={quickViewId}
        onClose={() => setQuickViewId(null)}
      />
    </>
  )
}
