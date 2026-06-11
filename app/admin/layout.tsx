'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Store01Icon } from '@hugeicons/core-free-icons'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

// Maps the active route to a human title shown in the shell header. Kept in the
// layout (not the page) so it stays correct as nested admin pages are added.
const PAGE_TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === '/admin', title: 'Dashboard' },
  { match: (p) => p.startsWith('/admin/products'), title: 'Products' },
  { match: (p) => p.startsWith('/admin/orders'), title: 'Orders' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = status === 'authenticated' && user?.userRole === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    // Authenticated but not an admin — bounce to the storefront home.
    if (status === 'authenticated' && user?.userRole !== 'ADMIN') {
      router.replace('/')
    }
  }, [status, user, pathname, router])

  const pageTitle = useMemo(
    () => PAGE_TITLES.find((entry) => entry.match(pathname))?.title ?? 'Admin',
    [pathname],
  )

  // While loading, or before the admin check resolves (and during the redirect
  // tick for non-admins), show a centered spinner rather than flashing content.
  if (!isAdmin) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4">
        <Spinner className="size-6 text-muted-foreground" />
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4! self-center" />
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Admin
            </span>
            <span className="text-muted-foreground/50">/</span>
            <h1 className="truncate font-heading text-sm font-semibold">{pageTitle}</h1>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'ml-auto')}
          >
            <HugeiconsIcon icon={Store01Icon} data-icon="inline-start" />
            <span className="hidden sm:inline">Back to store</span>
            <span className="sm:hidden">Store</span>
          </Link>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
