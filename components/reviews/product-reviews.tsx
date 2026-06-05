'use client'

import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { InboxIcon, Alert01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  getReviews,
  type Review,
  type ReviewSort,
} from '@/lib/reviews'

import { ReviewForm } from './review-form'
import { ReviewList } from './review-list'
import { ReviewSummary } from './review-summary'

const PAGE_SIZE = 10

interface ProductReviewsProps {
  productId: string
}

/**
 * Root reviews section that fetches, displays, and manages product reviews.
 * Handles loading, error, and empty states with full optimistic mutations.
 */
export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, status: authStatus } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<ReviewSort>('recency')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Whether the current user has already reviewed this product.
  const hasReviewed = user ? reviews.some((r) => r.userId === user._id) : false
  const hasMore = reviews.length < total

  // Fetch reviews (resets on sort change).
  const fetchReviews = useCallback(
    async (pageNum: number, sortBy: ReviewSort, append: boolean) => {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      setError(null)
      try {
        const result = await getReviews(productId, {
          page: pageNum,
          limit: PAGE_SIZE,
          sort: sortBy,
        })
        setReviews((prev) => (append ? [...prev, ...result.reviews] : result.reviews))
        setTotal(result.total)
        setPage(pageNum)
      } catch (err) {
        setError(isApiError(err) ? err.message : 'Failed to load reviews.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [productId],
  )

  // Initial load and on sort change.
  useEffect(() => {
    void fetchReviews(1, sort, false)
  }, [fetchReviews, sort])

  const handleSortChange = useCallback((newSort: ReviewSort) => {
    setSort(newSort)
  }, [])

  const handleLoadMore = useCallback(() => {
    void fetchReviews(page + 1, sort, true)
  }, [fetchReviews, page, sort])

  // Optimistic add — prepend the new review.
  const handleReviewSubmitted = useCallback((review: Review) => {
    setReviews((prev) => [review, ...prev])
    setTotal((prev) => prev + 1)
    setShowForm(false)
  }, [])

  // Optimistic delete — remove by id, revert on error.
  const handleReviewDeleted = useCallback((reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId))
    setTotal((prev) => Math.max(0, prev - 1))
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-16 text-center">
        <HugeiconsIcon icon={Alert01Icon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
        <div>
          <p className="font-heading text-sm font-medium">Couldn&apos;t load reviews</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchReviews(1, sort, false)}>
          Try again
        </Button>
      </div>
    )
  }

  const showWriteButton =
    authStatus === 'authenticated' && !hasReviewed && !showForm

  return (
    <div className="flex flex-col gap-6">
      {/* Header row: summary + write button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <ReviewSummary reviews={reviews} total={total} />
        </div>
        {showWriteButton && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setShowForm(true)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSubmitted={handleReviewSubmitted}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Non-blocking error (shown below existing reviews) */}
      {error && reviews.length > 0 && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Review list or empty state */}
      {reviews.length > 0 ? (
        <ReviewList
          reviews={reviews}
          productId={productId}
          currentUserId={user?._id ?? null}
          sort={sort}
          onSortChange={handleSortChange}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
          onDeleted={handleReviewDeleted}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-16 text-center">
          <HugeiconsIcon icon={InboxIcon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
          <div>
            <p className="font-heading text-sm font-medium">No reviews yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to share your experience.
            </p>
          </div>
          {authStatus === 'authenticated' && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Write a Review
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
