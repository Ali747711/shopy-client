'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ORDER_STATUSES } from '@/lib/orders/schema'
import { formatPrice } from '@/lib/format'

interface DashboardChartsProps {
  ordersByStatus: Record<string, number>
  revenueByCurrency: Record<string, number>
}

// Distinct hues per order status — coherent with the badge palette and readable
// against both themes. Indexed by status so colours never shuffle.
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'oklch(0.72 0.02 280)',
  PAID: 'oklch(0.62 0.17 250)',
  SHIPPED: 'oklch(0.66 0.16 70)',
  DELIVERED: 'oklch(0.6 0.17 150)',
  CANCELLED: 'var(--color-destructive)',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export function DashboardCharts({ ordersByStatus, revenueByCurrency }: DashboardChartsProps) {
  const statusData = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        status,
        label: STATUS_LABELS[status],
        count: ordersByStatus[status] ?? 0,
        fill: STATUS_COLORS[status],
      })).filter((entry) => entry.count > 0),
    [ordersByStatus],
  )

  const statusTotal = useMemo(
    () => statusData.reduce((sum, entry) => sum + entry.count, 0),
    [statusData],
  )

  const statusConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = { count: { label: 'Orders' } }
    for (const status of ORDER_STATUSES) {
      config[status] = { label: STATUS_LABELS[status], color: STATUS_COLORS[status] }
    }
    return config
  }, [])

  const revenueData = useMemo(
    () =>
      Object.entries(revenueByCurrency)
        .map(([currency, amount]) => ({ currency, amount }))
        .sort((a, b) => b.amount - a.amount),
    [revenueByCurrency],
  )

  const hasRevenue = revenueData.some((entry) => entry.amount > 0)

  const revenueConfig = useMemo<ChartConfig>(
    () => ({ amount: { label: 'Revenue', color: 'var(--color-primary)' } }),
    [],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Orders by status</CardTitle>
          <CardDescription>Distribution across the fulfilment pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          {statusTotal > 0 ? (
            <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-65">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="status" hideLabel />}
                />
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={68}
                  outerRadius={104}
                  strokeWidth={2}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox)) return null
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground font-mono text-2xl font-semibold tabular-nums"
                          >
                            {statusTotal.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 20}
                            className="fill-muted-foreground text-[11px]"
                          >
                            Total orders
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <ChartEmpty message="No orders to chart yet." />
          )}
          {statusTotal > 0 ? (
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {statusData.map((entry) => (
                <li key={entry.status} className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block size-2.5 shrink-0"
                    style={{ backgroundColor: entry.fill }}
                    aria-hidden
                  />
                  <span className="truncate text-muted-foreground">{entry.label}</span>
                  <span className="ml-auto font-mono font-medium tabular-nums">{entry.count}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by currency</CardTitle>
          <CardDescription>Gross revenue captured per settlement currency.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRevenue ? (
            <ChartContainer config={revenueConfig} className="aspect-video max-h-65 w-full">
              <BarChart data={revenueData} margin={{ left: 4, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="currency"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px]"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickMargin={4}
                  tickFormatter={(value: number) => compactNumber(value)}
                  className="text-[11px]"
                />
                <ChartTooltip
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const currency =
                          typeof item?.payload?.currency === 'string'
                            ? item.payload.currency
                            : ''
                        return (
                          <span className="font-mono font-medium tabular-nums">
                            {formatPrice(Number(value), currency)}
                          </span>
                        )
                      }}
                    />
                  }
                />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={0} maxBarSize={64} />
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartEmpty message="No revenue recorded yet." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <Empty className="aspect-video max-h-65 border">
      <EmptyHeader>
        <EmptyTitle>Nothing to show</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}
