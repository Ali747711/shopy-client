'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper'
import { A11y, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'

import { Skeleton } from '@/components/ui/skeleton'
import { getProducts } from '@/lib/products/api'
import type { Product } from '@/lib/products/schema'
import { cn } from '@/lib/utils'

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" fill="%23e5e5e5"%3E%3Crect width="800" height="1000"/%3E%3C/svg%3E'
const CARD_COUNT = 12

// Slides per view scale up with the viewport; fractional values let the next
// card peek in so it reads as a swipeable carousel.
const BREAKPOINTS = {
  0: { slidesPerView: 2.2, spaceBetween: 12 },
  640: { slidesPerView: 3.2, spaceBetween: 16 },
  768: { slidesPerView: 4, spaceBetween: 16 },
  1024: { slidesPerView: 5, spaceBetween: 16 },
}

function ProductShowcaseSkeleton() {
  return (
    <div className="flex gap-3 sm:gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="aspect-4/5 w-1/2 shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5" />
      ))}
    </div>
  )
}

export function ProductShowcase() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const [swiper, setSwiper] = useState<SwiperClass | null>(null)
  const [edges, setEdges] = useState({ isBeginning: true, isEnd: false })
  const syncEdges = (s: SwiperClass) =>
    setEdges({ isBeginning: s.isBeginning, isEnd: s.isEnd })

  useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      try {
        const { data } = await getProducts({ limit: CARD_COUNT, sort: 'RATING' })
        if (!cancelled) {
          setProducts(data)
          setStatus('ready')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="shop" className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-32">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-medium tracking-wider text-primary uppercase">
            {t('landing.trendingNow')}
          </span>
          <h2 className="font-heading mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {t('landing.pickedForYou')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Carousel arrows — swipe on touch, click on desktop */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <NavButton
              label="Previous products"
              disabled={edges.isBeginning}
              onClick={() => swiper?.slidePrev()}
            >
              <ChevronLeft className="size-4" />
            </NavButton>
            <NavButton
              label="Next products"
              disabled={edges.isEnd}
              onClick={() => swiper?.slideNext()}
            >
              <ChevronRight className="size-4" />
            </NavButton>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('landing.viewAll')}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      {status === 'loading' && <ProductShowcaseSkeleton />}

      {status === 'ready' && (
        <Swiper
          modules={[FreeMode, A11y]}
          freeMode={{ enabled: true, momentumBounce: false }}
          grabCursor
          breakpoints={BREAKPOINTS}
          onSwiper={(s) => {
            setSwiper(s)
            syncEdges(s)
          }}
          onSlideChange={syncEdges}
          onProgress={syncEdges}
        >
          {products.map((product) => {
            const imageUrl = product.productImages?.[0]?.url || PLACEHOLDER_IMAGE
            const imageAlt = product.productImages?.[0]?.alt || product.productName

            return (
              <SwiperSlide key={product._id}>
                <Link
                  href={`/products/${product._id}`}
                  aria-label={product.productName}
                  className="group block focus-visible:outline-none"
                >
                  <div className="relative aspect-4/5 overflow-hidden border border-border bg-muted">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                </Link>
              </SwiperSlide>
            )
          })}
        </Swiper>
      )}
    </section>
  )
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-full border border-border text-foreground transition-colors',
        'hover:border-foreground/40 hover:bg-muted',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
      )}
    >
      {children}
    </button>
  )
}
