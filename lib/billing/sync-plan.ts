// Sincroniza el plan de un user consultando a Polar directamente (pull).
//
// La activación normal llega por webhook (push), pero Polar redirige al
// usuario a /checkout/success ANTES de que el webhook aterrice, y un webhook
// puede perderse. Este módulo es la red: lo llama /api/billing/sync (desde la
// success page) y el camino de denegación del paywall (autocuración: un
// pagador con webhook perdido se arregla solo al intentar jugar).

import { prisma } from '@/lib/db/prisma'
import { getPlanStatus } from '@/lib/plans/check-access'
import {
  getPolar,
  isPolarConfigured,
  pickActiveSubscription,
  planFieldsFromActiveSubscription,
  POLAR_TIER_PRODUCTS,
  type PolarSubscriptionLike,
} from '@/lib/polar'
import { quotaFieldsFromSubscription, getQuotaStatus, type QuotaUser } from '@/lib/plans/quota'

export interface SyncPlanResult {
  plan: string
  active: boolean
  source: 'db' | 'polar' | 'none'
  subscriptionId: string | null
  /** Estado de la suscripción en Polar ('active' | 'trialing' | ...); null si no se consultó */
  status: string | null
}

export class PolarUnavailableError extends Error {}

/** Sincroniza el plan del user (por id interno). Idempotente. */
export async function syncPlanFromPolar(userId: string, opts: { force?: boolean } = {}): Promise<SyncPlanResult | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, plan: true, planExpiresAt: true, trialSessionUsed: true, stripeSubscriptionId: true, stripeCustomerId: true, periodStart: true, subStatus: true },
  })
  if (!user) return null

  const notActive: SyncPlanResult = { plan: user.plan, active: false, source: 'none', subscriptionId: user.stripeSubscriptionId, status: null }

  // force: consultar Polar aunque la DB ya diga PRO (cambio de plan, o
  // renovación cuyo webhook se perdió y dejó el cupo sin reiniciar).
  if (!opts.force && getPlanStatus(user) === 'pro') {
    return { plan: user.plan, active: true, source: 'db', subscriptionId: user.stripeSubscriptionId, status: null }
  }
  if (!isPolarConfigured()) return notActive

  let subs: PolarSubscriptionLike[] = []
  let polarCustomerId: string | null = null
  try {
    const state = await getPolar().customers.getStateExternal({ externalId: user.id })
    polarCustomerId = state.id
    subs = ('activeSubscriptions' in state ? state.activeSubscriptions : []) as PolarSubscriptionLike[]
  } catch (err) {
    // 404 = el usuario nunca llegó a ser customer en Polar (no pagó). No es error.
    if ((err as { statusCode?: number })?.statusCode === 404) return notActive
    throw new PolarUnavailableError(err instanceof Error ? err.message : 'polar error')
  }

  const sub = pickActiveSubscription(subs)
  if (!sub) return notActive

  const fields = {
    ...planFieldsFromActiveSubscription(sub),
    ...quotaFieldsFromSubscription(sub, user, POLAR_TIER_PRODUCTS),
  }
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { ...fields, stripeCustomerId: polarCustomerId ?? user.stripeCustomerId },
    })
  } catch (err) {
    // stripeCustomerId es @unique: si otro user ya lo tiene, activar igual sin él.
    // Cualquier otro error (DB caída, etc.) se propaga: no hay que enmascararlo.
    if ((err as { code?: string })?.code !== 'P2002') throw err
    console.warn(`[billing/sync] stripeCustomerId ${polarCustomerId} ya tomado; activo a ${user.id} sin él`)
    await prisma.user.update({ where: { id: user.id }, data: fields })
  }
  return { plan: 'PRO', active: true, source: 'polar', subscriptionId: sub.id, status: sub.status }
}

// Cupo agotado: antes de frenar al jugador, refrescamos desde Polar por si
// la renovación (o un upgrade) no llegó por webhook. Throttle propio.
const lastQuotaRefresh = new Map<string, number>()
const QUOTA_REFRESH_TTL_MS = 5 * 60 * 1000

/** Devuelve los campos de cupo actualizados si Polar tenía novedades y queda cupo; null si no. */
export async function maybeRefreshQuotaOnExhausted(userId: string): Promise<QuotaUser | null> {
  const now = Date.now()
  const last = lastQuotaRefresh.get(userId)
  if (last !== undefined && now - last < QUOTA_REFRESH_TTL_MS) return null
  try {
    await syncPlanFromPolar(userId, { force: true })
    lastQuotaRefresh.set(userId, now)
    const fresh = await prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, subStatus: true, periodStart: true, periodEnd: true, periodTurns: true },
    })
    if (!fresh) return null
    const q = getQuotaStatus(fresh)
    return !q.enforced || q.remaining > 0 ? fresh : null
  } catch (err) {
    console.warn('[billing/sync] refresco de cupo falló:', err instanceof Error ? err.message : err)
    return null
  }
}

// Throttle por user para el camino de denegación del paywall: un FREE que
// choca contra el muro repetidas veces no debe generar una llamada a Polar
// por intento. Memoria por instancia (serverless): suficiente como freno.
const lastDenySync = new Map<string, number>()
const DENY_SYNC_TTL_MS = 10 * 60 * 1000

/**
 * Versión para el paywall: nunca lanza, y como mucho consulta Polar una vez
 * cada 10 min por user. Devuelve true si el user resultó tener plan activo.
 */
export async function maybeSyncPlanOnDeny(userId: string): Promise<boolean> {
  const now = Date.now()
  const last = lastDenySync.get(userId)
  if (last !== undefined && now - last < DENY_SYNC_TTL_MS) return false
  try {
    const r = await syncPlanFromPolar(userId)
    // El throttle se estampa solo tras una consulta COMPLETA: si Polar estaba
    // caído, el próximo intento del pagador vuelve a consultar.
    lastDenySync.set(userId, now)
    return r?.active === true
  } catch (err) {
    console.warn('[billing/sync] autocuración en paywall falló:', err instanceof Error ? err.message : err)
    return false
  }
}
