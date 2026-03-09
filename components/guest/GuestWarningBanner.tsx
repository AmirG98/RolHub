'use client'

import { useState } from 'react'
import { AlertTriangle, X, LogIn, UserPlus } from 'lucide-react'
import { useGuest } from '@/lib/guest'
import { RunicButton } from '@/components/medieval/RunicButton'
import Link from 'next/link'

interface GuestWarningBannerProps {
  locale?: 'es' | 'en'
}

export function GuestWarningBanner({ locale = 'es' }: GuestWarningBannerProps) {
  const { isGuest, hasShownWarning, markWarningShown } = useGuest()
  const [isDismissed, setIsDismissed] = useState(false)

  const labels = locale === 'en' ? {
    title: 'Playing as Guest',
    message: 'Your progress will not be saved. Register to keep your adventures!',
    register: 'Register',
    login: 'Login',
    dismiss: 'Continue anyway'
  } : {
    title: 'Jugando como Invitado',
    message: 'Tu progreso no se guardará. ¡Registrate para conservar tus aventuras!',
    register: 'Registrarse',
    login: 'Iniciar sesión',
    dismiss: 'Continuar igual'
  }

  // No mostrar si no es guest o ya se descartó
  if (!isGuest || isDismissed || hasShownWarning) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    markWarningShown()
  }

  return (
    <div className="fixed top-16 inset-x-0 z-40 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel-dark border border-gold/30 rounded-lg p-4 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 bg-gold/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-gold" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-gold text-sm mb-1">
                {labels.title}
              </h3>
              <p className="font-ui text-parchment/80 text-xs">
                {labels.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/register">
                <RunicButton variant="primary" className="text-xs px-3 py-1.5">
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  {labels.register}
                </RunicButton>
              </Link>
              <Link href="/login">
                <RunicButton variant="secondary" className="text-xs px-3 py-1.5">
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  {labels.login}
                </RunicButton>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-parchment/50 hover:text-parchment transition-colors"
                title={labels.dismiss}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Modal de advertencia inicial para guests
 */
export function GuestWarningModal({ locale = 'es', onContinue }: {
  locale?: 'es' | 'en'
  onContinue: () => void
}) {
  const labels = locale === 'en' ? {
    title: 'Play as Guest',
    subtitle: 'Try the experience without an account',
    warning: 'Important: Guest sessions are temporary',
    warningItems: [
      'Your game will not be saved',
      'Progress is lost when you close the browser',
      'You cannot join multiplayer campaigns',
      'Register anytime to save your adventure'
    ],
    continueAsGuest: 'Continue as Guest',
    registerInstead: 'Register Instead',
    loginInstead: 'I have an account'
  } : {
    title: 'Jugar como Invitado',
    subtitle: 'Probá la experiencia sin crear cuenta',
    warning: 'Importante: Las sesiones de invitado son temporales',
    warningItems: [
      'Tu partida no se guardará',
      'El progreso se pierde al cerrar el navegador',
      'No podés unirte a campañas multijugador',
      'Podés registrarte en cualquier momento para guardar tu aventura'
    ],
    continueAsGuest: 'Continuar como Invitado',
    registerInstead: 'Prefiero Registrarme',
    loginInstead: 'Ya tengo cuenta'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-dark border border-gold/30 rounded-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-gold" />
          </div>
          <h2 className="font-title text-2xl text-gold-bright mb-2">
            {labels.title}
          </h2>
          <p className="font-ui text-parchment/70 text-sm">
            {labels.subtitle}
          </p>
        </div>

        {/* Warning box */}
        <div className="bg-blood/10 border border-blood/30 rounded-lg p-4 mb-6">
          <h3 className="font-heading text-blood text-sm mb-3">
            ⚠️ {labels.warning}
          </h3>
          <ul className="space-y-2">
            {labels.warningItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-parchment/80">
                <span className="text-blood mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <RunicButton
            onClick={onContinue}
            variant="primary"
            className="w-full"
          >
            {labels.continueAsGuest}
          </RunicButton>

          <div className="flex gap-2">
            <Link href="/register" className="flex-1">
              <RunicButton variant="secondary" className="w-full text-sm">
                {labels.registerInstead}
              </RunicButton>
            </Link>
            <Link href="/login" className="flex-1">
              <RunicButton variant="secondary" className="w-full text-sm">
                {labels.loginInstead}
              </RunicButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
