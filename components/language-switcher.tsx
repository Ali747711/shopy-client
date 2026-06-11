'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'

import {
  LANGUAGE_STORAGE_KEY,
  locales,
  localeNames,
  localeNativeNames,
  type Locale,
} from '@/lib/i18n/settings'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = (i18n.language?.slice(0, 2) ?? 'en') as Locale

  // Close the dropdown when focus leaves the control entirely.
  const onBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  const select = (locale: Locale) => {
    i18n.changeLanguage(locale)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative" onBlur={onBlur}>
      <button
        type="button"
        aria-label={`Language: ${localeNativeNames[current]}. Click to change.`}
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
        <Globe aria-hidden className="size-3.5" strokeWidth={2} />
        <span suppressHydrationWarning>{localeNames[current]}</span>
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
            aria-label="Select language"
            className="currency-popover absolute right-0 top-full z-50 mt-1.5 min-w-[150px] py-1"
          >
            {locales.map((locale) => (
              <li key={locale} role="option" aria-selected={locale === current}>
                <button
                  type="button"
                  onClick={() => select(locale)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors',
                    locale === current
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="font-medium tracking-wide uppercase">{localeNames[locale]}</span>
                  <span className="ml-auto text-muted-foreground">{localeNativeNames[locale]}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
