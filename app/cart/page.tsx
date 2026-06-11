'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Image01Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { QuantityStepper } from '@/components/cart/quantity-stepper'
import { buttonVariants } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const { items, count, subtotal, currency, hydrated, updateQty, removeItem, clear } = useCart()

  if (hydrated && items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 py-24 pb-24 text-center">
        <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={1.5} className="size-10 text-muted-foreground" />
        <h1 className="font-heading mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a few things and they&apos;ll show up here.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: 'default' }), 'mt-6')}>
          Browse products
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-24 pb-24 sm:pb-12">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Your cart</h1>
        {hydrated && items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            Clear cart
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ul className="border-t border-border">
          {(hydrated ? items : []).map((item) => (
            <li key={item.productId} className="flex gap-4 border-b border-border py-4">
              <Link
                href={`/products/${item.productId}`}
                className="flex size-20 shrink-0 items-center justify-center bg-muted ring-1 ring-foreground/10"
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.productName} className="size-full object-cover" />
                ) : (
                  <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-6 text-muted-foreground/40" />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-heading line-clamp-2 text-sm font-medium hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remove ${item.productName}`}
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{formatPrice(item.price, item.currency)} each</p>
                <div className="mt-auto flex items-center justify-between">
                  <QuantityStepper
                    value={item.qty}
                    max={item.stock}
                    onChange={(next) => updateQty(item.productId, next)}
                  />
                  <span className="font-heading text-sm font-semibold">
                    {formatPrice(item.price * item.qty, item.currency)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-border bg-card p-5 ring-1 ring-foreground/5 lg:sticky lg:top-20">
          <h2 className="font-heading text-sm font-semibold">Order summary</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal ({count} item{count === 1 ? '' : 's'})</dt>
              <dd>{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium">Total</span>
            <span className="font-heading text-lg font-semibold">{formatPrice(subtotal, currency)}</span>
          </div>
          <Link href="/checkout" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'mt-5 w-full')}>
            Proceed to checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  )
}
