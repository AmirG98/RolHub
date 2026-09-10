'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Crown, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage, useTranslations } from '@/lib/i18n'
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
// contra Polar directamente) hasta confirmar PRO. El evento de conversión
// (dataLayer → GTM → Meta Pixel) se dispara SOLO con PRO confirmado y una
// sola vez por suscripción en este dispositivo (localStorage, cross-tab).
type SyncState = 'checking' | 'active' | 'pending' | 'signed_out'

const MAX_ATTEMPTS = 8
const ATTEMPT_DELAY_MS = 1500

interface SyncResponse {
  active?: boolean
  subscriptionId?: string | null
  plan?: string
}

export default function CheckoutSuccessPage() {
  const t = useTranslations()
  const { locale } = useLanguage()
  const { isLoaded, isSignedIn } = useUser()
  const [state, setState] = useState<SyncState>('checking')

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setState('signed_out')
      return
    }

    // La limpieza cancela el loop, aborta el fetch en vuelo y limpia el timer:
    // así un unmount (o el doble-mount de StrictMode) no deja requests
    // huérfanas ni setState sobre un componente desmontado.
    let cancelled = false
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined

    const sleep = (ms: number) => new Promise<void>((resolve) => { timer = setTimeout(resolve, ms) })

    const run = async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const res = await fetch('/api/billing/sync', { method: 'POST', signal: controller.signal })
          if (cancelled) return
          if (res.status === 401) {
            setState('signed_out')
            return
          }
          const data = (await res.json().catch(() => ({}))) as SyncResponse
          if (cancelled) return
          if (data.active) {
            trackPurchaseOnce(data.subscriptionId ?? null)
            window.dispatchEvent(new CustomEvent('rolhub:plan-updated', { detail: { plan: data.plan ?? 'PRO' } }))
            setState('active')
            return
          }
        } catch {
          if (cancelled) return
          // red caída o similar: seguimos intentando hasta agotar
        }
        await sleep(ATTEMPT_DELAY_MS)
      }
      if (!cancelled) setState('pending')
    }
    run()

    return () => {
      cancelled = true
      controller.abort()
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [isLoaded, isSignedIn])

  const planLabel = locale === 'en' ? PLAN_CONFIG.PRO.label : PLAN_CONFIG.PRO.labelEs
  const copy = {
    checking: { title: t.checkout.confirming, body: t.checkout.confirmingSub },
    active: { title: t.checkout.welcome.replace('{plan}', planLabel), body: t.checkout.welcomeSub },
    pending: { title: t.checkout.pending, body: t.checkout.pendingSub },
    signed_out: { title: t.checkout.signedOut, body: t.checkout.signedOutSub },
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
              {t.checkout.signIn}
              <ArrowRight className="w-4 h-4 ml-2" />
            </RunicButton>
          </Link>
        ) : (
          <Link href="/campaigns" className="block">
            <RunicButton variant="primary" className="w-full justify-center" disabled={state === 'checking'}>
              {t.checkout.continueCta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </RunicButton>
          </Link>
        )}

        {state === 'active' && (
          <p className="font-ui text-xs text-parchment/40 mt-6">{t.checkout.receipt}</p>
        )}
      </ParchmentPanel>
    </div>
  )
}

// Una conversión por suscripción y por dispositivo. localStorage (no
// sessionStorage) para que reabrir esta URL pública en otra pestaña, desde
// el historial o desde el mail del recibo no vuelva a contar la compra.
// Sin subscriptionId (PRO otorgado a mano) no hay compra que trackear.
function trackPurchaseOnce(subscriptionId: string | null) {
  if (!subscriptionId) return
  const key = `rolhub_purchase_tracked:${subscriptionId}`
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    // storage bloqueado (modo privado estricto): trackear igual
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
