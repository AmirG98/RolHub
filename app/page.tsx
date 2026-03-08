import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center particle-bg px-4 py-8">
      <div className="max-w-4xl mx-auto text-center content-wrapper">
        {/* Hero Content */}
        <div className="glass-panel-dark rounded-lg p-6 md:p-12 glow-effect">
          <h1 className="font-title text-4xl sm:text-5xl md:text-7xl mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold-bright via-gold to-gold-dim animate-pulse">
            RPG HUB
          </h1>
          <p className="font-heading text-lg md:text-2xl text-gold mb-2 md:mb-4">
            Narrador / Game Master Autónomo
          </p>
          <p className="font-body text-sm md:text-lg text-parchment/80 mb-1 md:mb-2 max-w-2xl mx-auto">
            Sistema completo de juego de rol para cualquier nivel
          </p>
          <p className="font-body text-xs md:text-base text-parchment/60 mb-6 md:mb-8 max-w-2xl mx-auto">
            Embárcate en aventuras épicas en mundos infinitos. Desde la Tierra Media hasta galaxias lejanas,
            tu historia se escribe en tiempo real con un narrador IA que nunca duerme.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <RunicButton variant="primary" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4 glow-effect">
                Comenzar Aventura
              </RunicButton>
            </Link>
            <Link href="/design-system" className="w-full sm:w-auto">
              <RunicButton variant="secondary" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                Explorar Mundos
              </RunicButton>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-gold border border-gold/30">
              🏰 Fantasy
            </span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-neon-blue border border-neon-blue/30">
              🚀 Sci-Fi
            </span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-neon-purple border border-neon-purple/30">
              🧙 Magia
            </span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-blood border border-blood/30">
              🧟 Zombies
            </span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-neon-green border border-neon-green/30">
              🌆 Cyberpunk
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:mt-8">
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="font-title text-xl md:text-3xl text-gold-bright">∞</div>
            <div className="font-ui text-[10px] md:text-sm text-parchment/60">Mundos</div>
          </div>
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="font-title text-xl md:text-3xl text-neon-blue">24/7</div>
            <div className="font-ui text-[10px] md:text-sm text-parchment/60">Disponible</div>
          </div>
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="font-title text-xl md:text-3xl text-neon-purple">AI</div>
            <div className="font-ui text-[10px] md:text-sm text-parchment/60">Powered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
