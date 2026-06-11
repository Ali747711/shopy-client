import { cache, Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, ArrowLeft01Icon, StarIcon } from '@hugeicons/core-free-icons'

import { ProductCard } from '@/components/products/product-card'
import { ProductDetailClient } from '@/components/products/product-detail-client'
import { ProductImageGallery } from '@/components/products/product-image-gallery'
import { RecentlyViewed } from '@/components/products/recently-viewed'
import { CurrencySync } from '@/components/products/currency-sync'
import { ProductReviews } from '@/components/reviews/product-reviews'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { isApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { getProduct, getProducts, getSimilarProducts, type Product } from '@/lib/products'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

// Deduped so generateMetadata + the page share one request (React cache is
// request-scoped). Keyed by both id and currency so a currency change busts
// the cache.
const loadProduct = cache((id: string, currency?: string) => getProduct(id, currency))

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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const { id } = await params
  const sp = await searchParams
  const currencyParam = Array.isArray(sp.currency) ? sp.currency[0] : sp.currency

  let product: Product | null = null
  let errorMessage: string | null = null
  try {
    product = await loadProduct(id, currencyParam)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    errorMessage = isApiError(error) ? error.message : 'Failed to load this product.'
  }

  if (errorMessage) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 pt-24 pb-24 sm:pb-12">
        <BackLink />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
          <HugeiconsIcon icon={Alert01Icon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
          <div>
            <p className="font-heading text-sm font-medium">Couldn&apos;t load this product</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!product) notFound()

  const price = product.convertedPrice ?? product.productPrice
  const currency = product.currency ?? product.productCurrency
  const outOfStock = product.productStock <= 0
  const attributes = Object.entries(product.productAttributes ?? {})

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-24 pb-8 sm:pb-12">
      {/* Propagates currency changes from the selector to ?currency= URL param */}
      <Suspense fallback={null}>
        <CurrencySync />
      </Suspense>

      <BackLink />

      <nav aria-label="Breadcrumb" className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span aria-hidden>&gt;</span>
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        <span aria-hidden>&gt;</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.productCategory)}`}
          className="hover:text-foreground transition-colors capitalize"
        >
          {product.productCategory}
        </Link>
        <span aria-hidden>&gt;</span>
        <span className="text-foreground line-clamp-1 max-w-[200px]">{product.productName}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Feature 1: Image gallery with thumbnails, keyboard nav, swipe, lightbox */}
        <ProductImageGallery
          images={product.productImages}
          productName={product.productName}
        />

        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit capitalize">
            {product.productCategory}
          </Badge>

          <h1 className="font-heading mt-3 text-2xl font-semibold tracking-tight">
            {product.productName}
          </h1>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
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

          <p className="text-base/relaxed text-muted-foreground">{product.productDescription}</p>

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
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {attributes.map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-muted-foreground capitalize">{key}</dt>
                  <dd className="text-foreground">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Feature 2 anchor is inside ProductDetailClient. The client shell
              owns both the primary ATC button and the sticky mobile bar. */}
          <div className="mt-8">
            <ProductDetailClient
              product={{
                productId: product._id,
                productName: product.productName,
                price,
                currency,
                image: product.productImages?.[0]?.url,
                stock: product.productStock,
              }}
              price={price}
              currency={currency}
            />
          </div>
        </div>
      </div>

      {/* Similar products */}
      <SimilarProducts currentId={product._id} category={product.productCategory} />

      {/* Feature 5: Recently viewed — below the fold on product detail */}
      <Separator className="my-10" />
      <RecentlyViewed excludeId={product._id} className="mb-10" />

      {/* Reviews */}
      <Separator className="my-10" />
      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="font-heading mb-6 text-xl font-semibold tracking-tight">
          Reviews
        </h2>
        <ProductReviews productId={product._id} />
      </section>
    </main>
  )
}

async function SimilarProducts({ currentId, category }: { currentId: string; category: string }) {
  let similar: Product[] = []
  try {
    // Prefer vector-similarity recommendations; fall back to category filter.
    similar = await getSimilarProducts(currentId, 6)
  } catch {
    try {
      const { data } = await getProducts({ category, limit: 7 })
      similar = data.filter((p) => p._id !== currentId).slice(0, 6)
    } catch {
      return null
    }
  }

  if (similar.length === 0) return null

  return (
    <>
      <Separator className="my-10" />
      <section aria-labelledby="similar-heading">
        <h2 id="similar-heading" className="font-heading mb-6 text-xl font-semibold tracking-tight">
          Similar Products
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {similar.map((product) => (
            <div key={product._id} className="w-52 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function BackLink() {
  return (
    <Link
      href="/products"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
      Back to products
    </Link>
  )
}
