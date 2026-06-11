'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowExpand01Icon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, Image01Icon } from '@hugeicons/core-free-icons'

import type { ProductImage } from '@/lib/products'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  // Direction drives the slide animation: +1 = forward, -1 = backward
  const [direction, setDirection] = useState(1)
  const thumbnailStripRef = useRef<HTMLDivElement>(null)

  const navigate = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex) return
      setDirection(nextIndex > activeIndex ? 1 : -1)
      setActiveIndex(nextIndex)
    },
    [activeIndex],
  )

  const navigateRelative = useCallback(
    (delta: number) => {
      if (images.length === 0) return
      navigate((activeIndex + delta + images.length) % images.length)
    },
    [activeIndex, images.length, navigate],
  )

  // Keyboard navigation — arrow keys cycle through images; Escape closes lightbox
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateRelative(-1)
      if (e.key === 'ArrowRight') navigateRelative(1)
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigateRelative])

  // Scroll the active thumbnail into view when it changes
  useEffect(() => {
    const strip = thumbnailStripRef.current
    const thumb = strip?.children[activeIndex] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIndex])

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  const activeImage = images[activeIndex]

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-muted ring-1 ring-foreground/10 flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
        <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-12 text-muted-foreground/40" />
      </div>
    )
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className="group relative aspect-square w-full overflow-hidden bg-muted ring-1 ring-foreground/10 cursor-zoom-in"
          role="img"
          aria-label={activeImage?.alt ?? productName}
          onClick={() => setLightboxOpen(true)}
        >
          <AnimatePresence custom={direction} initial={false} mode="sync">
            <motion.img
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }}
              src={activeImage?.url}
              alt={activeImage?.alt ?? productName}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          </AnimatePresence>

          {/* Desktop zoom hint */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-foreground/0 transition-colors duration-200 group-hover:bg-foreground/5"
          />
          <span
            aria-hidden
            className="absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center bg-background/80 opacity-0 backdrop-blur-sm ring-1 ring-foreground/10 transition-opacity duration-200 group-hover:opacity-100"
          >
            <HugeiconsIcon icon={ArrowExpand01Icon} strokeWidth={1.5} className="size-4 text-foreground" />
          </span>

          {/* Swipe support */}
          <GestureLayer onSwipeLeft={() => navigateRelative(1)} onSwipeRight={() => navigateRelative(-1)} />

          {/* Prev / next arrow buttons — visible on hover */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); navigateRelative(-1) }}
                className="absolute top-1/2 left-2 -translate-y-1/2 flex size-8 items-center justify-center bg-background/80 backdrop-blur-sm ring-1 ring-foreground/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); navigateRelative(1) }}
                className="absolute top-1/2 right-2 -translate-y-1/2 flex size-8 items-center justify-center bg-background/80 backdrop-blur-sm ring-1 ring-foreground/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip — hidden when only one image */}
        {images.length > 1 && (
          <div
            ref={thumbnailStripRef}
            role="tablist"
            aria-label="Product images"
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Image ${i + 1}${img.alt ? `: ${img.alt}` : ''}`}
                onClick={() => navigate(i)}
                className={cn(
                  'relative h-16 w-16 flex-none overflow-hidden bg-muted ring-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  i === activeIndex
                    ? 'ring-foreground/60 opacity-100'
                    : 'ring-foreground/10 opacity-60 hover:opacity-100',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? `${productName} ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal
            aria-label="Image lightbox"
          >
            {/* Close */}
            <button
              type="button"
              aria-label="Close lightbox"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 flex size-9 items-center justify-center bg-muted ring-1 ring-foreground/10 transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="size-5" />
            </button>

            {/* Main lightbox image */}
            <div
              className="relative w-full max-w-3xl px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence custom={direction} initial={false} mode="sync">
                <motion.img
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  src={activeImage?.url}
                  alt={activeImage?.alt ?? productName}
                  className="max-h-[80vh] w-full object-contain"
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {/* Prev / next in lightbox */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => { e.stopPropagation(); navigateRelative(-1) }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center bg-muted ring-1 ring-foreground/10 transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => { e.stopPropagation(); navigateRelative(1) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center bg-muted ring-1 ring-foreground/10 transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                </button>
              </>
            )}

            {/* Dot indicators in lightbox */}
            {images.length > 1 && (
              <div aria-hidden className="absolute bottom-6 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(i) }}
                    aria-label={`Go to image ${i + 1}`}
                    className={cn(
                      'size-1.5 rounded-full transition-all duration-150',
                      i === activeIndex ? 'bg-foreground scale-125' : 'bg-foreground/30',
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Minimal touch-swipe detector — avoids an external dep
function GestureLayer({
  onSwipeLeft,
  onSwipeRight,
}: {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}) {
  const startX = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const delta = (e.changedTouches[0]?.clientX ?? 0) - startX.current
    if (Math.abs(delta) < 40) return
    if (delta < 0) onSwipeLeft()
    else onSwipeRight()
    startX.current = null
  }

  return (
    <div
      className="absolute inset-0"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-hidden
    />
  )
}
