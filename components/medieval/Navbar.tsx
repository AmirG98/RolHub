'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { RunicButton } from './RunicButton'

export function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="border-b border-gold-dim bg-shadow-mid/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-title text-2xl text-gold hover:text-gold-bright transition">
          RPG HUB
        </Link>

        {isSignedIn ? (
          <div className="flex items-center gap-6">
            <Link href="/campaigns" className="font-heading text-parchment hover:text-gold transition">
              Campañas
            </Link>
            <Link href="/characters" className="font-heading text-parchment hover:text-gold transition">
              Personajes
            </Link>
            <Link href="/compendium" className="font-heading text-parchment hover:text-gold transition">
              Compendio
            </Link>
            <UserButton afterSignOutUrl="/" />
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
