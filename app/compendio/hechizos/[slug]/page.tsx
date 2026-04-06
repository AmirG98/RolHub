import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ALL_SPELLS, getSpellBySlug } from '@/data/compendium/spells'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return ALL_SPELLS.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const spell = getSpellBySlug(slug)
  if (!spell) return { title: 'Hechizo no encontrado' }
  return {
    title: `${spell.name} — ${spell.loreName} | Hechizos RolHub`,
    description: `${spell.name}: ${spell.description.substring(0, 155)}...`,
    keywords: [spell.name, spell.school, spell.loreName, 'RPG spell', ...spell.tags],
    alternates: { canonical: `https://rol-hub.com/compendio/hechizos/${spell.slug}` },
  }
}

export default async function SpellPage({ params }: Props) {
  const { slug } = await params
  const spell = getSpellBySlug(slug)
  if (!spell) notFound()

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto content-wrapper">
        <nav className="font-ui text-xs text-parchment/40 mb-4">
          <Link href="/compendio/hechizos" className="hover:text-gold transition">Hechizos</Link>
          <span className="mx-2">›</span>
          <span className="text-parchment/70">{spell.name}</span>
        </nav>

        <div className="glass-panel-dark rounded-lg p-6 md:p-8 border border-gold-dim/30 mb-6">
          <h1 className="font-title text-2xl md:text-4xl text-gold-bright mb-1">{spell.name}</h1>
          <p className="font-ui text-sm text-parchment/50 mb-4">{spell.school} — {spell.loreName}</p>

          <div className="flex flex-wrap gap-4 mb-4 font-ui text-sm">
            <div><span className="text-parchment/50">Nivel</span> <span className="text-gold font-heading">{spell.level === 0 ? 'Truco' : spell.level}</span></div>
            <div><span className="text-parchment/50">Lanzamiento</span> <span className="text-parchment font-heading">{spell.castingTime}</span></div>
            <div><span className="text-parchment/50">Alcance</span> <span className="text-parchment font-heading">{spell.range}</span></div>
            <div><span className="text-parchment/50">Duración</span> <span className="text-parchment font-heading">{spell.duration}</span></div>
            {spell.damage && <div><span className="text-parchment/50">Daño</span> <span className="text-blood font-heading">{spell.damage}</span></div>}
          </div>

          <p className="font-body text-sm md:text-base text-parchment/80 leading-relaxed mb-5">{spell.description}</p>

          <div className="mb-4">
            <h2 className="font-heading text-base text-gold mb-2">Efectos</h2>
            <ul className="space-y-2">
              {spell.effects.map((effect, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span className="font-body text-sm text-parchment/80">{effect}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {spell.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-ui text-gold-dim border border-gold-dim/30 bg-shadow">{tag}</span>
            ))}
          </div>
        </div>

        <Link href="/compendio/hechizos" className="font-ui text-sm text-gold hover:text-gold-bright transition">← Volver a Hechizos</Link>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article', name: spell.name,
          description: spell.description, url: `https://rol-hub.com/compendio/hechizos/${spell.slug}`,
        })}} />
      </div>
    </div>
  )
}
