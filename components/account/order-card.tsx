import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/format'
import type { Order, OrderStatus } from '@/lib/orders'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: 'outline',
  PAID: 'secondary',
  SHIPPED: 'secondary',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
}

export function OrderCard({ order }: { order: Order }) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null
  const itemCount = order.orderItems.reduce((total, item) => total + item.qty, 0)

  return (
    <article className="border border-border bg-card ring-1 ring-foreground/5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex flex-col">
          <span className="font-mono text-xs">#{order._id.slice(-8)}</span>
          {date && <span className="text-[11px] text-muted-foreground">{date}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={ORDER_STATUS_VARIANT[order.orderStatus]}>{order.orderStatus}</Badge>
          <Badge variant="outline">
            {order.paymentMethod} · {order.paymentStatus}
          </Badge>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {order.orderItems.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
          >
            <span className="min-w-0 truncate">
              {item.productName} <span className="text-muted-foreground">× {item.qty}</span>
            </span>
            <span className="shrink-0">
              {formatPrice(item.priceAtPurchase * item.qty, order.orderCurrency)}
            </span>
          </li>
        ))}
      </ul>

      <footer className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </span>
        <span className="font-heading text-sm font-semibold">
          {formatPrice(order.orderTotal, order.orderCurrency)}
        </span>
      </footer>
    </article>
  )
}
