import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, InboxIcon } from '@hugeicons/core-free-icons'

import { ProductCard } from '@/components/products/product-card'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductsPagination } from '@/components/products/products-pagination'
import { isApiError } from '@/lib/api'
import {
  getCategories,
  getProducts,
  PRODUCT_SORTS,
  type Product,
  type ProductSort,
} from '@/lib/products'

export const metadata: Metadata = { title: 'Products — Shopy' }

const PAGE_SIZE = 12
const FILTER_KEYS = ['category', 'search', 'sort', 'minPrice', 'maxPrice'] as const

type RawSearchParams = Record<string, string | string[] | undefined>

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const toNum = (value: string | undefined): number | undefined => {
  if (value === undefined || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const toSort = (value: string | undefined): ProductSort | undefined =>
  PRODUCT_SORTS.includes(value as ProductSort) ? (value as ProductSort) : undefined

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const sp = await searchParams
  const page = toInt(first(sp.page), 1)
  const filters = {
    page,
    limit: PAGE_SIZE,
    category: first(sp.category),
    search: first(sp.search),
    sort: toSort(first(sp.sort)),
    minPrice: toNum(first(sp.minPrice)),
    maxPrice: toNum(first(sp.maxPrice)),
  }

  // Initiate both requests before awaiting so they run in parallel.
  const productsPromise = getProducts(filters)
  const categoriesPromise = getCategories().catch(() => [] as string[])

  let products: Product[] = []
  let total = 0
  let errorMessage: string | null = null
  try {
    const result = await productsPromise
    products = result.data
    total = result.meta?.total ?? 0
  } catch (error) {
    errorMessage = isApiError(error)
      ? error.message
      : 'Something went wrong loading products.'
  }

  const categories = await categoriesPromise
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const linkParams: Record<string, string> = {}
  for (const key of FILTER_KEYS) {
    const value = first(sp[key])
    if (value) linkParams[key] = value
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {errorMessage
            ? 'Browse the catalog'
            : `${total} ${total === 1 ? 'product' : 'products'} available`}
        </p>
      </header>

      <div className="mb-6">
        <Suspense fallback={<div className="h-8" />}>
          <ProductFilters categories={categories} />
        </Suspense>
      </div>

      {errorMessage ? (
        <StateBlock icon={Alert01Icon} title="Couldn't load products" description={errorMessage} />
      ) : products.length === 0 ? (
        <StateBlock
          icon={InboxIcon}
          title="No products found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="mt-8">
            <ProductsPagination page={page} totalPages={totalPages} params={linkParams} />
          </div>
        </>
      )}
    </main>
  )
}

function StateBlock({
  icon,
  title,
  description,
}: {
  icon: typeof Alert01Icon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
      <HugeiconsIcon icon={icon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
      <div>
        <p className="font-heading text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
