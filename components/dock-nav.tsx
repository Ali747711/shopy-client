'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, Info, Search, ShoppingBag, ShoppingCart, User, type LucideIcon } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import { SettingsMenu } from '@/components/settings-menu'
import { useCart } from '@/lib/cart'
import { cn } from '@/lib/utils'

interface DockItem {
  icon: LucideIcon
  label: string
  href: string
  badgeKey?: 'cart'
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DockNav() {
  const pathname = usePathname()
  const { count, hydrated } = useCart()
  const { t } = useTranslation()

  // The admin area has its own sidebar shell — hide the storefront dock there.
  if (pathname.startsWith('/admin')) return null

  // Primary / secondary split drives the desktop dock (with a divider between
  // the two groups). On mobile they're concatenated into one bottom tab bar.
  const PRIMARY_ITEMS: DockItem[] = [
    { icon: Home, label: t('nav.home'), href: '/' },
    { icon: ShoppingBag, label: t('nav.shop'), href: '/products' },
    { icon: Search, label: t('nav.aiSearch'), href: '/search' },
    { icon: Info, label: t('nav.about'), href: '/about' },
  ]

  const SECONDARY_ITEMS: DockItem[] = [
    { icon: Heart, label: t('nav.wishlist'), href: '/wishlist' },
    { icon: ShoppingCart, label: t('nav.cart'), href: '/cart', badgeKey: 'cart' },
    { icon: User, label: t('nav.account'), href: '/account' },
  ]

  const ALL_ITEMS = [...PRIMARY_ITEMS, ...SECONDARY_ITEMS]
  const cartBadge = hydrated && count > 0 ? count : undefined

  /** Desktop dock tile — icon in a rounded glass tile with a hover tooltip. */
  const renderTile = (item: DockItem) => {
    const active = isActive(pathname, item.href)
    const badge = item.badgeKey === 'cart' ? cartBadge : undefined

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

  /** Mobile bottom-tab item — icon + persistent label, evenly spaced. */
  const renderTab = (item: DockItem) => {
    const active = isActive(pathname, item.href)
    const badge = item.badgeKey === 'cart' ? cartBadge : undefined

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
      >
        <span
          className={cn(
            'relative grid size-8 place-items-center rounded-lg transition-colors',
            active ? 'bg-primary/15 text-primary' : 'text-white/65 group-active:text-white',
          )}
        >
          <item.icon strokeWidth={2.1} className="size-5" />
          {badge !== undefined && (
            <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground ring-1 ring-neutral-900">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </span>
        <span
          className={cn(
            'max-w-full truncate text-[9px] leading-none tracking-wide',
            active ? 'text-primary' : 'text-white/55',
          )}
        >
          {item.label}
        </span>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop / tablet: floating top dock with everything */}
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center px-4 sm:flex"
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-[40px] bg-neutral-900/80 px-5 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg sm:gap-4">
          {PRIMARY_ITEMS.map(renderTile)}
          <span className="mx-1 h-7 w-px bg-white/10" aria-hidden />
          {SECONDARY_ITEMS.map(renderTile)}
        </div>
      </nav>

      {/* Language + currency settings — top-right corner on all screens */}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex justify-end">
        <SettingsMenu className="pointer-events-auto size-10 rounded-full bg-neutral-900/80 shadow-lg backdrop-blur-lg" />
      </div>

      {/* Mobile: bottom tab bar with the full nav */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-900/90 backdrop-blur-lg sm:hidden"
      >
        <div className="flex h-14 items-stretch justify-around gap-0.5 px-1.5">
          {ALL_ITEMS.map(renderTab)}
        </div>
        {/* iOS safe-area inset so the bar clears the home indicator */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} aria-hidden />
      </nav>
    </>
  )
}
