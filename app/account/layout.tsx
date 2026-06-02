'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { AccountSidebar } from '@/components/account/account-sidebar'
import { useAuth } from '@/lib/auth'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [status, pathname, router])

  if (status !== 'authenticated') {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-24 text-center text-xs text-muted-foreground">
        Loading…
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  )
}
