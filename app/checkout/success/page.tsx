import { Suspense } from 'react'
import type { Metadata } from 'next'

import { CheckoutSuccess } from '@/components/checkout/checkout-success'

export const metadata: Metadata = { title: 'Order placed — Shopy' }

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccess />
    </Suspense>
  )
}
