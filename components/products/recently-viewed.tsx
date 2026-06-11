'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { formatPrice } from '@/lib/format'
import { getRecentlyViewed, type RecentlyViewedItem } from '@/lib/recently-viewed'
import { cn } from '@/lib/utils'

interface RecentlyViewedProps {
  /** The current product ID so we can exclude it from the list. */
  excludeId?: string
  className?: string
}

export function RecentlyViewed({ excludeId, className }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Read from localStorage on mount only — avoids SSR mismatch
  useEffect(() => {
    const stored = getRecentlyViewed().filter((i) => i.productId !== excludeId)
    setItems(stored)
    setHydrated(true)
  }, [excludeId])

  // Empty state: render nothing rather than an empty section
  if (!hydrated || items.length === 0) return null

  return (
    <section aria-labelledby="recently-viewed-heading" className={cn('w-full', className)}>
      <h2
        id="recently-viewed-heading"
        className="font-heading mb-4 text-lg font-semibold tracking-tight"
      >
        Recently viewed
      </h2>

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
        role="list"
      >
        {items.map((item, index) => (
          <RecentlyViewedCard key={item.productId} item={item} index={index} />
        ))}
      </div>
    </section>
  )
}

function RecentlyViewedCard({
  item,
  index,
}: {
  item: RecentlyViewedItem
  index: number
}) {
  return (
    <motion.div
      role="listitem"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: 'easeOut' }}
      className="w-36 flex-none focus-visible:outline-none sm:w-40"
    >
      <Link
        href={`/products/${item.productId}`}
        className="group block focus-visible:outline-none"
        aria-label={`${item.productName}, ${formatPrice(item.price, item.currency)}`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted ring-1 ring-foreground/10">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <HugeiconsIcon
                icon={Image01Icon}
                strokeWidth={1.5}
                className="size-6 text-muted-foreground/40"
              />
            </div>
          )}
        </div>

        {/* Name + price */}
        <div className="mt-2 space-y-0.5">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {item.productName}
          </p>
          <p className="text-sm tabular-nums text-muted-foreground">
            {formatPrice(item.price, item.currency)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
