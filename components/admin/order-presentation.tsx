import type { PaymentStatus } from '@/lib/orders'

/**
 * Shared presentation helpers for admin order views so the list and detail
 * pages agree on short ids, dates, and payment-status colours. Order *status*
 * styling lives in `order-status-badge.tsx` — this only covers payment status.
 */

interface PaymentMeta {
  label: string
  /** Inline colour override applied to the Badge text for a richer palette. */
  tone: string
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, PaymentMeta> = {
  UNPAID: { label: 'Unpaid', tone: 'var(--color-muted-foreground)' },
  PAID: { label: 'Paid', tone: 'oklch(0.6 0.17 150)' },
  FAILED: { label: 'Failed', tone: 'var(--color-destructive)' },
  REFUNDED: { label: 'Refunded', tone: 'oklch(0.66 0.16 70)' },
}

/** A compact, human-scannable id derived from the trailing characters. */
export function shortOrderId(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatOrderDate(value: string | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return DATE_FORMATTER.format(date)
}

export function formatOrderDateTime(value: string | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return DATE_TIME_FORMATTER.format(date)
}
