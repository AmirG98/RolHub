import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

// Paddle usa su propio portal de cancelación — retornamos la URL
// Los usuarios gestionan su suscripción directamente en Paddle
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

    // Paddle gestiona la cancelación via su propio portal
    // El usuario puede cancelar desde el email de confirmación de Paddle
    // o podemos cancelar programáticamente
    const { getPaddle } = await import('@/lib/paddle')
    const paddle = getPaddle()

    const subscription = await paddle.subscriptions.get(user.stripeSubscriptionId)

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      managementUrls: subscription.managementUrls,
    })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Error al obtener info de suscripción' },
      { status: 500 }
    )
  }
}
