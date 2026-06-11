'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { getProduct, type Product } from '@/lib/products'
import { getPriceSnapshot, useWishlist } from '@/lib/wishlist'
import { cn } from '@/lib/utils'

interface ProductWithDrop {
  product: Product
  /** The price at time of wishlisting; null means no snapshot was saved. */
  snapshotPrice: number | null
  snapshotCurrency: string | null
  priceDrop: boolean
}

export default function WishlistPage() {
  const { items, removeItem, hydrated } = useWishlist()
  const { addItem } = useCart()
  const [entries, setEntries] = useState<ProductWithDrop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated) return

    // When the list empties we still let the async path run but it resolves
    // immediately with an empty array — avoids synchronous setState in effect body.
    const fetchAll = async () => {
      const results = await Promise.all(
        items.map(async (id) => {
          try {
            const product = await getProduct(id)
            const snapshot = getPriceSnapshot(id)
            const currentPrice = product.convertedPrice ?? product.productPrice
            const priceDrop = snapshot !== null && currentPrice < snapshot.price

            return {
              product,
              snapshotPrice: snapshot?.price ?? null,
              snapshotCurrency: snapshot?.currency ?? null,
              priceDrop,
            } satisfies ProductWithDrop
          } catch {
            return null
          }
        }),
      )
      return results.filter((r): r is ProductWithDrop => r !== null)
    }

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    void fetchAll().then((results) => {
      if (!cancelled) {
        setEntries(results)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [items, hydrated])

  const handleRemove = (productId: string) => {
    // removeItem in context already calls clearPriceSnapshot internally.
    removeItem(productId)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-24 sm:pb-12">
      <header className="mb-6 flex items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Wishlist</h1>
        {hydrated && items.length > 0 && (
          <Badge variant="secondary">{items.length}</Badge>
        )}
      </header>

      {!hydrated || loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border py-24 text-center">
          <p className="font-heading text-sm font-medium">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">
            Save products you love and come back to them later.
          </p>
          <Link href="/products" className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map(({ product, snapshotPrice, snapshotCurrency, priceDrop }) => {
            const image = product.productImages?.[0]
            const price = product.convertedPrice ?? product.productPrice
            const currency = product.currency ?? product.productCurrency
            const outOfStock = product.productStock <= 0

            return (
              <div key={product._id} className="flex flex-col gap-2 border border-border bg-card p-3">
                <Link href={`/products/${product._id}`} className="block">
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt={image.alt ?? product.productName}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary" />
                    )}

                    {/* Price drop badge — top-left of the image */}
                    {priceDrop && (
                      <span className="absolute top-2 left-2 bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        ↓ Price dropped!
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="w-fit capitalize text-[10px]">
                    {product.productCategory}
                  </Badge>
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-heading line-clamp-2 text-sm font-medium leading-snug hover:underline">
                      {product.productName}
                    </h3>
                  </Link>

                  {/* Price with optional crossed-out original */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-sm font-semibold">
                      {formatPrice(price, currency)}
                    </span>
                    {priceDrop && snapshotPrice !== null && snapshotCurrency !== null && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(snapshotPrice, snapshotCurrency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={outOfStock}
                    className="w-full text-sm"
                    onClick={() =>
                      addItem({
                        productId: product._id,
                        productName: product.productName,
                        price,
                        currency,
                        image: image?.url,
                        stock: product.productStock,
                      })
                    }
                  >
                    {outOfStock ? 'Out of stock' : 'Add to cart'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
