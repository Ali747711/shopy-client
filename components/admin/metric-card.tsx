'use client'

import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent } from '@/components/ui/card'

type IconSvg = Parameters<typeof HugeiconsIcon>[0]['icon']

interface MetricCardProps {
  label: string
  icon: IconSvg
  /** Primary figure. Pre-formatted by the caller (currency, count, etc.). */
  value: React.ReactNode
  /** Optional secondary line under the value (e.g. extra currencies). */
  detail?: React.ReactNode
  /** Tone applied to the icon chip — defaults to the brand primary. */
  tone?: 'primary' | 'warning' | 'neutral'
}

const TONES: Record<NonNullable<MetricCardProps['tone']>, { bg: string; fg: string }> = {
  primary: { bg: 'var(--color-primary)', fg: 'var(--color-primary-foreground)' },
  warning: { bg: 'oklch(0.66 0.16 70)', fg: 'oklch(0.99 0 0)' },
  neutral: { bg: 'var(--color-secondary)', fg: 'var(--color-secondary-foreground)' },
}

export function MetricCard({ label, icon, value, detail, tone = 'neutral' }: MetricCardProps) {
  const palette = TONES[tone]

  return (
    <Card className="relative transition-shadow duration-200 hover:ring-foreground/20">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span className="font-mono text-2xl leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
        </div>
        <span
          className="inline-flex size-9 shrink-0 items-center justify-center"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          <HugeiconsIcon icon={icon} size={18} strokeWidth={2} />
        </span>
      </CardContent>
    </Card>
  )
}
