import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Tu email de admin
const ADMIN_EMAILS = ['amir.gomez.14@gmail.com']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminClerkId } = await auth()
    const { userId } = await params

    if (!adminClerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si es admin
    const adminUser = await prisma.user.findFirst({
      where: { clerkId: adminClerkId }
    })

    if (!adminUser || !ADMIN_EMAILS.includes(adminUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'No tienes permisos de admin' }, { status: 403 })
    }

    // Obtener usuario con todos sus datos
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
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
