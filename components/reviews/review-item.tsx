'use client'

import { useCallback, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { isApiError } from '@/lib/api'
import { deleteReview, type Review } from '@/lib/reviews'

import { RatingSquares } from './rating-squares'

interface ReviewItemProps {
  review: Review
  productId: string
  isOwn: boolean
  onDeleted: (reviewId: string) => void
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffDay > 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (diffDay > 0) return `${diffDay}d ago`
  if (diffHr > 0) return `${diffHr}h ago`
  if (diffMin > 0) return `${diffMin}m ago`
  return 'Just now'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/**
 * Single review card with left accent border, monogram avatar,
 * and inline delete confirmation for own reviews.
 */
export function ReviewItem({ review, productId, isOwn, onDeleted }: ReviewItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userName = review.userName || 'Anonymous'
  const initials = getInitials(userName)

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteReview(productId)
      onDeleted(review._id)
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to delete review.')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }, [productId, review._id, onDeleted])

  return (
    <article className="border-l-2 border-primary pl-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Square monogram avatar */}
          <div className="flex size-8 shrink-0 items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-[10px] text-muted-foreground">{formatRelativeDate(review.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RatingSquares rating={review.rating} />
          {isOwn && !confirmingDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Delete review"
              onClick={() => setConfirmingDelete(true)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="size-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm/relaxed text-muted-foreground">{review.comment}</p>

      {/* Inline delete confirmation */}
      {confirmingDelete && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Delete this review?</span>
          <Button
            variant="destructive"
            size="xs"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes'}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
          >
            No
          </Button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </article>
  )
}
