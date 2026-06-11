'use client'

import { useTranslation } from 'react-i18next'

import { BlurFade } from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Review, ReviewSort } from '@/lib/reviews'

import { ReviewItem } from './review-item'

interface ReviewListProps {
  reviews: Review[]
  productId: string
  currentUserId: string | null
  sort: ReviewSort
  onSortChange: (sort: ReviewSort) => void
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  onDeleted: (reviewId: string) => void
}

const SORT_LABELS: Record<ReviewSort, string> = {
  recency: 'Most Recent',
  rating_high: 'Highest Rated',
  rating_low: 'Lowest Rated',
}

/**
 * Sortable review list with staggered blur-fade reveals
 * and a "Load more" button at the bottom.
 */
export function ReviewList({
  reviews,
  productId,
  currentUserId,
  sort,
  onSortChange,
  hasMore,
  loadingMore,
  onLoadMore,
  onDeleted,
}: ReviewListProps) {
  return (
    <div>
      {/* Sort control */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} shown
        </p>
        <Select value={sort} onValueChange={(v) => onSortChange(v as ReviewSort)}>
          <SelectTrigger size="sm" aria-label="Sort reviews">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(SORT_LABELS) as [ReviewSort, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Review items */}
      <div className="flex flex-col gap-5">
        {reviews.map((review, i) => (
          <BlurFade key={review._id} delay={0.04 * Math.min(i, 8)} inView>
            <ReviewItem
              review={review}
              productId={productId}
              isOwn={currentUserId === review.userId}
              onDeleted={onDeleted}
            />
          </BlurFade>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load more reviews'}
          </Button>
        </div>
      )}
    </div>
  )
}
