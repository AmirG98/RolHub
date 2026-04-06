import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ALL_BEASTS, getBeastBySlug, LORE_COLORS } from '@/data/bestiary'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ALL_BEASTS.map(beast => ({ slug: beast.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const beast = getBeastBySlug(slug)
  if (!beast) return { title: 'Criatura no encontrada' }

  return {
    title: `${beast.name} — ${beast.loreName} | Bestiario RolHub`,
    description: `${beast.name}: ${beast.description.substring(0, 155)}...`,
    keywords: [beast.name, beast.type, beast.loreName, 'RPG monster', 'D&D 5e stats', ...beast.tags],
    alternates: { canonical: `https://rol-hub.com/compendio/bestias/${beast.slug}` },
    openGraph: {
      title: `${beast.name} — CR ${beast.cr} | Bestiario RolHub`,
      description: beast.description.substring(0, 200),
      type: 'article',
    },
  }
}

function StatBlock({ label, value }: { label: string; value: number }) {
  const mod = Math.floor((value - 10) / 2)
  return (
    <div className="text-center">
      <div className="font-ui text-[10px] text-gold-dim uppercase">{label}</div>
      <div className="font-heading text-lg text-parchment">{value}</div>
      <div className="font-mono text-xs text-gold">{mod >= 0 ? `+${mod}` : mod}</div>
    </div>
  )
}

export default async function BeastPage({ params }: Props) {
  const { slug } = await params
  const beast = getBeastBySlug(slug)

  if (!beast) notFound()

  const colorClass = LORE_COLORS[beast.lore] || 'text-gold'

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto content-wrapper">
        {/* Breadcrumb */}
        <nav className="font-ui text-xs text-parchment/40 mb-4">
          <Link href="/compendio/bestias" className="hover:text-gold transition">Bestiario</Link>
          <span className="mx-2">›</span>
          <span className={colorClass}>{beast.loreName}</span>
          <span className="mx-2">›</span>
          <span className="text-parchment/70">{beast.name}</span>
        </nav>

        {/* Header */}
        <div className="glass-panel-dark rounded-lg p-6 md:p-8 border border-gold-dim/30 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-title text-2xl md:text-4xl text-gold-bright mb-1">{beast.name}</h1>
              <p className="font-ui text-sm text-parchment/50">
                {beast.type} — <span className={colorClass}>{beast.loreName}</span>
              </p>
            </div>
            <div className="text-center glass-panel rounded-lg px-4 py-2 border border-gold-dim/30">
              <div className="font-ui text-[10px] text-gold-dim uppercase">CR</div>
              <div className="font-title text-2xl text-gold-bright">{beast.cr}</div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 mb-4 font-ui text-sm">
            <div><span className="text-parchment/50">HP</span> <span className="text-blood font-heading">{beast.hp}</span></div>
            <div><span className="text-parchment/50">AC</span> <span className="text-gold font-heading">{beast.ac}</span></div>
            <div><span className="text-parchment/50">Speed</span> <span className="text-parchment font-heading">{beast.speed}</span></div>
          </div>

          {/* Ability scores */}
          <div className="grid grid-cols-6 gap-2 p-3 rounded-lg bg-shadow border border-gold-dim/20 mb-5">
            <StatBlock label="STR" value={beast.stats.STR} />
            <StatBlock label="DEX" value={beast.stats.DEX} />
            <StatBlock label="CON" value={beast.stats.CON} />
            <StatBlock label="INT" value={beast.stats.INT} />
            <StatBlock label="WIS" value={beast.stats.WIS} />
            <StatBlock label="CHA" value={beast.stats.CHA} />
          </div>

          {/* Description */}
          <p className="font-body text-sm md:text-base text-parchment/80 leading-relaxed mb-5">
            {beast.description}
          </p>

          {/* Abilities */}
          <div className="mb-4">
            <h2 className="font-heading text-base text-gold mb-2">Habilidades</h2>
            <ul className="space-y-2">
              {beast.abilities.map((ability, i) => {
                const [name, ...rest] = ability.split(':')
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">•</span>
                    <span className="font-body text-sm text-parchment/80">
                      <strong className="text-parchment">{name}</strong>{rest.length > 0 ? `:${rest.join(':')}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {beast.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-ui text-gold-dim border border-gold-dim/30 bg-shadow">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/compendio/bestias" className="font-ui text-sm text-gold hover:text-gold-bright transition">
            ← Volver al Bestiario
          </Link>
        </div>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              name: beast.name,
              headline: `${beast.name} — Bestiario RPG`,
              description: beast.description,
              url: `https://rol-hub.com/compendio/bestias/${beast.slug}`,
              author: { '@type': 'Organization', name: 'RolHub' },
            }),
          }}
        />
      </div>
    </div>
  )
}
