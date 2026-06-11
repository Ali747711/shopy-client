'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  ArrowLeft01Icon,
  CreditCardIcon,
  InvoiceIcon,
  Location01Icon,
  TelephoneIcon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

import {
  OrderStatusBadge,
  getOrderStatusMeta,
} from '@/components/admin/order-status-badge'
import {
  PAYMENT_STATUS_META,
  formatOrderDateTime,
  shortOrderId,
} from '@/components/admin/order-presentation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateOrderStatus } from '@/lib/admin'
import { isApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import {
  ORDER_STATUSES,
  getOrder,
  type Order,
  type OrderStatus,
} from '@/lib/orders'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'not-found' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; order: Order }

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Next.js 16: route params are a promise — unwrap with React.use().
  const { id } = use(params)
  const [state, setState] = useState<LoadState>({ phase: 'loading' })
  const [refreshToken, setRefreshToken] = useState(0)
  const [updating, setUpdating] = useState(false)
  // Holds a pending CANCELLED transition awaiting confirmation.
  const [pendingCancel, setPendingCancel] = useState(false)

  useEffect(() => {
    let active = true

    void getOrder(id)
      .then((order) => {
        if (active) setState({ phase: 'ready', order })
      })
      .catch((error: unknown) => {
        if (!active) return
        if (isApiError(error) && error.status === 404) {
          setState({ phase: 'not-found' })
          return
        }
        const message = isApiError(error)
          ? error.message
          : 'Unable to load this order. Please try again.'
        setState({ phase: 'error', message })
      })

    return () => {
      active = false
    }
  }, [id, refreshToken])

  const applyStatus = useCallback(
    async (next: OrderStatus) => {
      if (state.phase !== 'ready') return
      const previous = state.order
      if (previous.orderStatus === next) return

      // Optimistic update — revert on failure.
      setState({ phase: 'ready', order: { ...previous, orderStatus: next } })
      setUpdating(true)
      try {
        const updated = await updateOrderStatus(previous._id, next)
        setState({ phase: 'ready', order: updated })
        toast.success(`Order marked as ${STATUS_LABELS[next].toLowerCase()}.`)
      } catch (error) {
        setState({ phase: 'ready', order: previous })
        toast.error(
          isApiError(error)
            ? error.message
            : 'Failed to update the order status. Please try again.',
        )
      } finally {
        setUpdating(false)
      }
    },
    [state],
  )

  const handleStatusSelect = useCallback(
    (value: string) => {
      const next = value as OrderStatus
      if (next === 'CANCELLED') {
        setPendingCancel(true)
        return
      }
      void applyStatus(next)
    },
    [applyStatus],
  )

  return (
    <div className="flex flex-col gap-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
      >
        <Link href="/admin/orders">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
          Back to orders
        </Link>
      </Button>

      {state.phase === 'loading' ? (
        <OrderDetailSkeleton />
      ) : state.phase === 'not-found' ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={InvoiceIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Order not found</EmptyTitle>
            <EmptyDescription>
              This order doesn&apos;t exist or may have been removed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link href="/admin/orders">Back to orders</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : state.phase === 'error' ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Couldn&apos;t load order</AlertTitle>
          <AlertDescription>
            <p>{state.message}</p>
            <button
              type="button"
              onClick={() => {
                setState({ phase: 'loading' })
                setRefreshToken((token) => token + 1)
              }}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <OrderDetail
          order={state.order}
          updating={updating}
          onStatusSelect={handleStatusSelect}
        />
      )}

      {/* Cancel confirmation */}
      <AlertDialog
        open={pendingCancel}
        onOpenChange={(open) => {
          if (!open && !updating) setPendingCancel(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="text-destructive">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Marking the order as cancelled will halt its fulfilment. This can&apos;t be
              automatically undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Keep order</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={updating}
              onClick={(event) => {
                event.preventDefault()
                setPendingCancel(false)
                void applyStatus('CANCELLED')
              }}
            >
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// --- Detail -----------------------------------------------------------------
function OrderDetail({
  order,
  updating,
  onStatusSelect,
}: {
  order: Order
  updating: boolean
  onStatusSelect: (value: string) => void
}) {
  const payment = PAYMENT_STATUS_META[order.paymentStatus]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-xl font-semibold tracking-tight tabular-nums">
              {shortOrderId(order._id)}
            </h2>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
          <p className="text-xs text-muted-foreground">
            Placed {formatOrderDateTime(order.createdAt)}
          </p>
        </div>

        {/* Status updater */}
        <div className="flex items-center gap-2">
          {updating ? <Spinner aria-label="Updating status" /> : null}
          <Select
            value={order.orderStatus}
            onValueChange={onStatusSelect}
            disabled={updating}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label="Update order status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((value) => {
                const meta = getOrderStatusMeta(value)
                return (
                  <SelectItem key={value} value={value}>
                    <span
                      style={
                        meta.variant === 'destructive' ? undefined : { color: meta.tone }
                      }
                    >
                      {STATUS_LABELS[value]}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Two-column layout: line items + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={InvoiceIcon} size={18} strokeWidth={2} />
              Line items
            </CardTitle>
            <CardDescription>
              {order.orderItems.length} product{order.orderItems.length === 1 ? '' : 's'} in this
              order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="pr-4 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.productId} className="hover:bg-transparent">
                      <TableCell className="pl-4 font-medium text-foreground">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatPrice(item.priceAtPurchase, order.orderCurrency)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {item.qty}
                      </TableCell>
                      <TableCell className="pr-4 text-right font-mono font-medium tabular-nums">
                        {formatPrice(item.priceAtPurchase * item.qty, order.orderCurrency)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="pl-4 font-medium text-foreground">
                      Order total
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono text-base font-semibold tabular-nums">
                      {formatPrice(order.orderTotal, order.orderCurrency)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={CreditCardIcon} size={18} strokeWidth={2} />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" style={{ color: payment.tone }}>
                  {payment.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Shipping address */}
          {order.shippingAddress ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={2} />
                  Shipping address
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="font-medium text-foreground">
                  {order.shippingAddress.fullName}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={TelephoneIcon} size={14} strokeWidth={2} />
                  {order.shippingAddress.phone}
                </p>
                <address className="text-muted-foreground not-italic">
                  {order.shippingAddress.address1}
                  {order.shippingAddress.address2 ? (
                    <>
                      <br />
                      {order.shippingAddress.address2}
                    </>
                  ) : null}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-full sm:w-48" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-44" />
        </div>
      </div>
    </div>
  )
}
