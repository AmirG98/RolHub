import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getLocalized } from '@/lib/i18n/localize'
import { Lore, GameMode, GameEngine, TutorialLevel, Prisma } from '@prisma/client'
import { createCampaignMapState } from '@/lib/maps/map-init'
import { getExampleMapData } from '@/lib/maps/lore-map-data'
import { generateCharacterPortrait } from '@/lib/fal/character-portrait-gen'
import { handleCachedSceneImageRequest } from '@/lib/fal/scene-image-gen'
import { type Lore as LoreType } from '@/lib/types/lore'
import { cookies } from 'next/headers'

import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'
import dndClassicData from '@/data/lores/dnd-classic.json'

/**
 * Crea una sesión de juego para un guest (sin Clerk auth)
 * Crea un usuario temporal en la DB y guarda el ID en cookie
 * Redirige a /play/{sessionId} — misma experiencia que con cuenta
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lore, archetypeId, characterName, characterDescription } = body as {
      lore: Lore
      archetypeId: string
      characterName: string
      characterDescription?: string
    }

    if (!lore || !archetypeId || !characterName) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Datos del lore
    const loreDataMap: Record<string, any> = {
      LOTR: lotrData, ZOMBIES: zombiesData, ISEKAI: isekaiData,
      VIKINGOS: vikingosData, STAR_WARS: starwarsData, CYBERPUNK: cyberpunkData,
      LOVECRAFT_HORROR: lovecraftData, DND_CLASSIC: dndClassicData, CUSTOM: lotrData,
    }
    const loreData = loreDataMap[lore] || lotrData

    // Buscar arquetipo en los datos del lore
    const archetype = loreData.archetypes?.find((a: any) => a.id === archetypeId)
    const charArchetype = archetype?.name || archetypeId
    const charStats = archetype?.starting_stats || { combat: 2, exploration: 2, social: 2, lore: 2 }
    const charInventory = archetype?.starting_inventory || []

    // HP basado en stats
    const maxHP = 10 + (charStats.combat || 2) * 2
    const mode: GameMode = 'ONE_SHOT'
    const engine: GameEngine = 'STORY_MODE'

    // World state inicial
    const mapLocations = getExampleMapData(lore as LoreType)
    const mapState = createCampaignMapState(lore as LoreType)
    const startingLocation = mapLocations.find(l => l.id === mapState.currentLocationId)

    const initialWorldState = {
      campaign_id: '',
      lore, engine, session_count: 0, act: 1,
      narrative_anchors_hit: [],
      party: {
        [characterName]: {
          hp: `${maxHP}/${maxHP}`, level: 1, experience: 0,
          conditions: [], active_effects: [], inventory: charInventory,
          relationships: {},
        },
      },
      world_flags: {}, active_quests: ['Misión Inicial'],
      completed_quests: [], failed_quests: [],
      npc_states: {}, faction_relations: {},
      current_scene: startingLocation?.name || 'Inicio',
      time_in_world: 'Día 1, mañana', weather: 'Despejado',
      map_state: mapState, quests: [],
    }

    // Generar guest ID único
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Opening scene
    const openingScenes = (loreData as any).opening_scenes || (loreData.opening_scene ? [loreData.opening_scene] : [])
    const openingScene = openingScenes.length > 0
      ? openingScenes[Math.floor(Math.random() * openingScenes.length)]
      : null

    let introContent = ''
    let suggestedActions: string[] = []
    if (openingScene) {
      introContent = openingScene.description + '\n\n' + (openingScene.closing_prompt || '¿Qué deseas hacer?')
      if (openingScene.visible_directions?.length > 0) {
        openingScene.visible_directions.slice(0, 3).forEach((dir: any) => {
          suggestedActions.push(`Ir al ${dir.direction}`)
        })
      }
      suggestedActions.push('Hablar con alguien cercano')
      suggestedActions.push('Explorar el lugar actual')
    } else {
      introContent = `Bienvenido a ${getLocalized(loreData.name, 'es')}, ${characterName}.\n\nTu aventura comienza...`
    }

    // Crear todo en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario guest
      const user = await tx.user.create({
        data: {
          clerkId: guestId,
          username: characterName,
          email: `${guestId}@guest.rolhub.com`,
          tutorialLevel: 'NOVICE' as TutorialLevel,
        },
      })

      // Crear campaña
      const campaign = await tx.campaign.create({
        data: {
          userId: user.id,
          name: `Aventura en ${getLocalized(loreData.name, 'es')}`,
          lore, engine, mode,
          worldState: initialWorldState as unknown as Prisma.InputJsonValue,
          worldMap: {} as Prisma.InputJsonValue,
          isMultiplayer: false,
        },
      })

      // Crear personaje
      const character = await tx.character.create({
        data: {
          userId: user.id, campaignId: campaign.id,
          name: characterName, lore, archetype: charArchetype,
          level: 1, experience: 0,
          stats: { ...charStats, hp: maxHP, maxHp: maxHP } as Prisma.InputJsonValue,
          inventory: charInventory as Prisma.InputJsonValue,
          backstory: characterDescription || '',
        },
      })

      // Crear participant
      await tx.campaignParticipant.create({
        data: {
          campaignId: campaign.id, userId: user.id,
          characterId: character.id, role: 'OWNER',
        },
      })

      // Crear sesión
      const session = await tx.session.create({
        data: { campaignId: campaign.id, userId: user.id, summary: null, partyCheckLog: [] },
      })

      // Crear primer turno
      const firstTurn = await tx.turn.create({
        data: {
          sessionId: session.id, role: 'DM', content: introContent,
          diceRolls: suggestedActions.length > 0 ? { suggested_actions: suggestedActions } : undefined,
          createdAt: new Date(),
        },
      })

      return { campaign, character, session, firstTurnId: firstTurn.id, userId: user.id }
    })

    // Generar retrato (síncrono, como el flow normal)
    let avatarUrl: string | null = null
    try {
      const portraitResult = await generateCharacterPortrait({
        name: characterName, archetype: charArchetype,
        lore: lore as unknown as LoreType,
        description: characterDescription, quality: 'standard',
      })
      if (portraitResult.isGenerated && portraitResult.url) {
        avatarUrl = portraitResult.url
        await prisma.character.update({
          where: { id: result.character.id },
          data: { avatarUrl },
        })
      }
    } catch (err) {
      console.error('[GuestCreate] Portrait failed:', err)
    }

    // Generar imagen de escena inicial
    let initialSceneImageUrl: string | null = null
    const openingSceneForImage = openingScenes.length > 0 ? openingScenes[0] : null
    if (openingSceneForImage && process.env.FAL_KEY) {
      try {
        const sceneResult = await handleCachedSceneImageRequest({
          prompt: openingSceneForImage.description || `Escena inicial de ${getLocalized(loreData.name, 'es')}`,
          lore, locationId: openingSceneForImage.location_id || 'opening',
          mood: 'exploration', locationName: openingSceneForImage.location_name || getLocalized(loreData.name, 'es'),
          quality: 'standard',
        })
        if (sceneResult.success && sceneResult.url) {
          initialSceneImageUrl = sceneResult.url
          await prisma.turn.update({
            where: { id: result.firstTurnId },
            data: { imageUrl: initialSceneImageUrl },
          })
        }
      } catch (err) {
        console.error('[GuestCreate] Scene image failed:', err)
      }
    }

    // Guardar guest user ID en cookie
    const cookieStore = await cookies()
    cookieStore.set('guest_user_id', result.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      campaignId: result.campaign.id,
      characterId: result.character.id,
      avatarUrl,
      initialSceneImageUrl,
      isGuest: true,
    })
  } catch (error) {
    console.error('[GuestCreate] Error:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesión', details: (error as Error).message },
      { status: 500 }
    )
  }
}
