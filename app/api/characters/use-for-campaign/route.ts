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
    const { campaignId, characterId } = body

    if (!campaignId || !characterId) {
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

    // Get character and verify ownership
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    })

    if (!character) {
      return NextResponse.json({ error: 'Personaje no encontrado' }, { status: 404 })
    }

    if (character.userId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para usar este personaje' },
        { status: 403 }
      )
    }

    // Verify lore matches
    if (character.lore !== campaign.lore) {
      return NextResponse.json(
        { error: 'Este personaje no es compatible con esta campaña' },
        { status: 400 }
      )
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

    // Update participant with character (this replaces any existing character assignment)
    await prisma.campaignParticipant.update({
      where: { id: participant.id },
      data: {
        characterId: character.id,
      },
    })

    // Update character to link to this campaign
    await prisma.character.update({
      where: { id: characterId },
      data: {
        campaignId: campaignId,
      },
    })

    // Update world state to add/update this character in party
    const worldState = campaign.worldState as any
    const stats = character.stats as any
    const inventory = character.inventory as string[]

    const updatedWorldState = {
      ...worldState,
      party: {
        ...worldState.party,
        [character.name]: {
          hp: `${stats?.hp || 20}/${stats?.maxHp || 20}`,
          level: character.level,
          experience: character.experience,
          conditions: character.conditions || [],
          active_effects: character.activeEffects || [],
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
    console.error('Error using character for campaign:', error)
    return NextResponse.json(
      { error: 'Error al asignar personaje' },
      { status: 500 }
    )
  }
}
