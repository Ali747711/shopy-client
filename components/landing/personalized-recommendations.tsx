'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BlurFade } from '@/components/ui/blur-fade'
import { ProductCard } from '@/components/products/product-card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth'
import { getProducts, type Product } from '@/lib/products'

export function PersonalizedRecommendations() {
  const { t } = useTranslation()
  const { status } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        // Try the personalized recommendations endpoint first.
        const res = await fetch('/api/recommendations?limit=8', {
          credentials: 'include',
        })
        if (res.ok) {
          const json = await res.json()
          if (!cancelled && json.success && Array.isArray(json.data?.items)) {
            setProducts(json.data.items)
            setLoading(false)
            return
          }
        }
      } catch {
        // Fallback below
      }

      // Fallback: top-rated products
      try {
        const { data } = await getProducts({ limit: 8, sort: 'RATING' })
        if (!cancelled) setProducts(data)
      } catch {
        // Silent fail — section just won't appear
      }
      if (!cancelled) setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [status])

  // Don't render for unauthenticated users or if no products loaded
  if (status !== 'authenticated') return null
  if (!loading && products.length === 0) return null

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="mb-6">
        <span className="text-xs font-medium tracking-wider text-primary uppercase">
          {t('landing.basedOnActivity')}
        </span>
        <h2 className="font-heading mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {t('landing.recommendedForYou')}
        </h2>
      </div>

      {loading ? (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-52 shrink-0">
                <Skeleton className="aspect-4/5 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-1 h-3 w-1/2" />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {products.map((product, index) => (
              <BlurFade key={product._id} delay={0.04 * index} inView>
                <div className="w-52 shrink-0">
                  <ProductCard product={product} />
                </div>
              </BlurFade>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  )
}
