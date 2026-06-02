'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Info, Search, ShoppingBag, ShoppingCart, User, type LucideIcon } from 'lucide-react'

import { useCart } from '@/lib/cart'
import { cn } from '@/lib/utils'

interface DockItem {
  icon: LucideIcon
  label: string
  href: string
  badgeKey?: 'cart'
}

const PRIMARY_ITEMS: DockItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: ShoppingBag, label: 'Shop', href: '/products' },
  { icon: Search, label: 'AI Search', href: '/search' },
  { icon: Info, label: 'About', href: '/about' },
]

const SECONDARY_ITEMS: DockItem[] = [
  { icon: ShoppingCart, label: 'Cart', href: '/cart', badgeKey: 'cart' },
  { icon: User, label: 'Account', href: '/account' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DockNav() {
  const pathname = usePathname()
  const { count, hydrated } = useCart()

  const renderItem = (item: DockItem) => {
    const active = isActive(pathname, item.href)
    const badge = item.badgeKey === 'cart' && hydrated && count > 0 ? count : undefined

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'hover-halo group relative grid size-12 place-items-center rounded-xl bg-linear-to-b from-neutral-800/60 to-neutral-900/70 shadow-lg ring-1 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 hover:scale-105 sm:size-14',
          active ? 'ring-primary/70' : 'ring-white/10',
        )}
      >
        <item.icon
          strokeWidth={2.1}
          className={cn(
            'size-5 transition-transform duration-200 group-hover:scale-110',
            active ? 'text-primary' : 'text-white/85',
          )}
        />

        {active && (
          <span className="absolute -bottom-1 size-1 rounded-full bg-primary" aria-hidden />
        )}

        {badge !== undefined && (
          <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-1 ring-neutral-900">
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        <span className="dock-tooltip pointer-events-none absolute -bottom-6 text-[9px] tracking-wide text-white/70 sm:text-[10px]">
          {item.label}
        </span>
      </Link>
    )
  }

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex scale-90 items-center gap-3 rounded-[28px] bg-neutral-900/80 px-3 py-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg sm:scale-100 sm:gap-4 sm:rounded-[40px] sm:px-5 sm:py-3">
        {PRIMARY_ITEMS.map(renderItem)}
        <span className="mx-1 h-7 w-px bg-white/10" aria-hidden />
        {SECONDARY_ITEMS.map(renderItem)}
      </div>
    </nav>
  )
}
