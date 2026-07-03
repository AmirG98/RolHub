import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/admin'

const VALID_PLANS = ['FREE', 'PRO', 'GUILD'] as const

// Helper para validar admin (delega en lib/auth/admin — emails desde ADMIN_EMAILS env)
async function validateAdmin(_adminClerkId: string | null): Promise<{ isAdmin: boolean; error?: NextResponse }> {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return { isAdmin: false, error: NextResponse.json({ error: admin.error }, { status: admin.status }) }
  }
  return { isAdmin: true }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminClerkId } = await auth()
    const { userId } = await params

    const adminCheck = await validateAdmin(adminClerkId)
    if (!adminCheck.isAdmin) return adminCheck.error!

    // Obtener usuario con todos sus datos
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        campaigns: {
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: {
              select: { sessions: true }
            }
          }
        },
        characters: {
          orderBy: { updatedAt: 'desc' },
        },
        sessions: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: {
            campaign: {
              select: { name: true, lore: true }
            },
            _count: {
              select: { turns: true }
            }
          }
        },
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener datos de Clerk
    let user: any = dbUser
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(dbUser.clerkId)
      user = {
        ...dbUser,
        clerkEmail: clerkUser.emailAddresses[0]?.emailAddress || null,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        lastSignInAt: clerkUser.lastSignInAt,
      }
    } catch {
      user = {
        ...dbUser,
        clerkEmail: null,
        firstName: null,
        lastName: null,
        imageUrl: null,
        lastSignInAt: null,
      }
    }

    // Calcular estadísticas del usuario
    const totalTurns = await prisma.turn.count({
      where: {
        session: {
          userId: user.id
        }
      }
    })

    const firstSession = await prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: 'asc' },
      select: { startedAt: true }
    })

    const lastSession = await prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true }
    })

    return NextResponse.json({
      user,
      stats: {
        totalTurns,
        totalSessions: user.sessions.length,
        totalCampaigns: user.campaigns.length,
        totalCharacters: user.characters.length,
        firstSessionAt: firstSession?.startedAt || null,
        lastSessionAt: lastSession?.startedAt || null,
      }
    })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH — Upgrade/downgrade manual de plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminClerkId } = await auth()
    const { userId } = await params

    const adminCheck = await validateAdmin(adminClerkId)
    if (!adminCheck.isAdmin) return adminCheck.error!

    const body = await request.json()
    const { plan } = body as { plan: string }

    if (!plan || !VALID_PLANS.includes(plan as typeof VALID_PLANS[number])) {
      return NextResponse.json(
        { error: `Plan inválido. Opciones: ${VALID_PLANS.join(', ')}` },
        { status: 400 }
      )
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Actualizar plan
    const updateData: Record<string, unknown> = { plan }

    if (plan === 'PRO' || plan === 'GUILD') {
      // Upgrade: sin expiración (manual = permanente hasta que admin lo cambie)
      updateData.planExpiresAt = null
    } else {
      // Downgrade a FREE: resetear trial para que puedan usar su sesión gratis de nuevo
      updateData.trialSessionUsed = false
      updateData.planExpiresAt = null
      updateData.stripeSubscriptionId = null
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        plan: true,
        trialSessionUsed: true,
        planExpiresAt: true,
        stripeSubscriptionId: true,
      },
    })

    return NextResponse.json({
      user: updated,
      message: `Plan actualizado a ${plan}`,
    })
  } catch (error) {
    console.error('Admin plan update error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
