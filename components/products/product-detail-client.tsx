'use client'

// This thin client shell owns the refs needed for Feature 2 (StickyAtcBar)
// and tracks the product view for Feature 5 (RecentlyViewed). It receives
// fully-resolved product data as props so the heavy data-fetching stays in
// the server component.

import { useEffect, useRef } from 'react'

import { AddToCart } from '@/components/products/add-to-cart'
import { StickyAtcBar } from '@/components/products/sticky-atc-bar'
import { addRecentlyViewed } from '@/lib/recently-viewed'
import type { CartAddInput } from '@/lib/cart'

interface ProductDetailClientProps {
  product: CartAddInput & { productName: string }
  price: number
  currency: string
}

export function ProductDetailClient({ product, price, currency }: ProductDetailClientProps) {
  // Ref passed to StickyAtcBar so IntersectionObserver can track the primary ATC button
  const atcRef = useRef<HTMLDivElement>(null)

  // Track this page view in localStorage for RecentlyViewed feature
  useEffect(() => {
    addRecentlyViewed({
      productId: product.productId,
      productName: product.productName,
      price,
      currency,
      image: product.image,
    })
  }, [product.productId, product.productName, price, currency, product.image])

  return (
    <>
      <div ref={atcRef}>
        <AddToCart product={product} />
      </div>

      <StickyAtcBar
        anchorRef={atcRef}
        product={product}
        price={price}
        currency={currency}
      />
    </>
  )
}
