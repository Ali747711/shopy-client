import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon, StarIcon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/products'
import { cn } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const image = product.productImages[0]
  const price = product.convertedPrice ?? product.productPrice
  const currency = product.currency ?? product.productCurrency
  const outOfStock = product.productStock <= 0

  return (
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
              <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-8 text-muted-foreground/40" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
              <Badge variant="secondary" className="uppercase tracking-wide">
                Out of stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-2">
          <Badge variant="outline" className="w-fit capitalize">
            {product.productCategory}
          </Badge>
          <h3 className="font-heading line-clamp-2 text-sm leading-snug font-medium">
            {product.productName}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {product.productDescription}
          </p>
          <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-3.5 text-primary" />
            {product.productRatingCount > 0 ? (
              <span>
                <span className="text-foreground">{product.productRatingAvg.toFixed(1)}</span>{' '}
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
          <span className={cn('text-xs', outOfStock ? 'text-destructive' : 'text-muted-foreground')}>
            {outOfStock ? 'Unavailable' : `${product.productStock} left`}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
