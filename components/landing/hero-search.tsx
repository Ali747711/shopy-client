'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Search01Icon } from '@hugeicons/core-free-icons'

export function HeroSearch({ initialValue = '' }: { initialValue?: string } = {}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <form
      onSubmit={onSubmit}
      className="group flex w-full items-center gap-2 border border-foreground/20 bg-card p-2 ring-1 ring-foreground/5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
    >
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className="ml-2 size-5 shrink-0 text-muted-foreground"
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try “lightweight jacket for rainy weather under $80”"
        aria-label="Search products in plain English"
        className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 bg-primary px-4 text-xs font-medium text-primary-foreground transition-transform active:translate-y-px"
      >
        Search
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
      </button>
    </form>
  )
}
