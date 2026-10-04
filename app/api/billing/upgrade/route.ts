import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPolar, isPolarConfigured, POLAR_TIER_PRODUCTS } from '@/lib/polar'
import { planUpgrade, type UpgradeAction } from '@/lib/billing/upgrade'
import { syncPlanFromPolar } from '@/lib/billing/sync-plan'
import { getQuotaStatus } from '@/lib/plans/quota'

export const dynamic = 'force-dynamic'

// Sube de plan (o corta el trial) sobre la suscripción existente del usuario.
// El cobro lo hace Polar con el medio de pago ya guardado; acá solo se pide
// el cambio y se resincroniza el plan y el cupo.
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, stripeSubscriptionId: true, planTier: true, subStatus: true },
    })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    if (!isPolarConfigured()) return NextResponse.json({ error: 'Billing no configurado' }, { status: 503 })

    const body = (await req.json().catch(() => ({}))) as { action?: UpgradeAction; tier?: unknown }
    const action: UpgradeAction = body.action === 'start_now' ? 'start_now' : 'upgrade'
    const plan = planUpgrade(user, action, body.tier, POLAR_TIER_PRODUCTS)
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status })

    await getPolar().subscriptions.update({ id: user.stripeSubscriptionId!, subscriptionUpdate: plan.update })

    // Polar es la fuente de verdad: releer la suscripción y guardar plan + cupo.
    await syncPlanFromPolar(user.id, { force: true })
    const fresh = await prisma.user.findUnique({
      where: { id: user.id },
      select: { planTier: true, subStatus: true, periodStart: true, periodEnd: true, periodTurns: true, subscribedAt: true, quotaExemptUntil: true },
    })
    const quota = fresh ? getQuotaStatus(fresh) : null
    return NextResponse.json({
      ok: true,
      tier: fresh?.planTier ?? plan.targetTier,
      quota: quota ? { limit: quota.limit, used: quota.used, remaining: quota.remaining, enforced: quota.enforced } : null,
    })
  } catch (error) {
    console.error('[billing/upgrade] error:', error)
    return NextResponse.json({ error: 'upgrade_failed' }, { status: 502 })
  }
}
