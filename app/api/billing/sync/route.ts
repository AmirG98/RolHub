import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { syncPlanFromPolar, PolarUnavailableError } from '@/lib/billing/sync-plan'

export const dynamic = 'force-dynamic'

// Lo llama /checkout/success mientras espera que Polar confirme el pago.
// La lógica vive en lib/billing/sync-plan.ts (compartida con el paywall).
export async function POST() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    const result = await syncPlanFromPolar(user.id)
    if (!result) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof PolarUnavailableError) {
      console.error('[billing/sync] Polar no disponible:', error.message)
      return NextResponse.json({ error: 'sync failed' }, { status: 502 })
    }
    console.error('[billing/sync] error:', error)
    return NextResponse.json({ error: 'sync failed' }, { status: 500 })
  }
}
