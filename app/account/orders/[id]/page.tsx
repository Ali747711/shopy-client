'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  CancelCircleIcon,
  CreditCardIcon,
  DeliveryTruck01Icon,
  Location01Icon,
  PackageIcon,
  ShoppingBag01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { isApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { cancelOrder, getOrder, type Order, type OrderStatus } from '@/lib/orders'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Status timeline config                                            */
/* ------------------------------------------------------------------ */

const STATUS_STEPS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'orderStatus.PENDING',
  PAID: 'orderStatus.PAID',
  SHIPPED: 'orderStatus.SHIPPED',
  DELIVERED: 'orderStatus.DELIVERED',
  CANCELLED: 'orderStatus.CANCELLED',
}

const STATUS_ICON: Record<string, typeof PackageIcon> = {
  PENDING: ShoppingBag01Icon,
  PAID: CreditCardIcon,
  SHIPPED: DeliveryTruck01Icon,
  DELIVERED: PackageIcon,
}

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: 'outline',
  PAID: 'secondary',
  SHIPPED: 'secondary',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
}

function getCurrentStepIndex(status: OrderStatus): number {
  return STATUS_STEPS.indexOf(status)
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function OrderDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    getOrder(id)
      .then((result) => {
        if (active) setOrder(result)
      })
      .catch((err) => {
        if (active) {
          setError(isApiError(err) ? err.message : 'Could not load this order.')
        }
      })
    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div className="flex items-center justify-center border border-dashed border-border py-20">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <OrderDetailSkeleton />
      </div>
    )
  }

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const isPending = order.orderStatus === 'PENDING'
  const isCancelled = order.orderStatus === 'CANCELLED'
  const currentStep = getCurrentStepIndex(order.orderStatus)
  const subtotal = order.orderItems.reduce(
    (total, item) => total + item.priceAtPurchase * item.qty,
    0,
  )

  async function handleCancelOrder() {
    if (!order) return
    setCancelling(true)
    try {
      const updated = await cancelOrder(order._id)
      setOrder(updated)
      toast.success('Order cancelled successfully.')
    } catch (err) {
      if (isApiError(err) && err.status === 403) {
        toast.error(
          'Order cancellation is not available for your account. Contact support.',
        )
      } else {
        toast.error(
          isApiError(err) ? err.message : 'Failed to cancel order. Please try again.',
        )
      }
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t('checkout.order')} Details
          </h1>
          <p className="font-mono text-xs text-muted-foreground">#{order._id}</p>
          {date && <p className="text-xs text-muted-foreground">{date}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={ORDER_STATUS_VARIANT[order.orderStatus]}>
            {t(STATUS_LABEL_KEYS[order.orderStatus])}
          </Badge>
          <Badge variant="outline">
            {order.paymentMethod} · {order.paymentStatus}
          </Badge>
          {isPending && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} className="size-3.5" />
                  Cancel order
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Cancel this order?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Your order will be cancelled and items will be
                    restocked.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={cancelling}>
                      Keep order
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    disabled={cancelling}
                    onClick={handleCancelOrder}
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, cancel order'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Status timeline */}
      {!isCancelled ? (
        <section
          aria-label="Order status"
          className="border border-border bg-card p-5 ring-1 ring-foreground/5 sm:p-6"
        >
          <div className="flex items-start">
            {STATUS_STEPS.map((step, index) => {
              const completed = currentStep >= index
              const isCurrent = currentStep === index
              const isLast = index === STATUS_STEPS.length - 1
              const StepIcon = STATUS_ICON[step]

              return (
                <div key={step} className="flex min-w-0 flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {/* Node */}
                    <div
                      className={cn(
                        'relative grid size-10 shrink-0 place-items-center transition-colors sm:size-11',
                        completed
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-muted text-muted-foreground',
                        isCurrent && 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
                      )}
                    >
                      {completed && !isCurrent ? (
                        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-4 sm:size-5" />
                      ) : (
                        <HugeiconsIcon icon={StepIcon} strokeWidth={2} className="size-4 sm:size-5" />
                      )}
                    </div>
                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className={cn(
                          'h-[2px] flex-1 transition-colors',
                          currentStep > index ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={cn(
                      'mt-2.5 max-w-[4.5rem] text-center text-[11px] leading-tight font-medium sm:max-w-none',
                      isCurrent
                        ? 'text-primary'
                        : completed
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                    )}
                  >
                    {t(STATUS_LABEL_KEYS[step])}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-3 border border-destructive/20 bg-destructive/5 px-4 py-4">
          <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={1.5} className="size-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">
              {t(STATUS_LABEL_KEYS.CANCELLED)}
            </p>
            <p className="text-xs text-muted-foreground">This order has been cancelled.</p>
          </div>
        </div>
      )}

      {/* Items */}
      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="font-heading mb-4 text-sm font-semibold tracking-tight">
          Items
        </h2>
        <div className="flex flex-col divide-y divide-border border border-border">
          {order.orderItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.priceAtPurchase, order.orderCurrency)} × {item.qty}
                </p>
              </div>
              <span className="font-heading shrink-0 text-sm font-semibold">
                {formatPrice(item.priceAtPurchase * item.qty, order.orderCurrency)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping address */}
      {order.shippingAddress && (
        <section
          aria-labelledby="ship-heading"
          className="border border-border bg-card p-4 ring-1 ring-foreground/5"
        >
          <h2
            id="ship-heading"
            className="font-heading mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
            {t('checkout.shippingDetails')}
          </h2>
          <address className="text-xs not-italic leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {order.shippingAddress.fullName}
            </span>
            <br />
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}
            <br />
            {[
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.postalCode,
            ]
              .filter(Boolean)
              .join(', ')}
            <br />
            {order.shippingAddress.country}
            {order.shippingAddress.phone && (
              <>
                <br />
                {order.shippingAddress.phone}
              </>
            )}
          </address>
        </section>
      )}

      {/* Summary */}
      <section
        aria-labelledby="summary-heading"
        className="border border-border bg-card p-4 ring-1 ring-foreground/5"
      >
        <h2 id="summary-heading" className="font-heading mb-4 text-sm font-semibold tracking-tight">
          {t('cart.orderSummary')}
        </h2>
        <dl className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('cart.subtotal')}</dt>
            <dd>{formatPrice(subtotal, order.orderCurrency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('cart.shipping')}</dt>
            <dd>Free</dd>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-sm font-medium">
            <dt>{t('cart.total')}</dt>
            <dd className="font-heading font-semibold">
              {formatPrice(order.orderTotal, order.orderCurrency)}
            </dd>
          </div>
          <div className="flex justify-between pt-1">
            <dt className="text-muted-foreground">{t('checkout.paymentMethod')}</dt>
            <dd>{order.paymentMethod}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function BackLink() {
  return (
    <Link
      href="/account/orders"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
      Back to orders
    </Link>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      {/* Timeline skeleton */}
      <Skeleton className="h-24 w-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
