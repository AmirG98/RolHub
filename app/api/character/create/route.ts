import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { Lore, GameMode, GameEngine, TutorialLevel, Prisma } from '@prisma/client'
import { createCampaignMapState } from '@/lib/maps/map-init'
import { getExampleMapData } from '@/lib/maps/lore-map-data'
import { generateCharacterPortrait } from '@/lib/fal/character-portrait-gen'
import { handleCachedSceneImageRequest } from '@/lib/fal/scene-image-gen'
import { type Lore as LoreType } from '@/lib/types/lore'

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
import dndClassicData from '@/data/lores/dnd-classic.json'

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
      lore, mode, engine, tutorialLevel, archetypeId, characterName, characterDescription, isMultiplayer,
      isDnD5eCharacter, dnd5eStats, dnd5eInventory, dnd5eLevel, dnd5eSubclass
    } = body as {
      lore: Lore
      mode: GameMode
      engine: GameEngine
      tutorialLevel: TutorialLevel
      archetypeId: string
      characterName?: string
      characterDescription?: string
      isMultiplayer?: boolean
      // D&D 5e specific fields
      isDnD5eCharacter?: boolean
      dnd5eStats?: Record<string, number | string>
      dnd5eInventory?: string[]
      dnd5eLevel?: number
      dnd5eSubclass?: { id: string; name: string }
      customStats?: { combat: number; exploration: number; social: number; lore: number }
    }

    // Validar campos requeridos
    if (!lore || !mode || !engine || !tutorialLevel || !archetypeId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // User se busca/crea dentro de la transacción para minimizar conexiones
    let user: any = null

    // Cargar datos del lore según el seleccionado
    const loreDataMap: Record<string, any> = {
      LOTR: lotrData,
      ZOMBIES: zombiesData,
      ISEKAI: isekaiData,
      VIKINGOS: vikingosData,
      STAR_WARS: starwarsData,
      CYBERPUNK: cyberpunkData,
      LOVECRAFT_HORROR: lovecraftData,
      DND_CLASSIC: dndClassicData,
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

      // Save ALL D&D 5e stats including proficiencies, features, etc.
      charStats = {
        // Basic stats
        hp: dnd5eStats.hp || 10,
        maxHp: dnd5eStats.maxHp || 10,
        ac: dnd5eStats.ac || 10,
        speed: dnd5eStats.speed || 30,
        proficiencyBonus: dnd5eStats.proficiencyBonus || 2,

        // Ability scores
        STR: dnd5eStats.STR || 10,
        DEX: dnd5eStats.DEX || 10,
        CON: dnd5eStats.CON || 10,
        INT: dnd5eStats.INT || 10,
        WIS: dnd5eStats.WIS || 10,
        CHA: dnd5eStats.CHA || 10,

        // Ability modifiers
        strMod: dnd5eStats.strMod || 0,
        dexMod: dnd5eStats.dexMod || 0,
        conMod: dnd5eStats.conMod || 0,
        intMod: dnd5eStats.intMod || 0,
        wisMod: dnd5eStats.wisMod || 0,
        chaMod: dnd5eStats.chaMod || 0,

        // Class/Race info
        className: dnd5eStats.className || '',
        classId: dnd5eStats.classId || '',
        raceName: dnd5eStats.raceName || '',
        raceId: dnd5eStats.raceId || '',
        subraceName: dnd5eStats.subraceName || '',
        subraceId: dnd5eStats.subraceId || '',
        subclassName: dnd5eSubclass?.name || dnd5eStats.subclassName || '',
        subclassId: dnd5eSubclass?.id || dnd5eStats.subclassId || '',

        // Hit dice
        hitDice: dnd5eStats.hitDice || `${dnd5eLevel || 1}d8`,
        hitDiceRemaining: dnd5eStats.hitDiceRemaining || dnd5eLevel || 1,

        // Experience
        experience: dnd5eStats.experience || 0,
        experienceToNext: dnd5eStats.experienceToNext || 300,

        // Proficiencies (arrays)
        savingThrowProficiencies: dnd5eStats.savingThrowProficiencies || [],
        skillProficiencies: dnd5eStats.skillProficiencies || [],

        // Features and traits (arrays)
        features: dnd5eStats.features || [],
        traits: dnd5eStats.traits || [],
        languages: dnd5eStats.languages || ['Común'],

        // Spellcasting (optional object)
        spellcasting: dnd5eStats.spellcasting || null,

        // Dragonborn ancestry (optional)
        draconicAncestry: dnd5eStats.draconicAncestry || null,
      }
      charInventory = dnd5eInventory || (Array.isArray(dnd5eStats.equipment) ? dnd5eStats.equipment : []) || []
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
      // Si hay customStats del point buy, usarlos en lugar de los defaults
      if (body.customStats) {
        charStats = {
          ...archetypeData.starting_stats,
          combat: body.customStats.combat,
          exploration: body.customStats.exploration,
          social: body.customStats.social,
          lore: body.customStats.lore,
        }
      } else {
        charStats = archetypeData.starting_stats
      }
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

    // Generar código de invitación si es multiplayer (sin query a DB — colisión es improbable con 6 chars alfanuméricos)
    let inviteCode: string | null = null
    if (isMultiplayer) {
      inviteCode = generateInviteCode()
    }

    // Crear todo secuencialmente (transaction mode no soporta $transaction interactivas)
    // 0. Buscar o crear usuario
    user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      const uniqueEmail = `user_${userId}_${Date.now()}@placeholder.local`
      user = await prisma.user.create({
        data: { clerkId: userId, username: `Usuario_${userId.slice(-6)}`, email: uniqueEmail, tutorialLevel },
      })
    } else if (user.tutorialLevel !== tutorialLevel) {
      user = await prisma.user.update({ where: { id: user.id }, data: { tutorialLevel } })
    }

    // 1. Crear la campaña
    const campaign = await prisma.campaign.create({
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

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { worldState: updatedWorldState as Prisma.InputJsonValue },
    })

    // 2. Crear el personaje
    const character = await prisma.character.create({
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

    // 2.5. Crear CampaignParticipant para el owner
    await prisma.campaignParticipant.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        characterId: character.id,
        role: 'OWNER',
        isOnline: true,
      },
    })

    // 3. Crear la primera sesión
    const session = await prisma.session.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        summary: null,
        partyCheckLog: [],
      },
    })

    // 4. Crear el primer turn del sistema con contexto espacial inmersivo
    const openingScenes = (loreData as any).opening_scenes || (loreData.opening_scene ? [loreData.opening_scene] : [])
    const openingScene = openingScenes.length > 0
      ? openingScenes[Math.floor(Math.random() * openingScenes.length)]
      : null
    let introContent = ''
    let suggestedActions: string[] = []

    if (openingScene) {
      introContent = openingScene.description + '\n\n'
      introContent += openingScene.closing_prompt || '¿Qué deseas hacer?'

      if (openingScene.visible_directions?.length > 0) {
        openingScene.visible_directions.slice(0, 3).forEach((dir: { direction: string; landmark: string }) => {
          suggestedActions.push(`Ir al ${dir.direction}`)
        })
      }
      suggestedActions.push('Hablar con alguien cercano')
      suggestedActions.push('Explorar el lugar actual')
    } else {
      const narrativeHook = mode === 'ONE_SHOT'
        ? (loreData.one_shot_hooks?.[0]?.hook || loreData.narrative_skeleton?.act_1?.description || 'Tu aventura comienza...')
        : (loreData.narrative_skeleton?.act_1?.description || 'Tu aventura comienza...')

      introContent = `Bienvenido a ${loreData.name}, ${charName}.\n\n${narrativeHook}`
    }

    const firstTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'DM',
        content: introContent,
        diceRolls: suggestedActions.length > 0 ? { suggested_actions: suggestedActions } : undefined,
        createdAt: new Date(),
      },
    })

    const result = { campaign, character, session, firstTurnId: firstTurn.id, introContent }

    // Generar retrato del personaje SÍNCRONAMENTE (patrón original que funciona)
    let avatarUrl: string | null = null

    try {
      console.log(`[Portrait] ENV CHECK: NEXT_PUBLIC_ENABLE_IMAGES="${process.env.NEXT_PUBLIC_ENABLE_IMAGES}", FAL_KEY=${process.env.FAL_KEY ? 'SET(' + process.env.FAL_KEY.substring(0, 8) + '...)' : 'MISSING'}`)
      console.log(`[Portrait] Starting for "${charName}" (archetype=${charArchetype}, lore=${lore}, isDnD5e=${isDnD5eCharacter})`)

      const portraitResult = await generateCharacterPortrait({
        name: charName,
        archetype: charArchetype,
        lore: lore as unknown as LoreType,
        description: characterDescription,
        quality: 'standard',
        ...(isDnD5eCharacter && dnd5eStats && {
          raceId: dnd5eStats.raceId as string | undefined,
          subraceId: dnd5eStats.subraceId as string | undefined,
          classId: dnd5eStats.classId as string | undefined,
          draconicAncestry: dnd5eStats.draconicAncestry as string | undefined,
        }),
      })

      console.log(`[Portrait] Result: isGenerated=${portraitResult.isGenerated}, hasUrl=${!!portraitResult.url}, url=${portraitResult.url?.substring(0, 60) || 'EMPTY'}`)

      if (portraitResult.isGenerated && portraitResult.url) {
        avatarUrl = portraitResult.url
        await prisma.character.update({
          where: { id: result.character.id },
          data: { avatarUrl: portraitResult.url },
        })
        console.log(`[Portrait] Saved avatar for character ${result.character.id}`)
      } else {
        console.log(`[Portrait] No image generated (isGenerated: ${portraitResult.isGenerated})`)
      }
    } catch (err) {
      console.error('[Portrait] Generation failed:', err)
    }

    // Generar imagen de escena inicial (cacheada por lore + locationId)
    let initialSceneImageUrl: string | null = null
    const openingScenesForImage = (loreData as any).opening_scenes || (loreData.opening_scene ? [loreData.opening_scene] : [])
    const openingSceneForImage = openingScenesForImage.length > 0 ? openingScenesForImage[0] : null

    if (openingSceneForImage && process.env.FAL_KEY) {
      try {
        console.log('[InitialScene] Generating opening scene image...')
        const sceneResult = await handleCachedSceneImageRequest({
          prompt: openingSceneForImage.description || `Escena inicial de ${loreData.name}`,
          lore: lore,
          locationId: openingSceneForImage.location_id || 'opening',
          mood: 'exploration',
          locationName: openingSceneForImage.location_name || loreData.name,
          quality: 'standard',
        })
        if (sceneResult.success && sceneResult.url) {
          initialSceneImageUrl = sceneResult.url
          console.log('[InitialScene] Image generated:', sceneResult.url?.substring(0, 80))

          // Guardar en el primer turn
          await prisma.turn.update({
            where: { id: result.firstTurnId },
            data: { imageUrl: initialSceneImageUrl },
          })
        }
      } catch (sceneErr) {
        console.error('[InitialScene] Failed to generate:', sceneErr)
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      campaignId: result.campaign.id,
      characterId: result.character.id,
      avatarUrl,
      initialSceneImageUrl,
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
