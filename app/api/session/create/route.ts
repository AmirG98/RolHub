import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

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

    const body = await req.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 })
    }

    // Fetch the campaign with participants
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        participants: true,
        sessions: {
          where: { endedAt: null },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    // Check if user is the owner or a participant
    const isOwner = campaign.userId === user.id
    const participant = campaign.participants.find(p => p.userId === user.id)

    if (!isOwner && !participant) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta campaña' },
        { status: 403 }
      )
    }

    // Only the owner can create new sessions
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Solo el anfitrión puede iniciar sesiones' },
        { status: 403 }
      )
    }

    // Check if there's already an active session
    if (campaign.sessions.length > 0) {
      const activeSession = campaign.sessions[0]
      return NextResponse.json({
        sessionId: activeSession.id,
        message: 'Sesión existente encontrada',
        isExisting: true,
      })
    }

    // Create a new session
    const session = await prisma.session.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
      },
    })

    // Update campaign status to ACTIVE if it was paused
    if (campaign.status !== 'ACTIVE') {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'ACTIVE' },
      })
    }

    return NextResponse.json({
      sessionId: session.id,
      message: 'Sesión creada exitosamente',
      isExisting: false,
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesión' },
      { status: 500 }
    )
  }
}
