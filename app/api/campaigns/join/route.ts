import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { inviteCode } = body as { inviteCode: string }

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Código de invitación requerido' },
        { status: 400 }
      )
    }

    // Find the campaign by invite code
    const campaign = await prisma.campaign.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      include: {
        participants: true,
        sessions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Código de invitación inválido' },
        { status: 404 }
      )
    }

    if (!campaign.isMultiplayer) {
      return NextResponse.json(
        { error: 'Esta campaña no acepta más jugadores' },
        { status: 400 }
      )
    }

    // Check if campaign is full
    const playerCount = campaign.participants.filter(
      p => p.role === 'PLAYER' || p.role === 'OWNER'
    ).length

    if (playerCount >= campaign.maxPlayers) {
      return NextResponse.json(
        { error: 'La campaña está llena' },
        { status: 400 }
      )
    }

    // Get the user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      // Create user if doesn't exist
      const uniqueEmail = `user_${userId}_${Date.now()}@placeholder.local`
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          username: `Jugador_${userId.slice(-6)}`,
          email: uniqueEmail,
        },
      })
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.campaignParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId: campaign.id,
          userId: user.id,
        },
      },
    })

    if (existingParticipant) {
      // User is already in the campaign, return session info
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        campaignId: campaign.id,
        campaignName: campaign.name,
        sessionId: campaign.sessions[0]?.id,
        needsCharacter: !existingParticipant.characterId,
      })
    }

    // Create participant
    const participant = await prisma.campaignParticipant.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        role: 'PLAYER',
        isOnline: true,
      },
    })

    return NextResponse.json({
      success: true,
      alreadyJoined: false,
      campaignId: campaign.id,
      campaignName: campaign.name,
      lore: campaign.lore,
      sessionId: campaign.sessions[0]?.id,
      needsCharacter: true,
      participantId: participant.id,
    })
  } catch (error) {
    console.error('Error joining campaign:', error)
    return NextResponse.json(
      { error: 'Error al unirse a la campaña', details: (error as Error).message },
      { status: 500 }
    )
  }
}
