import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ALL_LOCATIONS, getLocationBySlug } from '@/data/compendium/locations'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return ALL_LOCATIONS.map(l => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loc = getLocationBySlug(slug)
  if (!loc) return { title: 'Locación no encontrada' }
  return {
    title: `${loc.name} — ${loc.loreName} | Locaciones RolHub`,
    description: `${loc.name}: ${loc.description.substring(0, 155)}...`,
    keywords: [loc.name, loc.type, loc.loreName, 'RPG location', ...loc.tags],
    alternates: { canonical: `https://rol-hub.com/compendio/locaciones/${loc.slug}` },
  }
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params
  const loc = getLocationBySlug(slug)
  if (!loc) notFound()

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto content-wrapper">
        <nav className="font-ui text-xs text-parchment/40 mb-4">
          <Link href="/compendio/locaciones" className="hover:text-gold transition">Locaciones</Link>
          <span className="mx-2">›</span>
          <span className="text-parchment/70">{loc.name}</span>
        </nav>

        <div className="glass-panel-dark rounded-lg p-6 md:p-8 border border-gold-dim/30 mb-6">
          <h1 className="font-title text-2xl md:text-4xl text-gold-bright mb-1">{loc.name}</h1>
          <p className="font-ui text-sm text-parchment/50 mb-4">{loc.type} — {loc.loreName} — Peligro: {'⚔️'.repeat(loc.dangerLevel)}</p>

          <p className="font-body text-sm md:text-base text-parchment/80 leading-relaxed mb-5">{loc.description}</p>

          {loc.features.length > 0 && (
            <div className="mb-4">
              <h2 className="font-heading text-base text-gold mb-2">Características</h2>
              <ul className="space-y-1">
                {loc.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-gold">•</span><span className="font-body text-sm text-parchment/80">{f}</span></li>
                ))}
              </ul>
            </div>
          )}

          {loc.npcs.length > 0 && (
            <div className="mb-4">
              <h2 className="font-heading text-base text-gold mb-2">NPCs Notables</h2>
              <div className="flex flex-wrap gap-2">
                {loc.npcs.map(npc => (
                  <span key={npc} className="px-2 py-1 rounded bg-shadow border border-gold-dim/20 font-ui text-xs text-parchment/70">{npc}</span>
                ))}
              </div>
            </div>
          )}

          {loc.quests.length > 0 && (
            <div className="mb-4">
              <h2 className="font-heading text-base text-gold mb-2">Misiones Disponibles</h2>
              <ul className="space-y-1">
                {loc.quests.map((q, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-emerald">📜</span><span className="font-body text-sm text-parchment/80">{q}</span></li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {loc.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-ui text-gold-dim border border-gold-dim/30 bg-shadow">{tag}</span>
            ))}
          </div>
        </div>

        <Link href="/compendio/locaciones" className="font-ui text-sm text-gold hover:text-gold-bright transition">← Volver a Locaciones</Link>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Place', name: loc.name,
          description: loc.description, url: `https://rol-hub.com/compendio/locaciones/${loc.slug}`,
        })}} />
      </div>
    </div>
  )
}
