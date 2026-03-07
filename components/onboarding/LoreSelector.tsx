'use client'

import { useState } from 'react'
import { Lore } from '@/lib/types/lore'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Mountain, Skull, Sparkles, Axe } from 'lucide-react'

interface LoreSelectorProps {
  onSelect: (lore: Lore) => void
}

const lores: Array<{
  id: Lore
  name: string
  tagline: string
  icon: React.ReactNode
  available: boolean
}> = [
  {
    id: 'LOTR',
    name: 'Tierra Media',
    tagline: 'Un mundo de magia antigua y batallas épicas contra la oscuridad',
    icon: <Mountain className="h-16 w-16" />,
    available: true,
  },
  {
    id: 'ZOMBIES',
    name: 'Apocalipsis Zombie',
    tagline: 'Sobrevivir en un mundo post-apocalíptico lleno de muertos vivientes',
    icon: <Skull className="h-16 w-16" />,
    available: false,
  },
  {
    id: 'ISEKAI',
    name: 'Mundo Isekai',
    tagline: 'Transportado a un mundo de fantasía con magia y aventuras',
    icon: <Sparkles className="h-16 w-16" />,
    available: false,
  },
  {
    id: 'VIKINGOS',
    name: 'Era Vikinga',
    tagline: 'Sagas nórdicas de honor, conquista y mitología',
    icon: <Axe className="h-16 w-16" />,
    available: false,
  },
]

export function LoreSelector({ onSelect }: LoreSelectorProps) {
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="max-w-6xl w-full content-wrapper">
        <h1 className="font-title text-5xl md:text-6xl text-gold-bright text-center mb-4 ink-reveal glow-effect-on-hover">
          Elegí Tu Mundo
        </h1>
        <p className="font-ui text-parchment/80 text-center mb-12 text-lg">
          Cada mundo tiene su propia historia, desafíos y atmósfera única
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {lores.map((lore) => (
            <div
              key={lore.id}
              className={`glass-panel rounded-lg transition-all duration-300 hover:scale-105 relative cursor-pointer ${
                selectedLore === lore.id ? 'glow-effect ring-2 ring-gold-bright' : ''
              } ${!lore.available ? 'opacity-50' : ''}`}
              onClick={() => lore.available && setSelectedLore(lore.id)}
            >
              <div className="flex flex-col items-center text-center space-y-4 p-8">
                {/* Icono */}
                <div className="text-gold-bright text-5xl">{lore.icon}</div>

                {/* Nombre */}
                <h3 className="font-heading text-3xl text-gold">{lore.name}</h3>

                {/* Tagline */}
                <p className="font-body text-parchment/80 leading-relaxed">{lore.tagline}</p>

                {/* Badge de disponibilidad */}
                {!lore.available && (
                  <div className="absolute top-4 right-4 bg-gold-dim text-shadow px-3 py-1 rounded-full text-xs font-ui font-semibold">
                    Próximamente
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botón de continuar */}
        <div className="flex justify-center">
          <RunicButton
            variant="primary"
            disabled={!selectedLore}
            onClick={() => selectedLore && onSelect(selectedLore)}
            className="px-12"
          >
            Continuar
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
