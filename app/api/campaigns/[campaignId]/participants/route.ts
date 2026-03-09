import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

interface RouteParams {
  params: Promise<{
    campaignId: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { campaignId } = await params

    // Verify user has access to this campaign
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const participant = await prisma.campaignParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId,
          userId: user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta campaña' },
        { status: 403 }
      )
    }

    // Get all participants with their characters
    const participants = await prisma.campaignParticipant.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            archetype: true,
            level: true,
            stats: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    // Get world state to include HP
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { worldState: true },
    })

    const worldState = campaign?.worldState as any

    // Enrich participants with HP info
    const enrichedParticipants = participants.map(p => {
      const characterHP = p.character
        ? worldState?.party?.[p.character.name]?.hp ||
          `${(p.character.stats as any)?.hp || 20}/${(p.character.stats as any)?.maxHp || 20}`
        : null

      return {
        id: p.id,
        role: p.role,
        isOnline: p.isOnline,
        lastSeenAt: p.lastSeenAt,
        joinedAt: p.joinedAt,
        user: p.user,
        character: p.character
          ? {
              ...p.character,
              hp: characterHP,
            }
          : null,
      }
    })

    return NextResponse.json({
      participants: enrichedParticipants,
      currentUserId: user.id,
    })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Error al obtener participantes' },
      { status: 500 }
    )
  }
}

// Update online status
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { campaignId } = await params
    const body = await req.json()
    const { isOnline } = body as { isOnline: boolean }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const participant = await prisma.campaignParticipant.update({
      where: {
        campaignId_userId: {
          campaignId,
          userId: user.id,
        },
      },
      data: {
        isOnline,
        lastSeenAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, participant })
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Error al actualizar participante' },
      { status: 500 }
    )
  }
}
