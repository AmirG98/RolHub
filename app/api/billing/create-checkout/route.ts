import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { PADDLE_PRICES } from '@/lib/paddle'

// Retorna los datos necesarios para abrir el Paddle checkout overlay en el frontend
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.plan === 'PRO' || user.plan === 'GUILD') {
      return NextResponse.json({ error: 'Ya tienes un plan activo' }, { status: 400 })
    }

    const body = await req.json()
    const { period } = body as { period: 'monthly' | 'yearly' }

    const priceId = period === 'yearly'
      ? PADDLE_PRICES.PRO_YEARLY
      : PADDLE_PRICES.PRO_MONTHLY

    // Paddle usa overlay checkout en el frontend — le pasamos los datos necesarios
    return NextResponse.json({
      priceId,
      customData: {
        userId: user.id,
        clerkId: user.clerkId,
      },
      customerEmail: user.email,
      paddleCustomerId: user.stripeCustomerId || undefined, // reutilizamos el campo para Paddle customer ID
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error al preparar checkout' },
      { status: 500 }
    )
  }
}
