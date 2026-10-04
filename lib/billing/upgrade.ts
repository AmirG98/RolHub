// Cambio de plan / fin anticipado del trial sobre una suscripción de Polar.
// Lógica pura (qué pedirle a Polar) separada del route para testearla contra
// el schema real del SDK, como polar-portal.test.ts.

import { isTierId, nextTierOf, TIER_ORDER, type PlanTierId } from '@/lib/plans/quota'

export type UpgradeAction = 'upgrade' | 'start_now'

export interface UpgradeRequestUser {
  stripeSubscriptionId: string | null
  planTier: string | null
  subStatus: string | null
}

export type UpgradePlan =
  | { ok: true; targetTier: PlanTierId; update: { productId: string; prorationBehavior: 'invoice' } | { trialEnd: Date } }
  | { ok: false; status: number; error: string }

/**
 * Decide qué actualización pedirle a Polar.
 *  - 'upgrade': pasa al plan pedido (si es superior) o al siguiente. Cobra la
 *    diferencia prorrateada ahora (prorationBehavior 'invoice').
 *  - 'start_now': corta el trial gratis y empieza el período pago ya.
 */
export function planUpgrade(
  user: UpgradeRequestUser,
  action: UpgradeAction,
  requestedTier: unknown,
  products: Record<PlanTierId, string>,
  now: Date = new Date()
): UpgradePlan {
  if (!user.stripeSubscriptionId) return { ok: false, status: 400, error: 'no_subscription' }
  const current: PlanTierId = isTierId(user.planTier) ? user.planTier : 'adventurer'

  if (action === 'start_now') {
    if (user.subStatus !== 'trialing') return { ok: false, status: 400, error: 'not_trialing' }
    return { ok: true, targetTier: current, update: { trialEnd: now } }
  }

  const target = isTierId(requestedTier) ? requestedTier : nextTierOf(current)
  if (!target) return { ok: false, status: 400, error: 'already_top_tier' }
  if (TIER_ORDER.indexOf(target) <= TIER_ORDER.indexOf(current)) return { ok: false, status: 400, error: 'not_an_upgrade' }
  const productId = products[target]
  if (!productId) return { ok: false, status: 503, error: 'tier_not_configured' }
  return { ok: true, targetTier: target, update: { productId, prorationBehavior: 'invoice' } }
}
