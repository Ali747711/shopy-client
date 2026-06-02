import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, ArrowLeft01Icon, Image01Icon, StarIcon } from '@hugeicons/core-free-icons'

import { AddToCart } from '@/components/products/add-to-cart'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { isApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { getProduct, type Product } from '@/lib/products'

// Deduped so generateMetadata + the page share one request (React cache is
// request-scoped).
const loadProduct = cache((id: string) => getProduct(id))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const product = await loadProduct(id)
    return {
      title: `${product.productName} — Shopy`,
      description: product.productDescription.slice(0, 160),
    }
  } catch {
    return { title: 'Product — Shopy' }
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let product: Product | null = null
  let errorMessage: string | null = null
  try {
    product = await loadProduct(id)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    errorMessage = isApiError(error) ? error.message : 'Failed to load this product.'
  }

  if (errorMessage) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        <BackLink />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
          <HugeiconsIcon icon={Alert01Icon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
          <div>
            <p className="font-heading text-sm font-medium">Couldn&apos;t load this product</p>
            <p className="mt-1 text-xs text-muted-foreground">{errorMessage}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!product) notFound()

  const image = product.productImages[0]
  const price = product.convertedPrice ?? product.productPrice
  const currency = product.currency ?? product.productCurrency
  const outOfStock = product.productStock <= 0
  const attributes = Object.entries(product.productAttributes ?? {})

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <BackLink />

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden bg-muted ring-1 ring-foreground/10">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt ?? product.productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-12 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit capitalize">
            {product.productCategory}
          </Badge>

          <h1 className="font-heading mt-3 text-2xl font-semibold tracking-tight">
            {product.productName}
          </h1>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-4 text-primary" />
            {product.productRatingCount > 0 ? (
              <span>
                <span className="text-foreground">{product.productRatingAvg.toFixed(1)}</span> ·{' '}
                {product.productRatingCount}{' '}
                {product.productRatingCount === 1 ? 'review' : 'reviews'}
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-heading text-3xl font-semibold">{formatPrice(price, currency)}</span>
            <Badge variant={outOfStock ? 'destructive' : 'secondary'}>
              {outOfStock ? 'Out of stock' : `${product.productStock} in stock`}
            </Badge>
          </div>

          <Separator className="my-6" />

          <p className="text-xs/relaxed text-muted-foreground">{product.productDescription}</p>

          {product.productTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {product.productTags.map((tag) => (
                <Badge key={tag} variant="ghost" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {attributes.length > 0 && (
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
              {attributes.map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-muted-foreground capitalize">{key}</dt>
                  <dd className="text-foreground">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <AddToCart
              product={{
                productId: product._id,
                productName: product.productName,
                price,
                currency,
                image: image?.url,
                stock: product.productStock,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function BackLink() {
  return (
    <Link
      href="/products"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
      Back to products
    </Link>
  )
}
