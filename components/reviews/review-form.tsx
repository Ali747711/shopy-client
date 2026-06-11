'use client'

import { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { isApiError } from '@/lib/api'
import { createReview, createReviewInputSchema, type Review } from '@/lib/reviews'

import { InteractiveRatingSquares } from './rating-squares'

interface ReviewFormProps {
  productId: string
  onSubmitted: (review: Review) => void
  onCancel: () => void
}

/**
 * Inline review creation form with square rating selector.
 */
export function ReviewForm({ productId, onSubmitted, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<{ rating?: string; comment?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrors({})

      const parsed = createReviewInputSchema.safeParse({ rating, comment })
      if (!parsed.success) {
        const fieldErrors: typeof errors = {}
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof typeof fieldErrors
          if (!fieldErrors[key]) fieldErrors[key] = issue.message
        }
        setErrors(fieldErrors)
        return
      }

      setSubmitting(true)
      try {
        const review = await createReview(productId, parsed.data)
        onSubmitted(review)
      } catch (error) {
        setErrors({
          form: isApiError(error) ? error.message : 'Failed to submit review. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [rating, comment, productId, onSubmitted],
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border bg-card p-5 ring-1 ring-foreground/5"
    >
      <p className="font-heading text-sm font-medium">Write a Review</p>

      {/* Rating selector */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm text-muted-foreground">Rating</label>
        <InteractiveRatingSquares value={rating} onChange={setRating} />
        {errors.rating && (
          <p className="mt-1 text-xs text-destructive">{errors.rating}</p>
        )}
      </div>

      {/* Comment */}
      <div className="mt-4">
        <label htmlFor="review-comment" className="mb-1.5 block text-sm text-muted-foreground">
          Your review
        </label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          maxLength={1000}
          className="rounded-none"
          disabled={submitting}
        />
        {errors.comment && (
          <p className="mt-1 text-xs text-destructive">{errors.comment}</p>
        )}
      </div>

      {/* Form-level error */}
      {errors.form && (
        <p className="mt-3 text-xs text-destructive">{errors.form}</p>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
