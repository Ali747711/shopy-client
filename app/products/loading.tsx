import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-3 w-28" />
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-8 min-w-50 flex-1" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="ring-1 ring-foreground/10">
            <Skeleton className="aspect-square w-full" />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="mt-2 h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
