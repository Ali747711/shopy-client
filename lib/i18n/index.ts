'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { defaultLocale, locales } from './settings'

import en from '@/messages/en.json'
import ko from '@/messages/ko.json'

// Initialize with a FIXED locale (no language detection) so that the server
// render and the client's first hydration render always agree. Detecting the
// user's language at module load (via localStorage/navigator) would make the
// client diverge from the server-rendered HTML and trigger a hydration
// mismatch. The persisted language is applied after mount in I18nProvider.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, ko: { translation: ko } },
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    supportedLngs: [...locales],
    interpolation: { escapeValue: false },
  })
}

export default i18n
