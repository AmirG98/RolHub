import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { buildAbilitiesForArchetype, toRuntime } from '@/lib/game/abilities'
import type { Archetype } from '@/lib/types/lore'

import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'
import dndClassicData from '@/data/lores/dnd-classic.json'
import romantasyData from '@/data/lores/romantasy.json'
import cozyWitchData from '@/data/lores/cozy-witch.json'

const LORE_DATA_MAP: Record<string, any> = {
  LOTR: lotrData, ZOMBIES: zombiesData, ISEKAI: isekaiData,
  VIKINGOS: vikingosData, STAR_WARS: starwarsData, CYBERPUNK: cyberpunkData,
  LOVECRAFT_HORROR: lovecraftData, DND_CLASSIC: dndClassicData,
  ROMANTASY: romantasyData, COZY_WITCH: cozyWitchData,
}

// Buscar archetype por id exacto, o fallback a matching de name (caso en que archetype es el nombre localizado)
function resolveArchetype(loreKey: string, archetypeKey: string): Archetype | undefined {
  const data = LORE_DATA_MAP[loreKey]
  if (!data || !Array.isArray(data.archetypes)) return undefined
  const exactById = data.archetypes.find((a: any) => a.id === archetypeKey)
  if (exactById) return exactById as Archetype
  const lowered = archetypeKey.toLowerCase().trim()
  return data.archetypes.find((a: any) => {
    if (typeof a.name === 'string') return a.name.toLowerCase() === lowered
    return (a.name?.es?.toLowerCase() === lowered) || (a.name?.en?.toLowerCase() === lowered)
  }) as Archetype | undefined
}

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

    // If participant already has a character, remove it from party (we're replacing it)
    if (participant.characterId) {
      const oldCharacter = await prisma.character.findUnique({
        where: { id: participant.characterId },
      })
      if (oldCharacter) {
        // Remove old character from world state party
        const currentWorldState = campaign.worldState as any
        if (currentWorldState.party && currentWorldState.party[oldCharacter.name]) {
          delete currentWorldState.party[oldCharacter.name]
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { worldState: currentWorldState },
          })
        }
      }
    }

    // Resolve archetype para construir abilities según engine
    const resolvedArchetype = resolveArchetype(campaign.lore, archetype)
    const abilitiesTemplate = resolvedArchetype
      ? buildAbilitiesForArchetype(resolvedArchetype, campaign.engine)
      : []
    const abilitiesRuntime = abilitiesTemplate.map(toRuntime)

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
        abilities: abilitiesTemplate as any,
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
          abilities: abilitiesRuntime,
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
