import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center particle-bg">
      <div className="max-w-4xl mx-auto text-center content-wrapper">
        {/* Hero Content */}
        <div className="glass-panel-dark rounded-lg p-12 glow-effect">
          <h1 className="font-title text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold-bright via-gold to-gold-dim animate-pulse">
            RPG HUB
          </h1>
          <p className="font-heading text-2xl text-gold mb-4">
            Narrador / Game Master Autónomo
          </p>
          <p className="font-body text-lg text-parchment/80 mb-2 max-w-2xl mx-auto">
            Sistema completo de juego de rol para cualquier nivel
          </p>
          <p className="font-body text-base text-parchment/60 mb-8 max-w-2xl mx-auto">
            Embárcate en aventuras épicas en mundos infinitos. Desde la Tierra Media hasta galaxias lejanas,
            tu historia se escribe en tiempo real con un narrador IA que nunca duerme.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <Link href="/onboarding">
              <RunicButton variant="primary" className="text-lg px-8 py-4 glow-effect">
                Comenzar Aventura
              </RunicButton>
            </Link>
            <Link href="/design-system">
              <RunicButton variant="secondary" className="text-lg px-8 py-4">
                Explorar Mundos
              </RunicButton>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex gap-3 justify-center flex-wrap">
            <span className="px-4 py-2 rounded-full glass-panel text-sm font-ui text-gold border border-gold/30">
              🏰 Medieval Fantasy
            </span>
            <span className="px-4 py-2 rounded-full glass-panel text-sm font-ui text-neon-blue border border-neon-blue/30">
              🚀 Sci-Fi
            </span>
            <span className="px-4 py-2 rounded-full glass-panel text-sm font-ui text-neon-purple border border-neon-purple/30">
              🧙 Magia & Hechicería
            </span>
            <span className="px-4 py-2 rounded-full glass-panel text-sm font-ui text-blood border border-blood/30">
              🧟 Post-Apocalíptico
            </span>
            <span className="px-4 py-2 rounded-full glass-panel text-sm font-ui text-neon-green border border-neon-green/30">
              🌆 Cyberpunk
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="glass-panel rounded-lg p-4">
            <div className="font-title text-3xl text-gold-bright">∞</div>
            <div className="font-ui text-sm text-parchment/60">Mundos Disponibles</div>
          </div>
          <div className="glass-panel rounded-lg p-4">
            <div className="font-title text-3xl text-neon-blue">24/7</div>
            <div className="font-ui text-sm text-parchment/60">Narrador Disponible</div>
          </div>
          <div className="glass-panel rounded-lg p-4">
            <div className="font-title text-3xl text-neon-purple">AI</div>
            <div className="font-ui text-sm text-parchment/60">Powered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
