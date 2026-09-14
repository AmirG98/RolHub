import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPlanStatus } from '@/lib/plans/check-access'

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
    select: { plan: true, planExpiresAt: true, trialSessionUsed: true, totalTurns: true, stripeSubscriptionId: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ plan: user.plan, status: getPlanStatus(user) })
}
