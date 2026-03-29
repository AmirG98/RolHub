import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma, withRetry } from '@/lib/db/prisma'
import Anthropic from '@anthropic-ai/sdk'
import {
  getEngineConfig,
  GameEngine,
  Locale,
  EngineContext,
  DiceRoll as EngineDiceRoll
} from '@/lib/engines'
import { getExampleMapData } from '@/lib/maps/lore-map-data'
import { type Lore as LoreType } from '@/lib/maps/map-config'
import { type NavigationLockReason, type LocationKnowledgeLevel, type DynamicMapLocation } from '@/lib/types/map-state'
import { calculateRelativePosition, normalizeLegacyCoordinates } from '@/lib/maps/position-calculator'
import { type Quest, type QuestUpdate } from '@/lib/types/quest'
import { upgradeKnowledge, onLocationArrival } from '@/lib/maps/location-knowledge'
import { buildContextPayload } from '@/lib/claude/context-manager'
import { generateSummaryCheckpoint } from '@/lib/claude/session-summarizer'

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface DiceRoll {
  formula: string
  result: number
  rolls: number[]
}

// Vercel Pro permite hasta 300s — 120s es suficiente para Claude + DB
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    // Auth: Clerk O cookie de guest
    const { userId: clerkUserId } = await auth()
    let authUserId: string | null = null

    if (clerkUserId) {
      const user = await withRetry(() => prisma.user.findUnique({ where: { clerkId: clerkUserId }, select: { id: true } }))
      authUserId = user?.id || null
    }

    if (!authUserId) {
      // Intentar cookie de guest
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const guestUserId = cookieStore.get('guest_user_id')?.value
      if (guestUserId) {
        authUserId = guestUserId
      }
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, campaignId, action, actionType = 'talk', diceRoll, characterId, locale = 'es' } = body as {
      sessionId: string
      campaignId: string
      action: string
      actionType?: 'do' | 'talk'  // 'do' = physical action, 'talk' = dialogue
      diceRoll?: DiceRoll
      characterId?: string  // For multiplayer - which character is acting
      locale?: 'es' | 'en'  // Language preference for narration
    }

    // Language-specific text
    const isEnglish = locale === 'en'

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener la sesion con todos los datos necesarios
    const session = await withRetry(() => prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        campaign: {
          include: {
            characters: true,
            participants: {
              include: {
                user: {
                  select: { id: true, username: true },
                },
                character: true,
              },
            },
          },
        },
        turns: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
        summaryCheckpoints: {
          orderBy: { turnIndex: 'asc' },
        },
      },
    }))

    if (!session) {
      return NextResponse.json({ error: 'Sesion no encontrada' }, { status: 404 })
    }

    // Check access: user must be session owner OR a campaign participant
    const isOwner = session.userId === authUserId
    const participant = session.campaign.participants.find(p => p.userId === authUserId)

    if (!isOwner && !participant) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Determine which character is acting
    // For multiplayer: use the participant's character or the one specified
    // For single player: use the first character
    const isMultiplayer = session.campaign.isMultiplayer
    let actingCharacter = session.campaign.characters[0]
    let actingPlayer = participant?.user?.username || actingCharacter?.name || 'Jugador'

    if (isMultiplayer && participant?.character) {
      actingCharacter = participant.character
      actingPlayer = participant.user?.username || actingPlayer
    } else if (characterId) {
      const specifiedChar = session.campaign.characters.find(c => c.id === characterId)
      if (specifiedChar) actingCharacter = specifiedChar
    }

    // 1. Guardar el turno del jugador con info de multiplayer
    const playerTurn = await withRetry(() => prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: action,
        diceRolls: diceRoll ? JSON.parse(JSON.stringify(diceRoll)) : undefined,
        // Multiplayer fields
        participantId: participant?.id,
        characterId: actingCharacter?.id,
        characterName: actingCharacter?.name,
        playerName: actingPlayer,
      },
    }))

    // 2. Preparar contexto para Claude — Sistema de 3 capas
    const worldState = session.campaign.worldState as any
    const character = actingCharacter

    // Construir contexto con el Context Manager (3 capas: summaries + middle + recent completo)
    console.log(`[DM] Building context: ${session.turns.length} turns, ${((session as any).summaryCheckpoints || []).length} checkpoints`)
    const contextPayload = buildContextPayload({
      turns: session.turns,
      checkpoints: (session as any).summaryCheckpoints || [],
      worldState,
      playerAction: action,
      locale: locale as 'es' | 'en',
    })
    console.log(`[DM] Context built: ${contextPayload.conversationHistory.length} messages, storySoFar=${contextPayload.storySoFar.length} chars, shouldSummarize=${contextPayload.shouldTriggerSummary}`)

    const conversationHistory = contextPayload.conversationHistory
    const { stagnationData } = contextPayload

    // Variables de compatibilidad para el system prompt
    const allTurns = session.turns
    const totalTurns = stagnationData.totalTurns
    const passiveCount = stagnationData.passiveCount
    const isStagnant = stagnationData.isStagnant
    const needsWorldEvent = stagnationData.needsWorldEvent
    const turnsInCurrentLocation = stagnationData.turnsInCurrentLocation
    const ignoredQuests = stagnationData.ignoredQuests
    const isRepeatedObservation = stagnationData.isRepeatedObservation
    const isNPCLoop = stagnationData.isNPCLoop
    const loopingNPCName = stagnationData.loopingNPCName
    const currentScene = worldState.current_scene || ''

    // storySoFar y middleContext van en el system prompt
    const storySoFar = contextPayload.storySoFar
    const lastDMTurn = [...allTurns].reverse().find(t => t.role === 'DM')
    const lastDMNarration = lastDMTurn?.content?.substring(0, 250) || ''

    // Obtener el HP actual
    const currentHP = worldState.party?.[character.name]?.hp || `${(character.stats as any)?.hp || 20}/${(character.stats as any)?.maxHp || 20}`
    const [currentHPNum, maxHPNum] = currentHP.split('/').map(Number)

    // Obtener inventario
    const inventory = worldState.party?.[character.name]?.inventory || (character as any).inventory || []

    // Build party info for multiplayer
    const partyMembers = isMultiplayer
      ? session.campaign.participants
          .filter(p => p.character)
          .map(p => {
            const charStats = p.character!.stats as any
            const charHP = worldState.party?.[p.character!.name]?.hp || `${charStats?.hp || 20}/${charStats?.maxHp || 20}`
            const charInventory = worldState.party?.[p.character!.name]?.inventory || (p.character as any)?.inventory || []
            return {
              name: p.character!.name,
              archetype: p.character!.archetype,
              player: p.user?.username || 'Jugador',
              hp: charHP,
              stats: charStats,
              inventory: charInventory,
              isActing: p.character!.id === character.id,
            }
          })
      : []

    // 3. Llamar a Claude para obtener la respuesta del DM
    // Language-specific labels
    const labels = isEnglish ? {
      dmRole: 'You are the Dungeon Master of a narrative RPG session',
      multiplayer: 'MULTIPLAYER',
      singlePlayer: 'SINGLE PLAYER',
      worldAndSetting: 'WORLD AND SETTING',
      lore: 'Lore',
      rulesEngine: 'Rules Engine',
      mode: 'Mode',
      oneShot: 'One-Shot (short adventure)',
      campaign: 'Campaign (long story)',
      type: 'Type',
      players: 'players',
      currentAct: 'Current Act',
      currentScene: 'Current Scene',
      time: 'Time',
      weather: 'Weather',
      actingCharacter: 'CHARACTER ACTING NOW',
      name: 'Name',
      player: 'Player',
      archetype: 'Archetype',
      level: 'Level',
      hp: 'HP',
      critical: 'CRITICAL - near death',
      wounded: 'wounded',
      healthy: 'healthy',
      stats: 'Stats',
      combat: 'Combat',
      exploration: 'Exploration',
      social: 'Social',
      inventory: 'Inventory',
      empty: 'empty',
      party: 'PARTY OF ADVENTURERS',
      activeQuests: 'ACTIVE QUESTS',
      none: 'none',
      diceRoll: 'PLAYER DICE ROLL',
      dice: 'dice',
      responseInstructions: 'RESPONSE INSTRUCTIONS',
      narrationInstructions: 'Your narration here (ADAPT length to player input - if they write briefly, respond concisely; if they elaborate, you can too)',
      partyEffects: 'For effects on OTHER party members (not the one acting), use other_party_effects',
      mechanicRules: 'MECHANIC RULES',
      rule1: 'If there is combat and the player fails (low roll or bad decision), use negative hp_change (-1 to -5 depending on severity)',
      rule2: 'If the player does something heroic or has a good combat roll, they can gain an item',
      rule3: 'If the player completes an objective, mark quest_completed',
      rule4: 'When the location changes significantly, use scene_change',
      rule5: 'suggested_actions must have 3 options that make sense with the situation',
      rule6: 'In MULTIPLAYER: respond to the action but mention other characters if relevant',
      rule7: 'HP/item changes for the acting character go in hp_change/new_item',
      rule8: 'HP changes for OTHER characters go in other_party_effects',
      rule9: 'INVENTORY TRACKING (CRITICAL): When the player RECEIVES an item (loot, gift, purchase, finds), ALWAYS include "new_item" with the item name. When the player GIVES AWAY, LOSES, USES UP or CONSUMES an item, ALWAYS include "remove_item" with the EXACT item name from their inventory. Check the current inventory before narrating item use.',
      narrativeTone: 'NARRATIVE TONE',
      important: 'IMPORTANT',
      jsonOnly: 'Respond ONLY with JSON, no additional text',
      narrationLanguage: 'The narration must be in English',
      unconscious: 'If HP reaches 0, the character becomes unconscious (does not die immediately)',
      coherence: 'Maintain coherence with previous events',
      diceInterpret: 'Interpret the roll result',
      failure: 'failure',
      partialSuccess: 'partial success',
      success: 'success',
      criticalSuccess: 'critical success',
      noDice: 'No dice roll, evaluate narratively based on the character stats',
      actingNow: 'ACTING NOW',
    } : {
      dmRole: 'Sos el Dungeon Master de una partida de rol narrativo',
      multiplayer: 'MULTIJUGADOR',
      singlePlayer: 'UN SOLO JUGADOR',
      worldAndSetting: 'MUNDO Y AMBIENTACION',
      lore: 'Lore',
      rulesEngine: 'Motor de reglas',
      mode: 'Modo',
      oneShot: 'One-Shot (aventura corta)',
      campaign: 'Campaña (historia larga)',
      type: 'Tipo',
      players: 'jugadores',
      currentAct: 'Acto actual',
      currentScene: 'Escena actual',
      time: 'Tiempo',
      weather: 'Clima',
      actingCharacter: 'PERSONAJE QUE ACTÚA AHORA',
      name: 'Nombre',
      player: 'Jugador',
      archetype: 'Arquetipo',
      level: 'Nivel',
      hp: 'HP',
      critical: 'CRITICO - casi muerto',
      wounded: 'herido',
      healthy: 'saludable',
      stats: 'Stats',
      combat: 'Combate',
      exploration: 'Exploración',
      social: 'Social',
      inventory: 'Inventario',
      empty: 'vacío',
      party: 'GRUPO DE AVENTUREROS',
      activeQuests: 'MISIONES ACTIVAS',
      none: 'ninguna',
      diceRoll: 'TIRADA DE DADOS DEL JUGADOR',
      dice: 'dados',
      responseInstructions: 'INSTRUCCIONES DE RESPUESTA',
      narrationInstructions: 'Tu narración aquí (ADAPTA la longitud al input del jugador - si escribe poco, responde conciso; si escribe mucho, puedes elaborar más)',
      partyEffects: 'Para efectos en OTROS miembros del grupo (no el que actúa), usa other_party_effects',
      mechanicRules: 'REGLAS DE MECANICAS',
      rule1: 'Si hay combate y el jugador falla (tirada baja o mala decisión), usa hp_change negativo (-1 a -5 según gravedad)',
      rule2: 'Si el jugador hace algo heroico o tiene buena tirada en combate, puede ganar un item',
      rule3: 'Si el jugador resuelve un objetivo, marca quest_completed',
      rule4: 'Cuando cambie la ubicación significativamente, usa scene_change',
      rule5: 'suggested_actions debe tener 3 opciones que tengan sentido con la situación',
      rule6: 'En MULTIJUGADOR: responde a la acción pero menciona a los otros personajes si es relevante',
      rule7: 'Los cambios de HP/items del personaje que actúa van en hp_change/new_item',
      rule8: 'Los cambios de HP de OTROS personajes van en other_party_effects',
      rule9: 'TRACKING DE INVENTARIO (CRÍTICO): Cuando el jugador RECIBE un objeto (loot, regalo, compra, encuentra), SIEMPRE incluir "new_item" con el nombre del objeto. Cuando el jugador ENTREGA, PIERDE, USA o CONSUME un objeto, SIEMPRE incluir "remove_item" con el nombre EXACTO del objeto de su inventario. Revisá el inventario actual antes de narrar uso de objetos.',
      narrativeTone: 'TONO NARRATIVO',
      important: 'IMPORTANTE',
      jsonOnly: 'Responde SOLO con el JSON, sin texto adicional',
      narrationLanguage: 'La narración debe ser en español',
      unconscious: 'Si el HP llega a 0, el personaje queda inconsciente (no muere inmediatamente)',
      coherence: 'Mantén coherencia con eventos anteriores',
      diceInterpret: 'Interpreta el resultado de la tirada',
      failure: 'fracaso',
      partialSuccess: 'éxito parcial',
      success: 'éxito',
      criticalSuccess: 'éxito crítico',
      noDice: 'Sin tirada de dados, evalúa narrativamente basándote en los stats del personaje',
      actingNow: 'ACTUANDO AHORA',
    }

    // Build dice roll info with correct language
    const diceRollInfoLocalized = diceRoll
      ? `\n\n${labels.diceRoll}: ${diceRoll.formula} = ${diceRoll.result} (${labels.dice}: ${diceRoll.rolls.join(', ')})`
      : ''

    // Build party info with correct language
    const partyInfoLocalized = isMultiplayer && partyMembers.length > 1
      ? `\n\n${labels.party} (${partyMembers.length} ${labels.players}):\n${partyMembers.map(m => {
          const [hp, maxHp] = m.hp.split('/').map(Number)
          const status = hp <= maxHp * 0.3 ? labels.critical : hp <= maxHp * 0.6 ? labels.wounded : labels.healthy
          return `- ${m.name} (${m.archetype}, ${isEnglish ? 'played by' : 'jugado por'} ${m.player}): HP ${m.hp} [${status}], ${labels.inventory}: ${m.inventory.length > 0 ? m.inventory.join(', ') : labels.empty}${m.isActing ? ` ← ${labels.actingNow}` : ''}`
        }).join('\n')}`
      : ''

    // Narrative tone based on lore
    const narrativeTone = isEnglish ? (
      session.campaign.lore === 'LOTR' ? 'Epic and mythical, like Tolkien. Elevated and poetic language.' :
      session.campaign.lore === 'ZOMBIES' ? 'Tense and survival horror. Scarce resources, constant danger, oppressive atmosphere.' :
      session.campaign.lore === 'ISEKAI' ? 'Anime and adventurous. Energetic, with humor but also epic moments.' :
      session.campaign.lore === 'VIKINGOS' ? 'Brutal and honorable. Blood, glory, destiny and the gods.' :
      session.campaign.lore === 'STAR_WARS' ? 'Epic space opera. The Force, good vs evil, intergalactic adventure.' :
      session.campaign.lore === 'CYBERPUNK' ? 'Dark and neo-noir. Technology, corporations, urban survival.' :
      session.campaign.lore === 'LOVECRAFT_HORROR' ? 'Cosmic horror. The unknown, fragile sanity, indescribable horrors.' :
      'Atmospheric and immersive'
    ) : (
      session.campaign.lore === 'LOTR' ? 'Épico y mítico, como Tolkien. Lenguaje elevado y poético.' :
      session.campaign.lore === 'ZOMBIES' ? 'Tenso y survival horror. Recursos escasos, peligro constante, atmósfera opresiva.' :
      session.campaign.lore === 'ISEKAI' ? 'Anime y aventurero. Energético, con humor pero también momentos épicos.' :
      session.campaign.lore === 'VIKINGOS' ? 'Brutal y honorable. Sangre, gloria, destino y los dioses.' :
      session.campaign.lore === 'STAR_WARS' ? 'Espacial épico. La Fuerza, el bien vs el mal, aventura intergaláctica.' :
      session.campaign.lore === 'CYBERPUNK' ? 'Oscuro y neo-noir. Tecnología, corporaciones, supervivencia urbana.' :
      session.campaign.lore === 'LOVECRAFT_HORROR' ? 'Horror cósmico. Lo desconocido, cordura frágil, horrores indescriptibles.' :
      'Atmosférico y envolvente'
    )

    // Get engine configuration and build engine-specific prompt
    const engineConfig = getEngineConfig(session.campaign.engine as GameEngine)

    // Build engine context for specialized prompt generation
    const engineContext: EngineContext = {
      character: {
        name: character.name,
        archetype: character.archetype,
        level: character.level,
        stats: character.stats as Record<string, number>,
        inventory: inventory,
        conditions: worldState.party?.[character.name]?.conditions || [],
        hp: currentHPNum,
        maxHp: maxHPNum
      },
      worldState: {
        currentScene: worldState.current_scene,
        activeQuests: worldState.active_quests,
        weather: worldState.weather,
        timeOfDay: worldState.time_in_world
      },
      locale: locale as Locale,
      lore: session.campaign.lore as any,
      loreName: session.campaign.lore,
      loreDescription: narrativeTone
    }

    // Generate engine-specific prompt section
    const enginePromptSection = engineConfig.buildPrompt(engineContext)

    // Interpret dice roll if present
    let diceInterpretation = ''
    if (diceRoll) {
      const engineDiceRoll: EngineDiceRoll = {
        formula: diceRoll.formula,
        results: diceRoll.rolls,
        total: diceRoll.result
      }
      const interpretation = engineConfig.interpretDice(engineDiceRoll, locale as Locale)
      diceInterpretation = `
${isEnglish ? 'DICE INTERPRETATION' : 'INTERPRETACIÓN DE DADOS'} (${engineConfig.name[locale as Locale]}):
- ${isEnglish ? 'Result' : 'Resultado'}: ${interpretation.description}
- ${isEnglish ? 'Narrative guidance' : 'Guía narrativa'}: ${interpretation.narrativeHint}
`
    }

    // Build the system prompt with engine-specific rules
    const engineRulesSection = `
=== ${isEnglish ? 'GAME ENGINE RULES' : 'REGLAS DEL MOTOR DE JUEGO'}: ${engineConfig.name[locale as Locale]} ===
${enginePromptSection}
${diceInterpretation}
=== ${isEnglish ? 'END ENGINE RULES' : 'FIN REGLAS DEL MOTOR'} ===
`

    // Build location context for map integration
    const mapState = worldState.map_state
    const currentLocationId = mapState?.currentLocationId || null
    const mapLocations = getExampleMapData(session.campaign.lore as LoreType)
    const currentMapLocation = currentLocationId
      ? mapLocations.find(l => l.id === currentLocationId)
      : null
    const discoveredLocations = mapState?.discoveredLocationIds || []
    const navigationLocked = mapState?.navigationLocked || false
    const locationKnowledge = worldState.map_state?.locationKnowledge || {}

    // Build location list with knowledge levels
    const discoveredLocationIds = mapState?.discoveredLocationIds || discoveredLocations
    const buildLocationList = (locations: typeof mapLocations, knowledge: Record<string, string>) => {
      return locations.map(l => {
        const level = knowledge[l.id] || 'unknown'
        const canTravel = level !== 'unknown' && level !== 'rumored'
        const statusIcon = level === 'unknown' ? '❌' : level === 'rumored' ? '❓' : '✅'
        return `${statusIcon} ${l.id}: ${l.name} (${l.type}) [${level}] ${canTravel ? '- CAN TRAVEL' : '- CANNOT TRAVEL YET'}`
      }).join('\n')
    }

    // Solo incluir ubicaciones descubiertas (no todas) para reducir tokens
    const discoveredLocs = mapLocations.filter(l => {
      const level = locationKnowledge[l.id] || 'unknown'
      return level !== 'unknown'
    })
    const locationList = discoveredLocs.map(l => {
      const level = locationKnowledge[l.id] || 'unknown'
      return `${l.id}: ${l.name} [${level}]`
    }).join(', ')

    const locationContextSection = isEnglish ? `
LOCATION: ${currentMapLocation?.name || worldState.current_scene} (ID: ${currentLocationId || 'unknown'})${navigationLocked ? ' [NAVIGATION LOCKED]' : ''}
Known locations: ${locationList || 'none'}
Travel: use "location_id" + "scene_change" when player travels. Use "discover_locations" to reveal new places (rumored/discovered). Use "create_location" for new dynamic locations.
` : `
UBICACIÓN: ${currentMapLocation?.name || worldState.current_scene} (ID: ${currentLocationId || 'unknown'})${navigationLocked ? ' [NAVEGACIÓN BLOQUEADA]' : ''}
Lugares conocidos: ${locationList || 'ninguno'}
Viaje: usar "location_id" + "scene_change" al viajar. Usar "discover_locations" para revelar lugares (rumored/discovered). Usar "create_location" para lugares nuevos dinámicos.
`

    // Build quest context section
    const quests: Quest[] = worldState.quests || []
    const activeQuestsData = quests.filter(q => q.status === 'active')

    const questContextSection = isEnglish ? `
QUESTS: ${activeQuestsData.map(q => `"${q.title}" (${q.priority})`).join(', ') || 'None'}
${(currentMapLocation as any)?.plot_hooks?.slice(0, 2).map((h: string) => `Hook: ${h}`).join('. ') || ''}
Use "quest_create", "quest_complete_objective", "secret_reveal", "knowledge_upgrade" when relevant.

IMAGES: Set "generate_image":true + "image_prompt" (first-person POV, player NOT visible) only when scene changes visually (new location, mood shift, dramatic event). NOT for dialogue.
"mood_hint": "exploration"|"combat"|"dialogue"|"dramatic"

COMBAT: Use "combat_trigger" with enemies array when combat starts. Set "navigation_locked":true + "lock_reason":"combat".
=== END SYSTEMS ===
` : `
QUESTS: ${activeQuestsData.map(q => `"${q.title}" (${q.priority})`).join(', ') || 'Ninguna'}
${(currentMapLocation as any)?.plot_hooks?.slice(0, 2).map((h: string) => `Hook: ${h}`).join('. ') || ''}
Usar "quest_create", "quest_complete_objective", "secret_reveal", "knowledge_upgrade" cuando sea relevante.

IMÁGENES: Poner "generate_image":true + "image_prompt" (POV primera persona, jugador NO visible) solo cuando la escena cambie visualmente (nueva ubicación, cambio de ánimo, evento dramático). NO para diálogos.
"mood_hint": "exploration"|"combat"|"dialogue"|"dramatic"

COMBATE: Usar "combat_trigger" con array de enemies cuando empiece combate. Poner "navigation_locked":true + "lock_reason":"combat".
=== FIN SISTEMAS ===
`

    const systemPrompt = `${labels.dmRole}${isMultiplayer ? ` ${labels.multiplayer}` : ''}. ${isEnglish ? 'Your role is to create an immersive and exciting experience.' : 'Tu rol es crear una experiencia inmersiva y emocionante.'}

${engineRulesSection}
${locationContextSection}
${questContextSection}

${labels.worldAndSetting}:
- ${labels.lore}: ${session.campaign.lore}
- ${labels.rulesEngine}: ${engineConfig.name[locale as Locale]}
- ${labels.mode}: ${session.campaign.mode === 'ONE_SHOT' ? labels.oneShot : labels.campaign}
${isMultiplayer ? `- ${labels.type}: ${labels.multiplayer} (${partyMembers.length} ${labels.players})` : `- ${labels.type}: ${labels.singlePlayer}`}
- ${labels.currentAct}: ${worldState.act}/5
- ${labels.currentScene}: ${worldState.current_scene}
- ${labels.time}: ${worldState.time_in_world}
- ${labels.weather}: ${worldState.weather}
${Object.keys(worldState.npc_states || {}).length > 0 ? `- ${isEnglish ? 'NPC States' : 'Estado de NPCs'}: ${Object.entries(worldState.npc_states || {}).map(([name, state]) => `${name}: ${state}`).join(', ')}` : ''}
${(worldState.completed_quests || []).length > 0 ? `- ${isEnglish ? 'Completed Quests' : 'Quests Completadas'}: ${(worldState.completed_quests || []).join(', ')}` : ''}
${(worldState.narrative_anchors_hit || []).length > 0 ? `- ${isEnglish ? 'Story Milestones Reached' : 'Hitos Narrativos Alcanzados'}: ${(worldState.narrative_anchors_hit || []).join(', ')}` : ''}
${Object.keys(worldState.faction_relations || {}).length > 0 ? `- ${isEnglish ? 'Faction Relations' : 'Relaciones con Facciones'}: ${Object.entries(worldState.faction_relations || {}).map(([f, r]) => `${f}: ${r}`).join(', ')}` : ''}
${Object.keys(worldState.world_flags || {}).length > 0 ? `- ${isEnglish ? 'World Decisions' : 'Decisiones del Mundo'}: ${Object.entries(worldState.world_flags || {}).map(([f, v]) => `${f}: ${v}`).join(', ')}` : ''}

${labels.actingCharacter}:
- ${labels.name}: ${character.name}
- ${labels.player}: ${actingPlayer}
- ${labels.archetype}: ${character.archetype}
- ${labels.level}: ${character.level}
- ${labels.hp}: ${currentHP} (${currentHPNum <= maxHPNum * 0.3 ? labels.critical : currentHPNum <= maxHPNum * 0.6 ? labels.wounded : labels.healthy})
- ${labels.stats}: ${labels.combat} ${(character.stats as any)?.combat}/5, ${labels.exploration} ${(character.stats as any)?.exploration}/5, ${labels.social} ${(character.stats as any)?.social}/5, Lore ${(character.stats as any)?.lore}/5
- ${labels.inventory}: ${inventory.length > 0 ? inventory.join(', ') : labels.empty}
${partyInfoLocalized}

${labels.activeQuests}: ${(worldState.active_quests || []).join(', ') || labels.none}
${diceRollInfoLocalized}

${labels.responseInstructions}:
${isEnglish ? 'You must ALWAYS respond in JSON format with this exact structure' : 'Debes responder SIEMPRE en formato JSON con esta estructura exacta'}:
{
  "narration": "${labels.narrationInstructions}",
  "character_name": "${character.name}",
  "hp_change": 0,
  "hp_reason": null,
  "new_item": null,
  "remove_item": null,
  "quest_completed": null,
  "new_quest": null,
  "scene_change": null,
  "location_id": null,
  "navigation_locked": null,
  "lock_reason": null,
  "suggested_actions": ["${isEnglish ? 'action 1' : 'acción 1'}", "${isEnglish ? 'action 2' : 'acción 2'}", "${isEnglish ? 'action 3' : 'acción 3'}"],
  "dice_request": null,
  "npc_update": null,
  "world_flag": null,
  "generate_image": false,
  "image_prompt": null,
  "mood_hint": null${isMultiplayer ? `,
  "other_party_effects": []` : ''}
}
${isMultiplayer ? `
${labels.partyEffects}:
[{"character_name": "${isEnglish ? 'Name' : 'Nombre'}", "hp_change": -2, "reason": "${isEnglish ? 'reason' : 'razón'}"}, ...]
` : ''}

${labels.mechanicRules}:
1. ${labels.rule1}
2. ${labels.rule2}
3. ${labels.rule3}
4. ${labels.rule4}
5. ${labels.rule5}
6. ${labels.rule9}
${isMultiplayer ? `7. ${labels.rule6} ${character.name}
8. ${labels.rule7}
9. ${labels.rule8}` : ''}

${isEnglish
  ? `WORLD MEMORY (update these to track the story):
- "npc_update": {"name": "NPC Name", "status": "alive/dead/fled/ally/enemy/missing"} — when an NPC's status changes
- "world_flag": {"flag": "description_of_decision", "value": true} — when the player makes an important choice or something irreversible happens
Use these to build the world's memory. NPCs you've introduced, decisions made, and consequences should persist.`
  : `MEMORIA DEL MUNDO (actualizá estos para rastrear la historia):
- "npc_update": {"name": "Nombre NPC", "status": "vivo/muerto/huyó/aliado/enemigo/desaparecido"} — cuando cambia el estado de un NPC
- "world_flag": {"flag": "descripcion_de_la_decision", "value": true} — cuando el jugador toma una decisión importante o pasa algo irreversible
Usá estos para construir la memoria del mundo. Los NPCs introducidos, decisiones tomadas y consecuencias deben persistir.`}

${labels.narrativeTone}:
${narrativeTone}

${isEnglish ? `=== DICE SYSTEM ===
Request dice rolls for any risky/uncertain action (combat, stealth, persuasion, perception, magic). Only skip for pure dialogue.
${diceRoll ? `ROLL RESULT: ${diceRoll.formula} = ${diceRoll.result} (${diceRoll.rolls.join(', ')}). Narrate the OUTCOME.` : 'Use "dice_request": {"reason":"...", "formula":"1d20+3", "type":"skill", "difficulty":12, "stat":"combat", "on_success":"...", "on_failure":"..."}'}
When requesting: narrate the SETUP, stop at the moment of tension. Player rolls, then you narrate the result next turn.
=== END DICE ===` : `=== DADOS ===
Pedí tiradas para cualquier acción riesgosa/incierta (combate, sigilo, persuasión, percepción, magia). Solo saltear en diálogo puro.
${diceRoll ? `RESULTADO: ${diceRoll.formula} = ${diceRoll.result} (${diceRoll.rolls.join(', ')}). Narrá el RESULTADO.` : 'Usá "dice_request": {"reason":"...", "formula":"1d20+3", "type":"skill", "difficulty":12, "stat":"combat", "on_success":"...", "on_failure":"..."}'}
Al pedir tirada: narrá la PREPARACIÓN, pará en el momento de tensión. El jugador tira, después narrás el resultado.
=== FIN DADOS ===`}

${labels.important}:
- ${labels.jsonOnly}
- ${labels.narrationLanguage}
- ${labels.unconscious}
- ${labels.coherence}

${isEnglish
  ? 'RESPONSE LENGTH: Match the player\'s input length. Short input = short response (1-2 paragraphs). Prioritize action and dialogue over descriptions.'
  : 'LONGITUD: Adaptá al input del jugador. Input corto = respuesta corta (1-2 párrafos). Priorizá acción y diálogo sobre descripciones.'}

${isEnglish
  ? 'NPC DIALOGUE: Always use quotes — NPCName: "dialogue" or «dialogue», said NPCName.'
  : 'DIÁLOGOS NPC: Siempre usar comillas — NombreNPC: "diálogo" o «diálogo», dijo NombreNPC.'}

${contextPayload.storySoFar ? (isEnglish
  ? `=== SESSION MEMORY ===
STORY SO FAR (narrative summaries of previous segments):
${contextPayload.storySoFar}
=== END SESSION MEMORY ===`
  : `=== MEMORIA DE SESIÓN ===
HISTORIA HASTA AHORA (resúmenes narrativos de segmentos anteriores):
${contextPayload.storySoFar}
=== FIN MEMORIA DE SESIÓN ===`) : ''}

${contextPayload.middleContext ? (isEnglish
  ? `=== EARLIER THIS SESSION ===
${contextPayload.middleContext}
=== END EARLIER ===`
  : `=== ANTES EN ESTA SESIÓN ===
${contextPayload.middleContext}
=== FIN ANTES ===`) : ''}

${isEnglish ? `=== NARRATIVE CONTINUITY & PACING ===
CURRENT STATUS:
- Turn ${totalTurns} of this session
- Turns in "${currentScene}": ${turnsInCurrentLocation}
${isStagnant ? '⚠️ STAGNATION DETECTED — introduce something new' : ''}
${needsWorldEvent ? '🌍 WORLD EVENT NEEDED THIS TURN' : ''}
${ignoredQuests.length > 0 ? `- Forgotten quests to weave back in: ${ignoredQuests.join(', ')}` : ''}

SCENE ANCHOR (MANDATORY): The player is currently in "${currentScene}" during "${worldState.time_in_world || 'unknown time'}", weather: "${worldState.weather || 'unknown'}". Your response MUST take place in this exact location, at this time, with this weather. Do NOT teleport the player to a different place or time unless they explicitly travel there.

CONTINUITY — You have full access to your recent narration in the conversation above. Use it to:
1. CONTINUE the current scene exactly where it left off (same location, same NPCs present, same conditions)
2. REFERENCE past events naturally ("The wound from the ambush still ached...")
3. BUILD ON established details (maintain visual/environmental coherence)
4. ADVANCE callbacks and foreshadowing you planted earlier

ZERO REDUNDANCY: If an action was narrated in a previous turn (item received, NPC spoke, gesture made), it is DONE. Never re-narrate it. Start your response with what happens NEXT — only respond to the player's current action.

${isRepeatedObservation ? `⚠️ PLAYER KEEPS OBSERVING — Make the environment REACT or something HAPPEN instead of describing more details.` : ''}
${isNPCLoop ? `⚠️ "${loopingNPCName}" has been central for 6+ turns. Consider wrapping this conversation up naturally or introducing something happening in the background.` : ''}

WORLD IS ALIVE: ${isStagnant || needsWorldEvent
  ? 'INTRODUCE AN EXTERNAL EVENT NOW: NPC interrupts, danger approaches, weather changes, a quest develops. DO NOT wait for the player.'
  : 'Proactively introduce world events: NPCs approach, weather shifts, sounds heard, time passes.'}
${turnsInCurrentLocation >= 4 ? `Player has been in "${currentScene}" for ${turnsInCurrentLocation} turns. Consider moving the plot forward.` : ''}
${(worldState.active_quests || []).length > 0 ? `Active quests: ${(worldState.active_quests || []).join(', ')}. Do NOT create duplicates.` : ''}
Advance time naturally: morning→afternoon→evening→night.
=== END PACING ===` : `=== CONTINUIDAD NARRATIVA Y RITMO ===
ESTADO ACTUAL:
- Turno ${totalTurns} de esta sesión
- Turnos en "${currentScene}": ${turnsInCurrentLocation}
${isStagnant ? '⚠️ ESTANCAMIENTO DETECTADO — introducí algo nuevo' : ''}
${needsWorldEvent ? '🌍 EVENTO DEL MUNDO NECESARIO ESTE TURNO' : ''}
${ignoredQuests.length > 0 ? `- Quests olvidadas para reintegrar: ${ignoredQuests.join(', ')}` : ''}

ANCLA DE ESCENA (OBLIGATORIO): El jugador está actualmente en "${currentScene}" durante "${worldState.time_in_world || 'momento desconocido'}", clima: "${worldState.weather || 'desconocido'}". Tu respuesta DEBE transcurrir en esta ubicación exacta, en este momento, con este clima. NO teletransportes al jugador a otro lugar u hora a menos que explícitamente viaje.

CONTINUIDAD — Tenés acceso completo a tu narración reciente en la conversación arriba. Usala para:
1. CONTINUAR la escena actual exactamente donde quedó (misma ubicación, mismos NPCs presentes, mismas condiciones)
2. REFERENCIAR eventos pasados naturalmente ("La herida de la emboscada aún dolía...")
3. CONSTRUIR sobre detalles establecidos (mantener coherencia visual/ambiental)
4. AVANZAR callbacks y foreshadowing que plantaste antes

CERO REDUNDANCIA: Si una acción fue narrada en un turno anterior (objeto recibido, NPC habló, gesto hecho), ESTÁ HECHA. Nunca la re-narres. Comenzá tu respuesta con lo que pasa DESPUÉS — solo respondé a la acción actual del jugador.

${isRepeatedObservation ? `⚠️ JUGADOR SIGUE OBSERVANDO — Hacé que el entorno REACCIONE o que algo PASE en vez de describir más detalles.` : ''}
${isNPCLoop ? `⚠️ "${loopingNPCName}" lleva 6+ turnos siendo central. Considerá cerrar esta conversación naturalmente o introducir algo que pase en el fondo.` : ''}

EL MUNDO ESTÁ VIVO: ${isStagnant || needsWorldEvent
  ? 'INTRODUCÍ UN EVENTO EXTERNO AHORA: un NPC interrumpe, el peligro se acerca, el clima cambia, una quest avanza. NO esperes al jugador.'
  : 'Introducí eventos del mundo proactivamente: NPCs se acercan, el clima cambia, se escuchan sonidos, el tiempo pasa.'}
${turnsInCurrentLocation >= 4 ? `El jugador lleva ${turnsInCurrentLocation} turnos en "${currentScene}". Considerá mover la trama hacia adelante.` : ''}
${(worldState.active_quests || []).length > 0 ? `Quests activas: ${(worldState.active_quests || []).join(', ')}. NO crees duplicadas.` : ''}
Avanzá el tiempo naturalmente: mañana→tarde→noche→amanecer.
=== FIN RITMO ===`}

`

    console.log(`[DM] System prompt length: ${systemPrompt.length} chars, conversation: ${conversationHistory.length} messages`)

    // Llamar a Claude — streaming server-side para eficiencia, acumular respuesta completa
    let rawResponse = ''
    try {
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: conversationHistory as any,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          rawResponse += event.delta.text
        }
      }
    } catch (apiError: any) {
      console.error('[DM] Anthropic API error:', apiError?.message || apiError)
      return NextResponse.json(
        { error: 'Error al generar la narración', details: apiError?.message || 'API error' },
        { status: 502 }
      )
    }

    // Parse JSON response from DM
    let dmResponse: {
      narration: string
      character_name?: string
      hp_change?: number
      hp_reason?: string | null
      new_item?: string | null
      remove_item?: string | null
      quest_completed?: string | null
      new_quest?: string | null
      scene_change?: string | null
      // Map integration fields
      location_id?: string | null
      navigation_locked?: boolean | null
      lock_reason?: NavigationLockReason | null
      suggested_actions?: string[]
      other_party_effects?: Array<{
        character_name: string
        hp_change: number
        reason?: string
      }>
      // Quest system fields
      quest_create?: {
        title: string
        description: string
        priority: 'main' | 'side'
        targetLocationId?: string
        objectives: Array<{ description: string; locationId?: string }>
      }
      quest_complete_objective?: {
        questId: string
        objectiveId: string
      }
      secret_reveal?: {
        locationId: string
        secretId: string
        content: string
      }
      knowledge_upgrade?: {
        locationId: string
        newLevel: LocationKnowledgeLevel
      }
      // Narrative location discovery - new system
      discover_locations?: Array<{
        locationId: string
        level: 'rumored' | 'discovered'
        source: string  // "NPC dialogue", "found map", "overheard", "explored"
      }>
      // Dice roll request from DM
      dice_request?: {
        reason: string
        formula: string
        type: 'attack' | 'skill' | 'save' | 'perception' | 'social' | 'exploration'
        difficulty?: number
        stat?: string
        on_success?: string
        on_failure?: string
      } | null
      // NPC state update (when NPC status changes)
      npc_update?: { name: string; status: string } | null
      // World flag (track important decisions/events)
      world_flag?: { flag: string; value: boolean } | null
      // Dynamic location creation by DM
      create_location?: {
        id: string
        name: string
        description: string
        type: 'city' | 'dungeon' | 'wilderness' | 'landmark' | 'danger' | 'safe' | 'mystery'
        dangerLevel: number
        nearLocationId: string
        direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
        distance: 'close' | 'medium' | 'far'
        connectTo: string[]
      }
      // Image generation fields
      generate_image?: boolean
      image_prompt?: string
      // UI mood hint
      mood_hint?: 'exploration' | 'combat' | 'dialogue' | 'dramatic'
      // Combat trigger
      combat_trigger?: {
        enemies: Array<{
          name: string
          type: string
          count?: number
          hp?: number
          ac?: number
          level?: number
        }>
        terrain?: 'dungeon' | 'forest' | 'castle' | 'cavern' | 'arena' | 'street'
        ambush?: boolean
        ambushedBy?: 'enemies' | 'players'
        difficulty?: 'easy' | 'medium' | 'hard' | 'deadly'
        description?: string
      }
    }

    try {
      // Try to parse as JSON, fallback to raw text
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        dmResponse = JSON.parse(jsonMatch[0])
      } else {
        dmResponse = { narration: rawResponse }
      }
    } catch {
      dmResponse = { narration: rawResponse }
    }

    // Calculate world state updates
    const worldStateUpdates: Record<string, any> = {}

    // Update HP if changed
    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const newHP = Math.max(0, Math.min(maxHPNum, currentHPNum + dmResponse.hp_change))
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      worldStateUpdates.party[character.name].hp = `${newHP}/${maxHPNum}`
    }

    // Update inventory
    if (dmResponse.new_item) {
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      const currentInventory = worldStateUpdates.party[character.name].inventory || inventory
      worldStateUpdates.party[character.name].inventory = [...currentInventory, dmResponse.new_item]
    }

    if (dmResponse.remove_item) {
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      const currentInventory = worldStateUpdates.party[character.name].inventory || inventory
      worldStateUpdates.party[character.name].inventory = currentInventory.filter((i: string) => i !== dmResponse.remove_item)
    }

    // Update quests
    if (dmResponse.quest_completed) {
      worldStateUpdates.active_quests = (worldState.active_quests || []).filter(
        (q: string) => q !== dmResponse.quest_completed
      )
      worldStateUpdates.completed_quests = [
        ...(worldState.completed_quests || []),
        dmResponse.quest_completed
      ]
    }

    if (dmResponse.new_quest) {
      // Asegurar que new_quest sea un string
      const questName = typeof dmResponse.new_quest === 'object' && dmResponse.new_quest !== null
        ? (dmResponse.new_quest as any).title || JSON.stringify(dmResponse.new_quest)
        : String(dmResponse.new_quest)

      // Prevenir quests duplicadas
      const currentQuests = worldState.active_quests || []
      const completedQuests = worldState.completed_quests || []
      const allKnownQuests = [...currentQuests, ...completedQuests].map((q: string) => (typeof q === 'string' ? q : '').toLowerCase())
      const isDuplicate = allKnownQuests.some(q => q === questName.toLowerCase() || q.includes(questName.toLowerCase().substring(0, 15)))

      if (!isDuplicate) {
        worldStateUpdates.active_quests = [...currentQuests, questName]
        console.log(`[Quest] New quest added: "${questName}"`)
      } else {
        console.log(`[Quest] Duplicate quest rejected: "${questName}"`)
      }
    }

    // Update scene
    if (dmResponse.scene_change) {
      worldStateUpdates.current_scene = dmResponse.scene_change
    }

    // Fallback: Si el jugador hizo una acción de viaje pero Claude no seteo location_id,
    // parsear el destino del texto de la acción del jugador
    if (!dmResponse.location_id && action) {
      const travelMatch = action.match(/[Vv]iajo (?:desde .+ )?hacia (.+)|[Tt]ravel(?:ing)? to (.+)|[Mm]e dirijo (?:a|hacia) (.+)|[Vv]oy (?:a|hacia) (.+)/i)
      if (travelMatch) {
        const destinationName = (travelMatch[1] || travelMatch[2] || travelMatch[3] || travelMatch[4] || '').trim()
        if (destinationName) {
          const matchedLocation = mapLocations.find(l =>
            l.name.toLowerCase() === destinationName.toLowerCase() ||
            l.id.toLowerCase() === destinationName.toLowerCase() ||
            l.name.toLowerCase().includes(destinationName.toLowerCase()) ||
            destinationName.toLowerCase().includes(l.name.toLowerCase())
          )
          if (matchedLocation) {
            console.log(`[Turn] Auto-detected travel to: ${matchedLocation.id} (from action: "${destinationName}")`)
            dmResponse.location_id = matchedLocation.id
            if (!dmResponse.scene_change) {
              dmResponse.scene_change = matchedLocation.name
            }
          }
        }
      }
    }

    // Handle dynamic location creation
    if (dmResponse.create_location) {
      const cl = dmResponse.create_location
      // Buscar coordenadas del ancla
      const anchorLocation = mapLocations.find(l => l.id === cl.nearLocationId)
      if (anchorLocation) {
        // Normalizar coordenadas del ancla al sistema 0-1000 antes de calcular posición relativa
        const normalizedAnchor = normalizeLegacyCoordinates([{ coordinates: { ...anchorLocation.coordinates } }])[0]
        const coords = calculateRelativePosition(
          normalizedAnchor.coordinates,
          cl.direction,
          cl.distance
        )

        const newDynamic: DynamicMapLocation = {
          id: cl.id,
          name: cl.name,
          description: cl.description,
          type: cl.type,
          dangerLevel: cl.dangerLevel,
          coordinates: coords,
          connections: cl.connectTo || [],
          createdAtTurn: session.turns.length,
        }

        // Inicializar map_state si no existe
        if (!worldStateUpdates.map_state) {
          worldStateUpdates.map_state = { ...(worldState.map_state || {}) }
        }

        // Agregar a dynamicLocations
        const existingDynamic = worldStateUpdates.map_state.dynamicLocations || worldState.map_state?.dynamicLocations || []
        worldStateUpdates.map_state.dynamicLocations = [...existingDynamic, newDynamic]

        // Agregar a discoveredLocationIds
        const currentDiscovered = worldStateUpdates.map_state.discoveredLocationIds || worldState.map_state?.discoveredLocationIds || []
        if (!currentDiscovered.includes(cl.id)) {
          worldStateUpdates.map_state.discoveredLocationIds = [...currentDiscovered, cl.id]
        }

        // Agregar knowledge level 'discovered'
        const currentKnowledge = worldStateUpdates.map_state.locationKnowledge || worldState.map_state?.locationKnowledge || {}
        worldStateUpdates.map_state.locationKnowledge = {
          ...currentKnowledge,
          [cl.id]: 'discovered' as LocationKnowledgeLevel,
        }

        // Actualizar conexiones bidireccionales en mapLocations para este turno
        for (const connectId of cl.connectTo) {
          const connectedLoc = mapLocations.find(l => l.id === connectId)
          if (connectedLoc && !connectedLoc.connections.includes(cl.id)) {
            connectedLoc.connections.push(cl.id)
          }
        }

        // Agregar la nueva locación a mapLocations para que la validación de viaje funcione
        mapLocations.push({
          id: cl.id,
          name: cl.name,
          description: cl.description,
          type: cl.type,
          dangerLevel: cl.dangerLevel,
          coordinates: coords,
          connections: cl.connectTo || [],
          icon: '',
          discovered: true,
          visited: false,
        })

        console.log(`[Turn] Created dynamic location: ${cl.id} (${cl.name}) near ${cl.nearLocationId}`)
      } else {
        console.warn(`[Turn] create_location: anchor ${cl.nearLocationId} not found, skipping`)
      }
    }

    // Update map location
    if (dmResponse.location_id && dmResponse.location_id !== currentLocationId) {
      // Validate the location exists
      const newLocation = mapLocations.find(l => l.id === dmResponse.location_id)
      if (newLocation) {
        // Initialize map_state if it doesn't exist
        const currentMapState = worldState.map_state || {
          currentLocationId: null,
          previousLocationId: null,
          discoveredLocationIds: discoveredLocations,
          visitedLocationIds: [],
          navigationLocked: false,
          lockReason: undefined,
          activeSubmap: null,
        }

        // Update map state with new location
        const newVisited = [...(currentMapState.visitedLocationIds || [])]
        if (!newVisited.includes(dmResponse.location_id)) {
          newVisited.push(dmResponse.location_id)
        }

        // Discover connected locations
        const newDiscovered = [...(currentMapState.discoveredLocationIds || [])]
        for (const connectedId of newLocation.connections) {
          if (!newDiscovered.includes(connectedId)) {
            newDiscovered.push(connectedId)
          }
        }

        worldStateUpdates.map_state = {
          ...currentMapState,
          previousLocationId: currentLocationId,
          currentLocationId: dmResponse.location_id,
          visitedLocationIds: newVisited,
          discoveredLocationIds: newDiscovered,
        }

        // Also update current_scene if not already set
        if (!dmResponse.scene_change) {
          worldStateUpdates.current_scene = newLocation.name
        }
      }
    }

    // Update navigation lock status
    if (dmResponse.navigation_locked !== undefined && dmResponse.navigation_locked !== null) {
      if (!worldStateUpdates.map_state) {
        worldStateUpdates.map_state = { ...(worldState.map_state || {}) }
      }
      worldStateUpdates.map_state.navigationLocked = dmResponse.navigation_locked
      worldStateUpdates.map_state.lockReason = dmResponse.lock_reason || 'none'
    }

    // Update NPC state (e.g., NPC killed, fled, joined party)
    if (dmResponse.npc_update && dmResponse.npc_update.name) {
      const currentNPCStates = worldStateUpdates.npc_states || worldState.npc_states || {}
      worldStateUpdates.npc_states = {
        ...currentNPCStates,
        [dmResponse.npc_update.name]: dmResponse.npc_update.status,
      }
      console.log(`[NPC] Updated: ${dmResponse.npc_update.name} → ${dmResponse.npc_update.status}`)
    }

    // Update world flags (track important player decisions)
    if (dmResponse.world_flag && dmResponse.world_flag.flag) {
      const currentFlags = worldStateUpdates.world_flags || worldState.world_flags || {}
      worldStateUpdates.world_flags = {
        ...currentFlags,
        [dmResponse.world_flag.flag]: dmResponse.world_flag.value,
      }
      console.log(`[WorldFlag] Set: ${dmResponse.world_flag.flag} = ${dmResponse.world_flag.value}`)
    }

    // Handle quest creation
    if (dmResponse.quest_create) {
      const newQuest: Quest = {
        id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: dmResponse.quest_create.title,
        description: dmResponse.quest_create.description,
        status: 'active',
        priority: dmResponse.quest_create.priority,
        targetLocationId: dmResponse.quest_create.targetLocationId,
        relatedLocationIds: dmResponse.quest_create.targetLocationId
          ? [currentLocationId || '', dmResponse.quest_create.targetLocationId].filter(Boolean)
          : [currentLocationId || ''].filter(Boolean),
        objectives: dmResponse.quest_create.objectives.map((obj, idx) => ({
          id: `obj_${Date.now()}_${idx}`,
          description: obj.description,
          completed: false,
          locationId: obj.locationId,
        })),
        sourceType: 'narrative',
        sourceLocationId: currentLocationId || undefined,
        lore: session.campaign.lore as any,
        createdAt: Date.now(),
      }

      const existingQuests: Quest[] = worldState.quests || []
      worldStateUpdates.quests = [...existingQuests, newQuest]

      // Also update legacy active_quests array
      worldStateUpdates.active_quests = [
        ...(worldState.active_quests || []),
        newQuest.title
      ]
    }

    // Handle quest objective completion
    if (dmResponse.quest_complete_objective) {
      const { questId, objectiveId } = dmResponse.quest_complete_objective
      const existingQuests: Quest[] = worldState.quests || worldStateUpdates.quests || []

      worldStateUpdates.quests = existingQuests.map(quest => {
        if (quest.id !== questId) return quest

        const updatedObjectives = quest.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, completed: true } : obj
        )

        const allCompleted = updatedObjectives.every(obj => obj.completed)

        return {
          ...quest,
          objectives: updatedObjectives,
          status: allCompleted ? 'completed' as const : quest.status,
        }
      })
    }

    // Handle secret reveal
    if (dmResponse.secret_reveal) {
      const { locationId, secretId } = dmResponse.secret_reveal
      if (!worldStateUpdates.map_state) {
        worldStateUpdates.map_state = { ...(worldState.map_state || {}) }
      }
      const currentSecrets = worldStateUpdates.map_state.revealedSecrets || worldState.map_state?.revealedSecrets || {}
      const locationSecrets = currentSecrets[locationId] || []
      if (!locationSecrets.includes(secretId)) {
        worldStateUpdates.map_state.revealedSecrets = {
          ...currentSecrets,
          [locationId]: [...locationSecrets, secretId]
        }
      }
    }

    // Handle knowledge upgrade
    if (dmResponse.knowledge_upgrade) {
      const { locationId, newLevel } = dmResponse.knowledge_upgrade
      if (!worldStateUpdates.map_state) {
        worldStateUpdates.map_state = { ...(worldState.map_state || {}) }
      }
      const currentKnowledge = worldStateUpdates.map_state.locationKnowledge || worldState.map_state?.locationKnowledge || {}
      worldStateUpdates.map_state.locationKnowledge = {
        ...currentKnowledge,
        [locationId]: newLevel
      }
    }

    // Handle narrative location discovery (new system)
    if (dmResponse.discover_locations && Array.isArray(dmResponse.discover_locations)) {
      const levelOrder = ['unknown', 'rumored', 'discovered', 'visited', 'explored', 'mastered']

      for (const discovery of dmResponse.discover_locations) {
        const { locationId, level } = discovery
        // Validate the location exists in lore data
        const location = mapLocations.find(l => l.id === locationId)
        if (location) {
          // Get current knowledge level
          const currentLevel = worldStateUpdates.map_state?.locationKnowledge?.[locationId]
            || mapState?.locationKnowledge?.[locationId]
            || 'unknown'

          // Only upgrade, never downgrade
          if (levelOrder.indexOf(level) > levelOrder.indexOf(currentLevel)) {
            if (!worldStateUpdates.map_state) {
              worldStateUpdates.map_state = { ...(worldState.map_state || {}) }
            }
            worldStateUpdates.map_state.locationKnowledge = {
              ...(worldStateUpdates.map_state.locationKnowledge || mapState?.locationKnowledge || {}),
              [locationId]: level
            }

            // If level >= discovered, also add to discoveredLocationIds
            if (level !== 'rumored') {
              const currentDiscovered = worldStateUpdates.map_state.discoveredLocationIds
                || mapState?.discoveredLocationIds
                || []
              if (!currentDiscovered.includes(locationId)) {
                worldStateUpdates.map_state.discoveredLocationIds = [
                  ...currentDiscovered,
                  locationId
                ]
              }
            }
          }
        }
      }
    }

    // Handle other party effects in multiplayer
    if (isMultiplayer && dmResponse.other_party_effects && dmResponse.other_party_effects.length > 0) {
      for (const effect of dmResponse.other_party_effects) {
        const targetChar = partyMembers.find(m => m.name === effect.character_name)
        if (targetChar && effect.hp_change) {
          const [currentHP, maxHP] = targetChar.hp.split('/').map(Number)
          const newHP = Math.max(0, Math.min(maxHP, currentHP + effect.hp_change))

          if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
          if (!worldStateUpdates.party[effect.character_name]) {
            worldStateUpdates.party[effect.character_name] = { ...worldState.party?.[effect.character_name] }
          }
          worldStateUpdates.party[effect.character_name].hp = `${newHP}/${maxHP}`
        }
      }
    }

    // Update campaign world state if there are updates
    let campaignUpdatePromise: Promise<unknown> | null = null
    if (Object.keys(worldStateUpdates).length > 0) {
      const newWorldState = {
        ...worldState,
        ...worldStateUpdates,
        party: {
          ...worldState.party,
          ...worldStateUpdates.party,
        },
        map_state: worldStateUpdates.map_state
          ? {
              ...(worldState.map_state || {}),
              ...worldStateUpdates.map_state,
            }
          : worldState.map_state,
      }

      campaignUpdatePromise = withRetry(() => prisma.campaign.update({
        where: { id: session.campaignId },
        data: { worldState: newWorldState },
      }))
    }

    // Build narration with HP change
    const fullNarration = dmResponse.narration + (dmResponse.hp_change && dmResponse.hp_change !== 0
      ? `\n\n[${dmResponse.hp_change > 0 ? '+' : ''}${dmResponse.hp_change} HP${dmResponse.hp_reason ? ` (${dmResponse.hp_reason})` : ''}]`
      : '')

    // 4. DB writes en paralelo para reducir latencia
    const dbWrites: Promise<unknown>[] = [
      withRetry(() => prisma.turn.create({
        data: {
          sessionId: session.id,
          role: 'DM',
          content: fullNarration,
          worldStatePatch: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
        },
      })),
    ]
    if (campaignUpdatePromise) dbWrites.push(campaignUpdatePromise)
    await Promise.all(dbWrites)

    // 5. Retornar respuesta al cliente
    return NextResponse.json({
      success: true,
      narration: fullNarration,
      worldStateUpdates: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
      suggestedActions: dmResponse.suggested_actions,
      generateImage: dmResponse.generate_image || false,
      imagePrompt: dmResponse.image_prompt || null,
      moodHint: dmResponse.mood_hint || null,
      sceneChange: dmResponse.scene_change || dmResponse.location_id || null,
      combat_trigger: dmResponse.combat_trigger || null,
      diceRequest: dmResponse.dice_request || null,
    })

  } catch (error) {
    console.error('Error processing turn:', error)
    return NextResponse.json(
      {
        error: 'Error al procesar el turno',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
