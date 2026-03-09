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
    const { campaignId, name, archetype, stats, inventory } = body

    if (!campaignId || !name || !archetype) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        sessions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    // Check if user is a participant
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
        { error: 'No eres participante de esta campaña' },
        { status: 403 }
      )
    }

    if (participant.characterId) {
      return NextResponse.json(
        { error: 'Ya tienes un personaje en esta campaña' },
        { status: 400 }
      )
    }

    // Create character
    const character = await prisma.character.create({
      data: {
        name,
        lore: campaign.lore,
        archetype,
        userId: user.id,
        campaignId,
        stats: stats || {
          hp: 20,
          maxHp: 20,
          level: 1,
          experience: 0,
          combat: 2,
          exploration: 2,
          social: 2,
          lore: 2,
        },
        inventory: inventory || [],
      },
    })

    // Update participant with character
    await prisma.campaignParticipant.update({
      where: { id: participant.id },
      data: {
        characterId: character.id,
      },
    })

    // Update world state to add this character to party
    const worldState = campaign.worldState as any
    const updatedWorldState = {
      ...worldState,
      party: {
        ...worldState.party,
        [name]: {
          hp: `${stats?.hp || 20}/${stats?.maxHp || 20}`,
          level: 1,
          experience: 0,
          conditions: [],
          active_effects: [],
          inventory: inventory || [],
          relationships: {},
        },
      },
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { worldState: updatedWorldState },
    })

    return NextResponse.json({
      success: true,
      characterId: character.id,
      sessionId: campaign.sessions[0]?.id,
    })
  } catch (error) {
    console.error('Error creating character for campaign:', error)
    return NextResponse.json(
      { error: 'Error al crear personaje' },
      { status: 500 }
    )
  }
}
