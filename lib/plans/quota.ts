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
 * Fecha de lanzamiento del cupo (lanzado el 2026-10-04 22:00 UTC). Rige para
 * períodos de facturación que empiezan desde acá; quien se suscribió ANTES
 * conserva ilimitado hasta su quotaExemptUntil (ver getQuotaStatus). No
 * mover hacia atrás: le recortaría a gente que contrató "ilimitado". null =
 * apagado del todo. La env QUOTA_ENFORCED_FROM la pisa si existe.
 */
export const QUOTA_ENFORCED_FROM_DEFAULT: string | null = '2026-10-04T22:00:00Z'

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
  /** alta de la suscripción en Polar */
  subscribedAt?: Date | string | null
  /** quien se suscribió antes del lanzamiento conserva ilimitado hasta acá */
  quotaExemptUntil?: Date | string | null
}

const toDate = (v: Date | string | null | undefined): Date | null => (v ? new Date(v) : null)

/** Suma un mes calendario (UTC). 31 ene → 3 mar: se pasa de largo, a favor del usuario. */
export function addOneMonth(d: Date): Date {
  const r = new Date(d)
  r.setUTCMonth(r.getUTCMonth() + 1)
  return r
}

/**
 * ¿Se suscribió antes de que existiera el cupo? Sin fecha de alta conocida se
 * asume que SÍ (a favor del usuario: nunca se le recorta por un dato faltante).
 */
export function isGrandfathered(subscribedAt: Date | string | null | undefined, enforcedFrom: Date): boolean {
  const s = toDate(subscribedAt)
  return !s || s.getTime() < enforcedFrom.getTime()
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

/**
 * GARANTÍA LEGAL (decisión del user, 2026-10-04): quien se suscribió cuando
 * el plan era "8.99 ilimitado" conserva ilimitado hasta terminar el período
 * PAGO que tenía contratado — y si estaba en el trial, hasta terminar su
 * primer mes pago. El cupo rige solo si se cumplen TODAS:
 *   1. hay fecha de lanzamiento,
 *   2. el período de facturación actual empezó en/después del lanzamiento,
 *   3. y, para los que se suscribieron antes del lanzamiento, ya pasó su
 *      quotaExemptUntil. Si esa fecha todavía no se calculó → ilimitado.
 */
export function getQuotaStatus(
  user: QuotaUser,
  enforcedFrom: Date | null = quotaEnforcedFrom(),
  now: Date = new Date()
): QuotaStatus {
  const tier: PlanTierId = isTierId(user.planTier) ? user.planTier : 'adventurer'
  const inTrial = user.subStatus === 'trialing'
  const limit = inTrial ? SUB_TRIAL_TURNS : TIERS[tier].turns
  const used = Math.max(0, Math.floor(user.periodTurns ?? 0))
  const periodStart = toDate(user.periodStart)
  let enforced = !!enforcedFrom && !!periodStart && periodStart.getTime() >= enforcedFrom.getTime()
  if (enforced && enforcedFrom && isGrandfathered(user.subscribedAt, enforcedFrom)) {
    const exemptUntil = toDate(user.quotaExemptUntil)
    if (!exemptUntil || now.getTime() < exemptUntil.getTime()) enforced = false
  }
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
  startedAt?: Date | string | null
  createdAt?: Date | string | null
  trialEnd?: Date | string | null
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
  prev: {
    periodStart?: Date | string | null
    subStatus?: string | null
    subscribedAt?: Date | string | null
    quotaExemptUntil?: Date | string | null
  },
  products: Record<PlanTierId, string>,
  enforcedFrom: Date | null = quotaEnforcedFrom()
): {
  planTier: PlanTierId
  subStatus: string
  periodStart: Date | null
  periodEnd: Date | null
  subscribedAt: Date | null
  quotaExemptUntil: Date | null
  periodTurns?: number
} {
  const periodStart = toDate(sub.currentPeriodStart)
  const periodEnd = toDate(sub.currentPeriodEnd)
  const prevStart = toDate(prev.periodStart)
  const newPeriod = !!periodStart && (!prevStart || prevStart.getTime() !== periodStart.getTime())
  const trialConverted = prev.subStatus === 'trialing' && sub.status === 'active'

  // Alta: se fija una sola vez (la primera conocida).
  const subscribedAt = toDate(prev.subscribedAt) ?? toDate(sub.startedAt) ?? toDate(sub.createdAt)

  // Hasta cuándo conserva ilimitado quien se suscribió antes del cupo. Se
  // calcula UNA vez, con el período vigente al verlo por primera vez:
  //  - pagando: fin de ese período pago;
  //  - en trial: fin del trial + 1 mes (su primer mes pago completo).
  let quotaExemptUntil = toDate(prev.quotaExemptUntil)
  if (!quotaExemptUntil && enforcedFrom && isGrandfathered(subscribedAt, enforcedFrom)) {
    if (sub.status === 'trialing') {
      const trialEnd = toDate(sub.trialEnd) ?? periodEnd
      quotaExemptUntil = trialEnd ? addOneMonth(trialEnd) : null
    } else {
      quotaExemptUntil = periodEnd
    }
  }

  return {
    planTier: tierFromProductId(sub.productId, products),
    subStatus: sub.status,
    periodStart,
    periodEnd,
    subscribedAt,
    quotaExemptUntil,
    ...(newPeriod || trialConverted ? { periodTurns: 0 } : {}),
  }
}
