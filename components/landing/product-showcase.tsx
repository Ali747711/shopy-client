import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { BlurFade } from '@/components/ui/blur-fade'
import { formatPrice } from '@/lib/format'

interface ShowcaseProduct {
  name: string
  category: string
  price: number
  slug: string
  imageSrc: string
}

const PRODUCTS: ShowcaseProduct[] = [
  { name: 'Aurora Over-Ear Headphones', category: 'Audio', price: 248, slug: 'headphones', imageSrc: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Trailline Rain Shell', category: 'Outerwear', price: 178, slug: 'jacket', imageSrc: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Voyage 28L Backpack', category: 'Travel', price: 134, slug: 'backpack', imageSrc: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { name: 'Apex Runner GT', category: 'Footwear', price: 156, slug: 'shoes', imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { name: 'Meridian Field Watch', category: 'Accessories', price: 320, slug: 'watch', imageSrc: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { name: 'Halo Polarized Sunglasses', category: 'Accessories', price: 89, slug: 'sunglasses', imageSrc: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' },
  { name: 'Frame One Mirrorless', category: 'Photography', price: 899, slug: 'camera', imageSrc: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cloudstep Low', category: 'Footwear', price: 142, slug: 'shoes', imageSrc: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80' },
]

export function ProductShowcase() {
  return (
    <section id="shop" className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-32">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-medium tracking-wider text-primary uppercase">Trending now</span>
          <h2 className="font-heading mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Picked for you</h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((product, index) => (
          <BlurFade key={product.name} delay={0.04 * index} inView>
            <Link href={`/products?category=${product.slug}`} className="group block focus-visible:outline-none">
              <div className="relative aspect-4/5 overflow-hidden border border-border bg-muted">
                <Image
                  src={product.imageSrc}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
                  {product.category}
                </span>
                <span className="absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {product.name}
                </h3>
                <span className="font-heading text-sm font-semibold tabular-nums">
                  {formatPrice(product.price, 'USD')}
                </span>
              </div>
            </Link>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
