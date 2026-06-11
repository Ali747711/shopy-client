'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PackageIcon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { OrderCard } from '@/components/account/order-card'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { getMyOrders, type Order } from '@/lib/orders'
import { cn } from '@/lib/utils'

export default function AccountOverviewPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    let active = true
    getMyOrders()
      .then((result) => {
        if (active) setOrders(result)
      })
      .catch(() => {
        if (active) setOrders([])
      })
    return () => {
      active = false
    }
  }, [])

  const recent = orders?.slice(0, 3) ?? []

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Hi, {user?.userName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">Manage your orders and account.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Orders" value={orders ? String(orders.length) : '—'} />
        <StatCard label="Email" value={user?.userEmail ?? ''} />
        <StatCard label="Role" value={user?.userRole ?? ''} />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">Recent orders</h2>
          <Link
            href="/account/orders"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {orders === null ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 border border-dashed border-border py-12 text-center">
              <HugeiconsIcon icon={PackageIcon} strokeWidth={1.5} className="size-7 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">You haven&apos;t placed any orders yet.</p>
              <Link href="/products" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Start shopping
              </Link>
            </div>
          ) : (
            recent.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-4 ring-1 ring-foreground/5">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-heading mt-1 truncate text-sm font-semibold">{value || '—'}</p>
    </div>
  )
}
