'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Crown, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { PLAN_CONFIG } from '@/lib/plans/plan-config'
import { RunicButton } from '@/components/medieval/RunicButton'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

// Página de gracias del checkout de Polar.
//
// No asume que el pago ya activó el plan: Polar redirige acá ANTES de que su
// webhook llegue a nuestro server. Consultamos /api/billing/sync (que verifica
// contra Polar directamente) hasta confirmar PRO, así el jugador nunca vuelve
// al juego y se topa con el paywall que acaba de pagar. El evento de
// conversión (dataLayer → GTM → Meta Pixel) se dispara SOLO con PRO
// confirmado, una vez por suscripción — nada de compras fantasma por refresh
// ni por crawlers que visiten esta URL pública.
type SyncState = 'checking' | 'active' | 'pending' | 'signed_out'

const MAX_ATTEMPTS = 8
const ATTEMPT_DELAY_MS = 1500

export default function CheckoutSuccessPage() {
  const { locale } = useLanguage()
  const isEn = locale === 'en'
  const { isLoaded, isSignedIn } = useUser()
  const [state, setState] = useState<SyncState>('checking')
  const started = useRef(false)

  useEffect(() => {
    if (!isLoaded || started.current) return
    if (!isSignedIn) {
      setState('signed_out')
      return
    }
    started.current = true

    let cancelled = false
    const run = async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const res = await fetch('/api/billing/sync', { method: 'POST' })
          if (res.status === 401) {
            setState('signed_out')
            return
          }
          const data = (await res.json().catch(() => ({}))) as { active?: boolean; subscriptionId?: string | null }
          if (data.active) {
            trackPurchaseOnce(data.subscriptionId ?? null)
            window.dispatchEvent(new Event('rolhub:plan-updated'))
            setState('active')
            return
          }
        } catch {
          // red caída o similar: seguimos intentando hasta agotar
        }
        await new Promise((r) => setTimeout(r, ATTEMPT_DELAY_MS))
      }
      if (!cancelled) setState('pending')
    }
    run()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn])

  const copy = {
    checking: {
      title: isEn ? 'Confirming your payment…' : 'Confirmando tu pago…',
      body: isEn
        ? 'Talking to our payment provider. This usually takes a couple of seconds.'
        : 'Hablando con el proveedor de pagos. Suele tardar un par de segundos.',
    },
    active: {
      title: isEn ? 'Welcome to the Adventurer plan' : 'Bienvenido al plan Aventurero',
      body: isEn
        ? 'Your subscription is active. Every world, every rules engine, unlimited campaigns — all unlocked.'
        : 'Tu suscripción está activa. Todos los mundos, todos los motores de reglas, campañas ilimitadas — todo desbloqueado.',
    },
    pending: {
      title: isEn ? 'Payment received — activating' : 'Pago recibido — activando',
      body: isEn
        ? 'Your plan is being activated and can take a minute to show up. You can keep playing; if you still see the trial message, reload the page shortly.'
        : 'Tu plan se está activando y puede tardar un minuto en verse. Podés seguir jugando; si todavía ves el mensaje de prueba, recargá la página en un rato.',
    },
    signed_out: {
      title: isEn ? 'Sign in to see your subscription' : 'Iniciá sesión para ver tu suscripción',
      body: isEn
        ? 'Your payment is linked to your account. Sign in and your plan will activate automatically.'
        : 'Tu pago está vinculado a tu cuenta. Iniciá sesión y tu plan se activa solo.',
    },
  }[state]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <ParchmentPanel className="max-w-lg w-full text-center p-8 md:p-10">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center">
          {state === 'checking'
            ? <Loader2 className="w-8 h-8 text-gold animate-spin" />
            : <Crown className="w-8 h-8 text-gold" />}
        </div>

        <h1 className="font-title text-2xl md:text-3xl text-gold-bright mb-3">{copy.title}</h1>
        <p className="font-ui text-parchment/80 mb-8 leading-relaxed">{copy.body}</p>

        {state === 'signed_out' ? (
          <Link href="/login" className="block">
            <RunicButton variant="primary" className="w-full justify-center">
              {isEn ? 'Sign in' : 'Iniciar sesión'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </RunicButton>
          </Link>
        ) : (
          <Link href="/campaigns" className="block">
            <RunicButton variant="primary" className="w-full justify-center" disabled={state === 'checking'}>
              {isEn ? 'Continue your adventure' : 'Continuá tu aventura'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </RunicButton>
          </Link>
        )}

        {state === 'active' && (
          <p className="font-ui text-xs text-parchment/40 mt-6">
            {isEn ? 'A receipt has been sent to your email.' : 'Te enviamos el comprobante a tu email.'}
          </p>
        )}
      </ParchmentPanel>
    </div>
  )
}

// Empuja el evento de compra al dataLayer una sola vez por suscripción.
// sessionStorage sobrevive al refresh de la página pero no a cerrar la pestaña,
// que es exactamente la ventana en la que un refresh duplicaría la conversión.
function trackPurchaseOnce(subscriptionId: string | null) {
  const key = `rolhub_purchase_tracked:${subscriptionId ?? 'unknown'}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // sessionStorage bloqueado (modo privado estricto): trackear igual
  }
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'purchase_complete',
    value: PLAN_CONFIG.PRO.priceMonthly,
    currency: 'USD',
    plan: 'PRO',
    subscription_id: subscriptionId,
  })
}
