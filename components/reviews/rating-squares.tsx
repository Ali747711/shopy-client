'use client'

import { cn } from '@/lib/utils'

interface RatingSquaresProps {
  rating: number
  size?: 'sm' | 'md'
}

/**
 * Geometric rating indicator — filled squares instead of stars,
 * matching the project's sharp rectangular design language.
 */
export function RatingSquares({ rating, size = 'sm' }: RatingSquaresProps) {
  const dimension = size === 'sm' ? 'size-3' : 'size-5'

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            dimension,
            'inline-block transition-colors',
            i < rating ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}

interface InteractiveRatingSquaresProps {
  value: number
  onChange: (rating: number) => void
}

/**
 * Clickable rating selector using sharp squares.
 */
export function InteractiveRatingSquares({ value, onChange }: InteractiveRatingSquaresProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
            className={cn(
              'size-6 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              star <= value
                ? 'bg-primary hover:bg-primary/80'
                : 'bg-muted hover:bg-muted-foreground/20',
            )}
            onClick={() => onChange(star)}
          />
        )
      })}
    </div>
  )
}
