import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_SPELLS } from '@/data/compendium/spells'

export const metadata: Metadata = {
  title: 'Hechizos y Habilidades — Compendio RPG | RolHub',
  description: 'Catálogo completo de hechizos, trucos y habilidades especiales de RolHub. Desde Bola de Fuego hasta trucos mentales Vael, cada hechizo con mecánicas detalladas.',
  keywords: ['hechizos RPG', 'spells D&D', 'magic spells', 'force powers', 'habilidades RPG'],
  alternates: { canonical: 'https://rol-hub.com/compendio/hechizos' },
}

const SCHOOL_ICONS: Record<string, string> = {
  'Evocación': '🔥', 'Necromancia': '💀', 'Ilusión': '🌀', 'Curación': '💚',
  'Abjuración': '🛡️', 'Transmutación': '✨', 'Conjuración': '🌟', 'Adivinación': '👁️',
  'Supervivencia': '🏕️', 'Táctico': '🎯', 'Fuerza': '⚡', 'Lado Oscuro': '🔴',
  'Hackeo': '💻', 'Cibernético': '🤖', 'Ritual': '📿', 'Rúnico': '᛭',
}

export default function SpellsPage() {
  const lores = [...new Set(ALL_SPELLS.map(s => s.lore))]

  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto content-wrapper">
        <h1 className="font-title text-3xl md:text-5xl text-gold-bright text-center mb-2">Hechizos y Habilidades</h1>
        <p className="font-body text-sm md:text-base text-parchment/70 text-center mb-8 max-w-2xl mx-auto">
          Hechizos mágicos, poderes de la Corriente, hacks cibernéticos, rituales oscuros y habilidades de supervivencia.
        </p>

        {lores.map(lore => {
          const spells = ALL_SPELLS.filter(s => s.lore === lore)
          const loreName = spells[0]?.loreName || lore
          return (
            <section key={lore} className="mb-10">
              <h2 className="font-heading text-xl md:text-2xl text-gold mb-4 border-b border-gold-dim/20 pb-2">{loreName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spells.map(spell => (
                  <Link key={spell.slug} href={`/compendio/hechizos/${spell.slug}`}
                    className="glass-panel rounded-lg p-4 hover:scale-[1.02] transition-all group border border-transparent hover:border-gold-dim/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-lg mr-2">{SCHOOL_ICONS[spell.school] || '✨'}</span>
                        <h3 className="font-heading text-base text-parchment inline group-hover:text-gold-bright transition">{spell.name}</h3>
                      </div>
                      <span className="font-mono text-xs text-gold-dim bg-shadow px-2 py-0.5 rounded">
                        {spell.level === 0 ? 'Truco' : `Nv.${spell.level}`}
                      </span>
                    </div>
                    <p className="font-body text-xs text-parchment/60 line-clamp-2 mb-2">{spell.description}</p>
                    <div className="flex gap-3 font-mono text-[10px] text-parchment/40">
                      <span>{spell.school}</span>
                      <span>{spell.range}</span>
                      <span>{spell.duration}</span>
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
