'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale } from './translations'

type Translations = typeof translations[Locale]

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'rpghub-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default INGLÉS: el tráfico principal (ads) es en inglés. Los hispano-
  // hablantes flipean con el toggle, y su elección persiste en localStorage.
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Prioridad: ?lang= en la URL (para que los ads fuercen idioma) >
    // preferencia guardada > default inglés.
    const urlLang = new URLSearchParams(window.location.search).get('lang')?.toLowerCase()
    if (urlLang === 'es' || urlLang === 'en') {
      setLocaleState(urlLang)
      localStorage.setItem(STORAGE_KEY, urlLang)
    } else {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved === 'es' || saved === 'en') {
        setLocaleState(saved)
      }
      // sin preferencia guardada → queda el default 'en'
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
  }

  // Prevent hydration mismatch — el SSR renderiza en el default (en)
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ locale: 'en', setLocale, t: translations.en }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Shorthand hook for translations
export function useTranslations() {
  const { t } = useLanguage()
  return t
}
