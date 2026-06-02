import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AiSearchView } from '@/components/ai/ai-search-view'

export const metadata: Metadata = {
  title: 'AI search — Shopy',
  description: 'Search the catalog in plain English.',
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <AiSearchView />
    </Suspense>
  )
}
