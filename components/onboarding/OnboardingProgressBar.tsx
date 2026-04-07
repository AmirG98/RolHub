'use client'

import { useLanguage } from '@/lib/i18n'

interface OnboardingProgressBarProps {
  /** Current step (1, 2 or 3) */
  step: 1 | 2 | 3
}

/**
 * Barra de progreso del onboarding — inline, se ubica encima del título de cada paso.
 * No usa `fixed` para no tapar la navbar ni separarse visualmente del contenido.
 */
export function OnboardingProgressBar({ step }: OnboardingProgressBarProps) {
  const { locale } = useLanguage()
  const stepLabels = locale === 'en'
    ? ['World', 'Setup', 'Character']
    : ['Mundo', 'Configuración', 'Personaje']

  return (
    <div className="max-w-md mx-auto px-4 flex items-center justify-center gap-3 mb-4 md:mb-6">
      {stepLabels.map((label, i) => {
        const stepNum = i + 1
        const isActive = step >= stepNum
        const isCurrent = step === stepNum
        return (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className={`w-8 h-px ${isActive ? 'bg-gold' : 'bg-gold-dim/30'}`} />}
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-heading border transition-all ${
                isCurrent ? 'bg-gold text-shadow border-gold-bright' : isActive ? 'bg-gold-dim/40 text-gold border-gold-dim' : 'bg-transparent text-parchment/40 border-parchment/20'
              }`}>
                {stepNum}
              </div>
              <span className={`text-xs font-ui hidden sm:inline ${isCurrent ? 'text-gold-bright' : isActive ? 'text-gold-dim' : 'text-parchment/30'}`}>
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
