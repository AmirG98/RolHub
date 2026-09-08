'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, ArrowRight } from 'lucide-react'
import { useTranslations, useLanguage } from '@/lib/i18n'
import { PLAN_CONFIG } from '@/lib/plans/plan-config'
import { RunicButton } from '@/components/medieval/RunicButton'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

// Página de gracias del checkout de Polar. Existe SOLO para que el evento de
// conversión (Meta Pixel / GTM) tenga una URL propia y dispare una única vez
// por compra — antes el successUrl apuntaba a "/?upgraded=true", que un
// refresh del navegador podía re-disparar como una segunda "compra".
export default function CheckoutSuccessPage() {
  const t = useTranslations()
  const { locale } = useLanguage()
  const isEn = locale === 'en'

  // dataLayer push para GTM: el tag de conversión escucha este evento en vez
  // de basarse en la URL, así que sobrevive a cambios de ruta futuros.
  const [pushed, setPushed] = useState(false)
  useEffect(() => {
    if (pushed) return
    ;(window as unknown as { dataLayer?: unknown[] }).dataLayer =
      (window as unknown as { dataLayer?: unknown[] }).dataLayer || []
    ;(window as unknown as { dataLayer: unknown[] }).dataLayer.push({
      event: 'purchase_complete',
      value: PLAN_CONFIG.PRO.priceMonthly,
      currency: 'USD',
      plan: 'PRO',
    })
    setPushed(true)
  }, [pushed])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <ParchmentPanel className="max-w-lg w-full text-center p-8 md:p-10">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center">
          <Crown className="w-8 h-8 text-gold" />
        </div>

        <h1 className="font-title text-2xl md:text-3xl text-gold-bright mb-3">
          {isEn ? 'Welcome to the Adventurer plan' : 'Bienvenido al plan Aventurero'}
        </h1>

        <p className="font-ui text-parchment/80 mb-8 leading-relaxed">
          {isEn
            ? 'Your subscription is active. Every world, every rules engine, unlimited campaigns — all unlocked.'
            : 'Tu suscripción está activa. Todos los mundos, todos los motores de reglas, campañas ilimitadas — todo desbloqueado.'}
        </p>

        <Link href="/campaigns" className="block">
          <RunicButton variant="primary" className="w-full justify-center">
            {isEn ? 'Continue your adventure' : 'Continuá tu aventura'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </RunicButton>
        </Link>

        <p className="font-ui text-xs text-parchment/40 mt-6">
          {isEn
            ? 'A receipt has been sent to your email.'
            : 'Te enviamos el comprobante a tu email.'}
        </p>
      </ParchmentPanel>
    </div>
  )
}
