'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { buttonVariants } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export function CartButton() {
  const { items, count, subtotal, currency, hydrated } = useCart()
  const isEmpty = !hydrated || items.length === 0

  return (
    <HoverCard openDelay={80} closeDelay={120}>
      <HoverCardTrigger asChild>
        <Link
          href="/cart"
          aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
          className="relative inline-flex size-8 items-center justify-center text-foreground transition-colors hover:bg-muted"
        >
          <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} className="size-4.5" />
          {hydrated && count > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
      </HoverCardTrigger>

      <HoverCardContent align="end" className="w-80 p-0">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 p-5 text-center">
            <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={1.5} className="size-7 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Your cart is empty.</p>
            <Link href="/products" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Browse products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="border-b border-border px-3 py-2">
              <p className="font-heading text-xs font-semibold">
                Cart · {count} item{count === 1 ? '' : 's'}
              </p>
            </div>
            <ul className="max-h-64 divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 px-3 py-2">
                  <span className="flex size-10 shrink-0 items-center justify-center bg-muted">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="size-full object-cover" />
                    ) : (
                      <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-4 text-muted-foreground/40" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{item.productName}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {item.qty} × {formatPrice(item.price, item.currency)}
                    </span>
                  </span>
                  <span className="text-xs font-medium">
                    {formatPrice(item.price * item.qty, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="font-heading text-sm font-semibold">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-2">
              <Link href="/cart" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                View cart
              </Link>
              <Link href="/checkout" className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}>
                Checkout
              </Link>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
