import { Skeleton } from '@/components/ui/skeleton'

export default function ProductDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <Skeleton className="h-3 w-28" />
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-32" />
          <Skeleton className="my-3 h-px w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="mt-4 h-10 w-40" />
        </div>
      </div>
    </main>
  )
}
