'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  Logout01Icon,
  PackageIcon,
  ShoppingCart01Icon,
  Store01Icon,
} from '@hugeicons/core-free-icons'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth'

type IconSvg = typeof DashboardSquare01Icon

interface NavItem {
  label: string
  href: string
  icon: IconSvg
  /** Exact match avoids `/admin` staying active on `/admin/orders`. */
  exact: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: DashboardSquare01Icon, exact: true },
  { label: 'Products', href: '/admin/products', icon: PackageIcon, exact: false },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart01Icon, exact: false },
]

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 px-1 py-1.5 transition-opacity hover:opacity-80"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Store01Icon} size={18} strokeWidth={2} />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-heading text-sm font-semibold">Shopy</span>
            <span className="truncate text-[11px] text-muted-foreground">Admin console</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(pathname, item)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href} aria-current={active ? 'page' : undefined}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <span className="inline-flex size-8 shrink-0 items-center justify-center bg-secondary text-xs font-semibold text-secondary-foreground">
              {user.userName.charAt(0).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <p className="truncate text-xs font-medium">{user.userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.userEmail}</p>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to store">
              <Link href="/">
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
                <span>Back to store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
