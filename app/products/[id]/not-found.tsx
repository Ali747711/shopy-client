import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { InboxIcon } from '@hugeicons/core-free-icons'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
      <HugeiconsIcon icon={InboxIcon} strokeWidth={1.5} className="size-10 text-muted-foreground" />
      <h1 className="font-heading mt-4 text-xl font-semibold">Product not found</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        This product may have been removed or is no longer available.
      </p>
      <Link href="/products" className={cn(buttonVariants({ variant: 'default' }), 'mt-6')}>
        Browse products
      </Link>
    </main>
  )
}
