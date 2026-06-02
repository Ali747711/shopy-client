'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CreditCardIcon, DeliveryTruck01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button, buttonVariants } from '@/components/ui/button'
import { isApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { createOrder, type PaymentMethod } from '@/lib/orders'
import { createCheckoutSession, getPaymentConfig } from '@/lib/payments/api'
import { cn } from '@/lib/utils'

export default function CheckoutPage() {
  const { status } = useAuth()
  const { items, count, subtotal, currency, hydrated, clear } = useCart()
  const router = useRouter()

  const [method, setMethod] = useState<PaymentMethod>('COD')
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?redirect=/checkout')
  }, [status, router])

  useEffect(() => {
    let active = true
    getPaymentConfig()
      .then((config) => {
        if (active) setStripeEnabled(config.enabled)
      })
      .catch(() => {
        /* leave Stripe disabled if the config call fails */
      })
    return () => {
      active = false
    }
  }, [])

  if (status === 'loading' || !hydrated) {
    return <main className="mx-auto w-full max-w-5xl px-4 py-24 text-center text-xs text-muted-foreground">Loading…</main>
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-xs text-muted-foreground">Add something before checking out.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: 'default' }), 'mt-6')}>
          Browse products
        </Link>
      </main>
    )
  }

  const placeOrder = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        currency,
        paymentMethod: method,
      })

      if (method === 'STRIPE') {
        const { url } = await createCheckoutSession(order._id)
        if (!url) throw new Error('Could not start the payment session.')
        window.location.href = url // cart is cleared on the success page
        return
      }

      clear()
      router.push(`/checkout/success?order=${order._id}`)
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        router.replace('/login?redirect=/checkout')
        return
      }
      setError(isApiError(err) ? err.message : 'We couldn’t place your order. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="font-heading text-sm font-semibold">Payment method</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PaymentOption
              active={method === 'COD'}
              icon={DeliveryTruck01Icon}
              title="Cash on delivery"
              desc="Pay when your order arrives."
              onSelect={() => setMethod('COD')}
            />
            <PaymentOption
              active={method === 'STRIPE'}
              icon={CreditCardIcon}
              title="Card"
              desc={stripeEnabled ? 'Pay securely via Stripe.' : 'Currently unavailable.'}
              disabled={!stripeEnabled}
              onSelect={() => setMethod('STRIPE')}
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </section>

        <aside className="h-fit border border-border bg-card p-5 ring-1 ring-foreground/5">
          <h2 className="font-heading text-sm font-semibold">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-start justify-between gap-3 text-xs">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.productName}</span>
                  <span className="text-muted-foreground">Qty {item.qty}</span>
                </span>
                <span className="shrink-0">{formatPrice(item.price * item.qty, item.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-medium">Total ({count} item{count === 1 ? '' : 's'})</span>
            <span className="font-heading text-lg font-semibold">{formatPrice(subtotal, currency)}</span>
          </div>
          <Button size="lg" className="mt-5 w-full" disabled={submitting} onClick={placeOrder}>
            {submitting ? 'Placing order…' : method === 'STRIPE' ? 'Pay with card' : 'Place order'}
          </Button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </main>
  )
}

function PaymentOption({
  active,
  icon,
  title,
  desc,
  disabled,
  onSelect,
}: {
  active: boolean
  icon: typeof CreditCardIcon
  title: string
  desc: string
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        'flex items-start gap-3 border bg-card p-4 text-left transition-colors disabled:opacity-50',
        active ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-foreground/25',
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-foreground" />
      <span className="flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {title}
          {active && <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3.5 text-primary" />}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  )
}
