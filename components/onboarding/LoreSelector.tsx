'use client'

import { LORES } from '@/lib/constants/lores'
import { cn } from '@/lib/utils'

interface LoreSelectorProps {
  selectedLore: string | null
  onSelect: (loreId: string) => void
}

export function LoreSelector({ selectedLore, onSelect }: LoreSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {LORES.map((lore) => (
        <button
          key={lore.id}
          onClick={() => onSelect(lore.id)}
          className={cn(
            'glass-panel p-6 rounded-lg transition-all duration-300 hover:scale-105 text-left group',
            selectedLore === lore.id && 'glow-effect ring-2 ring-gold'
          )}
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
  )
}
