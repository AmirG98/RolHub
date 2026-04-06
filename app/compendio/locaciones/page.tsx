import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_LOCATIONS } from '@/data/compendium/locations'

export const metadata: Metadata = {
  title: 'Locaciones — Compendio RPG | RolHub',
  description: 'Explora todas las locaciones del universo RolHub: ciudades, dungeons, ruinas, fortalezas y más. Cada lugar con descripción, NPCs notables y quests disponibles.',
  keywords: ['locaciones RPG', 'D&D locations', 'fantasy locations', 'RPG maps', 'game locations'],
  alternates: { canonical: 'https://rol-hub.com/compendio/locaciones' },
}

const TYPE_ICONS: Record<string, string> = {
  'city': '🏰', 'dungeon': '🗝️', 'wilderness': '🌲', 'safe-haven': '🏠',
  'ruins': '🏚️', 'fortress': '⚔️', 'temple': '🕯️', 'tavern': '🍺', 'ocean': '🌊',
}

const DANGER_COLORS = ['text-emerald', 'text-emerald', 'text-gold', 'text-gold', 'text-blood', 'text-blood']

export default function LocationsPage() {
  const lores = [...new Set(ALL_LOCATIONS.map(l => l.lore))]

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto content-wrapper">
        <h1 className="font-title text-3xl md:text-5xl text-gold-bright text-center mb-2">Locaciones</h1>
        <p className="font-body text-sm md:text-base text-parchment/70 text-center mb-8 max-w-2xl mx-auto">
          Ciudades, dungeons, ruinas ancestrales, tabernas legendarias y territorios inexplorados de cada mundo.
        </p>

        {lores.map(lore => {
          const locations = ALL_LOCATIONS.filter(l => l.lore === lore)
          const loreName = locations[0]?.loreName || lore
          return (
            <section key={lore} className="mb-10">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-4 border-b border-gold-dim/20 pb-2">{loreName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map(loc => (
                  <Link key={loc.slug} href={`/compendio/locaciones/${loc.slug}`}
                    className="glass-panel rounded-lg p-4 hover:scale-[1.02] transition-all group border border-transparent hover:border-gold-dim/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-lg mr-2">{TYPE_ICONS[loc.type] || '📍'}</span>
                        <h3 className="font-heading text-base text-parchment inline group-hover:text-gold-bright transition">{loc.name}</h3>
                      </div>
                      <span className={`font-mono text-xs ${DANGER_COLORS[loc.dangerLevel] || 'text-gold'}`}>
                        {'⚔️'.repeat(Math.min(loc.dangerLevel, 5))}
                      </span>
                    </div>
                    <p className="font-body text-xs text-parchment/60 line-clamp-2 mb-2">{loc.description}</p>
                    <div className="flex gap-3 font-mono text-[10px] text-parchment/40">
                      <span>{loc.type}</span>
                      <span>{loc.npcs.length} NPCs</span>
                      <span>{loc.quests.length} quests</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
