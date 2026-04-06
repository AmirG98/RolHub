import Link from 'next/link'
import { ALL_BEASTS } from '@/data/bestiary'

export default function CompendiumPage() {
  return (
    <div className="min-h-screen particle-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto content-wrapper">
        <h1 className="font-title text-3xl md:text-4xl text-gold-bright text-center mb-2">
          Compendio
        </h1>
        <p className="font-body text-sm text-parchment/70 text-center mb-8">
          Explora monstruos, items, hechizos y locaciones de tus mundos favoritos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link
            href="/compendio/bestias"
            className="glass-panel rounded-lg p-6 hover:scale-[1.03] transition-all border border-transparent hover:border-gold-dim/30 text-center group"
          >
            <div className="text-4xl mb-3">🐉</div>
            <h2 className="font-heading text-lg text-parchment group-hover:text-gold-bright transition mb-1">Bestiario</h2>
            <p className="font-ui text-xs text-parchment/50">{ALL_BEASTS.length} criaturas con stats D&D 5e</p>
          </Link>

          <div className="glass-panel rounded-lg p-6 opacity-40 text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <h2 className="font-heading text-lg text-parchment mb-1">Items y Armas</h2>
            <p className="font-ui text-xs text-parchment/50">Próximamente</p>
          </div>

          <div className="glass-panel rounded-lg p-6 opacity-40 text-center">
            <div className="text-4xl mb-3">✨</div>
            <h2 className="font-heading text-lg text-parchment mb-1">Hechizos</h2>
            <p className="font-ui text-xs text-parchment/50">Próximamente</p>
          </div>

          <div className="glass-panel rounded-lg p-6 opacity-40 text-center">
            <div className="text-4xl mb-3">🏰</div>
            <h2 className="font-heading text-lg text-parchment mb-1">Locaciones</h2>
            <p className="font-ui text-xs text-parchment/50">Próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
