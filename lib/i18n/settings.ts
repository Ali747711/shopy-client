export const defaultLocale = 'en'
export const locales = ['en', 'ko'] as const
export type Locale = (typeof locales)[number]

// Where the user's chosen language is persisted across sessions.
export const LANGUAGE_STORAGE_KEY = 'shopy-lang'

// Short code shown in the navbar trigger (e.g. "EN", "KO").
export const localeNames: Record<Locale, string> = {
  en: 'EN',
  ko: 'KO',
}

// Full native name shown in the language dropdown.
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
}
