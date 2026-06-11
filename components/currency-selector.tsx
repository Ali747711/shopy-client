'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'

import { SUPPORTED_CURRENCIES, useCurrency, type CurrencyCode } from '@/lib/currency'
import { cn } from '@/lib/utils'

export function CurrencySelector() {
  const { currency, setCurrency, hydrated } = useCurrency()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const active = SUPPORTED_CURRENCIES.find((c) => c.code === currency)

  // Close dropdown when clicking outside
  const onBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  const select = (code: CurrencyCode) => {
    setCurrency(code)
    setOpen(false)
  }

  // Don't render until the stored preference is resolved — avoids flash
  if (!hydrated) {
    return (
      <div className="h-7 w-16 animate-pulse bg-muted" aria-hidden />
    )
  }

  return (
    <div ref={containerRef} className="relative" onBlur={onBlur}>
      <button
        type="button"
        aria-label={`Currency: ${currency}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 px-2 text-[11px] font-medium tracking-wide uppercase',
          'text-white/70 ring-1 ring-white/15 transition-colors hover:text-white hover:ring-white/30',
          'focus-visible:outline-none focus-visible:ring-ring focus-visible:text-white',
          open && 'text-white ring-white/30',
        )}
      >
        <span aria-hidden>{active?.flag}</span>
        <span>{active?.code}</span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            aria-label="Select currency"
            className="currency-popover absolute right-0 top-full z-50 mt-1.5 min-w-[130px] py-1"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === currency}>
                <button
                  type="button"
                  onClick={() => select(c.code)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors',
                    c.code === currency
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span aria-hidden>{c.flag}</span>
                  <span className="font-medium tracking-wide">{c.code}</span>
                  <span className="ml-auto text-muted-foreground">{c.symbol}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
