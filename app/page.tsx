'use client'

import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'

// Los 3 lores soportados por el guest flow. Si el usuario NO está logueado y
// clickea un pill, lo enviamos a /play-guest?lore=X solo si está en esta lista.
// Los otros caen a /play-guest sin pre-selección (muestra los 3 guest por default).
const GUEST_LORE_IDS = new Set(['LOTR', 'ZOMBIES', 'DND_CLASSIC'])

// Los 10 lores del catálogo. Estilo visual unificado (paleta dorada) — cada uno
// linkea a /onboarding con el lore pre-seleccionado en el flow.
const FEATURED_LORES = [
  { id: 'LOTR',             icon: '🏰' },
  { id: 'ZOMBIES',          icon: '☠️' },
  { id: 'VIKINGOS',         icon: '⚔️' },
  { id: 'ISEKAI',           icon: '⭐' },
  { id: 'STAR_WARS',        icon: '🚀' },
  { id: 'CYBERPUNK',        icon: '🏙️' },
  { id: 'LOVECRAFT_HORROR', icon: '👁️' },
  { id: 'DND_CLASSIC',      icon: '🐉' },
  { id: 'ROMANTASY',        icon: '🌹' },
  { id: 'COZY_WITCH',       icon: '🌙' },
] as const

export default function HomePage() {
  const t = useTranslations()
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-[85vh] flex items-center justify-center particle-bg px-4 py-8">
      <div className="max-w-4xl mx-auto text-center content-wrapper">
        {/* Hero panel */}
        <div className="glass-panel-dark rounded-lg p-6 md:p-12 glow-effect">
          {/* Logo */}
          <h1 className="font-title text-3xl sm:text-4xl md:text-7xl mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gold-bright via-gold to-gold-dim animate-pulse">
            ROL HUB
          </h1>

          {/* Headline real (value prop) */}
          <p className="font-heading text-base sm:text-lg md:text-2xl text-gold mb-2 md:mb-3 max-w-2xl mx-auto leading-snug">
            {t.home.headline}
          </p>

          {/* Subheadline */}
          <p className="font-body text-sm md:text-base text-parchment/70 mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed">
            {t.home.subheadline}
          </p>

          {/* Help link arriba de los CTAs (target: novatos) */}
          <div className="mb-5 md:mb-6">
            <Link href="/guias" className="inline-flex items-center gap-2 font-ui text-sm text-emerald hover:text-emerald/80 transition">
              <span className="text-lg">❓</span>
              {t.homeExtras.firstTime}
            </Link>
          </div>

          {/* CTA buttons — dos caminos claros para no-logueados, un solo botón para logueados */}
          {isSignedIn ? (
            <div className="flex justify-center items-center mb-6 md:mb-8">
              <Link href="/campaigns" className="w-full sm:w-auto">
                <RunicButton variant="primary" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4 glow-effect">
                  {t.home.continuePlaying}
                </RunicButton>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <SignUpButton mode="modal" forceRedirectUrl="/onboarding" signInForceRedirectUrl="/campaigns">
                  <RunicButton variant="primary" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4 glow-effect">
                    ✨ {t.homeExtras.createAccountAndPlay}
                  </RunicButton>
                </SignUpButton>
                <Link href="/play-guest" className="w-full sm:w-auto">
                  <RunicButton variant="secondary" className="w-full sm:w-auto text-sm md:text-base px-5 md:px-6 py-2 md:py-3">
                    ⚔️ {t.homeExtras.playAsGuest}
                  </RunicButton>
                </Link>
              </div>
              <SignInButton mode="modal" forceRedirectUrl="/campaigns" signUpForceRedirectUrl="/onboarding">
                <button className="font-ui text-xs md:text-sm text-parchment/60 hover:text-gold transition-colors underline-offset-4 hover:underline">
                  {t.homeExtras.alreadyHaveAccount}
                </button>
              </SignInButton>
            </div>
          )}

          {/* Lores del catálogo — pills clickeables, paleta dorada unificada */}
          <div className="mb-2">
            <p className="font-ui text-xs md:text-sm text-parchment/50 uppercase tracking-wider mb-3">
              {t.home.chooseWorldLabel}
            </p>
            <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
              {FEATURED_LORES.map((lore) => {
                // Logueado: al onboarding con lore pre-seleccionado (flujo actual).
                // No logueado: al guest flow con lore pre-seleccionado si es uno
                // de los 3 soportados; si no, solo al guest flow (mostrará los 3).
                const href = isSignedIn
                  ? `/onboarding?lore=${lore.id}`
                  : GUEST_LORE_IDS.has(lore.id)
                    ? `/play-guest?lore=${lore.id}`
                    : '/play-guest'
                return (
                  <Link
                    key={lore.id}
                    href={href}
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass-panel text-xs md:text-sm font-ui text-parchment/90 border border-gold-dim/40 hover:border-gold/60 hover:text-gold hover:scale-105 transition-all"
                  >
                    {lore.icon} {t.lores[lore.id as keyof typeof t.lores]?.name ?? lore.id}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 mt-10 font-ui text-sm text-parchment/50">
          <Link href="/privacy" className="hover:text-gold transition">{t.homeExtras.privacy}</Link>
          <span className="text-gold-dim/30">|</span>
          <Link href="/terms" className="hover:text-gold transition">{t.homeExtras.terms}</Link>
          <span className="text-gold-dim/30">|</span>
          <Link href="/refunds" className="hover:text-gold transition">Refunds</Link>
          <span className="text-gold-dim/30">|</span>
          <Link href="/pricing" className="hover:text-gold transition">Pricing</Link>
          <span className="text-gold-dim/30">|</span>
          {/* Contacto público — requisito de verificación del proveedor de pagos */}
          <a href="mailto:contact@rol-hub.com" className="hover:text-gold transition">
            contact@rol-hub.com
          </a>
        </div>
      </div>
    </div>
  );
}
