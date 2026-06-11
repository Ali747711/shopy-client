'use client'

import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  Coins01Icon,
  PackageIcon,
  PackageSearchIcon,
  ShoppingCart01Icon,
} from '@hugeicons/core-free-icons'

import { DashboardCharts } from '@/components/admin/dashboard-charts'
import { MetricCard } from '@/components/admin/metric-card'
import { RecentOrdersTable } from '@/components/admin/recent-orders-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getAdminStats, type AdminStats } from '@/lib/admin'
import { formatPrice } from '@/lib/format'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; stats: AdminStats }

/** Renders one figure per currency; the first is primary, the rest are a detail line. */
function renderRevenue(revenueByCurrency: Record<string, number>): {
  value: React.ReactNode
  detail?: React.ReactNode
} {
  const entries = Object.entries(revenueByCurrency).filter(([, amount]) => amount > 0)
  if (entries.length === 0) {
    return { value: formatPrice(0, 'USD') }
  }
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const [primary, ...rest] = sorted
  return {
    value: formatPrice(primary[1], primary[0]),
    detail:
      rest.length > 0
        ? rest.map(([currency, amount]) => formatPrice(amount, currency)).join('  ·  ')
        : undefined,
  }
}

export default function AdminDashboardPage() {
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  // Core fetch — no synchronous setState, so it's safe to invoke from an effect.
  const fetchStats = useCallback(async () => {
    try {
      const stats = await getAdminStats()
      setState({ phase: 'ready', stats })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load dashboard statistics.'
      setState({ phase: 'error', message })
    }
  }, [])

  // Retry handler resets to the loading state before refetching.
  const retry = useCallback(() => {
    setState({ phase: 'loading' })
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    let active = true
    void getAdminStats()
      .then((stats) => {
        if (active) setState({ phase: 'ready', stats })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message =
          error instanceof Error ? error.message : 'Unable to load dashboard statistics.'
        setState({ phase: 'error', message })
      })
    return () => {
      active = false
    }
  }, [])

  if (state.phase === 'loading') {
    return <DashboardSkeleton />
  }

  if (state.phase === 'error') {
    return (
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <AlertTitle>Couldn&apos;t load the dashboard</AlertTitle>
        <AlertDescription>
          <p>{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    )
  }

  const { stats } = state
  const revenue = renderRevenue(stats.revenueByCurrency)
  const lowStock = stats.lowStockCount

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Overview</h2>
        <p className="text-xs text-muted-foreground">
          A real-time pulse on orders, catalogue, and revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total orders"
          icon={ShoppingCart01Icon}
          value={stats.totalOrders.toLocaleString()}
          tone="primary"
        />
        <MetricCard
          label="Total products"
          icon={PackageIcon}
          value={stats.totalProducts.toLocaleString()}
          tone="neutral"
        />
        <MetricCard
          label="Low stock"
          icon={lowStock > 0 ? Alert02Icon : PackageSearchIcon}
          value={lowStock.toLocaleString()}
          detail={lowStock > 0 ? 'Needs restocking soon' : 'All healthy'}
          tone={lowStock > 0 ? 'warning' : 'neutral'}
        />
        <MetricCard
          label="Revenue"
          icon={Coins01Icon}
          value={revenue.value}
          detail={revenue.detail}
          tone="primary"
        />
      </div>

      {lowStock > 0 ? (
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} style={{ color: 'oklch(0.66 0.16 70)' }} />
          <AlertTitle>{lowStock} product{lowStock === 1 ? '' : 's'} running low</AlertTitle>
          <AlertDescription>
            Review and restock these items to avoid lost sales.
          </AlertDescription>
        </Alert>
      ) : null}

      <DashboardCharts
        ordersByStatus={stats.ordersByStatus}
        revenueByCurrency={stats.revenueByCurrency}
      />

      <RecentOrdersTable orders={stats.recentOrders} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
              <Skeleton className="size-9" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video max-h-65 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3 py-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
