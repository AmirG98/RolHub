import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ALL_ITEMS, getItemBySlug, RARITY_COLORS, TYPE_ICONS } from '@/data/compendium/items'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return ALL_ITEMS.map(item => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = getItemBySlug(slug)
  if (!item) return { title: 'Item no encontrado' }
  return {
    title: `${item.name} — ${item.loreName} | Items RolHub`,
    description: `${item.name}: ${item.description.substring(0, 155)}...`,
    keywords: [item.name, item.type, item.rarity, item.loreName, 'RPG item', ...item.tags],
    alternates: { canonical: `https://rol-hub.com/compendio/items/${item.slug}` },
  }
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params
  const item = getItemBySlug(slug)
  if (!item) notFound()

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto content-wrapper">
        <nav className="font-ui text-xs text-parchment/40 mb-4">
          <Link href="/compendio/items" className="hover:text-gold transition">Items</Link>
          <span className="mx-2">›</span>
          <span className="text-parchment/70">{item.name}</span>
        </nav>

        <div className="glass-panel-dark rounded-lg p-6 md:p-8 border border-gold-dim/30 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-2xl mr-2">{TYPE_ICONS[item.type] || '📦'}</span>
              <h1 className="font-title text-2xl md:text-4xl text-gold-bright inline">{item.name}</h1>
              <p className="font-ui text-sm text-parchment/50 mt-1">{item.type} — {item.loreName}</p>
            </div>
            <span className={`font-heading text-sm px-3 py-1 rounded-lg border ${RARITY_COLORS[item.rarity] || ''}`}>{item.rarity}</span>
          </div>

          <div className="flex gap-6 mb-4 font-ui text-sm">
            {item.damage && <div><span className="text-parchment/50">Daño</span> <span className="text-blood font-heading">{item.damage}</span></div>}
            {item.ac && <div><span className="text-parchment/50">AC</span> <span className="text-gold font-heading">{item.ac}</span></div>}
            <div><span className="text-parchment/50">Peso</span> <span className="text-parchment font-heading">{item.weight}</span></div>
            <div><span className="text-parchment/50">Valor</span> <span className="text-gold font-heading">{item.value}</span></div>
          </div>

          <p className="font-body text-sm md:text-base text-parchment/80 leading-relaxed mb-5">{item.description}</p>

          <div className="mb-4">
            <h2 className="font-heading text-base text-gold mb-2">Propiedades</h2>
            <ul className="space-y-2">
              {item.properties.map((prop, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  <span className="font-body text-sm text-parchment/80">{prop}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-ui text-gold-dim border border-gold-dim/30 bg-shadow">{tag}</span>
            ))}
          </div>
        </div>

        <Link href="/compendio/items" className="font-ui text-sm text-gold hover:text-gold-bright transition">← Volver a Items</Link>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article', name: item.name,
          description: item.description, url: `https://rol-hub.com/compendio/items/${item.slug}`,
        })}} />
      </div>
    </div>
  )
}
