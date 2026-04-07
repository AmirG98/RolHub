'use client'

import { useState } from 'react'
import { Lore } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'
import { useTranslations } from '@/lib/i18n'

interface LoreSelectorProps {
  onSelect: (lore: Lore) => void
}

const loreData: Array<{
  id: Lore
  icon: string
  color: string
}> = [
  { id: 'LOTR', icon: '🏰', color: '#C9A84C' },
  { id: 'ZOMBIES', icon: '☠️', color: '#8B1A1A' },
  { id: 'VIKINGOS', icon: '⚔️', color: '#C9A84C' },
  { id: 'ISEKAI', icon: '⭐', color: '#FFD93D' },
  { id: 'STAR_WARS', icon: '🚀', color: '#FFE81F' },
  { id: 'CYBERPUNK', icon: '🏙️', color: '#39FF14' },
  { id: 'LOVECRAFT_HORROR', icon: '👁️', color: '#7B68EE' },
  { id: 'ROMANTASY', icon: '🌹', color: '#E8A87C' },
]

export function LoreSelector({ onSelect }: LoreSelectorProps) {
  const t = useTranslations()
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)

  const lores = loreData.map(lore => ({
    ...lore,
    name: t.lores[lore.id as keyof typeof t.lores].name,
    tagline: t.lores[lore.id as keyof typeof t.lores].tagline,
    description: t.lores[lore.id as keyof typeof t.lores].description,
  }))

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8 pt-8 md:pt-12">
      <div className="max-w-3xl w-full mx-auto content-wrapper">
        <h1 className="font-title text-xl sm:text-2xl md:text-3xl text-gold mb-1 text-center">
          {t.onboarding.chooseLore.title}
        </h1>
        <p className="font-body text-xs md:text-sm text-parchment/60 text-center mb-4 md:mb-6">
          {t.onboarding.chooseLore.subtitle}
        </p>

        {/* Lores — grid balanceado */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto">
          {lores.map((lore) => (
            <button
              key={lore.id}
              onClick={() => { setSelectedLore(lore.id); onSelect(lore.id) }}
              className={`glass-panel p-3 md:p-4 rounded-lg transition-all duration-200 hover:scale-[1.03] text-left group h-full ${
                selectedLore === lore.id ? 'glow-effect ring-2 ring-gold' : ''
              }`}
            >
              <div className="text-2xl md:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                {lore.icon}
              </div>
              <h3 className="font-heading text-sm md:text-base text-parchment mb-0.5">
                {lore.name}
              </h3>
              <p className="font-ui text-[10px] md:text-xs leading-snug" style={{ color: lore.color }}>
                {lore.tagline}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
