'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRODUCT_SORTS, type ProductSort } from '@/lib/products'

const SORT_LABELS: Record<ProductSort, string> = {
  NEWEST: 'Newest',
  PRICE_ASC: 'Price: Low to High',
  PRICE_DESC: 'Price: High to Low',
  RATING: 'Top Rated',
}

const ALL_CATEGORIES = 'all'
const SEARCH_DEBOUNCE_MS = 400

export function ProductFilters({ categories }: { categories: { value: string; label: string }[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const commit = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') params.delete(key)
        else params.set(key, value)
      }
      params.delete('page') // any filter change returns to the first page
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams],
  )

  // Debounce free-text search so we don't navigate on every keystroke.
  useEffect(() => {
    const current = searchParams.get('search') ?? ''
    if (search === current) return
    const timer = setTimeout(() => commit({ search: search || undefined }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search, searchParams, commit])

  const category = searchParams.get('category') ?? ALL_CATEGORIES
  const sort = (searchParams.get('sort') as ProductSort | null) ?? undefined
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  const hasActiveFilters = [...searchParams.keys()].some((key) =>
    ['search', 'category', 'sort', 'minPrice', 'maxPrice'].includes(key),
  )

  const clearAll = () => {
    setSearch('')
    router.push(pathname)
  }

  const commitPrice = (key: 'minPrice' | 'maxPrice') => (value: string) => {
    const trimmed = value.trim()
    commit({ [key]: trimmed === '' ? undefined : trimmed })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-50 flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search products"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-7"
        />
      </div>

      <Select
        value={category}
        onValueChange={(value) =>
          commit({ category: value === ALL_CATEGORIES ? undefined : value })
        }
      >
        <SelectTrigger aria-label="Filter by category" className="min-w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {categories.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={sort ?? ''} onValueChange={(value) => commit({ sort: value || undefined })}>
        <SelectTrigger aria-label="Sort products" className="min-w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PRODUCT_SORTS.map((option) => (
              <SelectItem key={option} value={option}>
                {SORT_LABELS[option]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <PriceInput
          key={`min-${minPrice}`}
          ariaLabel="Minimum price"
          placeholder="Min"
          defaultValue={minPrice}
          onCommit={commitPrice('minPrice')}
        />
        <span className="text-sm text-muted-foreground">–</span>
        <PriceInput
          key={`max-${maxPrice}`}
          ariaLabel="Maximum price"
          placeholder="Max"
          defaultValue={maxPrice}
          onCommit={commitPrice('maxPrice')}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} data-icon="inline-start" />
          Clear
        </Button>
      )}
    </div>
  )
}

function PriceInput({
  ariaLabel,
  placeholder,
  defaultValue,
  onCommit,
}: {
  ariaLabel: string
  placeholder: string
  defaultValue: string
  onCommit: (value: string) => void
}) {
  const [value, setValue] = useState(defaultValue)

  return (
    <Input
      type="number"
      min={0}
      inputMode="numeric"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => value !== defaultValue && onCommit(value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onCommit(value)
      }}
      className="w-20"
    />
  )
}
