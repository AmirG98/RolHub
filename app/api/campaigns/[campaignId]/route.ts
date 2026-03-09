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

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: {
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
              },
            },
          },
        },
        sessions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            startedAt: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    // Get current user to check if they have a character
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    // Find current user's character in this campaign
    let currentUserCharacter = null
    if (currentUser) {
      const currentParticipant = campaign.participants.find(
        p => p.userId === currentUser.id
      )
      if (currentParticipant?.character) {
        currentUserCharacter = currentParticipant.character
      }
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        lore: campaign.lore,
        engine: campaign.engine,
        mode: campaign.mode,
        isMultiplayer: campaign.isMultiplayer,
        maxPlayers: campaign.maxPlayers,
        inviteCode: campaign.inviteCode,
        dmMode: campaign.dmMode,
        status: campaign.status,
        createdAt: campaign.createdAt,
        owner: campaign.user,
        participants: campaign.participants,
        latestSession: campaign.sessions[0] || null,
      },
      currentUserCharacter,
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Error al obtener campaña' },
      { status: 500 }
    )
  }
}
