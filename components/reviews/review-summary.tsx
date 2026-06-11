'use client'

import { useTranslation } from 'react-i18next'

import type { Review } from '@/lib/reviews'

interface ReviewSummaryProps {
  reviews: Review[]
  total: number
}

/**
 * Asymmetric review summary header: large average rating on the left,
 * star-distribution progress bars on the right.
 */
export function ReviewSummary({ reviews, total }: ReviewSummaryProps) {
  if (total === 0) return null

  // Compute distribution from the loaded reviews. When only one page is loaded
  // this is an approximation — good enough for a visual overview.
  const distribution = [0, 0, 0, 0, 0]
  let sum = 0
  for (const review of reviews) {
    distribution[review.rating - 1] += 1
    sum += review.rating
  }
  const avg = reviews.length > 0 ? sum / reviews.length : 0
  const maxBucket = Math.max(...distribution, 1)

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
      {/* Large average */}
      <div className="shrink-0">
        <p className="font-heading text-6xl font-semibold tracking-tight sm:text-7xl">
          {avg.toFixed(1)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} {total === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="flex flex-1 flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star - 1]
          const pct = (count / maxBucket) * 100
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-right text-muted-foreground">{star}</span>
              <div className="relative h-2 flex-1 bg-muted">
                <div
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-5 text-right tabular-nums text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
