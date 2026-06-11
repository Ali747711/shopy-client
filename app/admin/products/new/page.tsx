'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

import { ProductForm } from '@/components/admin/product-form'
import { Button } from '@/components/ui/button'
import { createProduct } from '@/lib/admin'
import { isApiError } from '@/lib/api'
import type { ProductFormValues } from '@/lib/admin'

export default function NewProductPage() {
  const router = useRouter()

  const handleSubmit = useCallback(
    async (values: ProductFormValues) => {
      try {
        const product = await createProduct(values)
        toast.success(`“${product.productName}” was created.`)
        router.push('/admin/products')
      } catch (error) {
        toast.error(
          isApiError(error) ? error.message : 'Failed to create the product. Please try again.',
        )
      }
    },
    [router],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="w-fit text-muted-foreground">
          <Link href="/admin/products">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
            Back to products
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold tracking-tight">New product</h2>
          <p className="text-xs text-muted-foreground">
            Add a new product to your catalogue.
          </p>
        </div>
      </div>

      <div className="max-w-2xl border border-border bg-card p-5">
        <ProductForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
