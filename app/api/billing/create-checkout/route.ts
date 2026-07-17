import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { ensureLemonSqueezy, LS_STORE_ID, variantForPeriod } from '@/lib/lemonsqueezy'

// Crea un checkout de Lemon Squeezy y devuelve la URL para redirigir al usuario.
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
    const variantId = variantForPeriod(period === 'yearly' ? 'yearly' : 'monthly')

    if (!LS_STORE_ID || !variantId) {
      console.error('[checkout] Falta LEMONSQUEEZY_STORE_ID o variant id')
      return NextResponse.json({ error: 'Checkout no configurado' }, { status: 503 })
    }

    ensureLemonSqueezy()

    const origin = req.headers.get('origin') || 'https://rol-hub.com'
    const checkout = await createCheckout(LS_STORE_ID, variantId, {
      checkoutData: {
        email: user.email.endsWith('@placeholder.local') ? undefined : user.email,
        // custom → llega en el webhook para identificar al usuario.
        custom: { user_id: user.id, clerk_id: user.clerkId },
      },
      productOptions: {
        redirectUrl: `${origin}/?upgraded=true`,
        receiptButtonText: 'Volver a RolHub',
        receiptThankYouNote: '¡Gracias por unirte a RolHub Pro!',
      },
      checkoutOptions: { embed: false },
    })

    if (checkout.error) {
      console.error('[checkout] LS error:', checkout.error)
      return NextResponse.json({ error: 'Error al crear checkout' }, { status: 502 })
    }

    const url = checkout.data?.data.attributes.url
    if (!url) {
      return NextResponse.json({ error: 'Checkout sin URL' }, { status: 502 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error al preparar checkout' }, { status: 500 })
  }
}
