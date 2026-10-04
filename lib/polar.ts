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
// Aventurero (producto original, "RolHub Monthly Subscription"). Los ids de
// producto no son secretos: el default evita depender de la env en cada entorno.
export const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || 'af039a9e-b323-4321-87f0-4b7f50f07882'
export const POLAR_PRICE_ID_MONTHLY = process.env.POLAR_PRICE_ID_MONTHLY || ''

// Un producto de Polar por plan. POLAR_PRODUCT_ID es Aventurero (el original).
export const POLAR_TIER_PRODUCTS = {
  adventurer: POLAR_PRODUCT_ID,
  // Creados en el dashboard de Polar el 2026-10-04 (mensuales, trial 3 días).
  // Los ids de producto no son secretos; la env solo sirve para sandbox.
  hero: process.env.POLAR_PRODUCT_ID_HERO || '5d85d2da-6630-43ec-99de-37ac0a733029',
  legend: process.env.POLAR_PRODUCT_ID_LEGEND || 'ff4dbaef-5d85-4478-9e40-288ea01133ec',
} as const

/** Ids de producto configurados que otorgan plan pago. */
export function tierProductIds(): string[] {
  return Object.values(POLAR_TIER_PRODUCTS).filter(Boolean)
}

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
  currentPeriodStart?: Date | string | null
  currentPeriodEnd?: Date | string | null
  endsAt?: Date | string | null
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

/**
 * Elige la suscripción que otorga PRO. Con POLAR_PRODUCT_ID configurado es
 * ESTRICTO: solo esa. Un fallback a "cualquier activa" convertía el filtro en
 * un no-op y daría PRO a quien compre cualquier otro producto de la org. Si
 * hay activas pero ninguna coincide, se loggea fuerte (posible config drift).
 */
export function pickActiveSubscription(
  subs: PolarSubscriptionLike[],
  productId: string | string[] = tierProductIds()
): PolarSubscriptionLike | null {
  const active = subs.filter((s) => ACTIVE_STATUSES.has(s.status))
  if (active.length === 0) return null
  // Acepta cualquiera de los productos de plan (Aventurero/Héroe/Leyenda).
  const accepted = (Array.isArray(productId) ? productId : [productId]).filter(Boolean)
  if (accepted.length === 0) return active[0]
  const match = active.find((s) => !!s.productId && accepted.includes(s.productId))
  if (!match) {
    console.warn(
      `[polar] ${active.length} suscripción(es) activa(s) pero ninguna de los productos ${accepted.join('|')}: ` +
      active.map((s) => s.productId ?? '?').join(', ')
    )
  }
  return match ?? null
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
