// Integración con Polar.sh (Merchant of Record).
// Reemplaza Lemon Squeezy (que rechazó por ser "gaming platform"). Polar
// acepta juegos + AI + Argentina, es MoR (maneja impuestos/IVA), payout vía
// Stripe Connect. La lógica de negocio (User.plan/planExpiresAt) no cambia.
//
// Config vía env:
//   POLAR_ACCESS_TOKEN       — API key (Settings → tokens en el dashboard)
//   POLAR_WEBHOOK_SECRET     — secret del webhook (verifica firma)
//   POLAR_PRODUCT_ID         — id del producto RolHub Pro
//   POLAR_PRICE_ID_MONTHLY   — id del precio mensual (checkout usa product o price)
//   POLAR_SERVER             — 'production' | 'sandbox' (default production)

import { Polar } from '@polar-sh/sdk'

let _polar: Polar | null = null

/** Cliente Polar (lazy singleton). Lanza si falta el token. */
export function getPolar(): Polar {
  if (!_polar) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN no configurado')
    _polar = new Polar({
      accessToken,
      server: (process.env.POLAR_SERVER as 'production' | 'sandbox') || 'production',
    })
  }
  return _polar
}

export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || ''
export const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || ''
export const POLAR_PRICE_ID_MONTHLY = process.env.POLAR_PRICE_ID_MONTHLY || ''

/** ¿Está configurado el checkout? (product o price presente + token) */
export function isPolarConfigured(): boolean {
  return !!process.env.POLAR_ACCESS_TOKEN && (!!POLAR_PRODUCT_ID || !!POLAR_PRICE_ID_MONTHLY)
}

// ── Lógica pura de plan a partir de una suscripción de Polar ─────────────
// Compartida por el webhook y por /api/billing/sync para que ambos caminos
// de activación (push de Polar vs. pull nuestro) deriven exactamente lo mismo.

/** Subconjunto de campos de una suscripción Polar que nos importa. */
export interface PolarSubscriptionLike {
  id: string
  status: string
  productId?: string | null
  cancelAtPeriodEnd?: boolean | null
  currentPeriodEnd?: Date | string | null
  endsAt?: Date | string | null
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

/**
 * Elige la suscripción que otorga PRO. Si hay POLAR_PRODUCT_ID configurado
 * prefiere la que coincide; si ninguna coincide cae a cualquier activa (por
 * si el product id cambió en Polar y no en las env vars — mejor dar acceso a
 * un pagador que bloquearlo por config).
 */
export function pickActiveSubscription(
  subs: PolarSubscriptionLike[],
  productId: string = POLAR_PRODUCT_ID
): PolarSubscriptionLike | null {
  const active = subs.filter((s) => ACTIVE_STATUSES.has(s.status))
  if (active.length === 0) return null
  if (productId) {
    const match = active.find((s) => s.productId === productId)
    if (match) return match
  }
  return active[0]
}

/**
 * Campos de User que derivan de una suscripción activa. planExpiresAt solo
 * se setea si está cancelada a fin de período: ahí el acceso vence en
 * currentPeriodEnd (o endsAt). Si sigue renovando, no hay vencimiento.
 */
export function planFieldsFromActiveSubscription(sub: PolarSubscriptionLike): {
  plan: 'PRO'
  planExpiresAt: Date | null
  stripeSubscriptionId: string
} {
  const end = sub.currentPeriodEnd ?? sub.endsAt ?? null
  const planExpiresAt = sub.cancelAtPeriodEnd && end ? new Date(end) : null
  return { plan: 'PRO', planExpiresAt, stripeSubscriptionId: sub.id }
}
