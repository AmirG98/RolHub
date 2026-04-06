import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_ITEMS, RARITY_COLORS, TYPE_ICONS } from '@/data/compendium/items'

export const metadata: Metadata = {
  title: 'Items y Armas — Compendio RPG | RolHub',
  description: 'Explora el catálogo completo de items, armas, armaduras, pociones y artefactos de RolHub. Desde el Anillo Único hasta lightsabers, cada item con stats y descripción.',
  keywords: ['items RPG', 'armas D&D', 'artefactos mágicos', 'equipment RPG', 'magic items', 'weapons'],
  alternates: { canonical: 'https://rol-hub.com/compendio/items' },
}

export default function ItemsPage() {
  const lores = [...new Set(ALL_ITEMS.map(i => i.lore))]

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto content-wrapper">
        <h1 className="font-title text-3xl md:text-5xl text-gold-bright text-center mb-2">Items y Armas</h1>
        <p className="font-body text-sm md:text-base text-parchment/70 text-center mb-8 max-w-2xl mx-auto">
          Armas legendarias, armaduras encantadas, pociones mágicas y artefactos únicos de cada mundo.
        </p>

        {lores.map(lore => {
          const items = ALL_ITEMS.filter(i => i.lore === lore)
          const loreName = items[0]?.loreName || lore
          return (
            <section key={lore} className="mb-10">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-4 border-b border-gold-dim/20 pb-2">{loreName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <Link key={item.slug} href={`/compendio/items/${item.slug}`}
                    className="glass-panel rounded-lg p-4 hover:scale-[1.02] transition-all group border border-transparent hover:border-gold-dim/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-lg mr-2">{TYPE_ICONS[item.type] || '📦'}</span>
                        <h3 className="font-heading text-base text-parchment inline group-hover:text-gold-bright transition">{item.name}</h3>
                      </div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${RARITY_COLORS[item.rarity] || 'text-parchment/50'}`}>{item.rarity}</span>
                    </div>
                    <p className="font-body text-xs text-parchment/60 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex gap-3 font-mono text-[10px] text-parchment/40">
                      <span>{item.type}</span>
                      {item.damage && <span>{item.damage}</span>}
                      {item.ac && <span>AC {item.ac}</span>}
                      <span>{item.value}</span>
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
