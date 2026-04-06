'use client'

import { useState } from 'react'
import { Lore } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'
import { useTranslations } from '@/lib/i18n'
import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

interface LoreSelectorProps {
  onSelect: (lore: Lore) => void
}

const loreData: Array<{
  id: Lore
  icon: string
  color: string
  available: boolean
}> = [
  { id: 'LOTR', icon: '🏰', color: '#C9A84C', available: true },
  { id: 'ZOMBIES', icon: '☠️', color: '#8B1A1A', available: true },
  { id: 'DND_CLASSIC', icon: '⚔️', color: '#D4A44C', available: true },
  { id: 'ISEKAI', icon: '⭐', color: '#FFD93D', available: false },
  { id: 'VIKINGOS', icon: '⚔️', color: '#C9A84C', available: false },
  { id: 'STAR_WARS', icon: '🚀', color: '#FFE81F', available: false },
  { id: 'CYBERPUNK', icon: '🏙️', color: '#39FF14', available: false },
  { id: 'LOVECRAFT_HORROR', icon: '👁️', color: '#1A3A2A', available: false },
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
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full content-wrapper">
        <h1 className="font-title text-2xl sm:text-3xl md:text-4xl text-gold mb-2 text-center px-2">
          {t.onboarding.chooseLore.title}
        </h1>
        <p className="font-body text-sm md:text-base text-parchment/80 text-center mb-6 md:mb-8 px-2">
          {t.onboarding.chooseLore.subtitle}
        </p>

        {/* Lores disponibles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10 max-w-3xl mx-auto">
          {lores.filter(l => l.available).map((lore) => (
            <button
              key={lore.id}
              onClick={() => setSelectedLore(lore.id)}
              className={`glass-panel p-4 md:p-6 rounded-lg transition-all duration-300 hover:scale-105 text-left group ${
                selectedLore === lore.id ? 'glow-effect ring-2 ring-gold' : ''
              }`}
            >
              <div className="text-3xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                {lore.icon}
              </div>
              <h3 className="font-heading text-base md:text-xl text-parchment mb-1 md:mb-2">
                {lore.name}
              </h3>
              <p className="font-ui text-xs md:text-sm mb-1 md:mb-2" style={{ color: lore.color }}>
                {lore.tagline}
              </p>
              <p className="font-body text-xs text-parchment/80">
                {lore.description}
              </p>
            </button>
          ))}
        </div>

        {/* Lores próximamente */}
        {lores.some(l => !l.available) && (
          <div className="mb-6 md:mb-8">
            <p className="font-heading text-sm text-parchment/40 text-center mb-3 uppercase tracking-wider">
              Disponibles próximamente
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3 max-w-3xl mx-auto">
              {lores.filter(l => !l.available).map((lore) => (
                <div
                  key={lore.id}
                  className="glass-panel p-2 md:p-3 rounded-lg opacity-30 text-center"
                >
                  <div className="text-xl md:text-2xl mb-1">{lore.icon}</div>
                  <p className="font-heading text-xs text-parchment/60 line-clamp-1">{lore.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de continuar - fixed en mobile */}
        <div className="text-center sticky bottom-4 md:relative md:bottom-auto space-y-3">
          <RunicButton
            variant="primary"
            onClick={() => {
              if (selectedLore) {
                onSelect(selectedLore)
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="px-8 md:px-12 py-3 md:py-4 w-full md:w-auto"
          >
            {selectedLore ? t.onboarding.buttons.continue : t.onboarding.buttons.completeFirst}
          </RunicButton>
          <div>
            <Link href="/guias/mejores-mundos" className="inline-flex items-center gap-2 font-ui text-xs md:text-sm text-emerald hover:text-emerald/80 transition">
              <HelpCircle size={14} />
              No sabes cual elegir? Te ayudamos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
