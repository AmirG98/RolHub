import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

// Solo el plan. El Navbar lo usaba desde /api/user/progress, que es el
// endpoint pesado del dashboard (5 queries) — demasiado para un badge.
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { clerkId }, select: { plan: true } })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ plan: user.plan })
}
