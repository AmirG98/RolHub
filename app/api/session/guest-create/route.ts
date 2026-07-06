import { NextRequest, NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/db/prisma'
import { getLocalized } from '@/lib/i18n/localize'
import { Lore, GameMode, GameEngine, TutorialLevel, Prisma } from '@prisma/client'
import { createCampaignMapState } from '@/lib/maps/map-init'
import { getExampleMapData } from '@/lib/maps/lore-map-data'
import { generateCharacterPortrait } from '@/lib/fal/character-portrait-gen'
import { handleCachedSceneImageRequest } from '@/lib/fal/scene-image-gen'
import { type Lore as LoreType } from '@/lib/types/lore'
import { generateOpeningTurnWithClaude } from '@/lib/claude/opening-turn'
import { cookies } from 'next/headers'
import { buildAbilitiesForArchetype, toRuntime } from '@/lib/game/abilities'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { signGuestId, verifyGuestCookie } from '@/lib/guest/cookie'

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

/**
 * Crea una sesión de juego para un guest (sin Clerk auth)
 * Crea un usuario temporal en la DB y guarda el ID en cookie
 * Redirige a /play/{sessionId} — misma experiencia que con cuenta
 */
export async function POST(req: NextRequest) {
  try {
    // === PROTECCIÓN DE COSTOS ===
    // Este endpoint es público y cada request dispara: creación de usuario +
    // campaña + sesión + opening turn (Claude) + retrato + imagen de escena
    // (fal.ai). Sin límites, es un vector de abuso de costos.
    // Bypass de rate limit para los agentes de playtesting (nightly desde una
    // IP fija de GitHub Actions). Requiere el header con el secreto exacto;
    // si PLAYTEST_BYPASS_TOKEN no está seteada, no hay bypass posible.
    const bypassToken = process.env.PLAYTEST_BYPASS_TOKEN
    const isPlaytest =
      !!bypassToken && req.headers.get('x-playtest-token') === bypassToken

    const clientIp = getClientIp(req)
    if (!isPlaytest) {
      const ipLimit = await rateLimit(`guest-create:${clientIp}`, 3, 60 * 60) // 3/hora por IP
      if (!ipLimit.allowed) {
        return rateLimitResponse(
          ipLimit,
          'Alcanzaste el límite de partidas de prueba por ahora. Creá una cuenta gratis para seguir jugando.'
        )
      }
    }

    // Si este navegador ya tiene un guest válido, limitar también por usuario
    // (una IP compartida no debería castigar a todos, pero un mismo guest
    // tampoco debería crear sesiones en loop).
    const existingCookieStore = await cookies()
    const existingGuestId = verifyGuestCookie(existingCookieStore.get('guest_user_id')?.value)
    if (existingGuestId) {
      const guestLimit = await rateLimit(`guest-create-user:${existingGuestId}`, 5, 60 * 60 * 24) // 5/día
      if (!guestLimit.allowed) {
        return rateLimitResponse(
          guestLimit,
          'Alcanzaste el límite diario de partidas de prueba. Creá una cuenta gratis para seguir jugando.'
        )
      }
    }

    const body = await req.json()
    const { lore, archetypeId, characterName, characterDescription, locale: rawLocale } = body as {
      lore: Lore
      archetypeId: string
      characterName: string
      characterDescription?: string
      locale?: string
    }
    const locale = rawLocale === 'en' ? 'en' : 'es'
    const isEN = locale === 'en'

    if (!lore || !archetypeId || !characterName) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Datos del lore
    const loreDataMap: Record<string, any> = {
      LOTR: lotrData, ZOMBIES: zombiesData, ISEKAI: isekaiData,
      VIKINGOS: vikingosData, STAR_WARS: starwarsData, CYBERPUNK: cyberpunkData,
      LOVECRAFT_HORROR: lovecraftData, DND_CLASSIC: dndClassicData,
      ROMANTASY: romantasyData, COZY_WITCH: cozyWitchData, CUSTOM: lotrData,
    }
    const loreData = loreDataMap[lore] || lotrData

    // Buscar arquetipo en los datos del lore
    const archetype = loreData.archetypes?.find((a: any) => a.id === archetypeId)
    const charArchetype = archetype?.name ? getLocalized(archetype.name, locale) : archetypeId
    const charStats = archetype?.starting_stats || { combat: 2, exploration: 2, social: 2, lore: 2 }
    // Importante: starting_inventory es LocalizedString[] (bilingüe). Hay que
    // aplanarlo con getLocalized al locale actual antes de persistir en Character.inventory
    const rawInventory = archetype?.starting_inventory || []
    const charInventory: string[] = rawInventory.map((item: any) => getLocalized(item, locale))

    // HP basado en stats
    const maxHP = 10 + (charStats.combat || 2) * 2
    const mode: GameMode = 'ONE_SHOT'
    const engine: GameEngine = 'STORY_MODE'

    // Abilities del arquetipo (cooldown_turns para STORY_MODE)
    const abilitiesTemplate = archetype ? buildAbilitiesForArchetype(archetype, engine) : []
    const abilitiesRuntime = abilitiesTemplate.map(toRuntime)

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
          abilities: abilitiesRuntime,
          relationships: {},
        },
      },
      world_flags: {}, active_quests: [isEN ? 'Initial Mission' : 'Misión Inicial'],
      completed_quests: [], failed_quests: [],
      npc_states: {}, faction_relations: {},
      current_scene: startingLocation?.name || (isEN ? 'Start' : 'Inicio'),
      time_in_world: isEN ? 'Day 1, morning' : 'Día 1, mañana', weather: isEN ? 'Clear skies' : 'Despejado',
      map_state: mapState, quests: [],
    }

    // Generar guest ID único
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Opening scene / primer turno del DM
    let introContent = ''
    let suggestedActions: string[] = []

    // Para guests en inglés, generar el primer turno con Claude (evita que el JSON en español se muestre literal).
    // Reintenta 1 vez ante error para amortiguar cold starts / timeouts transitorios de Claude.
    if (isEN) {
      for (let attempt = 0; attempt < 2 && !introContent; attempt++) {
        try {
          const opening = await generateOpeningTurnWithClaude({
            loreData,
            archetypeName: charArchetype,
            characterName,
            characterDescription: characterDescription || undefined,
            startingLocationName: startingLocation?.name,
            locale: 'en',
          })
          introContent = opening.introContent
          suggestedActions = opening.suggestedActions
        } catch (err) {
          console.error(`[guest-create] Opening turn generation failed (attempt ${attempt + 1}/2):`, err)
        }
      }
    }

    if (!introContent) {
      if (isEN) {
        // Fallback EN: NO usar openingScenes (están solo en español). Mejor un mensaje mínimo
        // que el usuario ve como welcome y el DM toma desde ahí en turnos posteriores.
        const loreName = getLocalized(loreData.name, 'en')
        const locName = startingLocation?.name || loreName
        introContent = `You find yourself in ${locName}, at the beginning of a new adventure in ${loreName}. Take a moment to take in your surroundings — the sights, the sounds, the people nearby. Your story starts here.\n\nWhat do you want to do?`
        suggestedActions = ['Look around', 'Talk to someone nearby', 'Explore the area']
      } else {
        // ES: leer del JSON (está en español nativo)
        const openingScenes = (loreData as any).opening_scenes || (loreData.opening_scene ? [loreData.opening_scene] : [])
        const openingScene = openingScenes.length > 0
          ? openingScenes[Math.floor(Math.random() * openingScenes.length)]
          : null

        if (openingScene) {
          const closingPrompt = openingScene.closing_prompt || '¿Qué deseas hacer?'
          introContent = openingScene.description + '\n\n' + closingPrompt
          if (openingScene.visible_directions?.length > 0) {
            openingScene.visible_directions.slice(0, 3).forEach((dir: any) => {
              suggestedActions.push(`Ir al ${dir.direction}`)
            })
          }
          suggestedActions.push('Hablar con alguien cercano')
          suggestedActions.push('Explorar el lugar actual')
        } else {
          introContent = `Bienvenido a ${getLocalized(loreData.name, locale)}, ${characterName}.\n\nTu aventura comienza...`
        }
      }
    }

    // Crear todo en una transacción con retry para pool timeout
    const result = await withRetry(() => prisma.$transaction(async (tx) => {
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
          name: isEN ? `Adventure in ${getLocalized(loreData.name, locale)}` : `Aventura en ${getLocalized(loreData.name, locale)}`,
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
          abilities: abilitiesTemplate as unknown as Prisma.InputJsonValue,
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
    }))

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

    // Generar imagen de escena inicial (usa el opening scene del JSON como fuente del prompt,
    // independiente del locale — la imagen no tiene idioma)
    let initialSceneImageUrl: string | null = null
    const openingScenesForImage = (loreData as any).opening_scenes || (loreData.opening_scene ? [loreData.opening_scene] : [])
    const openingSceneForImage = openingScenesForImage.length > 0 ? openingScenesForImage[0] : null
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
    cookieStore.set('guest_user_id', signGuestId(result.userId), {
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
