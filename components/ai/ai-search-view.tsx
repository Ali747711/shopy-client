'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AiSearch02Icon, Alert01Icon, InboxIcon, SparklesIcon } from '@hugeicons/core-free-icons'

import { AiResultCard } from '@/components/ai/ai-result-card'
import { IntentChips } from '@/components/ai/intent-chips'
import { HeroSearch } from '@/components/landing/hero-search'
import { Badge } from '@/components/ui/badge'
import { streamAiSearch, type AiSearchMeta } from '@/lib/ai'

const EXAMPLES = [
  'lightweight jacket under $80',
  'noise-cancelling headphones',
  'weekend travel backpack',
  'running shoes for flat feet',
  'polarized sunglasses',
]

export function AiSearchView() {
  const searchParams = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()

  const [meta, setMeta] = useState<AiSearchMeta | null>(null)
  const [explanation, setExplanation] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      // Yield once so the state resets happen in a microtask, not synchronously
      // inside the effect body (keeps the React lint happy).
      await Promise.resolve()
      if (controller.signal.aborted) return

      setMeta(null)
      setExplanation('')
      setError(null)
      setStreaming(Boolean(query))

      if (!query) return

      await streamAiSearch(
        query,
        {
          onMeta: (next) => setMeta(next),
          onToken: (token) => setExplanation((prev) => prev + token),
          onDone: () => setStreaming(false),
          onError: (message) => {
            setError(message)
            setStreaming(false)
          },
        },
        controller.signal,
      )
    })()
    return () => controller.abort()
  }, [query])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-24 pb-24 sm:pb-12">
      <div className="mb-6 inline-flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground uppercase">
        <HugeiconsIcon icon={AiSearch02Icon} strokeWidth={2} className="size-3.5 text-primary" />
        AI search
      </div>

      <div className="max-w-2xl">
        <HeroSearch key={query} initialValue={query} />
      </div>

      {!query ? (
        <EmptyState />
      ) : (
        <section className="mt-10 flex flex-col gap-8">
          <header className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-pretty">
              <span className="text-muted-foreground">Showing results for</span>{' '}
              <span className="text-foreground">“{query}”</span>
            </h1>
            <div className="flex items-center gap-1.5">
              {meta?.cached && <Badge variant="secondary">Cached</Badge>}
              {meta?.degraded && <Badge variant="outline">Keyword fallback</Badge>}
            </div>
          </header>

          {error ? (
            <ErrorBlock message={error} />
          ) : !meta ? (
            <LoadingBlock />
          ) : (
            <>
              <IntentChips intent={meta.intent} />

              {meta.degraded ? (
                <p className="text-xs text-muted-foreground">
                  AI explanations are paused — showing keyword results.
                </p>
              ) : (
                meta.products.length > 0 && <ExplanationPanel text={explanation} streaming={streaming} />
              )}

              {meta.products.length === 0 ? (
                <EmptyMatches />
              ) : (
                <div>
                  <h2 className="font-heading mb-3 text-sm font-semibold">
                    {meta.products.length} match{meta.products.length === 1 ? '' : 'es'}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {meta.products.map((product) => (
                      <AiResultCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  )
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.5} className="size-9 text-muted-foreground" />
      <p className="font-heading mt-3 text-base font-medium">Ask Shopy in plain English</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Describe what you&apos;re after — budget, use case, vibe.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {EXAMPLES.map((example) => (
          <Link
            key={example}
            href={`/search?q=${encodeURIComponent(example)}`}
            className="border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {example}
          </Link>
        ))}
      </div>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <HugeiconsIcon
        icon={SparklesIcon}
        strokeWidth={2}
        className="size-4 animate-pulse text-primary"
      />
      Reading your intent and searching the catalog…
    </div>
  )
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
      <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function EmptyMatches() {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-border py-16 text-center">
      <HugeiconsIcon icon={InboxIcon} strokeWidth={1.5} className="size-7 text-muted-foreground" />
      <p className="font-heading text-sm font-medium">No matches</p>
      <p className="text-xs text-muted-foreground">Try rephrasing — fewer constraints often helps.</p>
    </div>
  )
}

function ExplanationPanel({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <div className="border border-border bg-card p-5 ring-1 ring-foreground/5">
      <div className="mb-3 flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground uppercase">
        <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5 text-primary" />
        Why these
      </div>
      <p className="text-xs/relaxed text-foreground whitespace-pre-line">
        {text}
        {streaming && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-foreground/70"
          />
        )}
        {!streaming && !text && (
          <span className="text-muted-foreground">No explanation available.</span>
        )}
      </p>
    </div>
  )
}
