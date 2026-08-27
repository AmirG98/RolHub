import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getPolar, POLAR_PRODUCT_ID, isPolarConfigured } from '@/lib/polar'

// Crea un checkout de Polar y devuelve la URL para redirigir al usuario.
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

    if (!isPolarConfigured()) {
      console.error('[checkout] Polar no configurado (falta token o product id)')
      return NextResponse.json({ error: 'Checkout no configurado' }, { status: 503 })
    }

    const origin = req.headers.get('origin') || 'https://rol-hub.com'
    const polar = getPolar()

    const checkout = await polar.checkouts.create({
      products: [POLAR_PRODUCT_ID],
      successUrl: `${origin}/?upgraded=true`,
      // Email real solo si no es placeholder (evita prefill basura)
      customerEmail: user.email.endsWith('@placeholder.local') ? undefined : user.email,
      // externalCustomerId permite reconciliar el pago con nuestro usuario en
      // el webhook sin depender de metadata.
      externalCustomerId: user.id,
      metadata: { user_id: user.id, clerk_id: user.clerkId },
    })

    if (!checkout.url) {
      return NextResponse.json({ error: 'Checkout sin URL' }, { status: 502 })
    }

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error al preparar checkout' }, { status: 500 })
  }
}
