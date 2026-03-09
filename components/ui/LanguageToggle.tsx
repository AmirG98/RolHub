'use client'

import { useLanguage } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-shadow/50 hover:bg-shadow/70 border border-gold-dim/30
                 transition-all duration-200 hover:border-gold/50"
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Globe className="w-4 h-4 text-gold" />
      <span className="font-ui text-sm text-gold uppercase tracking-wider">
        {locale === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  )
}
