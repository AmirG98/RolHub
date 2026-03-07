'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { RunicButton } from './RunicButton'

export function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="glass-panel-dark border-b border-gold/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-title text-2xl text-gold hover:text-gold-bright transition glow-effect-on-hover group">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-bright via-gold to-gold-dim group-hover:from-gold to-gold-bright transition-all">
            RPG HUB
          </span>
        </Link>

        {isSignedIn ? (
          <div className="flex items-center gap-6">
            <Link href="/campaigns" className="font-heading text-parchment hover:text-gold transition relative group">
              Campañas
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/characters" className="font-heading text-parchment hover:text-neon-blue transition relative group">
              Personajes
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/compendium" className="font-heading text-parchment hover:text-neon-purple transition relative group">
              Compendio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-purple group-hover:w-full transition-all"></span>
            </Link>
            <UserButton />
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <RunicButton variant="secondary">Iniciar Sesión</RunicButton>
            </Link>
            <Link href="/register">
              <RunicButton variant="primary">Registrarse</RunicButton>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
