'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useTranslations, useLanguage } from '@/lib/i18n'
import { Check, Crown } from 'lucide-react'
import { TIERS, TIER_ORDER, SUB_TRIAL_TURNS, isTierId, type PlanTierId } from '@/lib/plans/quota'
import { GOLD_CTA_CLASS } from '@/components/billing/gold-cta'
import Link from 'next/link'

interface PlanInfo {
  status: string | null
  tier: PlanTierId | null
  quota: { enforced: boolean; limit: number; used: number } | null
}

const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), s)

export default function PricingPage() {
  const t = useTranslations()
  const { locale } = useLanguage()
  const isEn = locale === 'en'
  const { isSignedIn } = useUser()
  const router = useRouter()
  // Qué botón está trabajando ('manage' o el id del plan), para no bloquear los tres.
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmTier, setConfirmTier] = useState<PlanTierId | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  // Plan actual: un suscriptor no tiene que ver "elegir" su propio plan (el
  // checkout le devolvía 400) sino cómo GESTIONAR/CANCELAR, y los planes
  // superiores como cambio de plan sobre su suscripción.
  const [plan, setPlan] = useState<PlanInfo>({ status: null, tier: null, quota: null })
  // Solo un plan VIGENTE gestiona; uno vencido vuelve a ver el checkout.
  const isPaidPlan = plan.status === 'pro'
  const currentTier: PlanTierId | null = isPaidPlan ? (plan.tier ?? 'adventurer') : null

  const loadPlan = () =>
    fetch('/api/user/plan')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.status) setPlan({ status: data.status, tier: isTierId(data.tier) ? data.tier : null, quota: data.quota ?? null })
      })
      .catch(() => {})

  useEffect(() => {
    if (isSignedIn) loadPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn])

  const genericError = isEn
    ? "We couldn't open checkout. Please try again in a few minutes."
    : 'No pudimos abrir el checkout. Intentá de nuevo en unos minutos.'

  const handleManage = async () => {
    setBusy('manage')
    setCheckoutError(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.customerPortalUrl) {
        window.location.href = data.customerPortalUrl
        return
      }
      console.error('[portal] error:', res.status, data)
      setCheckoutError(t.pricing.portalError)
    } catch (err) {
      console.error('[portal] network error:', err)
      setCheckoutError(t.pricing.portalError)
    }
    setBusy(null)
  }

  const handleSubscribe = async (tier: PlanTierId) => {
    if (!isSignedIn) {
      router.push('/register')
      return
    }
    setBusy(tier)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      // Checkout hosteado (Polar) — redirigir a la URL devuelta
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      console.error('[checkout] error:', res.status, data)
      setCheckoutError(data.error || genericError)
    } catch (err) {
      console.error('[checkout] network error:', err)
      setCheckoutError(isEn ? 'Connection error. Check your internet and try again.' : 'Error de conexión. Revisá tu internet e intentá de nuevo.')
    }
    setBusy(null)
  }

  // Cambio de plan sobre la suscripción existente (cobra la diferencia ahora).
  const handleSwitch = async (tier: PlanTierId) => {
    setBusy(tier)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade', tier }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        window.dispatchEvent(new CustomEvent('rolhub:plan-updated', { detail: { plan: 'PRO' } }))
        await loadPlan()
      } else {
        console.error('[upgrade] error:', res.status, data)
        setCheckoutError(t.upgrade.upgradeError)
      }
    } catch (err) {
      console.error('[upgrade] network error:', err)
      setCheckoutError(t.upgrade.upgradeError)
    }
    setBusy(null)
    setConfirmTier(null)
  }

  const features = [
    'allLores', 'allEngines', 'unlimitedCampaigns', 'unlimitedSessions', 'aiImages', 'aiVoice',
    'sfx', 'dice3d', 'journal', 'compendium', 'fogOfWar', 'achievements',
  ] as const

  const faqs = [
    { q: t.pricing.faq.q4, a: t.pricing.faq.a4 },
    { q: t.pricing.faq.q5, a: t.pricing.faq.a5 },
    { q: t.pricing.faq.q1, a: t.pricing.faq.a1 },
    { q: t.pricing.faq.q2, a: t.pricing.faq.a2 },
    { q: t.pricing.faq.q3, a: t.pricing.faq.a3 },
  ]

  const tierLabel = (id: PlanTierId) => (isEn ? TIERS[id].label : TIERS[id].labelEs)

  return (
    <div className="min-h-[85vh] particle-bg px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto content-wrapper">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-title text-3xl md:text-5xl text-gold-bright mb-3">
            {t.pricing.title}
          </h1>
          <p className="font-body text-lg text-parchment/70 max-w-xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Trial banner */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-emerald/10 border border-emerald/30 font-ui text-sm text-emerald">
            {t.pricing.trialBanner}
          </span>
        </div>

        {isPaidPlan && plan.quota?.enforced && (
          <p className="text-center font-ui text-sm text-parchment/70 mb-6">
            {fill(t.pricing.usedThisPeriod, { used: plan.quota.used, limit: plan.quota.limit })}
          </p>
        )}

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {TIER_ORDER.map((id) => {
            const tier = TIERS[id]
            const isCurrent = currentTier === id
            const isHigher = currentTier !== null && TIER_ORDER.indexOf(id) > TIER_ORDER.indexOf(currentTier)
            const isLower = currentTier !== null && TIER_ORDER.indexOf(id) < TIER_ORDER.indexOf(currentTier)
            const highlighted = currentTier ? isCurrent : id === 'adventurer'
            return (
              <div
                key={id}
                className={`glass-panel-dark rounded-xl p-6 md:p-7 flex flex-col text-center ${highlighted ? 'glow-effect border border-gold/50' : ''}`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-gold-bright" />
                  <span className="font-title text-xl text-gold-bright">{tierLabel(id)}</span>
                </div>
                <p className="font-ui text-[11px] uppercase tracking-wider text-gold-dim h-4 mb-3">
                  {isCurrent ? `✓ ${t.pricing.currentPlan}` : !currentTier && id === 'adventurer' ? t.pricing.mostPopular : ''}
                </p>

                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="font-title text-4xl md:text-5xl text-parchment">${tier.priceMonthly.toFixed(2)}</span>
                  <span className="font-ui text-parchment/50">{t.pricing.perMonth}</span>
                </div>
                <p className="font-heading text-sm text-gold mb-5">
                  {fill(t.pricing.turnsPerMonth, { n: tier.turns.toLocaleString(isEn ? 'en-US' : 'es-AR') })}
                </p>

                <div className="mt-auto">
                  {isCurrent ? (
                    <button onClick={handleManage} disabled={busy !== null} className={`${GOLD_CTA_CLASS} disabled:opacity-50`}>
                      {busy === 'manage' ? '…' : t.pricing.manageSubscription}
                    </button>
                  ) : isHigher ? (
                    confirmTier === id ? (
                      <div>
                        <p className="font-body text-xs text-parchment mb-2">{fill(t.pricing.switchConfirm, { plan: tierLabel(id) })}</p>
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleSwitch(id)} disabled={busy !== null} className={`${GOLD_CTA_CLASS} disabled:opacity-50`}>
                            {busy === id ? '…' : t.upgrade.confirm}
                          </button>
                          <button onClick={() => setConfirmTier(null)} disabled={busy !== null} className="font-ui text-sm text-parchment/60 hover:text-parchment">
                            {t.upgrade.cancel}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmTier(id)} disabled={busy !== null} className={`${GOLD_CTA_CLASS} disabled:opacity-50`}>
                        {fill(t.pricing.switchPlan, { plan: tierLabel(id) })}
                      </button>
                    )
                  ) : isLower ? (
                    <p className="font-body text-xs text-parchment/50">{t.pricing.lowerPlanHint}</p>
                  ) : (
                    <button onClick={() => handleSubscribe(id)} disabled={busy !== null} className={`${GOLD_CTA_CLASS} disabled:opacity-50`}>
                      {busy === id ? '…' : fill(t.pricing.choosePlan, { plan: tierLabel(id) })}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-center font-body text-xs text-parchment/60">
          {fill(t.pricing.trialNote, { n: SUB_TRIAL_TURNS })}
          {isPaidPlan ? ` ${t.pricing.manageHint}` : ''}
        </p>

        {checkoutError && (
          <p className="mt-3 text-center font-body text-sm text-blood">{checkoutError}</p>
        )}

        {/* Lo que incluyen todos los planes */}
        <div className="mt-10 max-w-2xl mx-auto glass-panel rounded-xl p-6">
          <h2 className="font-heading text-base text-gold text-center mb-4">{t.pricing.everyPlanIncludes}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {features.map((key) => (
              <li key={key} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                <span className="font-body text-sm text-parchment/80">{t.pricing.features[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-lg mx-auto">
          <h2 className="font-heading text-xl text-gold text-center mb-6">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="glass-panel rounded-lg group">
                <summary className="px-5 py-3 cursor-pointer font-heading text-sm text-parchment hover:text-gold transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gold/50 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="px-5 pb-4 font-body text-sm text-parchment/60 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Footer link back */}
        <div className="text-center mt-10">
          <Link href="/" className="font-ui text-sm text-parchment/40 hover:text-gold transition-colors">
            ← {isSignedIn ? t.home.continuePlaying : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
