import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ProductCard } from '@/components/products/product-card'
import { BlurFade } from '@/components/ui/blur-fade'
import { PRODUCT_CATEGORIES, getProducts } from '@/lib/products'

const CATEGORIES = PRODUCT_CATEGORIES

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = CATEGORIES[slug]
  if (!cat) return { title: 'Category — Shopy' }
  return {
    title: `${cat.label} — Shopy`,
    description: cat.description,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cat = CATEGORIES[slug]
  if (!cat) notFound()

  // slug === the exact productCategory value in the backend (e.g. "jacket", "watch").
  let products: Awaited<ReturnType<typeof getProducts>>['data'] = []
  try {
    const { data } = await getProducts({ category: slug, limit: 48 })
    products = data
  } catch {
    products = []
  }

  return (
    <main className="pb-24 sm:pb-12">
      {/* Hero */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <Image
          src={cat.image}
          alt={cat.label}
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 sm:px-12">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {cat.label}
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/80">{cat.description}</p>
          <Link
            href={`/products?category=${encodeURIComponent(slug)}`}
            className="mt-5 inline-flex w-fit items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Shop All {cat.label}
          </Link>
        </div>
      </div>

      {/* Count bar */}
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <p className="text-xs text-muted-foreground">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'} in{' '}
          <Link href="/products" className="hover:text-foreground transition-colors underline underline-offset-2">
            {cat.label}
          </Link>
        </p>
      </div>

      {/* Products grid */}
      <div className="mx-auto w-full max-w-6xl px-4">
        {products.length === 0 ? (
          <div className="flex items-center justify-center border border-dashed border-border py-20">
            <p className="text-sm text-muted-foreground">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <BlurFade key={product._id} delay={0.03 * index} inView>
                <ProductCard product={product} />
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
