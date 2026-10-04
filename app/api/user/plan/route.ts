import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPlanStatus } from '@/lib/plans/check-access'
import { getQuotaStatus } from '@/lib/plans/quota'

export const dynamic = 'force-dynamic'

// Plan + estado efectivo. El Navbar lo usaba desde /api/user/progress, que
// es el endpoint pesado del dashboard (5 queries) — demasiado para un badge.
// `status` distingue un PRO vigente de uno vencido (planExpiresAt pasado):
// /pricing tiene que ofrecerle a un PRO vencido volver a suscribirse, no
// "gestionar" una suscripción que ya no existe.
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      plan: true, planExpiresAt: true, trialSessionUsed: true, totalTurns: true, stripeSubscriptionId: true,
      planTier: true, subStatus: true, periodStart: true, periodEnd: true, periodTurns: true,
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  const status = getPlanStatus(user)
  // Cupo del plan pago (para /pricing y el contador en la UI). null si es FREE.
  const q = status === 'pro' ? getQuotaStatus(user) : null
  return NextResponse.json({
    plan: user.plan,
    status,
    tier: q?.tier ?? null,
    quota: q
      ? { enforced: q.enforced, kind: q.kind, limit: q.limit, used: q.used, remaining: q.remaining, nextTier: q.nextTier, resetsAt: q.resetsAt?.toISOString() ?? null }
      : null,
  })
}
