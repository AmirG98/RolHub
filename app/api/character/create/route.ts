import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { Lore, GameMode, GameEngine, TutorialLevel } from '@prisma/client'
import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Parsear request body
    const body = await req.json()
    const { lore, mode, engine, tutorialLevel, archetypeId, characterName } = body as {
      lore: Lore
      mode: GameMode
      engine: GameEngine
      tutorialLevel: TutorialLevel
      archetypeId: string
      characterName?: string
    }

    // Validar campos requeridos
    if (!lore || !mode || !engine || !tutorialLevel || !archetypeId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Buscar el usuario por clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      // Generar email único usando timestamp para evitar conflictos
      const uniqueEmail = `user_${userId}_${Date.now()}@placeholder.local`

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          username: `Usuario_${userId.slice(-6)}`,
          email: uniqueEmail,
          tutorialLevel,
        },
      })
    } else if (user.tutorialLevel !== tutorialLevel) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { tutorialLevel },
      })
    }

    // Cargar datos del lore según el seleccionado
    const loreDataMap: Record<Lore, any> = {
      LOTR: lotrData,
      ZOMBIES: zombiesData,
      ISEKAI: isekaiData,
      VIKINGOS: vikingosData,
      STAR_WARS: starwarsData,
      CYBERPUNK: cyberpunkData,
      LOVECRAFT_HORROR: lovecraftData,
      CUSTOM: lotrData, // Fallback
    }

    const loreData = loreDataMap[lore]
    if (!loreData) {
      return NextResponse.json({ error: 'Lore no encontrado' }, { status: 404 })
    }

    // Buscar el arquetipo seleccionado
    const archetype = loreData.archetypes.find((a: any) => a.id === archetypeId)
    if (!archetype) {
      return NextResponse.json({ error: 'Arquetipo no encontrado' }, { status: 404 })
    }
    const archetypeData = archetype as any

    // Generar el world state inicial
    const initialWorldState = {
      campaign_id: '', // Se llenará después de crear la campaña
      lore,
      engine,
      session_count: 0,
      act: 1,
      narrative_anchors_hit: [],
      party: {
        [characterName || archetypeData.name]: {
          hp: `${archetypeData.starting_stats.hp}/${archetypeData.starting_stats.maxHp}`,
          level: 1,
          experience: 0,
          conditions: [],
          active_effects: [],
          inventory: archetypeData.starting_inventory,
          relationships: {},
        },
      },
      world_flags: {},
      active_quests: mode === 'ONE_SHOT' ? ['Misión Inicial'] : [],
      completed_quests: [],
      failed_quests: [],
      npc_states: {},
      faction_relations: {},
      current_scene: loreData.locations[0].name, // Primera locación del lore
      time_in_world: 'Día 1, mañana',
      weather: 'Cielo despejado',
    }

    // Crear Campaign, Character y Session en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la campaña
      const campaign = await tx.campaign.create({
        data: {
          userId: user.id,
          name: mode === 'ONE_SHOT'
            ? `Aventura en ${loreData.name}`
            : `Campaña en ${loreData.name}`,
          lore,
          engine,
          mode,
          worldState: initialWorldState,
        },
      })

      // Actualizar el campaign_id en el world state
      const updatedWorldState = {
        ...initialWorldState,
        campaign_id: campaign.id,
      }

      await tx.campaign.update({
        where: { id: campaign.id },
        data: { worldState: updatedWorldState },
      })

      // 2. Crear el personaje
      const character = await tx.character.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          name: characterName || archetypeData.name,
          lore,
          archetype: archetypeData.name,
          level: 1,
          experience: 0,
          stats: archetypeData.starting_stats,
          inventory: archetypeData.starting_inventory,
          conditions: [],
          activeEffects: [],
          backstory: archetypeData.description,
        },
      })

      // 3. Crear la primera sesión
      const session = await tx.session.create({
        data: {
          campaignId: campaign.id,
          userId: user.id,
          summary: null,
          partyCheckLog: [],
        },
      })

      // 4. Crear el primer turn del sistema con el hook narrativo
      const narrativeHook = mode === 'ONE_SHOT'
        ? loreData.one_shot_hook
        : loreData.narrative_skeleton.act_1.description

      await tx.turn.create({
        data: {
          sessionId: session.id,
          role: 'SYSTEM',
          content: `Bienvenido a ${loreData.name}. ${narrativeHook}`,
          createdAt: new Date(),
        },
      })

      return { campaign, character, session }
    })

    // Retornar el ID de la sesión para redirigir
    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      campaignId: result.campaign.id,
      characterId: result.character.id,
    })
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json(
      { error: 'Error al crear el personaje', details: (error as Error).message },
      { status: 500 }
    )
  }
}
