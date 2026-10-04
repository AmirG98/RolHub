/**
 * Cupo de turnos por plan y por período de facturación.
 *
 * Por qué: PRO era "todo ilimitado" a USD 8.99 y cada turno cuesta
 * ~$0.05-0.11 en la API. En 30 días, 16 suscriptores costaron ~$161 contra
 * $143.84 de ingreso bruto; dos maratonistas eran la mitad del costo y uno
 * hizo 758 turnos dentro del trial gratis de 3 días. Con cupo, el costo por
 * suscriptor queda acotado y quien juega mucho pasa al plan siguiente.
 *
 * Decisiones del user (2026-10-04):
 *  - 3 planes: Aventurero 150 / Héroe 400 / Leyenda 1.000 turnos por mes.
 *  - Al agotar el cupo: ofrecer el plan siguiente o esperar a la renovación.
 *  - Suscriptores existentes: ilimitado hasta su próxima renovación.
 *
 * Todo puro (sin I/O ni Prisma) para poder testearlo.
 */

export type PlanTierId = 'adventurer' | 'hero' | 'legend'

export const TIER_ORDER: readonly PlanTierId[] = ['adventurer', 'hero', 'legend']

export const TIERS: Record<PlanTierId, { turns: number; priceMonthly: number; label: string; labelEs: string }> = {
  adventurer: { turns: 150, priceMonthly: 8.99, label: 'Adventurer', labelEs: 'Aventurero' },
  hero: { turns: 400, priceMonthly: 24.99, label: 'Hero', labelEs: 'Héroe' },
  legend: { turns: 1000, priceMonthly: 59.99, label: 'Legend', labelEs: 'Leyenda' },
}

/** Turnos incluidos en el trial gratis de la suscripción (3 días en Polar). */
export const SUB_TRIAL_TURNS = 60

/**
 * Fecha de lanzamiento del cupo: rige para períodos de facturación que
 * EMPIEZAN desde acá. Hoy está en 2099 = armado pero sin alcanzar a ningún
 * suscriptor real (permite probar el flujo completo en una cuenta puntual
 * moviendo su periodStart). Al lanzar, poner la fecha real (ISO, p. ej.
 * '2026-10-06T00:00:00Z'). null = apagado del todo. La env
 * QUOTA_ENFORCED_FROM la pisa si existe. Ver quotaEnforcedFrom().
 */
export const QUOTA_ENFORCED_FROM_DEFAULT: string | null = '2099-01-01T00:00:00Z'

/** Desde este % de uso la UI muestra el contador del cupo. */
export const QUOTA_WARNING_RATIO = 0.8

export function isTierId(v: unknown): v is PlanTierId {
  return v === 'adventurer' || v === 'hero' || v === 'legend'
}

export function nextTierOf(tier: PlanTierId): PlanTierId | null {
  const i = TIER_ORDER.indexOf(tier)
  return i >= 0 && i < TIER_ORDER.length - 1 ? TIER_ORDER[i + 1] : null
}

/**
 * Fecha desde la que rige el cupo (env QUOTA_ENFORCED_FROM, ISO). Sin la env
 * el cupo está APAGADO. Solo se aplica a períodos de facturación que EMPIEZAN
 * en o después de esta fecha: un suscriptor existente sigue ilimitado hasta
 * su próxima renovación, que es cuando su período nuevo pasa a contar.
 */
export function quotaEnforcedFrom(env: Record<string, string | undefined> = process.env): Date | null {
  const raw = env.QUOTA_ENFORCED_FROM ?? QUOTA_ENFORCED_FROM_DEFAULT
  if (!raw) return null
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

export interface QuotaUser {
  planTier?: string | null
  subStatus?: string | null
  periodStart?: Date | string | null
  periodEnd?: Date | string | null
  periodTurns?: number | null
}

export interface QuotaStatus {
  /** false = sin cupo (apagado, o período anterior al lanzamiento) */
  enforced: boolean
  /** 'sub_trial' = dentro del trial gratis de la suscripción */
  kind: 'quota' | 'sub_trial'
  tier: PlanTierId
  limit: number
  used: number
  remaining: number
  /** plan al que puede subir para seguir jugando (null si ya es el máximo) */
  nextTier: PlanTierId | null
  /** cuándo se renueva el cupo */
  resetsAt: Date | null
}

export function getQuotaStatus(user: QuotaUser, enforcedFrom: Date | null = quotaEnforcedFrom()): QuotaStatus {
  const tier: PlanTierId = isTierId(user.planTier) ? user.planTier : 'adventurer'
  const inTrial = user.subStatus === 'trialing'
  const limit = inTrial ? SUB_TRIAL_TURNS : TIERS[tier].turns
  const used = Math.max(0, Math.floor(user.periodTurns ?? 0))
  const periodStart = user.periodStart ? new Date(user.periodStart) : null
  const enforced = !!enforcedFrom && !!periodStart && periodStart.getTime() >= enforcedFrom.getTime()
  return {
    enforced,
    kind: inTrial ? 'sub_trial' : 'quota',
    tier,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    nextTier: nextTierOf(tier),
    resetsAt: user.periodEnd ? new Date(user.periodEnd) : null,
  }
}

/** Turnos que quedan DESPUÉS de jugar el turno actual (como trialTurnsRemainingAfter). */
export function quotaRemainingAfter(status: QuotaStatus): number {
  return Math.max(0, status.remaining - 1)
}

export interface SubscriptionForQuota {
  status: string
  productId?: string | null
  currentPeriodStart?: Date | string | null
  currentPeriodEnd?: Date | string | null
}

export function tierFromProductId(
  productId: string | null | undefined,
  products: Record<PlanTierId, string>
): PlanTierId {
  if (productId) {
    for (const tier of TIER_ORDER) if (products[tier] && products[tier] === productId) return tier
  }
  return 'adventurer'
}

/**
 * Campos de User derivados de una suscripción activa/trialing. Reinicia
 * periodTurns cuando empieza un período nuevo (renovación) o cuando el trial
 * pasa a pago. Un cambio de plan a mitad de período NO reinicia: sube el
 * límite y conserva lo ya jugado.
 */
export function quotaFieldsFromSubscription(
  sub: SubscriptionForQuota,
  prev: { periodStart?: Date | string | null; subStatus?: string | null },
  products: Record<PlanTierId, string>
): { planTier: PlanTierId; subStatus: string; periodStart: Date | null; periodEnd: Date | null; periodTurns?: number } {
  const periodStart = sub.currentPeriodStart ? new Date(sub.currentPeriodStart) : null
  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null
  const prevStart = prev.periodStart ? new Date(prev.periodStart) : null
  const newPeriod = !!periodStart && (!prevStart || prevStart.getTime() !== periodStart.getTime())
  const trialConverted = prev.subStatus === 'trialing' && sub.status === 'active'
  return {
    planTier: tierFromProductId(sub.productId, products),
    subStatus: sub.status,
    periodStart,
    periodEnd,
    ...(newPeriod || trialConverted ? { periodTurns: 0 } : {}),
  }
}
