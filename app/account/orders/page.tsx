'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, PackageIcon } from '@hugeicons/core-free-icons'

import { OrderCard } from '@/components/account/order-card'
import { buttonVariants } from '@/components/ui/button'
import { isApiError } from '@/lib/api'
import { getMyOrders, type Order } from '@/lib/orders'
import { cn } from '@/lib/utils'

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getMyOrders()
      .then((result) => {
        if (active) setOrders(result)
      })
      .catch((err) => {
        if (active) {
          setError(isApiError(err) ? err.message : 'Could not load your orders.')
          setOrders([])
        }
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-xs text-muted-foreground">Your order history and statuses.</p>
      </header>

      {orders === null ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : error ? (
        <State icon={Alert01Icon} title="Couldn't load orders" body={error} />
      ) : orders.length === 0 ? (
        <State icon={PackageIcon} title="No orders yet" body="When you place an order it will appear here.">
          <Link href="/products" className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'mt-4')}>
            Start shopping
          </Link>
        </State>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function State({
  icon,
  title,
  body,
  children,
}: {
  icon: typeof PackageIcon
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-border py-16 text-center">
      <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
      <p className="font-heading text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{body}</p>
      {children}
    </div>
  )
}
