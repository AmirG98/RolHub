import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_BEASTS, LORE_COLORS } from '@/data/bestiary'

export const metadata: Metadata = {
  title: 'Bestiario — Criaturas y Monstruos de RPG | RolHub',
  description: 'Explora el bestiario completo de RolHub: trolls, dragones, zombies, criaturas nórdicas, monstruos lovecraftianos y más. Stats D&D 5e, habilidades y descripciones detalladas.',
  keywords: ['bestiario RPG', 'monstruos D&D', 'criaturas fantásticas', 'bestiary', 'D&D monsters', 'creature stats'],
  alternates: { canonical: 'https://rol-hub.com/compendio/bestias' },
  openGraph: {
    title: 'Bestiario RPG — Criaturas y Monstruos | RolHub',
    description: 'Todas las criaturas del universo RolHub con stats D&D 5e.',
    type: 'website',
  },
}

const TYPE_ICONS: Record<string, string> = {
  'Bestia': '🐺', 'No-muerto': '💀', 'Demonio': '🔥', 'Gigante': '🗿',
  'Dragón': '🐉', 'Humanoide': '👤', 'Aberración': '👁️', 'Ooze': '🫧',
  'Constructo': '🤖', 'Dragón/Bestia': '🐍', 'Celestial/Bestia': '🐺',
}

export default function BestiaryPage() {
  const lores = [...new Set(ALL_BEASTS.map(b => b.lore))]

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto content-wrapper">
        <h1 className="font-title text-3xl md:text-5xl text-gold-bright text-center mb-2">
          Bestiario
        </h1>
        <p className="font-body text-sm md:text-base text-parchment/70 text-center mb-8 max-w-2xl mx-auto">
          Todas las criaturas y monstruos del universo RolHub. Cada entrada incluye stats compatibles con D&D 5e, habilidades especiales y descripción detallada.
        </p>

        {/* Stats rápidos */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <p className="font-title text-2xl text-gold-bright">{ALL_BEASTS.length}</p>
            <p className="font-ui text-xs text-parchment/50">Criaturas</p>
          </div>
          <div className="text-center">
            <p className="font-title text-2xl text-gold-bright">{lores.length}</p>
            <p className="font-ui text-xs text-parchment/50">Mundos</p>
          </div>
          <div className="text-center">
            <p className="font-title text-2xl text-gold-bright">CR ¼–20</p>
            <p className="font-ui text-xs text-parchment/50">Dificultad</p>
          </div>
        </div>

        {/* Grid de bestias agrupadas por lore */}
        {lores.map(lore => {
          const beasts = ALL_BEASTS.filter(b => b.lore === lore)
          const loreName = beasts[0]?.loreName || lore
          const colorClass = LORE_COLORS[lore] || 'text-gold'

          return (
            <section key={lore} className="mb-10">
              <h2 className={`font-heading text-xl md:text-2xl ${colorClass} mb-4 border-b border-gold-dim/20 pb-2`}>
                {loreName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {beasts.map(beast => (
                  <Link
                    key={beast.slug}
                    href={`/compendio/bestias/${beast.slug}`}
                    className="glass-panel rounded-lg p-4 hover:scale-[1.02] transition-all group border border-transparent hover:border-gold-dim/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-lg mr-2">{TYPE_ICONS[beast.type] || '❓'}</span>
                        <h3 className="font-heading text-base text-parchment inline group-hover:text-gold-bright transition">
                          {beast.name}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-gold-dim bg-shadow px-2 py-0.5 rounded">
                        CR {beast.cr}
                      </span>
                    </div>
                    <p className="font-body text-xs text-parchment/60 line-clamp-2 mb-2">
                      {beast.description}
                    </p>
                    <div className="flex gap-3 font-mono text-[10px] text-parchment/40">
                      <span>HP {beast.hp}</span>
                      <span>AC {beast.ac}</span>
                      <span>{beast.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Bestiario RPG — RolHub',
              description: 'Colección completa de criaturas y monstruos para juegos de rol.',
              url: 'https://rol-hub.com/compendio/bestias',
              numberOfItems: ALL_BEASTS.length,
            }),
          }}
        />
      </div>
    </div>
  )
}
