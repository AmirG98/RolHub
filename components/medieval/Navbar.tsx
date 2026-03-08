'use client'

import { useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { RunicButton } from './RunicButton'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const { isSignedIn } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-parchment hover:text-gold transition"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
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
                  Campañas
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/characters" className="font-heading text-sm lg:text-base text-parchment hover:text-neon-blue transition relative group">
                  Personajes
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/compendium" className="font-heading text-sm lg:text-base text-parchment hover:text-neon-purple transition relative group">
                  Compendio
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-purple group-hover:w-full transition-all"></span>
                </Link>
                <UserButton />
              </>
            ) : (
              <div className="flex gap-2 lg:gap-4">
                <Link href="/login">
                  <RunicButton variant="secondary" className="text-sm px-3 py-1.5 lg:px-4 lg:py-2">Iniciar Sesión</RunicButton>
                </Link>
                <Link href="/register">
                  <RunicButton variant="primary" className="text-sm px-3 py-1.5 lg:px-4 lg:py-2">Registrarse</RunicButton>
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
                    📚 Campañas
                  </Link>
                  <Link
                    href="/characters"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-heading text-parchment hover:text-neon-blue transition py-2"
                  >
                    ⚔️ Personajes
                  </Link>
                  <Link
                    href="/compendium"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-heading text-parchment hover:text-neon-purple transition py-2"
                  >
                    📖 Compendio
                  </Link>
                  <div className="pt-2 border-t border-gold/20">
                    <UserButton />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2 border-t border-gold/20">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <RunicButton variant="secondary" className="w-full">Iniciar Sesión</RunicButton>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <RunicButton variant="primary" className="w-full">Registrarse</RunicButton>
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
