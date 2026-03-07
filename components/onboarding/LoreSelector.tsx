'use client'

import { useState } from 'react'
import { Lore } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'

interface LoreSelectorProps {
  onSelect: (lore: Lore) => void
}

const lores: Array<{
  id: Lore
  name: string
  tagline: string
  description: string
  icon: string
  color: string
  available: boolean
}> = [
  {
    id: 'MEDIEVAL_FANTASY',
    name: 'Medieval Fantasy',
    tagline: 'Dragones, hechiceros y leyendas ancestrales',
    description: 'Espadas, magia y reinos en guerra',
    icon: '🏰',
    color: '#B026FF',
    available: true,
  },
  {
    id: 'POST_APOCALYPTIC',
    name: 'Post-Apocalíptico',
    tagline: 'Sobrevive en un mundo devastado',
    description: 'Ruinas, mutantes y recursos escasos',
    icon: '☠️',
    color: '#FF6B6B',
    available: false,
  },
  {
    id: 'HARRY_POTTER',
    name: 'Mundo Mágico',
    tagline: 'Hechizos, pociones y criaturas mágicas',
    description: 'Escuela de magia y aventuras místicas',
    icon: '⭐',
    color: '#FFD93D',
    available: false,
  },
  {
    id: 'SCI_FI',
    name: 'Sci-Fi',
    tagline: 'Galaxias lejanas y tecnología avanzada',
    description: 'Naves espaciales, aliens y planetas exóticos',
    icon: '🚀',
    color: '#00D9FF',
    available: false,
  },
  {
    id: 'STAR_WARS',
    name: 'Guerra de las Galaxias',
    tagline: 'La Fuerza, Jedis y el Imperio',
    description: 'Sables de luz en una galaxia muy lejana',
    icon: '⭐',
    color: '#FFE81F',
    available: false,
  },
  {
    id: 'CYBERPUNK',
    name: 'Cyberpunk',
    tagline: 'Alta tecnología, baja vida',
    description: 'Megacorporaciones, hackers y cyborgs',
    icon: '🏙️',
    color: '#39FF14',
    available: false,
  },
]

export function LoreSelector({ onSelect }: LoreSelectorProps) {
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="max-w-6xl w-full content-wrapper">
        <h1 className="font-title text-4xl text-gold mb-2 text-center">
          ¿En qué mundo quieres aventurarte?
        </h1>
        <p className="font-body text-parchment/80 text-center mb-8">
          Cada mundo tiene su propia historia, criaturas y desafíos únicos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {lores.map((lore) => (
            <button
              key={lore.id}
              onClick={() => lore.available && setSelectedLore(lore.id)}
              disabled={!lore.available}
              className={`glass-panel p-6 rounded-lg transition-all duration-300 hover:scale-105 text-left group ${
                selectedLore === lore.id && 'glow-effect ring-2 ring-gold'
              } ${!lore.available && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                {lore.icon}
              </div>
              <h3 className="font-heading text-xl text-parchment mb-2">
                {lore.name}
              </h3>
              <p className="font-ui text-sm mb-2" style={{ color: lore.color }}>
                {lore.tagline}
              </p>
              <p className="font-body text-xs text-parchment/60">
                {lore.description}
              </p>
            </button>
          ))}
        </div>

        {/* Botón de continuar */}
        <div className="text-center">
          <RunicButton
            variant="primary"
            disabled={!selectedLore}
            onClick={() => selectedLore && onSelect(selectedLore)}
            className="px-12 py-4"
          >
            Continuar →
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
