import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
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

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface DiceRoll {
  formula: string
  result: number
  rolls: number[]
}

// Vercel Pro permite hasta 300s — 120s da margen para Claude + DB
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    // Auth: Clerk O cookie de guest
    const { userId: clerkUserId } = await auth()
    let authUserId: string | null = null

    if (clerkUserId) {
      const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId }, select: { id: true } })
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
    const session = await prisma.session.findUnique({
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
          take: 10, // Ultimos 10 turnos para contexto
        },
      },
    })

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
    const playerTurn = await prisma.turn.create({
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
    })

    // 2. Preparar contexto para Claude
    const worldState = session.campaign.worldState as any
    const character = actingCharacter

    // Construir historial de conversación — TODOS los turnos DM se condensan
    // Claude NO debe ver su propia prosa anterior para no copiarla
    // Solo necesita saber QUÉ PASÓ, no CÓMO lo escribió
    const recentTurnsForHistory = session.turns.slice(-8)

    const conversationHistory = recentTurnsForHistory.map((turn) => {
      // Turnos del usuario: siempre completos
      if (turn.role === 'USER') {
        return { role: 'user' as const, content: turn.content }
      }

      // TODOS los turnos DM: condensar a resumen factual
      // Extraer los hechos clave sin la prosa (qué pasó, quién dijo qué)
      const content = turn.content || ''
      const sentences = content.split(/[.!?»"]/).filter(s => s.trim().length > 12)
      const facts = sentences.slice(0, 3).map(s => s.trim().substring(0, 80)).join('. ')
      return { role: 'assistant' as const, content: `[Ya narrado: ${facts}.]` }
    })

    // === DETECCIÓN DE ESTANCAMIENTO Y ANTI-REPETICIÓN ===
    const allTurns = session.turns
    const totalTurns = allTurns.length
    const recentUserActions = allTurns.slice(-8).filter(t => t.role === 'USER').map(t => t.content.toLowerCase().trim())

    // Acciones pasivas (esperar, mirar, no hacer nada)
    const passiveWords = ['espero', 'esperar', 'descanso', 'descansar', 'miro', 'observo', 'no hago nada', 'me quedo', 'wait', 'rest', 'look around', 'do nothing', 'stay']
    const passiveCount = recentUserActions.filter(a => passiveWords.some(w => a.includes(w))).length

    // Repetición: acciones muy similares consecutivas (>60% palabras en común)
    const wordSimilarity = (a: string, b: string): number => {
      const wordsA = new Set(a.split(/\s+/))
      const wordsB = new Set(b.split(/\s+/))
      const intersection = [...wordsA].filter(w => wordsB.has(w)).length
      return intersection / Math.max(wordsA.size, wordsB.size, 1)
    }
    const hasRepetition = recentUserActions.length >= 2 &&
      recentUserActions.some((a, i) => i > 0 && (a === recentUserActions[i - 1] || wordSimilarity(a, recentUserActions[i - 1]) > 0.6))

    // Turnos en la ubicación actual
    const currentScene = worldState.current_scene || ''
    const turnsInCurrentLocation = allTurns.slice(-12).filter(t => t.role === 'DM').length

    // Quests ignoradas (activas pero no mencionadas en últimos turnos)
    const activeQuests = worldState.active_quests || []
    const recentDMText = allTurns.slice(-6).filter(t => t.role === 'DM').map(t => t.content.toLowerCase()).join(' ')
    const ignoredQuests = activeQuests.filter((q: string) => !recentDMText.includes(q.toLowerCase().substring(0, 10)))

    // Estancamiento: acciones pasivas, repetición, o Acto 1 demasiado largo
    const isStagnant = hasRepetition || passiveCount >= 2 || (totalTurns > 12 && worldState.act === 1)
    const needsWorldEvent = passiveCount >= 3 || turnsInCurrentLocation >= 6 || ignoredQuests.length >= 2

    // Resumen acumulativo de TODA la sesión (fuera de la ventana de 6 turnos)
    // Toma la primera oración significativa de cada narración del DM, distribuido uniformemente
    const olderDMNarrations = allTurns.slice(0, -6).filter(t => t.role === 'DM' && t.content.length > 30)
    let storySoFar = ''
    if (olderDMNarrations.length > 0) {
      // Tomar hasta 8 puntos distribuidos uniformemente por toda la sesión
      const maxPoints = 8
      const step = Math.max(1, Math.floor(olderDMNarrations.length / maxPoints))
      const summaryPoints: string[] = []
      for (let i = 0; i < olderDMNarrations.length; i += step) {
        const firstSentence = olderDMNarrations[i].content.split(/[.!?]/)[0]?.trim()
        if (firstSentence && firstSentence.length > 10) {
          summaryPoints.push(firstSentence)
        }
        if (summaryPoints.length >= maxPoints) break
      }
      storySoFar = summaryPoints.join('. ') + '.'
    }

    // Última narración del DM (para evitar repetir la misma escena)
    const lastDMTurn = [...allTurns].reverse().find(t => t.role === 'DM')
    const lastDMNarration = lastDMTurn?.content?.substring(0, 250) || ''

    // Anti-repetición: detectar loops narrativos y extraer eventos ya ocurridos
    let isRepeatedObservation = false
    let isNPCLoop = false
    let loopingNPCName = ''
    let alreadyHappenedEvents: string[] = []

    try {
      const recentDMContent = allTurns.slice(-6).filter(t => t.role === 'DM').map(t => t.content || '')
      const recentUserContent = allTurns.slice(-6).filter(t => t.role === 'USER').map(t => (t.content || '').toLowerCase())

      // Extraer RESÚMENES de lo que ya pasó en cada turno reciente del DM
      // En vez de frases literales, condensar el BEAT narrativo de cada turno
      alreadyHappenedEvents = recentDMContent.map(content => {
        // Tomar las primeras 2 oraciones como resumen del beat
        const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10)
        return sentences.slice(0, 2).map(s => s.trim().substring(0, 50)).join('. ')
      }).filter(s => s.length > 10)

      // Detectar observación repetida del jugador
      const obsWords = ['observ', 'mir', 'examin', 'fij', 'watch', 'look', 'study']
      isRepeatedObservation = recentUserContent.filter(a => obsWords.some(w => a.includes(w))).length >= 2

      // Detectar NPC loop: si el mismo NPC aparece en 3+ narraciones consecutivas
      // hablando/haciendo lo mismo (misma interacción estancada)
      if (recentDMContent.length >= 3) {
        // Extraer nombres de NPCs mencionados (palabras con mayúscula seguidas de ":")
        const npcMentions = recentDMContent.map(c => {
          const match = c.match(/([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)\s*[:«]/)?.[1]
          return match || ''
        }).filter(Boolean)

        // Si el mismo NPC aparece en 3+ turnos seguidos, hay loop
        if (npcMentions.length >= 3) {
          const lastNPC = npcMentions[npcMentions.length - 1]
          const sameNPCCount = npcMentions.filter(n => n === lastNPC).length
          if (sameNPCCount >= 3) {
            isNPCLoop = true
            loopingNPCName = lastNPC
          }
        }
      }
    } catch {
      // Si falla la extracción, continuar sin anti-repetición
    }

    // Enviar la acción del jugador directamente, sin prefijo de tipo
    const actionContext = action

    // Construir instrucción anti-repetición concisa para inyectar en el mensaje del usuario
    // (Claude presta más atención al último mensaje que al system prompt)
    let antiRepeatDirective = ''
    if (alreadyHappenedEvents.length > 0) {
      const isES = !isEnglish
      const eventsList = alreadyHappenedEvents.slice(-4).map(e => `• ${e}`).join('\n')
      antiRepeatDirective = isES
        ? `\n\n[SISTEMA: Lo siguiente YA PASÓ — NO lo narres de nuevo con ninguna palabra: \n${eventsList}\nAVANZÁ la historia. Narrá qué pasa DESPUÉS, no lo que ya pasó.]`
        : `\n\n[SYSTEM: The following ALREADY HAPPENED — do NOT narrate it again in any words:\n${eventsList}\nADVANCE the story. Narrate what happens NEXT, not what already happened.]`
    }

    conversationHistory.push({
      role: 'user',
      content: actionContext + antiRepeatDirective,
    })

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

    const locationContextSection = isEnglish ? `
=== LOCATION SYSTEM (NARRATIVE DISCOVERY) ===
Current Location ID: ${currentLocationId || 'unknown'}
Current Location: ${currentMapLocation?.name || worldState.current_scene}
Navigation Status: ${navigationLocked ? 'LOCKED' : 'FREE'}
${mapState?.lockReason ? `Lock Reason: ${mapState.lockReason}` : ''}

ALL WORLD LOCATIONS (with knowledge levels):
${buildLocationList(mapLocations, locationKnowledge)}

KNOWLEDGE LEVELS:
- "unknown": Player has never heard of this place
- "rumored": Player heard about it (name shown with "?" on map, CANNOT travel)
- "discovered": Player knows how to get there (CAN travel)
- "visited": Player has been there
- "explored": Player investigated thoroughly
- "mastered": Player knows all secrets

NARRATIVE DISCOVERY RULES:
1. The player can ONLY travel to locations with knowledge level >= "discovered"
2. To REVEAL new locations, use "discover_locations" in your response
3. Use level "rumored" when they HEAR about a place (NPC mentions it, rumor, etc.)
4. Use level "discovered" when they LEARN HOW to get there (map found, directions given, etc.)
5. The narrative MUST justify the discovery: NPC tells them, they find a map, overhear conversation, etc.
6. When player arrives at a new location, include "location_id" with the ID
7. Use "navigation_locked": true during combat, important dialogue, or crucial decisions

EXAMPLE - Revealing a location through narrative:
{
  "narration": "The old merchant leans closer and whispers: 'There's an ancient temple hidden in the northern mountains... I've heard strange lights there at night.'",
  "discover_locations": [
    { "locationId": "ancient-temple", "level": "rumored", "source": "NPC dialogue" }
  ]
}

EXAMPLE - Upgrading to discovered (can now travel):
{
  "narration": "The merchant hands you a weathered map. 'Here, this shows the path through the mountains to the temple.'",
  "discover_locations": [
    { "locationId": "ancient-temple", "level": "discovered", "source": "found map" }
  ]
}

CRITICAL RULE - TRAVEL BETWEEN LOCATIONS:
When the player says they travel to another location (e.g. "I travel to Rivendell", "I head to Bree", "I go to the city"):
1. ALWAYS include "location_id" with the exact destination location ID
2. ALWAYS include "scene_change" with the name of the new place
3. Narrate the journey immersively (landscapes, road dangers, arrival)
4. Upon arrival, describe the new location

EXAMPLE - Player travels to another location:
{
  "narration": "You set off eastward, leaving behind the green fields of the Shire. The path winds through increasingly dense hills and forests. After hours of walking, the Valley of Rivendell opens before you: crystal waterfalls, elven terraces among ancient trees, and an ancient peace fills the air.",
  "location_id": "rivendel",
  "scene_change": "Rivendell",
  "generate_image": true,
  "image_prompt": "Elven valley with crystal waterfalls, terraces among ancient trees, elegant elven architecture, golden sunset light filtering through foliage, a hobbit traveler arriving at the valley",
  "mood_hint": "exploration",
  "suggested_actions": ["Seek Lord Elrond", "Explore the elven terraces", "Rest by the waterfalls"]
}

CREATING NEW LOCATIONS DYNAMICALLY:
When the narrative introduces a place that does NOT exist in the location list above,
you can create it dynamically using "create_location" in your response.
The new location will appear on the player's map automatically.
Position it relative to an existing location using direction and distance.

"create_location": {
  "id": "hidden-cave",
  "name": "Hidden Cave",
  "description": "A cave behind a waterfall",
  "type": "dungeon",
  "dangerLevel": 3,
  "nearLocationId": "rivendel",
  "direction": "north",
  "distance": "close",
  "connectTo": ["rivendel"]
}

Valid directions: north, south, east, west, northeast, northwest, southeast, southwest
Valid distances: close, medium, far
Valid types: city, dungeon, wilderness, landmark, danger, safe, mystery
=== END LOCATION SYSTEM ===
` : `
=== SISTEMA DE UBICACIÓN (DESCUBRIMIENTO NARRATIVO) ===
ID de Ubicación Actual: ${currentLocationId || 'desconocido'}
Ubicación Actual: ${currentMapLocation?.name || worldState.current_scene}
Estado de Navegación: ${navigationLocked ? 'BLOQUEADA' : 'LIBRE'}
${mapState?.lockReason ? `Razón del Bloqueo: ${mapState.lockReason}` : ''}

TODAS LAS UBICACIONES DEL MUNDO (con niveles de conocimiento):
${buildLocationList(mapLocations, locationKnowledge)}

NIVELES DE CONOCIMIENTO:
- "unknown": El jugador nunca ha oído de este lugar
- "rumored": El jugador escuchó hablar de él (nombre con "?" en mapa, NO PUEDE viajar)
- "discovered": El jugador sabe cómo llegar (PUEDE viajar)
- "visited": El jugador ha estado ahí
- "explored": El jugador investigó a fondo
- "mastered": El jugador conoce todos los secretos

REGLAS DE DESCUBRIMIENTO NARRATIVO:
1. El jugador SOLO puede viajar a ubicaciones con nivel de conocimiento >= "discovered"
2. Para REVELAR nuevas ubicaciones, usa "discover_locations" en tu respuesta
3. Usa nivel "rumored" cuando ESCUCHEN sobre un lugar (NPC lo menciona, rumor, etc.)
4. Usa nivel "discovered" cuando APRENDAN CÓMO llegar (encuentran mapa, les dan indicaciones, etc.)
5. La narrativa DEBE justificar el descubrimiento: NPC les cuenta, encuentran mapa, escuchan conversación, etc.
6. Cuando el jugador llegue a una nueva ubicación, incluye "location_id" con el ID
7. Usa "navigation_locked": true durante combate, diálogo importante o decisiones cruciales

EJEMPLO - Revelando una ubicación mediante narrativa:
{
  "narration": "El viejo mercader se acerca y susurra: 'Hay un templo antiguo oculto en las montañas del norte... He oído de luces extrañas ahí por las noches.'",
  "discover_locations": [
    { "locationId": "templo-antiguo", "level": "rumored", "source": "NPC dialogue" }
  ]
}

EJEMPLO - Mejorando a discovered (ahora pueden viajar):
{
  "narration": "El mercader te entrega un mapa desgastado. 'Aquí, esto muestra el camino a través de las montañas hasta el templo.'",
  "discover_locations": [
    { "locationId": "templo-antiguo", "level": "discovered", "source": "found map" }
  ]
}

REGLA CRÍTICA - VIAJE ENTRE UBICACIONES:
Cuando el jugador dice que viaja a otra ubicación (ej: "Viajo hacia Rivendel", "Me dirijo a Bree", "Voy a la ciudad"):
1. SIEMPRE incluir "location_id" con el ID exacto de la ubicación de destino
2. SIEMPRE incluir "scene_change" con el nombre del nuevo lugar
3. Narra el viaje de forma inmersiva (paisajes, peligros del camino, llegada)
4. Al llegar, describe la nueva ubicación

EJEMPLO - Jugador viaja a otra ubicación:
{
  "narration": "Emprendes el camino hacia el este, dejando atrás los verdes campos de la Comarca. El sendero serpentea entre colinas y bosques cada vez más densos. Tras horas de marcha, el Valle de Rivendel se abre ante ti: cascadas de cristal, terrazas élficas entre los árboles, y una paz antigua que invade el aire.",
  "location_id": "rivendel",
  "scene_change": "Rivendel",
  "generate_image": true,
  "image_prompt": "Valle élfico con cascadas cristalinas, terrazas entre árboles ancestrales, arquitectura élfica elegante, luz dorada del atardecer filtrándose entre el follaje, un viajero hobbit llegando al valle",
  "mood_hint": "exploration",
  "suggested_actions": ["Buscar al Señor Elrond", "Explorar las terrazas élficas", "Descansar junto a las cascadas"]
}

CREACIÓN DINÁMICA DE UBICACIONES:
Cuando la narrativa introduce un lugar que NO existe en la lista de ubicaciones anterior,
puedes crearlo dinámicamente usando "create_location" en tu respuesta.
La nueva ubicación aparecerá automáticamente en el mapa del jugador.
Posiciónala respecto a una ubicación existente usando dirección y distancia.

"create_location": {
  "id": "cueva-oculta",
  "name": "Cueva Oculta",
  "description": "Una cueva detrás de una cascada",
  "type": "dungeon",
  "dangerLevel": 3,
  "nearLocationId": "rivendel",
  "direction": "north",
  "distance": "close",
  "connectTo": ["rivendel"]
}

Direcciones válidas: north, south, east, west, northeast, northwest, southeast, southwest
Distancias válidas: close, medium, far
Tipos válidos: city, dungeon, wilderness, landmark, danger, safe, mystery
=== FIN SISTEMA DE UBICACIÓN ===
`

    // Build quest context section
    const quests: Quest[] = worldState.quests || []
    const activeQuestsData = quests.filter(q => q.status === 'active')

    const questContextSection = isEnglish ? `
=== QUEST AND DISCOVERY SYSTEM ===
Active Quests: ${activeQuestsData.length}
${activeQuestsData.map(q => `- "${q.title}" (${q.priority}): ${q.description.slice(0, 80)}...
  ${q.objectives.filter(o => !o.completed).map(o => `  → Pending: ${o.description}`).join('\n')}`).join('\n') || '- No active quests'}

Plot Hooks Available (at current location):
${(currentMapLocation as any)?.plot_hooks?.slice(0, 3).map((h: string) => `- ${h}`).join('\n') || '- None available'}

QUEST RULES:
1. You can CREATE new quests when the player discovers something important or talks to an NPC
2. You can COMPLETE objectives when the player accomplishes them
3. You can REVEAL location secrets when appropriate
4. You can UPGRADE knowledge level when player learns about new places:
   - "rumored": player hears about a place
   - "discovered": player knows basic info
   - "visited": player has been there
   - "explored": player has investigated thoroughly
   - "mastered": player knows all secrets

Include in your response when relevant:
- "quest_create": { title, description, priority: "main"|"side", targetLocationId?, objectives: [{description, locationId?}] }
- "quest_complete_objective": { questId, objectiveId }
- "secret_reveal": { locationId, secretId, content }
- "knowledge_upgrade": { locationId, newLevel }
=== END QUEST SYSTEM ===

=== IMAGE GENERATION SYSTEM ===
Generate images ONLY when the visual scene changes meaningfully.

WHEN to generate images (set "generate_image": true):
- Player arrives at a NEW location (ALWAYS)
- The mood shifts dramatically (peaceful → combat, safe → danger, calm → storm)
- Entering/exiting a building, going underground, crossing a threshold
- A visually dramatic event (explosion, magical phenomenon, dramatic reveal)

WHEN NOT to generate images:
- Dialogue or conversation (even with new NPCs)
- Actions within the same scene that don't change the visual environment
- Consecutive turns in the same location with the same mood
- Combat turns after the initial combat image

PERSPECTIVE RULE (CRITICAL):
ALWAYS describe the scene from FIRST PERSON POV — what the player character SEES in front of them.
The player character is the CAMERA. They are NEVER visible in the image.
Describe the environment, NPCs facing the viewer, objects ahead, the path forward.

CONSISTENCY RULE:
Maintain visual consistency across images in the same scene: same lighting, same color palette, same architectural style. If the previous image was a warm firelit tavern, the next one in that tavern must feel the same unless something changed (fire goes out, fight breaks out).

Include in your response when appropriate:
- "generate_image": true
- "image_prompt": "First-person POV description in 2-3 sentences. Describe what the player SEES ahead: the environment, lighting, atmosphere, any NPCs or creatures FACING the viewer, objects in the foreground. The player character is NOT visible. Example: 'Looking down a misty forest path at dawn, golden light filtering through ancient oaks. A single goblin crouches behind a mossy boulder ahead, its yellow eyes gleaming. The dirt trail splits into two directions.'"

Also include mood hints for UI styling:
- "mood_hint": "exploration" (calm, exploring) | "combat" (tense, dangerous) | "dialogue" (intimate, conversation) | "dramatic" (epic, revelatory)
=== END IMAGE SYSTEM ===

=== COMBAT TRIGGER SYSTEM ===
When combat begins (enemies attack, player starts fight, ambush, etc), you can trigger tactical combat.

WHEN to trigger combat:
- Player attacks an enemy or enemies attack the player
- An ambush or surprise encounter occurs
- A hostile creature blocks the path
- A tense situation escalates to violence

WHEN NOT to trigger combat:
- Just seeing enemies in the distance
- Negotiation or diplomacy attempts
- Non-combat challenges (puzzles, traps that don't involve creatures)

Include in your response when combat starts:
- "combat_trigger": {
    "enemies": [
      {"name": "Goblin", "type": "goblin", "count": 3, "hp": 7, "ac": 12},
      {"name": "Hobgoblin Captain", "type": "hobgoblin", "hp": 22, "ac": 15}
    ],
    "terrain": "dungeon" | "forest" | "castle" | "cavern" | "arena" | "street",
    "ambush": true/false,
    "ambushedBy": "enemies" | "players" (who surprised whom),
    "difficulty": "easy" | "medium" | "hard" | "deadly",
    "description": "Brief description of the combat scenario"
  }

IMPORTANT:
- When you trigger combat, also set "navigation_locked": true, "lock_reason": "combat"
- Keep the narration focused on the moment before combat begins
- Let the tactical system handle the actual combat
=== END COMBAT SYSTEM ===
` : `
=== SISTEMA DE QUESTS Y DESCUBRIMIENTO ===
Quests Activas: ${activeQuestsData.length}
${activeQuestsData.map(q => `- "${q.title}" (${q.priority}): ${q.description.slice(0, 80)}...
  ${q.objectives.filter(o => !o.completed).map(o => `  → Pendiente: ${o.description}`).join('\n')}`).join('\n') || '- Sin quests activas'}

Plot Hooks Disponibles (en ubicación actual):
${(currentMapLocation as any)?.plot_hooks?.slice(0, 3).map((h: string) => `- ${h}`).join('\n') || '- Ninguno disponible'}

REGLAS DE QUESTS:
1. Puedes CREAR nuevas quests cuando el jugador descubre algo importante o habla con un NPC
2. Puedes COMPLETAR objetivos cuando el jugador los logra
3. Puedes REVELAR secretos de locaciones cuando sea apropiado
4. Puedes MEJORAR nivel de conocimiento cuando el jugador aprende de nuevos lugares:
   - "rumored": jugador escuchó hablar del lugar
   - "discovered": jugador conoce info básica
   - "visited": jugador ha estado ahí
   - "explored": jugador ha investigado a fondo
   - "mastered": jugador conoce todos los secretos

Incluir en tu respuesta cuando sea relevante:
- "quest_create": { title, description, priority: "main"|"side", targetLocationId?, objectives: [{description, locationId?}] }
- "quest_complete_objective": { questId, objectiveId }
- "secret_reveal": { locationId, secretId, content }
- "knowledge_upgrade": { locationId, newLevel }
=== FIN SISTEMA DE QUESTS ===

=== SISTEMA DE IMÁGENES ===
Generá imágenes SOLO cuando la escena visual cambie significativamente.

CUÁNDO generar imágenes (poner "generate_image": true):
- El jugador llega a una NUEVA ubicación (SIEMPRE)
- El ánimo cambia drásticamente (pacífico → combate, seguro → peligro, calma → tormenta)
- Entrar/salir de un edificio, ir bajo tierra, cruzar un umbral
- Un evento visualmente dramático (explosión, fenómeno mágico, revelación dramática)

CUÁNDO NO generar imágenes:
- Diálogo o conversación (incluso con NPCs nuevos)
- Acciones dentro de la misma escena que no cambian el entorno visual
- Turnos consecutivos en la misma ubicación con el mismo ánimo
- Turnos de combate después de la imagen inicial de combate

REGLA DE PERSPECTIVA (CRÍTICO):
SIEMPRE describí la escena desde PRIMERA PERSONA (POV) — lo que el personaje jugador VE frente a él.
El personaje jugador es la CÁMARA. NUNCA es visible en la imagen.
Describí el entorno, NPCs de frente al espectador, objetos adelante, el camino a seguir.

REGLA DE CONSISTENCIA:
Mantené consistencia visual entre imágenes de la misma escena: misma iluminación, misma paleta de colores, mismo estilo arquitectónico. Si la imagen anterior era una taberna cálida con fuego, la siguiente en esa taberna debe sentirse igual a menos que algo haya cambiado (el fuego se apagó, empezó una pelea).

Incluir en tu respuesta cuando sea apropiado:
- "generate_image": true
- "image_prompt": "Descripción en primera persona (POV) en 2-3 oraciones. Describí lo que el jugador VE adelante: el entorno, iluminación, atmósfera, NPCs o criaturas DE FRENTE al espectador, objetos en primer plano. El personaje jugador NO es visible. Ejemplo: 'Mirando por un sendero brumoso del bosque al amanecer, luz dorada filtrándose entre robles ancestrales. Un goblin solitario se agazapa detrás de un peñasco cubierto de musgo adelante, sus ojos amarillos brillando. El camino de tierra se bifurca en dos direcciones.'"

También incluí hints de mood para estilización de UI:
- "mood_hint": "exploration" (calmo) | "combat" (tenso) | "dialogue" (íntimo) | "dramatic" (épico)
=== FIN SISTEMA DE IMÁGENES ===

=== SISTEMA DE COMBATE TÁCTICO ===
Cuando comienza un combate (enemigos atacan, jugador inicia pelea, emboscada, etc), puedes activar combate táctico.

CUÁNDO activar combate:
- El jugador ataca a un enemigo o enemigos atacan al jugador
- Ocurre una emboscada o encuentro sorpresa
- Una criatura hostil bloquea el camino
- Una situación tensa escala a violencia

CUÁNDO NO activar combate:
- Solo ver enemigos a lo lejos
- Intentos de negociación o diplomacia
- Desafíos sin combate (puzzles, trampas sin criaturas)

Incluir en tu respuesta cuando comience combate:
- "combat_trigger": {
    "enemies": [
      {"name": "Goblin", "type": "goblin", "count": 3, "hp": 7, "ac": 12},
      {"name": "Capitán Hobgoblin", "type": "hobgoblin", "hp": 22, "ac": 15}
    ],
    "terrain": "dungeon" | "forest" | "castle" | "cavern" | "arena" | "street",
    "ambush": true/false,
    "ambushedBy": "enemies" | "players" (quién sorprendió a quién),
    "difficulty": "easy" | "medium" | "hard" | "deadly",
    "description": "Breve descripción del escenario de combate"
  }

IMPORTANTE:
- Al activar combate, también establece "navigation_locked": true, "lock_reason": "combat"
- Mantén la narración enfocada en el momento antes del combate
- Deja que el sistema táctico maneje el combate real
=== FIN SISTEMA DE COMBATE ===
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
${isMultiplayer ? `6. ${labels.rule6} ${character.name}
7. ${labels.rule7}
8. ${labels.rule8}` : ''}

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

${isEnglish ? `=== DICE ROLLING SYSTEM ===
CRITICAL: You MUST request dice rolls frequently! This is a tabletop RPG, not a choose-your-own-adventure.

WHEN TO REQUEST A ROLL (use "dice_request" in your response):
- Combat: ALWAYS. Every attack, dodge, spell cast, or defensive action
- Exploration: Searching for traps, picking locks, climbing, sneaking, tracking
- Social: Persuasion, deception, intimidation, gathering information from NPCs
- Perception: Noticing hidden things, hearing approaching danger, reading body language
- Survival: Navigating, foraging, resisting environmental hazards, endurance checks
- Magic/Special abilities: Casting spells, using special powers, ritual attempts
- ANY risky or uncertain action: If the outcome is not guaranteed, REQUEST A ROLL

HOW TO REQUEST A ROLL:
Include "dice_request" in your response:
{
  "dice_request": {
    "reason": "Brief description of what the roll is for",
    "formula": "1d20+3",
    "type": "attack" | "skill" | "save" | "perception" | "social" | "exploration",
    "difficulty": 12,
    "stat": "combat",
    "on_success": "What happens on success",
    "on_failure": "What happens on failure"
  }
}

When requesting a roll: narrate the SETUP but NOT the outcome. End the narration at the moment of tension.
Example: "You draw your sword and charge at the orc. It snarls and raises its shield..."
Then the player rolls, and you narrate the RESULT in the next turn.

INTERPRETING A SUBMITTED ROLL:
${diceRoll ? `The player just rolled: ${diceRoll.formula} = ${diceRoll.result} (dice: ${diceRoll.rolls.join(', ')}). Narrate the OUTCOME based on this result.` : 'No dice roll submitted - if the action requires one, REQUEST IT with dice_request.'}

RULES:
- ANY action requiring skill = ALWAYS request a roll. No exceptions.
- Combat = EVERY turn requires a roll (attack, dodge, cast spell).
- Only pure dialogue/conversation turns skip dice. Everything else needs a roll.
- If the player says "I try to...", "I attempt...", "I attack...", "I sneak...", "I search...", "I convince..." → REQUEST A ROLL.
- NEVER auto-succeed or auto-fail a skill action without a dice roll.
=== END DICE SYSTEM ===` : `=== SISTEMA DE TIRADA DE DADOS ===
CRÍTICO: ¡DEBES pedir tiradas de dados frecuentemente! Esto es un RPG de mesa, no un "elige tu propia aventura".

CUÁNDO PEDIR UNA TIRADA (usa "dice_request" en tu respuesta):
- Combate: SIEMPRE. Cada ataque, esquive, hechizo o acción defensiva
- Exploración: Buscar trampas, forzar cerraduras, escalar, sigilo, rastreo
- Social: Persuasión, engaño, intimidación, obtener información de NPCs
- Percepción: Notar cosas ocultas, escuchar peligro, leer lenguaje corporal
- Supervivencia: Navegar, forrajear, resistir peligros ambientales, resistencia
- Magia/Habilidades especiales: Lanzar hechizos, usar poderes, rituales
- CUALQUIER acción arriesgada: Si el resultado no está garantizado, PIDE UNA TIRADA

CÓMO PEDIR UNA TIRADA:
Incluí "dice_request" en tu respuesta:
{
  "dice_request": {
    "reason": "Breve descripción de para qué es la tirada",
    "formula": "1d20+3",
    "type": "attack" | "skill" | "save" | "perception" | "social" | "exploration",
    "difficulty": 12,
    "stat": "combat",
    "on_success": "Qué pasa en éxito",
    "on_failure": "Qué pasa en fracaso"
  }
}

Al pedir una tirada: narrá la PREPARACIÓN pero NO el resultado. Terminá la narración en el momento de tensión.
Ejemplo: "Desenvainás tu espada y cargás contra el orco. Gruñe y levanta su escudo..."
El jugador tira, y narrás el RESULTADO en el siguiente turno.

INTERPRETANDO UNA TIRADA ENVIADA:
${diceRoll ? `El jugador acaba de tirar: ${diceRoll.formula} = ${diceRoll.result} (dados: ${diceRoll.rolls.join(', ')}). Narrá el RESULTADO basándote en esta tirada.` : 'Sin tirada de dados enviada - si la acción requiere una, PEDILA con dice_request.'}

REGLAS:
- CUALQUIER acción que requiera habilidad = SIEMPRE pedí tirada. Sin excepciones.
- Combate = CADA turno requiere tirada (atacar, esquivar, lanzar hechizo).
- Solo los turnos de pura conversación/diálogo se saltan dados. Todo lo demás necesita tirada.
- Si el jugador dice "intento...", "ataco...", "me escabullo...", "busco...", "convenzo..." → PEDÍ TIRADA.
- NUNCA auto-éxito o auto-fallo en una acción de habilidad sin tirada de dados.
=== FIN SISTEMA DE DADOS ===`}

${labels.important}:
- ${labels.jsonOnly}
- ${labels.narrationLanguage}
- ${labels.unconscious}
- ${labels.coherence}

${isEnglish ? 'ADAPTIVE RESPONSE LENGTH' : 'LONGITUD DE RESPUESTA ADAPTATIVA'}:
- ${isEnglish ? 'If the player writes 1-2 sentences: respond with 1-2 SHORT paragraphs (max 4 sentences total)' : 'Si el jugador escribe 1-2 oraciones: responde con 1-2 párrafos CORTOS (máx 4 oraciones total)'}
- ${isEnglish ? 'If the player writes 3-4 sentences: respond with 2-3 medium paragraphs' : 'Si el jugador escribe 3-4 oraciones: responde con 2-3 párrafos medianos'}
- ${isEnglish ? 'If the player writes a detailed paragraph: you can elaborate more' : 'Si el jugador escribe un párrafo detallado: puedes elaborar más'}
- ${isEnglish ? 'PRIORITIZE action and dialogue over lengthy descriptions' : 'PRIORIZA acción y diálogo sobre descripciones largas'}

${isEnglish ? 'VOICE FORMAT FOR NPCs' : 'FORMATO DE VOZ PARA NPCs'}:
${isEnglish
  ? `CRITICAL: For NPCs to have distinct voices, ALWAYS format dialogue like this:
- NPCName: "What the NPC says here"
- "What the NPC says", said NPCName.
- —What the NPC says —replied NPCName.

WRONG (will be read as narrator):
- NPCName says something (no quotes)
- The NPC speaks without clear format

Example:
"The forest closes around you. Gandalf: «Fear not, young hobbit... the path still lies ahead.» His words resonate with ancient wisdom."`
  : `CRÍTICO: Para que los NPCs tengan voces distintas, SIEMPRE formatea diálogos así:
- NombreNPC: "Lo que dice el NPC aquí"
- «Lo que dice el NPC», dijo NombreNPC.
- —Lo que dice el NPC —respondió NombreNPC.

INCORRECTO (se leerá como narrador):
- NombreNPC dice algo importante (sin comillas)
- El NPC habla sin formato claro

Ejemplo:
"El bosque se cierra a tu alrededor. Gandalf: «No temas, joven hobbit... el camino aún está por delante.» Sus palabras resuenan con antigua sabiduría."`}

${isEnglish ? `=== NARRATIVE PACING & ANTI-REPETITION ===
CURRENT STATUS:
- Turn ${totalTurns} of this session
- Turns in "${currentScene}": ${turnsInCurrentLocation}
- Passive actions detected: ${passiveCount}
${isStagnant ? '⚠️ STAGNATION DETECTED' : ''}
${needsWorldEvent ? '🌍 WORLD EVENT NEEDED THIS TURN' : ''}
${ignoredQuests.length > 0 ? `- Forgotten quests: ${ignoredQuests.join(', ')}` : ''}

${storySoFar ? `STORY SO FAR (do NOT repeat these scenes/descriptions):
${storySoFar}` : ''}

${lastDMNarration ? `YOUR LAST NARRATION (CONTINUE from here, do NOT re-describe this scene):
"${lastDMNarration}..."` : ''}

${isRepeatedObservation ? `⚠️ PLAYER KEEPS OBSERVING — STOP describing physical details. Make the target REACT or something HAPPEN. Force the story forward.` : ''}
${isNPCLoop ? `⚠️ NPC INTERACTION LOOP DETECTED with "${loopingNPCName}" — This NPC has dominated the last 3+ turns. You MUST either: (1) have this NPC leave/finish the conversation, (2) introduce a NEW character or event that interrupts, (3) move the scene to a different location, or (4) have something urgent happen that demands attention. The player needs VARIETY, not the same NPC interaction over and over.` : ''}

CORE RULE: NEVER GO BACKWARD. Each turn must advance the story. Never re-narrate, re-describe, or re-introduce anything from previous turns — even with different words.

${isNPCLoop ? `⚠️ "${loopingNPCName}" has been talking for 3+ turns. End this interaction or interrupt it NOW.` : ''}

RULES:
1. Each response must contain NEW information, NEW events, or NEW developments. If something was said/done/shown before, it's done — move on.
2. Never re-describe an NPC's appearance or re-introduce them. They're already here.
3. ${(worldState.active_quests || []).length > 0 ? `Active quests: ${(worldState.active_quests || []).join(', ')}. Do NOT create duplicate quests.` : 'No active quests.'}
4. THE WORLD IS ALIVE: ${isStagnant || needsWorldEvent
  ? 'INTRODUCE AN EXTERNAL EVENT NOW: NPC interrupts, danger approaches, weather changes, a quest develops, something unexpected happens. DO NOT wait for the player.'
  : 'Proactively introduce world events: NPCs approach, weather shifts, sounds heard, time passes. Never let 3+ turns be only player-driven.'}
7. ${turnsInCurrentLocation >= 4 ? `Player has been in "${currentScene}" for ${turnsInCurrentLocation} turns. Consider: move the plot forward, introduce a reason to leave, or have something arrive.` : 'Keep the current scene engaging with new details.'}
8. ${ignoredQuests.length > 0 ? `Weave these forgotten quests back in: ${ignoredQuests.join(', ')}` : 'All quests are being addressed.'}
9. Advance time naturally: morning→afternoon→evening→night. Don't stay frozen in the same moment.
=== END PACING ===` : `=== RITMO NARRATIVO Y ANTI-REPETICIÓN ===
ESTADO ACTUAL:
- Turno ${totalTurns} de esta sesión
- Turnos en "${currentScene}": ${turnsInCurrentLocation}
- Acciones pasivas detectadas: ${passiveCount}
${isStagnant ? '⚠️ ESTANCAMIENTO DETECTADO' : ''}
${needsWorldEvent ? '🌍 EVENTO DEL MUNDO NECESARIO ESTE TURNO' : ''}
${ignoredQuests.length > 0 ? `- Quests olvidadas: ${ignoredQuests.join(', ')}` : ''}

${storySoFar ? `HISTORIA HASTA AHORA (NO repitas estas escenas/descripciones):
${storySoFar}` : ''}

${lastDMNarration ? `TU ÚLTIMA NARRACIÓN (CONTINUÁ desde acá, NO re-describas esta escena):
"${lastDMNarration}..."` : ''}

${isRepeatedObservation ? `⚠️ JUGADOR SIGUE OBSERVANDO — DEJÁ de describir detalles físicos. Hacé que el objetivo REACCIONE o que algo PASE. Forzá el avance de la historia.` : ''}
${isNPCLoop ? `⚠️ LOOP DE NPC DETECTADO con "${loopingNPCName}" — Este NPC dominó los últimos 3+ turnos. DEBÉS: (1) hacer que este NPC se vaya o termine la conversación, (2) introducir un NUEVO personaje o evento que interrumpa, (3) mover la escena a otro lugar, o (4) hacer que pase algo urgente. El jugador necesita VARIEDAD, no la misma interacción una y otra vez.` : ''}

REGLA CENTRAL: NUNCA RETROCEDER. Cada turno debe avanzar la historia. Nunca re-narres, re-describas ni re-introduzcas nada de turnos anteriores — ni siquiera con palabras diferentes.

${isNPCLoop ? `⚠️ "${loopingNPCName}" lleva hablando 3+ turnos. Terminá esta interacción o interrumpila AHORA.` : ''}

REGLAS:
1. Cada respuesta debe contener información NUEVA, eventos NUEVOS o desarrollos NUEVOS. Si algo se dijo/hizo/mostró antes, ya pasó — seguí adelante.
2. Nunca re-describas la apariencia de un NPC ni lo re-introduzcas. Ya está ahí.
3. ${(worldState.active_quests || []).length > 0 ? `Quests activas: ${(worldState.active_quests || []).join(', ')}. NO crees quests duplicadas.` : 'Sin quests activas.'}
4. EL MUNDO ESTÁ VIVO: ${isStagnant || needsWorldEvent
  ? 'INTRODUCÍ UN EVENTO EXTERNO AHORA: un NPC interrumpe, el peligro se acerca, el clima cambia, una quest avanza, algo inesperado pasa. NO esperes al jugador.'
  : 'Introducí eventos del mundo proactivamente: NPCs se acercan, el clima cambia, se escuchan sonidos, el tiempo pasa. Nunca dejes pasar 3+ turnos sin eventos del mundo.'}
7. ${turnsInCurrentLocation >= 4 ? `El jugador lleva ${turnsInCurrentLocation} turnos en "${currentScene}". Considerá: avanzar la trama, dar razón para irse, o que algo llegue.` : 'Mantené la escena actual interesante con nuevos detalles.'}
8. ${ignoredQuests.length > 0 ? `Entretejé estas quests olvidadas: ${ignoredQuests.join(', ')}` : 'Todas las quests están siendo atendidas.'}
8. Avanzá el tiempo naturalmente: mañana→tarde→noche→amanecer. No te quedes congelado en el mismo momento.
=== FIN RITMO ===`}

${isEnglish ? 'NPC GENDER FOR VOICE' : 'GÉNERO DE NPCs PARA VOZ'}:
- ${isEnglish
  ? 'When introducing a new NPC, always use gendered pronouns or descriptors clearly (he/she, the woman/the man, the old lady/the old man). This is critical for the voice system to assign the correct voice gender.'
  : 'Al introducir un NPC nuevo, siempre usa pronombres o descriptores de género claros (él/ella, la mujer/el hombre, la anciana/el anciano). Esto es crítico para que el sistema de voz asigne el género de voz correcto.'}
`

    console.log(`[DM] System prompt length: ${systemPrompt.length} chars, conversation: ${conversationHistory.length} messages`)

    let response
    try {
      response = await anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: conversationHistory as any,
      })
    } catch (apiError: any) {
      console.error('[DM] Anthropic API error:', apiError?.message || apiError)
      return NextResponse.json(
        { error: 'Error al generar la narración', details: apiError?.message || 'API error' },
        { status: 502 }
      )
    }

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : ''

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

      await prisma.campaign.update({
        where: { id: session.campaignId },
        data: { worldState: newWorldState },
      })
    }

    // Build the full narration with HP change notification
    let fullNarration = dmResponse.narration
    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const changeText = dmResponse.hp_change > 0
        ? `+${dmResponse.hp_change} HP`
        : `${dmResponse.hp_change} HP`
      const reason = dmResponse.hp_reason ? ` (${dmResponse.hp_reason})` : ''
      fullNarration += `\n\n[${changeText}${reason}]`
    }

    // 4. Guardar el turno del DM
    await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'DM',
        content: fullNarration,
        worldStatePatch: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
      },
    })

    // 5. Retornar exito con world state updates
    return NextResponse.json({
      success: true,
      narration: fullNarration,
      worldStateUpdates: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
      suggestedActions: dmResponse.suggested_actions,
      // Image generation
      generateImage: dmResponse.generate_image || false,
      imagePrompt: dmResponse.image_prompt || null,
      // UI mood
      moodHint: dmResponse.mood_hint || null,
      // Scene change info for transitions
      sceneChange: dmResponse.scene_change || dmResponse.location_id || null,
      // Combat trigger
      combat_trigger: dmResponse.combat_trigger || null,
      // Dice roll request from DM
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
