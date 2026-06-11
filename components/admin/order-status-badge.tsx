'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CreditCardIcon,
  DeliveryTruck01Icon,
  PackageIcon,
} from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/lib/orders/schema'

type IconSvg = typeof Clock01Icon
type BadgeVariant = React.ComponentProps<typeof Badge>['variant']

interface StatusMeta {
  label: string
  icon: IconSvg
  variant: BadgeVariant
  /** Inline color override applied to text + icon for a richer status palette. */
  tone: string
}

// A single source of truth so the table, charts, and any future filters all
// agree on how each order status looks. Tones reference theme tokens (or a
// fixed semantic colour) so they stay coherent in light + dark.
const STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING: {
    label: 'Pending',
    icon: Clock01Icon,
    variant: 'outline',
    tone: 'var(--color-muted-foreground)',
  },
  PAID: {
    label: 'Paid',
    icon: CreditCardIcon,
    variant: 'outline',
    tone: 'oklch(0.62 0.17 250)',
  },
  SHIPPED: {
    label: 'Shipped',
    icon: DeliveryTruck01Icon,
    variant: 'outline',
    tone: 'oklch(0.66 0.16 70)',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckmarkCircle02Icon,
    variant: 'outline',
    tone: 'oklch(0.6 0.17 150)',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: Cancel01Icon,
    variant: 'destructive',
    tone: 'var(--color-destructive)',
  },
}

const FALLBACK: StatusMeta = {
  label: 'Unknown',
  icon: PackageIcon,
  variant: 'secondary',
  tone: 'var(--color-muted-foreground)',
}

export function getOrderStatusMeta(status: string): StatusMeta {
  return STATUS_META[status as OrderStatus] ?? FALLBACK
}

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = getOrderStatusMeta(status)
  const isDestructive = meta.variant === 'destructive'

  return (
    <Badge
      variant={meta.variant}
      // For non-destructive variants we paint the icon + text with the status
      // tone, keeping the outline neutral for a clean, premium look.
      style={isDestructive ? undefined : { color: meta.tone }}
    >
      <HugeiconsIcon icon={meta.icon} strokeWidth={2} data-icon="inline-start" />
      {meta.label}
    </Badge>
  )
}
