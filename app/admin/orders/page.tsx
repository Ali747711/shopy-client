'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, InvoiceIcon } from '@hugeicons/core-free-icons'

import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAllOrders } from '@/lib/admin'
import { isApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/lib/orders'
import {
  PAYMENT_STATUS_META,
  formatOrderDate,
  shortOrderId,
} from '@/components/admin/order-presentation'

const PAGE_SIZE = 10

type StatusFilter = 'ALL' | OrderStatus

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; orders: Order[]; total: number }

const STATUS_FILTER_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function customerLabel(order: Order): string {
  if (order.shippingAddress?.fullName) return order.shippingAddress.fullName
  if (order.userId) return `Customer ${shortOrderId(order.userId)}`
  return 'Guest'
}

function itemCount(order: Order): number {
  return order.orderItems.reduce((sum, item) => sum + item.qty, 0)
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const [state, setState] = useState<LoadState>({ phase: 'loading' })
  // Bumped to force a refetch after an error retry.
  const [refreshToken, setRefreshToken] = useState(0)

  // Tracks the latest request so a slow earlier one can't clobber a newer result.
  const requestId = useRef(0)

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatus(value)
    setPage(1)
    setState({ phase: 'loading' })
  }, [])

  const handlePageChange = useCallback((next: number) => {
    setPage(next)
    setState({ phase: 'loading' })
  }, [])

  const handleRetry = useCallback(() => {
    setState({ phase: 'loading' })
    setRefreshToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const current = ++requestId.current
    let active = true

    void getAllOrders({
      page,
      limit: PAGE_SIZE,
      status: status === 'ALL' ? undefined : status,
    })
      .then((result) => {
        if (!active || current !== requestId.current) return
        setState({
          phase: 'ready',
          orders: result.data,
          total: result.meta?.total ?? result.data.length,
        })
      })
      .catch((error: unknown) => {
        if (!active || current !== requestId.current) return
        const message = isApiError(error)
          ? error.message
          : 'Unable to load orders. Please try again.'
        setState({ phase: 'error', message })
      })

    return () => {
      active = false
    }
  }, [page, status, refreshToken])

  const totalPages = useMemo(() => {
    if (state.phase !== 'ready') return 1
    return Math.max(1, Math.ceil(state.total / PAGE_SIZE))
  }, [state])

  const hasFilters = status !== 'ALL'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Orders</h2>
        <p className="text-xs text-muted-foreground">
          Review incoming orders and keep their fulfilment status up to date.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Select
          value={status}
          onValueChange={(value) => handleStatusChange(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {ORDER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_FILTER_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      {state.phase === 'error' ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Couldn&apos;t load orders</AlertTitle>
          <AlertDescription>
            <p>{state.message}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden pr-4 text-right lg:table-cell">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.phase === 'loading' ? (
                <OrderRowsSkeleton />
              ) : state.orders.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0">
                    <Empty className="border-none py-12">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} />
                        </EmptyMedia>
                        <EmptyTitle>
                          {hasFilters ? 'No matching orders' : 'No orders yet'}
                        </EmptyTitle>
                        <EmptyDescription>
                          {hasFilters
                            ? 'Try selecting a different status filter.'
                            : 'Orders placed by customers will appear here.'}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                state.orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onSelect={() => router.push(`/admin/orders/${order._id}`)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {state.phase === 'ready' && totalPages > 1 ? (
        <Pagination className="justify-between">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Showing page <span className="font-medium text-foreground">{page}</span> of{' '}
            <span className="font-medium text-foreground">{totalPages}</span> ·{' '}
            <span className="font-mono tabular-nums">{state.total}</span> orders
          </p>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {buildPageRange(page, totalPages).map((entry, index) =>
              entry === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <span className="px-2 text-xs text-muted-foreground">…</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <PaginationLink
                    isActive={entry === page}
                    onClick={() => handlePageChange(entry)}
                    className="cursor-pointer"
                  >
                    {entry}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}

// --- Row --------------------------------------------------------------------
function OrderRow({ order, onSelect }: { order: Order; onSelect: () => void }) {
  const payment = PAYMENT_STATUS_META[order.paymentStatus]

  return (
    <TableRow
      onClick={onSelect}
      tabIndex={0}
      role="link"
      aria-label={`View order ${shortOrderId(order._id)}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className="cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none"
    >
      <TableCell className="pl-4 font-mono font-medium tabular-nums">
        {shortOrderId(order._id)}
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground">{customerLabel(order)}</span>
          <span className="truncate text-xs text-muted-foreground lg:hidden">
            {formatOrderDate(order.createdAt)}
          </span>
        </div>
      </TableCell>
      <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">
        {itemCount(order)}
      </TableCell>
      <TableCell className="text-right font-mono font-medium tabular-nums">
        {formatPrice(order.orderTotal, order.orderCurrency)}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline" style={{ color: payment.tone }}>
          {payment.label}
        </Badge>
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={order.orderStatus} />
      </TableCell>
      <TableCell className="hidden pr-4 text-right text-xs text-muted-foreground lg:table-cell">
        {formatOrderDate(order.createdAt)}
      </TableCell>
    </TableRow>
  )
}

function OrderRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-transparent">
          <TableCell className="pl-4">
            <Skeleton className="h-3 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-3 w-28" />
          </TableCell>
          <TableCell className="hidden text-right sm:table-cell">
            <Skeleton className="ml-auto h-3 w-6" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-3 w-16" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell className="hidden pr-4 text-right lg:table-cell">
            <Skeleton className="ml-auto h-3 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/** Compact page-number range with ellipses around the current page. */
function buildPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('ellipsis')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < total - 1) pages.push('ellipsis')
  pages.push(total)
  return pages
}
