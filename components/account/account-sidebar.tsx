'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { DashboardSquare01Icon, Location01Icon, PackageIcon, Settings02Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Overview', href: '/account', icon: DashboardSquare01Icon, exact: true },
  { label: 'Orders', href: '/account/orders', icon: PackageIcon, exact: false },
  { label: 'Addresses', href: '/account/addresses', icon: Location01Icon, exact: false },
  { label: 'Settings', href: '/account/settings', icon: Settings02Icon, exact: false },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="lg:sticky lg:top-20 lg:h-fit">
      {user && (
        <div className="mb-4 flex items-center gap-3 border border-border bg-card p-3 ring-1 ring-foreground/5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
            {user.userName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{user.userName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.userEmail}</p>
          </div>
        </div>
      )}

      <nav className="flex gap-1 lg:flex-col">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 items-center gap-2 border border-transparent px-3 py-2 text-xs transition-colors lg:flex-none',
                active
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
