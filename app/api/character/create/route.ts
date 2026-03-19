import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { Lore, GameMode, GameEngine, TutorialLevel, Prisma } from '@prisma/client'
import { createCampaignMapState } from '@/lib/maps/map-init'
import { getExampleMapData } from '@/lib/maps/lore-map-data'

// Generar código de invitación único de 6 caracteres
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin caracteres confusos (0,O,1,I)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
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
    const {
      lore, mode, engine, tutorialLevel, archetypeId, characterName, isMultiplayer,
      isDnD5eCharacter, dnd5eStats, dnd5eInventory, dnd5eLevel
    } = body as {
      lore: Lore
      mode: GameMode
      engine: GameEngine
      tutorialLevel: TutorialLevel
      archetypeId: string
      characterName?: string
      isMultiplayer?: boolean
      // D&D 5e specific fields
      isDnD5eCharacter?: boolean
      dnd5eStats?: Record<string, number | string>
      dnd5eInventory?: string[]
      dnd5eLevel?: number
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

    // Datos del personaje - difieren entre D&D 5e y arquetipos narrativos
    let charName: string
    let charArchetype: string
    let charStats: any
    let charInventory: string[]
    let charLevel: number

    if (isDnD5eCharacter && dnd5eStats) {
      // Personaje D&D 5e creado con el creador completo
      charName = characterName || 'Aventurero'
      charArchetype = archetypeId // e.g., "dnd5e_fighter_human"
      charStats = {
        hp: dnd5eStats.hp || 10,
        maxHp: dnd5eStats.maxHp || 10,
        ac: dnd5eStats.ac || 10,
        STR: dnd5eStats.STR || 10,
        DEX: dnd5eStats.DEX || 10,
        CON: dnd5eStats.CON || 10,
        INT: dnd5eStats.INT || 10,
        WIS: dnd5eStats.WIS || 10,
        CHA: dnd5eStats.CHA || 10,
        proficiencyBonus: dnd5eStats.proficiencyBonus || 2,
        className: dnd5eStats.className || '',
        raceName: dnd5eStats.raceName || '',
      }
      charInventory = dnd5eInventory || []
      charLevel = dnd5eLevel || 1
    } else {
      // Personaje de arquetipo narrativo tradicional
      const archetype = loreData.archetypes.find((a: any) => a.id === archetypeId)
      if (!archetype) {
        return NextResponse.json({ error: 'Arquetipo no encontrado' }, { status: 404 })
      }
      const archetypeData = archetype as any

      charName = characterName || archetypeData.name
      charArchetype = archetypeData.name
      charStats = archetypeData.starting_stats
      charInventory = archetypeData.starting_inventory as string[]
      charLevel = 1
    }

    // Generar el map_state inicial
    const mapState = createCampaignMapState(lore)

    // Obtener nombre de la locación inicial
    const mapLocations = getExampleMapData(lore)
    const startingLocation = mapLocations.find(l => l.id === mapState.currentLocationId)
    const startingSceneName = startingLocation?.name || loreData.locations[0]?.name || 'Inicio'

    // Generar el world state inicial
    const initialWorldState = {
      campaign_id: '', // Se llenará después de crear la campaña
      lore,
      engine,
      session_count: 0,
      act: 1,
      narrative_anchors_hit: [] as string[],
      party: {
        [charName]: {
          hp: isDnD5eCharacter
            ? `${charStats.hp}/${charStats.maxHp}`
            : `${charStats.hp}/${charStats.maxHp}`,
          level: charLevel,
          experience: 0,
          conditions: [] as string[],
          active_effects: [] as string[],
          inventory: charInventory,
          relationships: {} as Record<string, string>,
          // D&D 5e specific stats
          ...(isDnD5eCharacter && {
            ac: charStats.ac,
            STR: charStats.STR,
            DEX: charStats.DEX,
            CON: charStats.CON,
            INT: charStats.INT,
            WIS: charStats.WIS,
            CHA: charStats.CHA,
            proficiencyBonus: charStats.proficiencyBonus,
            className: charStats.className,
            raceName: charStats.raceName,
          }),
        },
      },
      world_flags: {} as Record<string, boolean>,
      active_quests: mode === 'ONE_SHOT' ? ['Misión Inicial'] : ([] as string[]),
      completed_quests: [] as string[],
      failed_quests: [] as string[],
      npc_states: {} as Record<string, string>,
      faction_relations: {} as Record<string, number>,
      current_scene: startingSceneName,
      time_in_world: 'Día 1, mañana',
      weather: 'Cielo despejado',
      map_state: {
        currentLocationId: mapState.currentLocationId,
        previousLocationId: mapState.previousLocationId,
        discoveredLocationIds: mapState.discoveredLocationIds,
        visitedLocationIds: mapState.visitedLocationIds,
        navigationLocked: mapState.navigationLocked,
        lockReason: mapState.lockReason,
        activeSubmap: mapState.activeSubmap,
        locationKnowledge: mapState.locationKnowledge || {},
        revealedSecrets: mapState.revealedSecrets || {},
      },
      quests: [] as unknown[],
    }

    // Generar código de invitación si es multiplayer
    let inviteCode: string | null = null
    if (isMultiplayer) {
      // Generar código único (reintentar si ya existe)
      let codeIsUnique = false
      while (!codeIsUnique) {
        inviteCode = generateInviteCode()
        const existing = await prisma.campaign.findUnique({
          where: { inviteCode },
        })
        if (!existing) codeIsUnique = true
      }
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
          worldState: initialWorldState as Prisma.InputJsonValue,
          isMultiplayer: isMultiplayer || false,
          inviteCode: inviteCode,
        },
      })

      // Actualizar el campaign_id en el world state
      const updatedWorldState = {
        ...initialWorldState,
        campaign_id: campaign.id,
      }

      await tx.campaign.update({
        where: { id: campaign.id },
        data: { worldState: updatedWorldState as Prisma.InputJsonValue },
      })

      // 2. Crear el personaje
      const character = await tx.character.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          name: charName,
          lore,
          archetype: charArchetype,
          level: charLevel,
          experience: 0,
          stats: charStats,
          inventory: charInventory,
          conditions: [],
          activeEffects: [],
          backstory: isDnD5eCharacter
            ? `${charStats.raceName} ${charStats.className} nivel ${charLevel}`
            : loreData.archetypes.find((a: any) => a.id === archetypeId)?.description || '',
        },
      })

      // 2.5. Crear CampaignParticipant para el owner (siempre, no solo multiplayer)
      await tx.campaignParticipant.create({
        data: {
          campaignId: campaign.id,
          userId: user.id,
          characterId: character.id,
          role: 'OWNER',
          isOnline: true,
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
      inviteCode: inviteCode,
      isMultiplayer: isMultiplayer || false,
    })
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json(
      { error: 'Error al crear el personaje', details: (error as Error).message },
      { status: 500 }
    )
  }
}
