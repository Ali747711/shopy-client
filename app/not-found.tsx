'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { cn } from '@/lib/utils'

export default function NotFound() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <main className="lime-wash relative flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <DotPattern
        className={cn(
          '[mask-image:radial-gradient(480px_circle_at_50%_50%,white,transparent)]',
        )}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <p className="font-heading text-[clamp(6rem,20vw,12rem)] font-semibold leading-none text-primary select-none">
          404
        </p>

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Looks like this page went shopping and never came back.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for something else…"
            className="flex-1 border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <Button type="submit" variant="default" size="sm">
            Search
          </Button>
        </form>

        <Link href="/">
          <Button variant="outline" size="sm">
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  )
}
