import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPolar } from '@/lib/polar'

// Polar: una customer session da una URL de portal donde el usuario gestiona
// o cancela su suscripción. La sesión se crea por externalCustomerId (= user.id,
// que seteamos en el checkout).
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No tienes una suscripción activa' }, { status: 400 })
    }

    const polar = getPolar()
    const session = await polar.customerSessions.create({
      customerExternalId: user.id,
    } as any)

    return NextResponse.json({
      customerPortalUrl: session.customerPortalUrl,
    })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Error al obtener el portal' }, { status: 500 })
  }
}
