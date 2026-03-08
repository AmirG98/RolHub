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
    id: 'LOTR',
    name: 'Tierra Media',
    tagline: 'Las sombras crecen mientras los pueblos libres resisten',
    description: 'Hobbits, elfos, enanos y hombres unen fuerzas contra la oscuridad',
    icon: '🏰',
    color: '#C9A84C',
    available: true,
  },
  {
    id: 'ZOMBIES',
    name: 'Apocalipsis Zombie',
    tagline: 'El fin llegó. Los muertos caminan. Sobreviví',
    description: 'Ruinas, recursos escasos y hordas imparables',
    icon: '☠️',
    color: '#8B1A1A',
    available: true,
  },
  {
    id: 'ISEKAI',
    name: 'Mundo Isekai',
    tagline: 'Fuiste transportado a un mundo de fantasía con magia real',
    description: 'Aventuras, gremios y mazmorras te esperan',
    icon: '⭐',
    color: '#FFD93D',
    available: true,
  },
  {
    id: 'VIKINGOS',
    name: 'Saga Vikinga',
    tagline: 'Conquista, gloria y el favor de los dioses',
    description: 'Los dioses son reales. El Valhalla espera a los valientes',
    icon: '⚔️',
    color: '#C9A84C',
    available: true,
  },
  {
    id: 'STAR_WARS',
    name: 'Guerra de las Galaxias',
    tagline: 'Una galaxia muy, muy lejana llena de aventura',
    description: 'La Fuerza, sables de luz y el Imperio Galáctico',
    icon: '🚀',
    color: '#FFE81F',
    available: true,
  },
  {
    id: 'CYBERPUNK',
    name: 'Neón y Cromo',
    tagline: 'Alta tecnología, baja vida en la ciudad del futuro',
    description: 'Megacorporaciones, netrunners y la Red',
    icon: '🏙️',
    color: '#39FF14',
    available: true,
  },
  {
    id: 'LOVECRAFT_HORROR',
    name: 'Horrores Cósmicos',
    tagline: 'Hay cosas que la humanidad no debe saber',
    description: 'Años 1920. Investigaciones prohibidas y locura ancestral',
    icon: '👁️',
    color: '#1A3A2A',
    available: true,
  },
]

export function LoreSelector({ onSelect }: LoreSelectorProps) {
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full content-wrapper">
        <h1 className="font-title text-2xl sm:text-3xl md:text-4xl text-gold mb-2 text-center px-2">
          ¿En qué mundo quieres aventurarte?
        </h1>
        <p className="font-body text-sm md:text-base text-parchment/80 text-center mb-6 md:mb-8 px-2">
          Cada mundo tiene su propia historia, criaturas y desafíos únicos
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {lores.map((lore) => (
            <button
              key={lore.id}
              onClick={() => lore.available && setSelectedLore(lore.id)}
              disabled={!lore.available}
              className={`glass-panel p-3 md:p-6 rounded-lg transition-all duration-300 hover:scale-105 text-left group ${
                selectedLore === lore.id && 'glow-effect ring-2 ring-gold'
              } ${!lore.available && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="text-3xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                {lore.icon}
              </div>
              <h3 className="font-heading text-sm md:text-xl text-parchment mb-1 md:mb-2 line-clamp-1">
                {lore.name}
              </h3>
              <p className="font-ui text-xs md:text-sm mb-1 md:mb-2 line-clamp-2" style={{ color: lore.color }}>
                {lore.tagline}
              </p>
              <p className="font-body text-xs text-parchment/60 hidden md:block">
                {lore.description}
              </p>
            </button>
          ))}
        </div>

        {/* Botón de continuar - fixed en mobile */}
        <div className="text-center sticky bottom-4 md:relative md:bottom-auto">
          <RunicButton
            variant="primary"
            disabled={!selectedLore}
            onClick={() => selectedLore && onSelect(selectedLore)}
            className="px-8 md:px-12 py-3 md:py-4 w-full md:w-auto"
          >
            Continuar →
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
