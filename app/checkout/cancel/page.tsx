import type { Metadata } from 'next'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Payment cancelled — Shopy' }

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-24 text-center">
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="size-10 text-muted-foreground" />
      <h1 className="font-heading mt-4 text-xl font-semibold">Payment cancelled</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Your order wasn&apos;t completed and your cart is still saved.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/cart" className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to cart
        </Link>
        <Link href="/checkout" className={cn(buttonVariants({ variant: 'default' }))}>
          Try again
        </Link>
      </div>
    </main>
  )
}
