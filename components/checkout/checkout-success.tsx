'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { isApiError } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { getOrder, type Order } from '@/lib/orders'
import { cn } from '@/lib/utils'

export function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const { clear } = useCart()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    let active = true
    ;(async () => {
      try {
        const result = await getOrder(orderId)
        if (!active) return
        setOrder(result)
        clear() // order is placed — empty the cart
      } catch (err) {
        if (active) setError(isApiError(err) ? err.message : 'Could not load your order.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [orderId, clear])

  if (!orderId) {
    return <Centered title="No order found" body="We couldn’t find an order reference." error />
  }
  if (loading) {
    return <Centered title="Finalizing your order…" body="One moment." />
  }
  if (error || !order) {
    return <Centered title="Couldn’t load your order" body={error ?? 'Please check your orders later.'} error />
  }

  const paid = order.paymentStatus === 'PAID'
  const isStripe = order.paymentMethod === 'STRIPE'
  const note = paid
    ? 'Payment received. Thank you!'
    : isStripe
      ? 'We’re confirming your payment — this updates once Stripe confirms.'
      : `Pay ${formatPrice(order.orderTotal, order.orderCurrency)} on delivery.`

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-16 pb-24 sm:py-24 sm:pb-24">
      <div className="flex flex-col items-center text-center">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-12 text-primary" />
        <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight">Order placed</h1>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </div>

      <div className="mt-8 border border-border bg-card p-5 ring-1 ring-foreground/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Order</span>
          <span className="font-mono text-xs">#{order._id.slice(-8)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Payment</span>
          <Badge variant={paid ? 'secondary' : 'outline'}>
            {order.paymentMethod} · {order.paymentStatus}
          </Badge>
        </div>

        <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          {order.orderItems.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate">
                {item.productName} <span className="text-muted-foreground">× {item.qty}</span>
              </span>
              <span className="shrink-0">
                {formatPrice(item.priceAtPurchase * item.qty, order.orderCurrency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs font-medium">Total</span>
          <span className="font-heading text-base font-semibold">
            {formatPrice(order.orderTotal, order.orderCurrency)}
          </span>
        </div>
      </div>

      <Link href="/products" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'mt-6 w-full')}>
        Continue shopping
      </Link>
    </main>
  )
}

function Centered({ title, body, error }: { title: string; body: string; error?: boolean }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-24 pb-24 text-center">
      {error && <HugeiconsIcon icon={Alert01Icon} strokeWidth={1.5} className="size-9 text-muted-foreground" />}
      <h1 className="font-heading mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      <Link href="/products" className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}>
        Browse products
      </Link>
    </main>
  )
}
