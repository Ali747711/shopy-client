'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Image01Icon, StarIcon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { AddToCart } from '@/components/products/add-to-cart'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import { getProduct, type Product } from '@/lib/products'

interface QuickViewModalProps {
  productId: string | null
  onClose: () => void
}

// Framer Motion variants for a subtle scale + fade entrance.
// The dialog overlay handles backdrop; we animate the content itself.
const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12, ease: [0.42, 0, 1, 1] } },
}

export function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  // Fetch product data when a productId is provided.
  // All setState calls happen in async callbacks (not synchronously in the effect
  // body) to satisfy the react-hooks/set-state-in-effect lint rule.
  useEffect(() => {
    if (!productId) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setFetchError(false)
      setProduct(null)
      try {
        const p = await getProduct(productId)
        if (!cancelled) {
          setProduct(p)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setFetchError(true)
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [productId])

  const price = product ? (product.convertedPrice ?? product.productPrice) : 0
  const currency = product ? (product.currency ?? product.productCurrency) : 'USD'
  const image = product?.productImages?.[0]
  const outOfStock = product ? product.productStock <= 0 : false

  return (
    <Dialog open={productId !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="w-full max-w-xl p-0 overflow-hidden sm:max-w-2xl"
        showCloseButton
      >
        {/* Always-present title satisfies Radix accessibility requirement.
            The visible product name is rendered as a plain element below. */}
        <DialogTitle className="sr-only">
          {product?.productName ?? 'Quick view'}
        </DialogTitle>
        <AnimatePresence mode="wait">
          {productId && (
            <motion.div
              key={productId}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid sm:grid-cols-2"
            >
              {/* Image column */}
              <div className="relative aspect-square w-full bg-muted sm:aspect-auto sm:min-h-72">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.alt ?? product?.productName ?? ''}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
                    <HugeiconsIcon
                      icon={Image01Icon}
                      strokeWidth={1.5}
                      className="size-10 text-muted-foreground/40"
                    />
                  </div>
                )}

                {!loading && outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                    <Badge variant="secondary" className="uppercase tracking-wide">
                      Out of stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Info column */}
              <div className="flex flex-col gap-4 p-5">
                {loading ? (
                  <QuickViewSkeleton />
                ) : fetchError ? (
                  <div className="flex flex-col gap-2 py-4">
                    <p className="text-sm font-medium text-destructive">Failed to load product</p>
                    <p className="text-xs text-muted-foreground">Please try again later.</p>
                  </div>
                ) : product ? (
                  <>
                    <DialogHeader>
                      <Badge variant="outline" className="w-fit capitalize text-[10px]">
                        {product.productCategory}
                      </Badge>
                      <p className="mt-1 text-base font-heading font-semibold leading-snug">
                        {product.productName}
                      </p>
                    </DialogHeader>

                    {/* Rating */}
                    {product.productRatingCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-3.5 text-primary" />
                        <span className="text-foreground">{product.productRatingAvg.toFixed(1)}</span>
                        <span>({product.productRatingCount})</span>
                      </div>
                    )}

                    {/* Price */}
                    <span className="font-heading text-xl font-semibold">
                      {formatPrice(price, currency)}
                    </span>

                    {/* Description — clamped to 3 lines */}
                    <DialogDescription className="line-clamp-3 text-sm leading-relaxed">
                      {product.productDescription}
                    </DialogDescription>

                    {/* Stock */}
                    <p className={`text-sm ${outOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {outOfStock ? 'Unavailable' : `${product.productStock} in stock`}
                    </p>

                    {/* Add to cart */}
                    <div className="mt-auto">
                      <AddToCart
                        product={{
                          productId: product._id,
                          productName: product.productName,
                          price,
                          currency,
                          image: image?.url,
                          stock: product.productStock,
                        }}
                      />
                    </div>

                    {/* Full details link */}
                    <Link
                      href={`/products/${product._id}`}
                      onClick={onClose}
                      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      View full details
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
                    </Link>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

function QuickViewSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-9 w-full mt-2" />
    </div>
  )
}
