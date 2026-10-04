import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getPolar, isPolarConfigured, POLAR_TIER_PRODUCTS } from '@/lib/polar'
import { quotaFieldsFromSubscription, getQuotaStatus } from '@/lib/plans/quota'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Backfill del cupo para los suscriptores EXISTENTES: lee cada suscripción
 * en Polar y guarda plan, estado, período, fecha de alta y —lo importante—
 * hasta cuándo conservan ilimitado (quotaExemptUntil). Correrlo antes de
 * fijar la fecha de lanzamiento deja a cada uno con su fecha exacta (fin del
 * período pago vigente; para los que están en trial, fin del primer mes pago).
 *
 * No toca plan ni cobros ni el contador de turnos. Idempotente: la fecha de
 * exención se calcula una sola vez. ?dry=1 muestra sin escribir.
 * Protegido por CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!isPolarConfigured()) return NextResponse.json({ error: 'polar not configured' }, { status: 503 })

  const dry = req.nextUrl.searchParams.get('dry') === '1'
  const users = await prisma.user.findMany({
    where: { plan: { not: 'FREE' }, stripeSubscriptionId: { not: null } },
    select: {
      id: true, username: true, stripeSubscriptionId: true, planTier: true, subStatus: true,
      periodStart: true, periodEnd: true, periodTurns: true, subscribedAt: true, quotaExemptUntil: true,
    },
  })

  const polar = getPolar()
  const results: Array<Record<string, unknown>> = []
  for (const u of users) {
    const subId = u.stripeSubscriptionId!
    // ids numéricos = suscripciones viejas de Lemon Squeezy: no existen en Polar
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(subId)) {
      results.push({ user: u.username, skipped: 'not_a_polar_subscription' })
      continue
    }
    try {
      const sub = await polar.subscriptions.get({ id: subId })
      // periodTurns fuera: el backfill no reinicia el contador de nadie
      const { periodTurns: _reset, ...fields } = quotaFieldsFromSubscription(sub, u, POLAR_TIER_PRODUCTS)
      if (!dry) await prisma.user.update({ where: { id: u.id }, data: fields })
      const q = getQuotaStatus({ ...u, ...fields })
      results.push({
        user: u.username,
        status: sub.status,
        tier: fields.planTier,
        periodStart: fields.periodStart?.toISOString().slice(0, 10) ?? null,
        periodEnd: fields.periodEnd?.toISOString().slice(0, 10) ?? null,
        subscribedAt: fields.subscribedAt?.toISOString().slice(0, 10) ?? null,
        unlimitedUntil: fields.quotaExemptUntil?.toISOString().slice(0, 10) ?? null,
        enforcedNow: q.enforced,
      })
    } catch (err) {
      results.push({ user: u.username, error: err instanceof Error ? err.message.slice(0, 120) : 'error' })
    }
  }
  return NextResponse.json({ dry, count: results.length, results })
}
