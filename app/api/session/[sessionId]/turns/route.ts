import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

interface RouteParams {
  params: Promise<{
    sessionId: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { sessionId } = await params

    // Get the session with its turns
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { createdAt: 'asc' },
        },
        campaign: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    // Verify user has access to this session
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const participant = await prisma.campaignParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId: session.campaign.id,
          userId: user.id,
        },
      },
    })

    // Also check if user is the session owner
    const isOwner = session.userId === user.id

    if (!participant && !isOwner) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta sesión' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      turns: session.turns,
      sessionId: session.id,
      campaignId: session.campaign.id,
    })
  } catch (error) {
    console.error('Error fetching turns:', error)
    return NextResponse.json(
      { error: 'Error al obtener turnos' },
      { status: 500 }
    )
  }
}
