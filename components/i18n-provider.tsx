'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import i18n from '@/lib/i18n'
import {
  LANGUAGE_STORAGE_KEY,
  defaultLocale,
  locales,
  type Locale,
} from '@/lib/i18n/settings'

const isSupported = (value: string | null | undefined): value is Locale =>
  !!value && (locales as readonly string[]).includes(value)

/** Resolve the user's preferred locale from storage, then browser language. */
function resolvePreferredLocale(): Locale {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isSupported(stored)) return stored

  const navLang = window.navigator.language?.slice(0, 2)
  return isSupported(navLang) ? navLang : defaultLocale
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Detection runs only after hydration, so the first client render still
  // matches the server's default-locale HTML. Switching here is safe because
  // it happens in an effect, after React has reconciled the initial tree.
  useEffect(() => {
    const locale = resolvePreferredLocale()
    if (locale !== i18n.language) {
      void i18n.changeLanguage(locale)
      document.documentElement.lang = locale
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
