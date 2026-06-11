'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Settings2 } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SUPPORTED_CURRENCIES, useCurrency, type CurrencyCode } from '@/lib/currency'
import {
  LANGUAGE_STORAGE_KEY,
  locales,
  localeNames,
  localeNativeNames,
  type Locale,
} from '@/lib/i18n/settings'
import { cn } from '@/lib/utils'

interface SettingsMenuProps {
  /** Trigger styling so it can adapt to the desktop dock vs the mobile corner. */
  className?: string
}

export function SettingsMenu({ className }: SettingsMenuProps) {
  const { i18n } = useTranslation()
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)

  const currentLocale = (i18n.language?.slice(0, 2) ?? 'en') as Locale

  const selectLanguage = (locale: Locale) => {
    i18n.changeLanguage(locale)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Language and currency settings"
          className={cn(
            'grid place-items-center text-white/75 transition-colors hover:text-white',
            'ring-1 ring-white/15 hover:ring-white/30 focus-visible:outline-none focus-visible:ring-ring',
            open && 'text-white ring-white/30',
            className,
          )}
        >
          <Settings2 className="size-4" strokeWidth={2} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-64 p-1.5">
        <Command className="gap-1">
          <CommandInput placeholder="Search settings…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>

            <CommandGroup heading="Language">
              {locales.map((locale) => (
                <CommandItem
                  key={locale}
                  value={`language ${localeNames[locale]} ${localeNativeNames[locale]}`}
                  onSelect={() => selectLanguage(locale)}
                >
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                    {localeNames[locale]}
                  </span>
                  <span>{localeNativeNames[locale]}</span>
                  {currentLocale === locale && <Check className="ml-auto size-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Currency">
              {SUPPORTED_CURRENCIES.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`currency ${c.code} ${c.symbol}`}
                  onSelect={() => setCurrency(c.code as CurrencyCode)}
                >
                  <span aria-hidden>{c.flag}</span>
                  <span className="font-medium tracking-wide">{c.code}</span>
                  <span className="text-muted-foreground">{c.symbol}</span>
                  {currency === c.code && <Check className="ml-auto size-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
