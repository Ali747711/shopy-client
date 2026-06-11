'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, ArrowLeft01Icon, PackageSearchIcon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

import { ProductForm } from '@/components/admin/product-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { updateProduct } from '@/lib/admin'
import type { ProductFormValues } from '@/lib/admin'
import { isApiError } from '@/lib/api'
import { getProduct, type Product } from '@/lib/products'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'not-found' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; product: Product }

/** Map a loaded product onto the form's initial values (USD base price). */
function toFormValues(product: Product): Partial<ProductFormValues> {
  return {
    productName: product.productName,
    productDescription: product.productDescription,
    productCategory: product.productCategory,
    productTags: product.productTags,
    productPrice: product.productPrice,
    productStock: product.productStock,
    productImages: product.productImages.map((image) => ({
      url: image.url,
      ...(image.alt ? { alt: image.alt } : {}),
    })),
    productStatus: product.productStatus,
  }
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16: route params are a promise — unwrap with React.use().
  const { id } = use(params)
  const router = useRouter()
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  useEffect(() => {
    let active = true

    void getProduct(id)
      .then((product) => {
        if (active) setState({ phase: 'ready', product })
      })
      .catch((error: unknown) => {
        if (!active) return
        if (isApiError(error) && error.status === 404) {
          setState({ phase: 'not-found' })
          return
        }
        const message = isApiError(error)
          ? error.message
          : 'Unable to load this product. Please try again.'
        setState({ phase: 'error', message })
      })

    return () => {
      active = false
    }
  }, [id])

  const handleSubmit = useCallback(
    async (values: ProductFormValues) => {
      try {
        const product = await updateProduct(id, values)
        toast.success(`“${product.productName}” was updated.`)
        router.push('/admin/products')
      } catch (error) {
        toast.error(
          isApiError(error) ? error.message : 'Failed to update the product. Please try again.',
        )
      }
    },
    [id, router],
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
          <h2 className="font-heading text-xl font-semibold tracking-tight">Edit product</h2>
          <p className="text-xs text-muted-foreground">
            {state.phase === 'ready'
              ? state.product.productName
              : 'Update the details of an existing product.'}
          </p>
        </div>
      </div>

      {state.phase === 'loading' ? (
        <EditFormSkeleton />
      ) : state.phase === 'not-found' ? (
        <div className="max-w-2xl border border-dashed border-border bg-card">
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={PackageSearchIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Product not found</EmptyTitle>
              <EmptyDescription>
                This product may have been removed or the link is incorrect.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm">
                <Link href="/admin/products">Back to products</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : state.phase === 'error' ? (
        <Alert variant="destructive" className="max-w-2xl">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Couldn&apos;t load the product</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : (
        <div className="max-w-2xl border border-border bg-card p-5">
          <ProductForm
            mode="edit"
            initialValues={toFormValues(state.product)}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  )
}

function EditFormSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-5 border border-border bg-card p-5">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  )
}
