'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/lib/i18n'
import { Check, Crown, Sparkles, Scroll, Shield } from 'lucide-react'
import { PLAN_CONFIG } from '@/lib/plans/plan-config'
import Link from 'next/link'

export default function PricingPage() {
  const t = useTranslations()
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const price = billingPeriod === 'monthly'
    ? PLAN_CONFIG.PRO.priceMonthly
    : PLAN_CONFIG.PRO.priceYearly

  const monthlyEquivalent = billingPeriod === 'yearly'
    ? (PLAN_CONFIG.PRO.priceYearly / 12).toFixed(2)
    : null

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      router.push('/register')
      return
    }

    setLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: billingPeriod }),
      })
      const data = await res.json()

      // Checkout hosteado (Polar) — redirigir a la URL devuelta
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        // Mostrar el error al usuario en vez de fallar en silencio
        const msg = data.error || 'No pudimos abrir el checkout. Intentá de nuevo en unos minutos.'
        console.error('[checkout] error:', res.status, data)
        setCheckoutError(msg)
        setLoading(false)
      }
    } catch (err) {
      console.error('[checkout] network error:', err)
      setCheckoutError('Error de conexión. Revisá tu internet e intentá de nuevo.')
      setLoading(false)
    }
  }

  const features = [
    { key: 'allLores', icon: Scroll },
    { key: 'allEngines', icon: Shield },
    { key: 'unlimitedCampaigns', icon: Sparkles },
    { key: 'unlimitedSessions', icon: Sparkles },
    { key: 'aiImages', icon: Sparkles },
    { key: 'aiVoice', icon: Sparkles },
    { key: 'sfx', icon: Sparkles },
    { key: 'dice3d', icon: Sparkles },
    { key: 'journal', icon: Scroll },
    { key: 'compendium', icon: Scroll },
    { key: 'fogOfWar', icon: Shield },
    { key: 'achievements', icon: Crown },
    { key: 'priority', icon: Crown },
  ] as const

  const faqs = [
    { q: t.pricing.faq.q1, a: t.pricing.faq.a1 },
    { q: t.pricing.faq.q2, a: t.pricing.faq.a2 },
    { q: t.pricing.faq.q3, a: t.pricing.faq.a3 },
  ]

  return (
    <div className="min-h-[85vh] particle-bg px-4 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
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

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-heading text-sm transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-gold/20 text-gold border border-gold/40'
                : 'text-parchment/50 hover:text-parchment/70'
            }`}
          >
            {t.pricing.monthly}
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-lg font-heading text-sm transition-all flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-gold/20 text-gold border border-gold/40'
                : 'text-parchment/50 hover:text-parchment/70'
            }`}
          >
            {t.pricing.yearly}
            <span className="text-xs bg-emerald/20 text-emerald px-2 py-0.5 rounded-full">
              {t.pricing.yearlyDiscount}
            </span>
          </button>
        </div>

        {/* PRO Card */}
        <div className="glass-panel-dark rounded-xl p-8 md:p-10 glow-effect mx-auto max-w-lg">
          {/* Plan badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-gold-bright" />
            <span className="font-title text-xl text-gold-bright">
              {PLAN_CONFIG.PRO.label}
            </span>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-title text-5xl md:text-6xl text-parchment">
                ${billingPeriod === 'monthly' ? price.toFixed(2) : monthlyEquivalent}
              </span>
              <span className="font-ui text-parchment/50 text-lg">
                {t.pricing.perMonth}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="font-ui text-sm text-parchment/40 mt-1">
                ${price.toFixed(2)}{t.pricing.perYear}
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map(({ key }) => (
              <li key={key} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                <span className="font-body text-parchment/80">
                  {t.pricing.features[key]}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-gold-dim via-gold to-gold-dim text-shadow font-heading text-lg tracking-wide hover:from-gold hover:via-gold-bright hover:to-gold transition-all disabled:opacity-50"
          >
            {loading ? '...' : t.pricing.subscribe}
          </button>

          {checkoutError && (
            <p className="mt-3 text-center font-body text-sm text-blood">
              {checkoutError}
            </p>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-lg mx-auto">
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
