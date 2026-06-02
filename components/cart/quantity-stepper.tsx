'use client'

import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  className?: string
}

export function QuantityStepper({ value, min = 1, max = 99, onChange, className }: QuantityStepperProps) {
  return (
    <div className={cn('inline-flex items-center border border-border', className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-8 items-center justify-center text-sm transition-colors hover:bg-muted disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center text-xs tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-8 items-center justify-center text-sm transition-colors hover:bg-muted disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}
