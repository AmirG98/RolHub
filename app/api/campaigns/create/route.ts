import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { generateInviteCode, getInviteUrl } from '@/lib/utils/invite-code'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lore, mode, engine, characterName, isMultiplayer = false, maxPlayers = 8 } = body

    //  Crear o buscar usuario en DB
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Crear usuario si no existe
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          username: 'Player',
          email: `${userId}@temp.com`, // Temporal, se actualiza con Clerk webhook
        }
      })
    }

    // Generate invite code for multiplayer campaigns
    let inviteCode: string | null = null
    if (isMultiplayer) {
      // Ensure unique invite code
      let isUnique = false
      while (!isUnique) {
        inviteCode = generateInviteCode()
        const existing = await prisma.campaign.findUnique({
          where: { inviteCode },
        })
        if (!existing) isUnique = true
      }
    }

    // Crear campaña
    const campaign = await prisma.campaign.create({
      data: {
        name: `${lore.replace('_', ' ')} Adventure`,
        lore,
        engine,
        mode,
        userId: user.id,
        isMultiplayer,
        maxPlayers: isMultiplayer ? maxPlayers : 1,
        inviteCode,
        worldState: {
          campaign_id: '',
          lore,
          engine,
          session_count: 0,
          act: 1,
          narrative_anchors_hit: [],
          party: {},
          world_flags: {},
          active_quests: [],
          completed_quests: [],
          failed_quests: [],
          npc_states: {},
          faction_relations: {},
          current_scene: 'Inicio',
          time_in_world: 'Día 1',
          weather: 'Despejado'
        }
      }
    })

    // Actualizar el worldState con el campaign_id
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        worldState: {
          ...campaign.worldState as any,
          campaign_id: campaign.id
        }
      }
    })

    // Crear personaje
    const character = await prisma.character.create({
      data: {
        name: characterName,
        lore,
        archetype: 'Aventurero', // Default
        userId: user.id,
        campaignId: campaign.id,
        stats: {
          hp: 20,
          maxHp: 20,
          level: 1,
          experience: 0
        },
        inventory: []
      }
    })

    // Crear primera sesión
    const session = await prisma.session.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        partyCheckLog: []
      }
    })

    // Crear primer turn del DM
    await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'DM',
        content: `Bienvenido a ${lore.replace('_', ' ')}, ${characterName}. Tu aventura está por comenzar...`
      }
    })

    // Create campaign participant for owner
    await prisma.campaignParticipant.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        characterId: character.id,
        role: 'OWNER',
        isOnline: true,
      },
    })

    return NextResponse.json({
      campaignId: campaign.id,
      sessionId: session.id,
      characterId: character.id,
      inviteCode: campaign.inviteCode,
      inviteUrl: campaign.inviteCode ? getInviteUrl(campaign.inviteCode) : null,
    })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
