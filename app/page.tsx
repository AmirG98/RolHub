'use client'

import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'

export default function HomePage() {
  const t = useTranslations()

  return (
    <div className="min-h-[85vh] flex items-center justify-center particle-bg px-4 py-8">
      <div className="max-w-4xl mx-auto text-center content-wrapper">
        {/* Hero Content */}
        <div className="glass-panel-dark rounded-lg p-6 md:p-12 glow-effect">
          <h1 className="font-title text-4xl sm:text-5xl md:text-7xl mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gold-bright via-gold to-gold-dim animate-pulse">
            ROL HUB
          </h1>
          <p className="font-heading text-lg md:text-2xl text-gold mb-2 md:mb-4">
            {t.homeExtras.narrator}
          </p>
          <p className="font-body text-sm md:text-lg text-parchment/80 mb-1 md:mb-2 max-w-2xl mx-auto">
            {t.homeExtras.systemComplete}
          </p>
          <p className="font-body text-xs md:text-base text-parchment/60 mb-6 md:mb-8 max-w-2xl mx-auto">
            {t.homeExtras.epicAdventures}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6 md:mb-8">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <RunicButton variant="primary" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4 glow-effect">
                {t.home.startAdventure}
              </RunicButton>
            </Link>
            <Link href="/play-guest" className="w-full sm:w-auto">
              <RunicButton variant="secondary" className="w-full sm:w-auto text-sm md:text-base px-5 md:px-6 py-2 md:py-3">
                ⚔️ {t.homeExtras.playGuest}
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
              🧙 {t.lores.ISEKAI.name}
            </span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-blood border border-blood/30">
              🧟 Zombies
            </span>
            <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-neon-green border border-neon-green/30">
              🌆 Cyberpunk
            </span>
          </div>

          {/* Help link */}
          <div className="mt-6">
            <Link href="/guias" className="inline-flex items-center gap-2 font-ui text-sm text-emerald hover:text-emerald/80 transition">
              <span className="text-lg">❓</span>
              {t.homeExtras.firstTime}
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:mt-8">
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="font-title text-xl md:text-3xl text-gold-bright">∞</div>
            <div className="font-ui text-[10px] md:text-sm text-parchment/60">{t.homeExtras.worlds}</div>
          </div>
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="font-title text-xl md:text-3xl text-neon-blue">24/7</div>
            <div className="font-ui text-[10px] md:text-sm text-parchment/60">{t.homeExtras.available}</div>
          </div>
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="font-title text-xl md:text-3xl text-neon-purple">AI</div>
            <div className="font-ui text-[10px] md:text-sm text-parchment/60">{t.homeExtras.powered}</div>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 mt-10 font-ui text-sm text-parchment/50">
          <Link href="/privacy" className="hover:text-gold transition">{t.homeExtras.privacy}</Link>
          <span className="text-gold-dim/30">|</span>
          <Link href="/terms" className="hover:text-gold transition">{t.homeExtras.terms}</Link>
        </div>
      </div>
    </div>
  );
}
