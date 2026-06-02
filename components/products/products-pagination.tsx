import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
} from '@hugeicons/core-free-icons'

import { buttonVariants } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

interface ProductsPaginationProps {
  page: number
  totalPages: number
  params: Record<string, string>
}

const buildHref = (params: Record<string, string>, page: number): string => {
  const search = new URLSearchParams(params)
  if (page <= 1) search.delete('page')
  else search.set('page', String(page))
  const qs = search.toString()
  return qs ? `/products?${qs}` : '/products'
}

const pageWindow = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: Array<number | 'ellipsis'> = [1]
  if (current > 3) pages.push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export function ProductsPagination({ page, totalPages, params }: ProductsPaginationProps) {
  if (totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PageArrow
            direction="prev"
            href={buildHref(params, page - 1)}
            disabled={page <= 1}
          />
        </PaginationItem>

        {pages.map((entry, index) =>
          entry === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <span className="flex size-8 items-center justify-center text-muted-foreground">
                <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} className="size-4" />
                <span className="sr-only">More pages</span>
              </span>
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <Link
                href={buildHref(params, entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={cn(
                  buttonVariants({ variant: entry === page ? 'outline' : 'ghost', size: 'icon' }),
                )}
              >
                {entry}
              </Link>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PageArrow
            direction="next"
            href={buildHref(params, page + 1)}
            disabled={page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function PageArrow({
  direction,
  href,
  disabled,
}: {
  direction: 'prev' | 'next'
  href: string
  disabled: boolean
}) {
  const isPrev = direction === 'prev'
  const label = isPrev ? 'Previous' : 'Next'
  const icon = (
    <HugeiconsIcon
      icon={isPrev ? ArrowLeft01Icon : ArrowRight01Icon}
      strokeWidth={2}
      data-icon={isPrev ? 'inline-start' : 'inline-end'}
    />
  )
  const content = (
    <>
      {isPrev && icon}
      <span className="hidden sm:block">{label}</span>
      {!isPrev && icon}
    </>
  )
  const className = cn(buttonVariants({ variant: 'ghost', size: 'default' }), isPrev ? 'pl-1.5' : 'pr-1.5')

  if (disabled) {
    return (
      <span aria-disabled className={cn(className, 'pointer-events-none opacity-50')}>
        {content}
      </span>
    )
  }

  return (
    <Link href={href} aria-label={`Go to ${label.toLowerCase()} page`} className={className}>
      {content}
    </Link>
  )
}
