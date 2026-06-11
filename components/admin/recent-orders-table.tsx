'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, InboxIcon } from '@hugeicons/core-free-icons'

import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/format'
import type { Order } from '@/lib/orders/schema'

interface RecentOrdersTableProps {
  orders: Order[]
}

function shortId(id: string): string {
  return id.length > 8 ? `#${id.slice(-8).toUpperCase()}` : `#${id.toUpperCase()}`
}

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function itemCount(order: Order): number {
  return order.orderItems.reduce((sum, item) => sum + item.qty, 0)
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>The latest orders placed across your store.</CardDescription>
        <CardAction>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
          >
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {orders.length === 0 ? (
          <Empty className="border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={InboxIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>No orders yet</EmptyTitle>
              <EmptyDescription>
                Orders will appear here as soon as customers start checking out.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Items</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="pr-4 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} className="group relative cursor-pointer">
                  <TableCell className="pl-4 font-mono font-medium">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-foreground transition-colors group-hover:text-primary after:absolute after:inset-0 after:content-['']"
                    >
                      {shortId(order._id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.orderStatus} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                    {itemCount(order)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="pr-4 text-right font-mono font-medium tabular-nums">
                    {formatPrice(order.orderTotal, order.orderCurrency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
