'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Alert02Icon,
  Delete02Icon,
  Image02Icon,
  MoreVerticalIcon,
  PackageSearchIcon,
  PencilEdit02Icon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteProduct, getAllProducts } from '@/lib/admin'
import { isApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import type { Product, ProductStatus } from '@/lib/products'

const PAGE_SIZE = 10
const LOW_STOCK_THRESHOLD = 5

type StatusFilter = 'ALL' | 'ACTIVE' | 'PAUSE'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; products: Product[]; total: number }

/** Debounce a changing value by `delay` ms. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])
  return debounced
}

const PRODUCT_STATUS_META: Record<
  ProductStatus,
  { label: string; tone?: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  ACTIVE: { label: 'Active', tone: 'oklch(0.6 0.17 150)', variant: 'outline' },
  PAUSE: { label: 'Paused', tone: 'oklch(0.66 0.16 70)', variant: 'outline' },
  DELETE: { label: 'Archived', variant: 'destructive' },
}

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const meta = PRODUCT_STATUS_META[status]
  const isDestructive = meta.variant === 'destructive'
  return (
    <Badge variant={meta.variant} style={isDestructive ? undefined : { color: meta.tone }}>
      {meta.label}
    </Badge>
  )
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const [state, setState] = useState<LoadState>({ phase: 'loading' })
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  // Bumped to force a refetch after a successful delete.
  const [refreshToken, setRefreshToken] = useState(0)

  const debouncedSearch = useDebounced(search.trim(), 350)
  // Tracks the latest request so a slow earlier one can't clobber a newer result.
  const requestId = useRef(0)

  // Event-driven handlers reset paging + show the loading state. Doing this here
  // (rather than in an effect) keeps the fetch effect free of synchronous
  // setState cascades.
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
    setState({ phase: 'loading' })
  }, [])

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatus(value)
    setPage(1)
    setState({ phase: 'loading' })
  }, [])

  const handlePageChange = useCallback((next: number) => {
    setPage(next)
    setState({ phase: 'loading' })
  }, [])

  useEffect(() => {
    const current = ++requestId.current
    let active = true

    void getAllProducts({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : status,
    })
      .then((result) => {
        if (!active || current !== requestId.current) return
        setState({
          phase: 'ready',
          products: result.data,
          total: result.meta?.total ?? result.data.length,
        })
      })
      .catch((error: unknown) => {
        if (!active || current !== requestId.current) return
        const message = isApiError(error)
          ? error.message
          : 'Unable to load products. Please try again.'
        setState({ phase: 'error', message })
      })

    return () => {
      active = false
    }
  }, [page, debouncedSearch, status, refreshToken])

  const totalPages = useMemo(() => {
    if (state.phase !== 'ready') return 1
    return Math.max(1, Math.ceil(state.total / PAGE_SIZE))
  }, [state])

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteProduct(pendingDelete._id)
      toast.success(`“${pendingDelete.productName}” was archived.`)
      setPendingDelete(null)
      setRefreshToken((token) => token + 1)
    } catch (error) {
      toast.error(
        isApiError(error) ? error.message : 'Failed to delete the product. Please try again.',
      )
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete])

  const hasFilters = debouncedSearch.length > 0 || status !== 'ALL'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Products</h2>
          <p className="text-xs text-muted-foreground">
            Manage your catalogue — create, edit, and retire products.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            New product
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={PackageSearchIcon}
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search products by name…"
            aria-label="Search products"
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(value) => handleStatusChange(value as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSE">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      {state.phase === 'error' ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Couldn&apos;t load products</AlertTitle>
          <AlertDescription>
            <p>{state.message}</p>
            <button
              type="button"
              onClick={() => {
                setState({ phase: 'loading' })
                setRefreshToken((token) => token + 1)
              }}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.phase === 'loading' ? (
                <ProductRowsSkeleton />
              ) : state.products.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="p-0">
                    <Empty className="border-none py-12">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <HugeiconsIcon icon={PackageSearchIcon} strokeWidth={2} />
                        </EmptyMedia>
                        <EmptyTitle>
                          {hasFilters ? 'No matching products' : 'No products yet'}
                        </EmptyTitle>
                        <EmptyDescription>
                          {hasFilters
                            ? 'Try adjusting your search or status filter.'
                            : 'Get started by adding your first product to the catalogue.'}
                        </EmptyDescription>
                      </EmptyHeader>
                      {!hasFilters ? (
                        <EmptyContent>
                          <Button asChild size="sm">
                            <Link href="/admin/products/new">
                              <HugeiconsIcon
                                icon={Add01Icon}
                                strokeWidth={2}
                                data-icon="inline-start"
                              />
                              New product
                            </Link>
                          </Button>
                        </EmptyContent>
                      ) : null}
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                state.products.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onDelete={() => setPendingDelete(product)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {state.phase === 'ready' && totalPages > 1 ? (
        <Pagination className="justify-between">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Showing page <span className="font-medium text-foreground">{page}</span> of{' '}
            <span className="font-medium text-foreground">{totalPages}</span> ·{' '}
            <span className="font-mono tabular-nums">{state.total}</span> products
          </p>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {buildPageRange(page, totalPages).map((entry, index) =>
              entry === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <span className="px-2 text-xs text-muted-foreground">…</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <PaginationLink
                    isActive={entry === page}
                    onClick={() => handlePageChange(entry)}
                    className="cursor-pointer"
                  >
                    {entry}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="text-destructive">
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </AlertDialogMedia>
            <AlertDialogTitle>Archive this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.productName}” will be archived and hidden from the storefront. You can restore it later.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                // Keep the dialog open until the request settles.
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? 'Archiving…' : 'Archive product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// --- Row --------------------------------------------------------------------
function ProductRow({ product, onDelete }: { product: Product; onDelete: () => void }) {
  const thumbnail = product.productImages[0]
  const lowStock = product.productStock <= LOW_STOCK_THRESHOLD
  const initials = product.productName.slice(0, 2).toUpperCase()

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-none after:rounded-none">
            {thumbnail ? (
              <AvatarImage
                src={thumbnail.url}
                alt={thumbnail.alt ?? product.productName}
                className="rounded-none"
              />
            ) : null}
            <AvatarFallback className="rounded-none">
              {initials || <HugeiconsIcon icon={Image02Icon} size={16} strokeWidth={2} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{product.productName}</span>
            <span className="truncate text-xs text-muted-foreground md:hidden">
              {product.productCategory}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground capitalize md:table-cell">
        {product.productCategory}
      </TableCell>
      <TableCell className="text-right font-mono font-medium tabular-nums">
        {formatPrice(product.productPrice, product.productCurrency)}
      </TableCell>
      <TableCell className="hidden text-right sm:table-cell">
        <Badge
          variant="outline"
          className="font-mono tabular-nums"
          style={lowStock ? { color: 'oklch(0.66 0.16 70)' } : undefined}
        >
          {lowStock ? (
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} data-icon="inline-start" />
          ) : null}
          {product.productStock}
        </Badge>
      </TableCell>
      <TableCell>
        <ProductStatusBadge status={product.productStatus} />
      </TableCell>
      <TableCell className="pr-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.productName}`}>
              <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product._id}/edit`}>
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function ProductRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-transparent">
          <TableCell className="pl-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-3 w-20" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-3 w-14" />
          </TableCell>
          <TableCell className="hidden text-right sm:table-cell">
            <Skeleton className="ml-auto h-5 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell className="pr-4 text-right">
            <Skeleton className="ml-auto size-7" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/** Compact page-number range with ellipses around the current page. */
function buildPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('ellipsis')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < total - 1) pages.push('ellipsis')
  pages.push(total)
  return pages
}
