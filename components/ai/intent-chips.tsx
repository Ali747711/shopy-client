import { formatPrice } from '@/lib/format'
import type { SearchIntent } from '@/lib/ai'

export function IntentChips({ intent }: { intent: SearchIntent }) {
  const chips: { label: string; value: string }[] = []

  if (intent.category) chips.push({ label: 'category', value: intent.category })
  if (intent.minPrice != null) chips.push({ label: 'min', value: formatPrice(intent.minPrice, 'USD') })
  if (intent.maxPrice != null) chips.push({ label: 'max', value: formatPrice(intent.maxPrice, 'USD') })
  intent.tags?.forEach((tag) => chips.push({ label: 'tag', value: tag }))
  intent.attributes?.forEach((attr) => chips.push({ label: 'attribute', value: attr }))
  if (intent.keywords && chips.length === 0) {
    chips.push({ label: 'keywords', value: intent.keywords })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
        Understood as
      </span>
      {chips.map((chip, index) => (
        <span
          key={`${chip.label}-${index}`}
          className="border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground"
        >
          <span className="text-muted-foreground">{chip.label}:</span> {chip.value}
        </span>
      ))}
    </div>
  )
}
