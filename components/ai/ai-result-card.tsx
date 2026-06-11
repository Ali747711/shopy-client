import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon, SparklesIcon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import type { ScoredProduct } from '@/lib/ai'

export function AiResultCard({ product }: { product: ScoredProduct }) {
  const matchPercent = Math.round(Math.max(0, Math.min(1, product.score)) * 100)

  return (
    <Link
      href={`/products/${product._id}`}
      className="group/link block focus-visible:outline-none"
    >
      <Card className="h-full transition-all group-hover/link:ring-foreground/25 group-focus-visible/link:ring-2 group-focus-visible/link:ring-ring">
        <div className="relative -mt-4 aspect-square w-full overflow-hidden bg-muted">
          {product.productImages?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.productImages[0].url}
              alt={product.productImages[0].alt ?? product.productName}
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
          {product.score > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3" />
              {matchPercent}% match
            </span>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-2">
          <Badge variant="outline" className="w-fit capitalize">
            {product.productCategory}
          </Badge>
          <h3 className="font-heading line-clamp-2 text-sm leading-snug font-medium">
            {product.productName}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.productDescription}</p>
        </CardContent>

        <CardFooter className="justify-between">
          <span className="font-heading text-sm font-semibold">
            {formatPrice(product.productPrice, product.productCurrency)}
          </span>
          <span className="text-xs text-muted-foreground">View details →</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
