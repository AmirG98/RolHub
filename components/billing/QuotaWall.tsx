'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'
import { TIERS, isTierId, type PlanTierId } from '@/lib/plans/quota'
import { GOLD_CTA_CLASS } from './gold-cta'

/** Lo que manda el turn route en `wall` cuando rige el cupo del plan. */
export interface WallInfo {
  kind: 'quota' | 'sub_trial'
  tier: string
  limit: number
  used: number
  remaining: number
  nextTier: string | null
  resetsAt: string | null
}

interface QuotaWallProps {
  wall: WallInfo
  locale: 'es' | 'en'
  /** el plan cambió y hay cupo de nuevo: el juego vuelve a habilitar el input */
  onUpgraded: () => void
}

const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), s)

/**
 * Reemplaza el input cuando se agotó el cupo del plan (o los turnos del trial
 * de la suscripción). Ofrece el plan siguiente a un clic —con confirmación,
 * porque cobra en el momento— o esperar a la renovación.
 */
export function QuotaWall({ wall, locale, onUpgraded }: QuotaWallProps) {
  const t = useTranslations()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tierLabel = (id: PlanTierId) => (locale === 'en' ? TIERS[id].label : TIERS[id].labelEs)
  const date = wall.resetsAt
    ? new Date(wall.resetsAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-AR', { day: 'numeric', month: 'long' })
    : null
  const current: PlanTierId = isTierId(wall.tier) ? wall.tier : 'adventurer'
  const next: PlanTierId | null = isTierId(wall.nextTier) ? wall.nextTier : null
  const isTrial = wall.kind === 'sub_trial'
  // En el trial el botón empieza el plan actual; con cupo agotado, sube al siguiente.
  const target: PlanTierId | null = isTrial ? current : next

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isTrial ? { action: 'start_now' } : { action: 'upgrade', tier: target }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok && (!data.quota || !data.quota.enforced || data.quota.remaining > 0)) {
        window.dispatchEvent(new CustomEvent('rolhub:plan-updated', { detail: { plan: 'PRO' } }))
        onUpgraded()
        return
      }
      setError(t.upgrade.upgradeError)
    } catch {
      setError(t.upgrade.upgradeError)
    }
    setBusy(false)
    setConfirming(false)
  }

  const title = fill(isTrial ? t.upgrade.subTrialTitle : t.upgrade.quotaTitle, { limit: wall.limit })
  const sub = isTrial
    ? fill(t.upgrade.subTrialSub, { plan: tierLabel(current), turns: TIERS[current].turns, date: date ?? '—' })
    : [date ? fill(t.upgrade.quotaRenews, { date }) : '', next ? fill(t.upgrade.quotaUpgradeSub, { plan: tierLabel(next), turns: TIERS[next].turns }) : t.upgrade.quotaTop]
        .filter(Boolean).join(' ')

  return (
    <div className="rounded-lg border border-gold/40 glass-panel-dark p-5 text-center">
      <p className="font-title text-lg text-gold-bright mb-1">{title}</p>
      <p className="font-body text-sm text-parchment/70 mb-4">{sub}</p>

      {target && !confirming && (
        <button onClick={() => setConfirming(true)} className={`${GOLD_CTA_CLASS} inline-block`}>
          {fill(isTrial ? t.upgrade.subTrialCta : t.upgrade.quotaUpgradeCta, { plan: tierLabel(target), price: TIERS[target].priceMonthly.toFixed(2) })}
        </button>
      )}

      {target && confirming && (
        <div>
          <p className="font-body text-sm text-parchment mb-3">
            {fill(isTrial ? t.upgrade.subTrialConfirm : t.upgrade.quotaUpgradeConfirm, { price: TIERS[target].priceMonthly.toFixed(2) })}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={run} disabled={busy} className={`${GOLD_CTA_CLASS} disabled:opacity-50`}>
              {busy ? '…' : t.upgrade.confirm}
            </button>
            <button onClick={() => setConfirming(false)} disabled={busy} className="font-ui text-sm text-parchment/60 hover:text-parchment">
              {t.upgrade.cancel}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 font-body text-sm text-blood">{error}</p>}

      <Link href="/pricing" className="mt-3 inline-block font-ui text-xs text-parchment/50 hover:text-gold">
        {t.upgrade.seePlans} →
      </Link>
    </div>
  )
}
