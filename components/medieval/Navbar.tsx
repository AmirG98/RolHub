'use client'

import { useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { RunicButton } from './RunicButton'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useTranslations } from '@/lib/i18n'
import { Menu, X, HelpCircle } from 'lucide-react'

export function Navbar() {
  const { isSignedIn } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations()

  return (
    <nav className="glass-panel-dark border-b border-gold/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-title text-xl md:text-2xl text-gold hover:text-gold-bright transition glow-effect-on-hover group">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-bright via-gold to-gold-dim group-hover:from-gold to-gold-bright transition-all">
              RPG HUB
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-parchment hover:text-gold transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/guias" className="font-heading text-sm lg:text-base text-parchment hover:text-emerald transition relative group flex items-center gap-1">
              <HelpCircle size={16} />
              Guias
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/dados" className="font-heading text-sm lg:text-base text-parchment hover:text-gold transition relative group">
              🎲 Dados
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/hoja-personaje" className="font-heading text-sm lg:text-base text-parchment hover:text-neon-blue transition relative group">
              📜 Hoja
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue group-hover:w-full transition-all"></span>
            </Link>

            {isSignedIn ? (
              <>
                <Link href="/campaigns" className="font-heading text-sm lg:text-base text-parchment hover:text-gold transition relative group">
                  {t.nav.campaigns}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/characters" className="font-heading text-sm lg:text-base text-parchment hover:text-neon-blue transition relative group">
                  {t.nav.characters}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/compendium" className="font-heading text-sm lg:text-base text-parchment hover:text-neon-purple transition relative group">
                  {t.nav.compendium}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-purple group-hover:w-full transition-all"></span>
                </Link>
                <LanguageToggle />
                <UserButton />
              </>
            ) : (
              <div className="flex items-center gap-2 lg:gap-4">
                <LanguageToggle />
                <Link href="/login">
                  <RunicButton variant="secondary" className="text-sm px-3 py-1.5 lg:px-4 lg:py-2">{t.nav.login}</RunicButton>
                </Link>
                <Link href="/register">
                  <RunicButton variant="primary" className="text-sm px-3 py-1.5 lg:px-4 lg:py-2">{t.nav.register}</RunicButton>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gold/20 pt-4 space-y-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/guias"
                onClick={() => setIsMenuOpen(false)}
                className="font-heading text-parchment hover:text-emerald transition py-2 flex items-center gap-2"
              >
                <HelpCircle size={18} /> Guias para Jugar
              </Link>
              <Link
                href="/dados"
                onClick={() => setIsMenuOpen(false)}
                className="font-heading text-parchment hover:text-gold transition py-2"
              >
                🎲 Dados
              </Link>
              <Link
                href="/hoja-personaje"
                onClick={() => setIsMenuOpen(false)}
                className="font-heading text-parchment hover:text-neon-blue transition py-2"
              >
                📜 Hoja de Personaje
              </Link>

              {isSignedIn ? (
                <>
                  <Link
                    href="/campaigns"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-heading text-parchment hover:text-gold transition py-2"
                  >
                    📚 {t.nav.campaigns}
                  </Link>
                  <Link
                    href="/characters"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-heading text-parchment hover:text-neon-blue transition py-2"
                  >
                    ⚔️ {t.nav.characters}
                  </Link>
                  <Link
                    href="/compendium"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-heading text-parchment hover:text-neon-purple transition py-2"
                  >
                    📖 {t.nav.compendium}
                  </Link>
                  <div className="pt-2 border-t border-gold/20">
                    <UserButton />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2 border-t border-gold/20">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <RunicButton variant="secondary" className="w-full">{t.nav.login}</RunicButton>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <RunicButton variant="primary" className="w-full">{t.nav.register}</RunicButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
