import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'

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

    // Si ya tiene plan PRO activo, redirigir al portal
    if (user.plan === 'PRO' || user.plan === 'GUILD') {
      return NextResponse.json({ error: 'Ya tienes un plan activo. Usa el portal para gestionar tu suscripción.' }, { status: 400 })
    }

    const body = await req.json()
    const { period } = body as { period: 'monthly' | 'yearly' }

    const priceId = period === 'yearly'
      ? STRIPE_PRICES.PRO_YEARLY
      : STRIPE_PRICES.PRO_MONTHLY

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
    }

    // Buscar o crear Stripe Customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: user.clerkId,
        },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Crear Checkout Session
    const origin = req.headers.get('origin') || 'https://rol-hub.vercel.app'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}
