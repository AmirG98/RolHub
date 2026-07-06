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
import { generateSummaryCheckpoint } from '@/lib/claude/session-summarizer'
import { updateUserProgress, type ProgressUpdate } from '@/lib/game/user-progress'
import { normalizeMilestones, recordMilestoneEvent, detectNewUnlockables } from '@/lib/game/milestones'
import { getSkillTree } from '@/lib/game/skill-trees'
import type { MilestoneState } from '@/lib/types/skill-tree'
import { validateDMResponse } from '@/lib/validation/dm-response.schema'
import { parseDMResponse } from '@/lib/claude/parse-dm-response'
import { canStartSession } from '@/lib/plans/check-access'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { verifyGuestCookie } from '@/lib/guest/cookie'
import {
  buildAbilitiesForArchetype,
  toRuntime,
  tickCooldowns,
  resetDailyUses,
  applyAbilityUse,
  findAbilityById,
  canUseAbility,
  ensureAbilities,
} from '@/lib/game/abilities'
import type { AbilityRuntime } from '@/lib/types/ability'
import type { Archetype as LoreArchetype } from '@/lib/types/lore'
// Regex consistente para detectar NPCs con diálogo (Nombre: o Nombre «)
const NPC_DIALOGUE_REGEX = /([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚ]?[a-záéíóúñ]+)*)\s*[:«]/g

// Lore data para sub-locaciones
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

const LORE_JSON_DATA: Record<string, any> = {
  LOTR: lotrData, ZOMBIES: zombiesData, ISEKAI: isekaiData, VIKINGOS: vikingosData,
  STAR_WARS: starwarsData, CYBERPUNK: cyberpunkData, LOVECRAFT_HORROR: lovecraftData, DND_CLASSIC: dndClassicData,
  ROMANTASY: romantasyData, COZY_WITCH: cozyWitchData,
}

// Resuelve un archetype por id o por nombre localizado (ES/EN) — usado para backfill y lookup
function resolveArchetype(loreKey: string, archetypeKey: string): LoreArchetype | undefined {
  const data = LORE_JSON_DATA[loreKey]
  if (!data || !Array.isArray(data.archetypes) || !archetypeKey) return undefined
  const exact = data.archetypes.find((a: any) => a.id === archetypeKey)
  if (exact) return exact as LoreArchetype
  const lowered = archetypeKey.toLowerCase().trim()
  return data.archetypes.find((a: any) => {
    if (typeof a.name === 'string') return a.name.toLowerCase() === lowered
    return (a.name?.es?.toLowerCase() === lowered) || (a.name?.en?.toLowerCase() === lowered)
  }) as LoreArchetype | undefined
}

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

// Handle GET (browser prefetch/navigation)
export async function GET() {
  return Response.redirect(new URL('/', 'https://rol-hub.com'), 302)
}

export async function POST(req: NextRequest) {
  try {
    // Auth: Clerk O cookie de guest
    const { userId: clerkUserId } = await auth()
    let authUserId: string | null = null

    let authUserPlan: string | null = null
    let authUserTrialUsed: boolean = false
    let authUserPlanExpires: Date | null = null
    let authUserStripeSubId: string | null = null

    if (clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true, plan: true, trialSessionUsed: true, planExpiresAt: true, stripeSubscriptionId: true },
      })
      authUserId = user?.id || null
      authUserPlan = user?.plan || null
      authUserTrialUsed = user?.trialSessionUsed || false
      authUserPlanExpires = user?.planExpiresAt || null
      authUserStripeSubId = user?.stripeSubscriptionId || null
    }

    let isGuestUser = false
    if (!authUserId) {
      // Intentar cookie de guest (firmada con HMAC — ver lib/guest/cookie.ts)
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const guestUserId = verifyGuestCookie(cookieStore.get('guest_user_id')?.value)
      if (guestUserId) {
        authUserId = guestUserId
        isGuestUser = true
      }
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Bypass para los agentes de playtesting (header con secreto exacto).
    const isPlaytest =
      !!process.env.PLAYTEST_BYPASS_TOKEN &&
      req.headers.get('x-playtest-token') === process.env.PLAYTEST_BYPASS_TOKEN

    // === RATE LIMITING ===
    // Cada turno es una llamada a Claude — proteger costos.
    // Guests: 40 turnos/hora. Registrados: 120/hora (generoso, solo frena scripts).
    const turnLimit = isPlaytest
      ? { allowed: true, remaining: 999, retryAfterSeconds: 0 }
      : isGuestUser
        ? await rateLimit(`turn:guest:${authUserId}`, 40, 60 * 60)
        : await rateLimit(`turn:user:${authUserId}`, 120, 60 * 60)
    if (!turnLimit.allowed) {
      return rateLimitResponse(
        turnLimit,
        isGuestUser
          ? 'Alcanzaste el límite de turnos por hora del modo invitado. Creá una cuenta gratis para seguir sin límites.'
          : 'Demasiados turnos en poco tiempo. Esperá unos minutos e intentá de nuevo.'
      )
    }

    // Plan check: usuarios registrados (no guests) deben tener plan activo.
    // Controlado por env var — NO por código comentado. Para activar el
    // enforcement de billing el día del launch: BILLING_ENFORCED=true en Vercel.
    if (process.env.BILLING_ENFORCED === 'true' && authUserPlan !== null) {
      const access = canStartSession({
        plan: authUserPlan,
        trialSessionUsed: authUserTrialUsed,
        planExpiresAt: authUserPlanExpires,
        stripeSubscriptionId: authUserStripeSubId,
      })
      if (!access.allowed) {
        return NextResponse.json(
          { error: access.reasonEs || access.reason, upgradeRequired: true },
          { status: 403 }
        )
      }
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

    // Obtener la sesion con todos los datos necesarios (con retry para pool timeout)
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
          take: 40, // Ventana activa — los SummaryCheckpoints cubren turnos más viejos
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

    // === CAP DE TURNOS PARA GUESTS ===
    // El modo invitado es una demo, no juego ilimitado gratis. Cap duro de
    // turnos de jugador por sesión (configurable via GUEST_TURN_CAP).
    if (isGuestUser && !isPlaytest) {
      const guestTurnCap = parseInt(process.env.GUEST_TURN_CAP || '15', 10)
      const playerTurnCount = await prisma.turn.count({
        where: { sessionId: session.id, role: 'USER' },
      })
      if (playerTurnCount >= guestTurnCap) {
        return NextResponse.json(
          {
            error: locale === 'en'
              ? 'You reached the guest demo limit for this adventure. Create a free account to keep playing and save your progress!'
              : '¡Llegaste al límite de la demo de invitado para esta aventura. Creá una cuenta gratis para seguir jugando y guardar tu progreso!',
            guestLimitReached: true,
          },
          { status: 403 }
        )
      }
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

    // 1. Preparar datos del turno del jugador (NO persistimos todavía — si Claude
    // falla, no queremos orphan USER turns en DB). Se persiste en la $transaction
    // final junto con el DM turn y el worldState update.
    const playerTurnData = {
      sessionId: session.id,
      role: 'USER' as const,
      content: action,
      diceRolls: diceRoll ? JSON.parse(JSON.stringify(diceRoll)) : undefined,
      participantId: participant?.id,
      characterId: actingCharacter?.id,
      characterName: actingCharacter?.name,
      playerName: actingPlayer,
    }

    // 2. Preparar contexto para Claude
    const worldState = session.campaign.worldState as any
    const character = actingCharacter

    // === BACKFILL LAZY DE ABILITIES ===
    // Para campañas existentes que aún no tienen party[name].abilities:
    // materializar desde Character.abilities o, si falta, derivar del archetype.
    // Idempotente — si ya hay abilities, no hace nada.
    if (character && worldState) {
      const partySlot = worldState.party?.[character.name]
      const existingAbilities: AbilityRuntime[] | undefined = Array.isArray(partySlot?.abilities)
        ? partySlot.abilities
        : undefined
      const hasRuntime = Array.isArray(existingAbilities) && existingAbilities.length > 0

      if (!hasRuntime) {
        const storedTemplate = Array.isArray((character as any).abilities)
          ? ((character as any).abilities as any[])
          : []
        const archetypeData = resolveArchetype(session.campaign.lore, character.archetype)

        let backfilledRuntime: AbilityRuntime[] = []
        if (storedTemplate.length > 0) {
          backfilledRuntime = storedTemplate.map((ab: any) => ({
            ...ab,
            usedToday: 0,
            cooldownRemaining: 0,
          }))
        } else if (archetypeData) {
          const tpl = buildAbilitiesForArchetype(archetypeData, session.campaign.engine)
          backfilledRuntime = tpl.map(toRuntime)
        }

        if (backfilledRuntime.length > 0) {
          if (!worldState.party) worldState.party = {}
          if (!worldState.party[character.name]) worldState.party[character.name] = {}
          worldState.party[character.name].abilities = backfilledRuntime
        }
      }
    }

    // Detectar si el jugador quiere moverse (necesario antes de construir historial)
    // Detectar movimiento real (NO exploración in-situ como "exploro los alrededores")
    const movementPattern = /(?:vuelv|regres|dirij|dirig|voy\s|ir\s|salg|salir|me voy|parto|march|camino|me dirijo|head\s|go\s+to|go\s+back|return|leave|walk\s+to|travel|move\s+to)/i
    const playerWantsToMove = movementPattern.test(action)

    // Construir historial de conversación — híbrido: recientes completos + viejos condensados
    // Cuando el jugador quiere moverse, condensar TODO para romper el dominio del NPC
    const recentTurnsForHistory = session.turns.slice(-12)
    let dmTurnCount = 0
    const totalDMTurns = recentTurnsForHistory.filter(t => t.role === 'DM').length
    // Si el jugador quiere moverse: 0 turnos completos (todo condensado)
    // Si no: solo el ÚLTIMO turno DM semi-completo (con diálogos de NPCs ya conocidos limpiados)
    const fullDMWindow = playerWantsToMove ? 0 : 1

    const conversationHistory = recentTurnsForHistory.map((turn) => {
      // Turnos del usuario: siempre completos
      if (turn.role === 'USER') {
        return { role: 'user' as const, content: turn.content }
      }

      dmTurnCount++
      // Último turno DM: semi-completo — mantener narración pero reemplazar diálogos
      // de NPCs ya conocidos con tags para evitar que Claude los re-introduzca
      if (fullDMWindow > 0 && dmTurnCount > totalDMTurns - fullDMWindow) {
        const rawContent = turn.content || ''
        // Reemplazar diálogos de NPCs con tags compactos que preservan la info
        // "Pippin: «¡Un guerrero!»" → "[Pippin responde al jugador]"
        const cleanedContent = rawContent.replace(
          /([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚ]?[a-záéíóúñ]+)*)\s*[:«]([^»\n]*)[»"]?/g,
          (_match, name, dialogue) => {
            const shortDialogue = (dialogue || '').trim().substring(0, 30)
            return `[${name}: "${shortDialogue}..."]`
          }
        )
        return { role: 'assistant' as const, content: cleanedContent }
      }

      // Turnos DM viejos: condensar SIN diálogos de NPCs (para evitar que Claude los repita)
      const content = turn.content || ''
      // Extraer NPCs que hablaron en este turno
      const npcsInTurn = [...content.matchAll(NPC_DIALOGUE_REGEX)].map(m => m[1])
      const uniqueNPCs = [...new Set(npcsInTurn)]
      // Quitar diálogos de NPCs y dejar solo la acción/descripción
      const withoutDialogue = content
        .replace(/[A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚ]?[a-záéíóúñ]+)*\s*[:«][^»\n]*[»"]?/g, '')
        .replace(/\s{2,}/g, ' ').trim()
      const sentences = withoutDialogue.split(/[.!?]/).filter(s => s.trim().length > 15)
      const actionSummary = sentences.slice(0, 2).map(s => s.trim().substring(0, 80)).join('. ')
      const npcTag = uniqueNPCs.length > 0 ? `[NPCs: ${uniqueNPCs.join(', ')} — ya interactuaste, NO re-introducir] ` : ''
      return { role: 'assistant' as const, content: `${npcTag}${actionSummary || '[Escena previa sin acción relevante]'}` }
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

    // Story so far — preferimos los SummaryCheckpoints generados por Haiku
    // (memoria semántica completa). Si no hay checkpoints todavía, fallback al
    // resumen heurístico de primera-oración para no perder cobertura en sesiones
    // que aún no llegaron al primer trigger de summarizer.
    const checkpoints = (session as any).summaryCheckpoints || []
    let storySoFar = ''

    if (checkpoints.length > 0) {
      // Concatenar todos los checkpoints como bloques etiquetados con turn range.
      // Cada checkpoint cubre ~10 turnos comprimidos a 4-6 oraciones por Haiku.
      storySoFar = checkpoints
        .map((c: any) => {
          const start = Math.max(1, c.turnIndex - c.turnCount + 1)
          const end = c.turnIndex
          return `[Turns ${start}-${end}] ${c.summary}`
        })
        .join('\n\n')
    } else {
      // Fallback heurístico: primera oración de cada narración del DM
      const olderDMNarrations = allTurns.slice(0, -6).filter(t => t.role === 'DM' && t.content.length > 30)
      if (olderDMNarrations.length > 0) {
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
    }

    // Última narración del DM (para evitar repetir la misma escena)
    const lastDMTurn = [...allTurns].reverse().find(t => t.role === 'DM')
    const lastDMNarration = lastDMTurn?.content?.substring(0, 250) || ''

    // Anti-repetición: detectar loops narrativos y extraer eventos ya ocurridos
    let isRepeatedObservation = false
    let isNPCLoop = false
    let loopingNPCName = ''
    let alreadyHappenedEvents: string[] = []

    // Estado narrativo acumulado — NPCs presentados y acciones completadas
    let introducedNPCsList: string[] = []
    let completedActions: string[] = []
    // Memoria persistente de TODOS los NPCs conocidos a lo largo de la sesión
    // (independiente de la escena actual). Se inyecta en el prompt como "NPCs
    // ya conocidos" para que el DM no los re-presente en turnos lejanos.
    let allKnownNPCs: Array<{ name: string; info: string }> = []

    try {
      const recentDMContent = allTurns.slice(-10).filter(t => t.role === 'DM').map(t => t.content || '')
      const recentUserContent = allTurns.slice(-8).filter(t => t.role === 'USER').map(t => (t.content || '').toLowerCase())

      // Extraer resúmenes de lo que ya pasó — 3 oraciones, 100 chars cada una
      alreadyHappenedEvents = recentDMContent.map(content => {
        const sentences = content.split(/[.!?»"]/).filter(s => s.trim().length > 10)
        return sentences.slice(0, 3).map(s => s.trim().substring(0, 100)).join('. ')
      }).filter(s => s.length > 10)

      // NPCs presentados — usar npc_states persistente + regex como fallback
      const introducedNPCs = new Set<string>()
      // Primero: NPCs de npc_states que están en la escena actual
      const currentSceneLower = (worldState.current_scene || '').toLowerCase()
      Object.entries(worldState.npc_states || {}).forEach(([name, data]) => {
        const info = typeof data === 'string' ? { status: data, location: '' } : (data as any)
        const loc = (info.location || '').toLowerCase()
        if (!loc || loc === currentSceneLower || currentSceneLower.includes(loc) || loc.includes(currentSceneLower)) {
          introducedNPCs.add(name)
        }
      })
      // Fallback: regex sobre narraciones recientes (para NPCs no registrados aún)
      recentDMContent.forEach(content => {
        const npcMatches = content.matchAll(NPC_DIALOGUE_REGEX)
        for (const m of npcMatches) introducedNPCs.add(m[1])
      })
      introducedNPCsList = [...introducedNPCs]

      // Memoria persistente: TODOS los NPCs conocidos en cualquier punto de la
      // sesión, con su info estructurada del worldState.npc_states. Esto es la
      // fuente de verdad de largo plazo, independiente de la escena actual.
      Object.entries(worldState.npc_states || {}).forEach(([name, data]) => {
        const info = typeof data === 'string' ? { status: data } : (data as any)
        const parts: string[] = []
        if (info.status) parts.push(info.status)
        if (info.location) parts.push(`en ${info.location}`)
        if (info.relationship_to_player) parts.push(`relación: ${info.relationship_to_player}`)
        if (info.active_motivation) parts.push(`motivación: ${info.active_motivation}`)
        allKnownNPCs.push({ name, info: parts.join(', ') || 'conocido' })
      })
      // Cap a 30 para no inflar el prompt
      allKnownNPCs = allKnownNPCs.slice(0, 30)

      // Extraer acciones ya completadas (estado, no eventos)
      const actionPatterns: Array<{ pattern: RegExp; label: (who?: string) => string }> = [
        { pattern: /abr[eió].*puerta|empuj[aó].*puerta|open.*door|push.*door/i, label: () => 'puerta ya abierta' },
        { pattern: /empuñ[aó]|agarra.*(?:hacha|espada|arma)|desenvain[aó]|grab.*(?:axe|sword|weapon)|drew?\s/i, label: () => 'armas ya desenvainadas' },
        { pattern: /cerr[óo].*puerta|clos.*door|lock.*door/i, label: () => 'puerta cerrada con llave' },
        { pattern: /sub[eió].*escalera|climb.*stair/i, label: () => 'subieron las escaleras' },
        { pattern: /sal[eió].*posada|left.*inn|exit.*inn/i, label: () => 'salieron de la posada' },
        { pattern: /salt[aóo].*ventana|jump.*window|lanz[aóo].*ventana/i, label: () => 'ya saltaron por la ventana' },
        { pattern: /descend[ió].*cuerda|baj[aóo].*cuerda|descend.*rope|climb.*down.*rope/i, label: () => 'ya descendieron por la cuerda' },
        { pattern: /huy[eóo]|escap[aóo]|huid|fled|escaped|running away/i, label: () => 'ya escaparon/huyeron' },
        { pattern: /aterriz[aóo]|land(?:ed|ing)/i, label: () => 'ya aterrizaron' },
        { pattern: /abr[eió].*ventana|open.*window/i, label: () => 'ventana ya abierta' },
        { pattern: /at[aóo].*cuerda|tied.*rope|amarr[aóo]/i, label: () => 'cuerda ya atada' },
      ]
      const seenActions = new Set<string>()
      recentDMContent.forEach(content => {
        // NPCs que ya se presentaron
        const introMatch = content.match(/(?:present[aó]|introduc|soy\s|me llamo|mi nombre es|my name is)\b/i)
        if (introMatch) {
          const who = content.match(NPC_DIALOGUE_REGEX)?.[1]
          if (who) {
            const action = `${who} ya se presentó`
            if (!seenActions.has(action)) { seenActions.add(action); completedActions.push(action) }
          }
        }
        // Acciones de estado
        for (const ap of actionPatterns) {
          if (ap.pattern.test(content)) {
            const action = ap.label()
            if (!seenActions.has(action)) { seenActions.add(action); completedActions.push(action) }
          }
        }
      })

      // Detectar observación repetida del jugador
      const obsWords = ['observ', 'mir', 'examin', 'fij', 'watch', 'look', 'study']
      isRepeatedObservation = recentUserContent.filter(a => obsWords.some(w => a.includes(w))).length >= 2

      // Detectar NPC loop: si el mismo NPC aparece en 3+ narraciones consecutivas
      if (recentDMContent.length >= 3) {
        const npcMentions = recentDMContent.map(c => {
          const match = c.match(NPC_DIALOGUE_REGEX)?.[1]
          return match || ''
        }).filter(Boolean)

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

    // playerWantsToMove ya se calculó antes del historial (línea ~164)

    // Construir directiva anti-repetición con estado narrativo
    let antiRepeatDirective = ''
    {
      const isES = !isEnglish
      const parts: string[] = []

      // NPCs ya presentados — instrucción ULTRA explícita
      if (introducedNPCsList.length > 0) {
        parts.push(isES
          ? `⚠️ ESTOS NPCs YA SE PRESENTARON Y EL JUGADOR YA LOS CONOCE: ${introducedNPCsList.join(', ')}.\nNO repitas sus presentaciones. NO digas "Soy [nombre]" ni describas su apariencia otra vez. Ellos YA están en la escena. Simplemente hacelos REACCIONAR a la acción del jugador como personajes que ya se conocen.`
          : `⚠️ THESE NPCs HAVE ALREADY BEEN INTRODUCED AND THE PLAYER KNOWS THEM: ${introducedNPCsList.join(', ')}.\nDo NOT repeat their introductions. Do NOT say "I am [name]" or describe their appearance again. They are ALREADY in the scene. Simply have them REACT to the player's action as characters who already know each other.`)
      }

      // Acciones ya completadas (estado)
      if (completedActions.length > 0) {
        parts.push(isES
          ? `Estado actual: ${completedActions.join(', ')}. Esto YA pasó, NO volver a narrarlo.`
          : `Current state: ${completedActions.join(', ')}. This ALREADY happened, do NOT narrate it again.`)
      }

      // Eventos recientes
      if (alreadyHappenedEvents.length > 0) {
        const eventsList = alreadyHappenedEvents.slice(-6).map(e => `• ${e}`).join('\n')
        parts.push(isES
          ? `Lo que ya pasó (NO repetir):\n${eventsList}`
          : `What already happened (do NOT repeat):\n${eventsList}`)
      }

      // Instrucción de movimiento obligatorio
      if (playerWantsToMove) {
        parts.push(isES
          ? `⚠️ MOVIMIENTO OBLIGATORIO: El jugador quiere IRSE de este lugar. DEBÉS:\n1. Usar "scene_change" para mover al destino mencionado\n2. Narrar la partida brevemente (1 oración máximo)\n3. Describir el NUEVO lugar al que llega\n4. NO dejar que ningún NPC bloquee el movimiento ni siga hablando\nLa intención de movimiento del jugador tiene PRIORIDAD ABSOLUTA sobre cualquier interacción NPC.`
          : `⚠️ MANDATORY MOVEMENT: The player wants to LEAVE this location. You MUST:\n1. Use "scene_change" to move to the destination they mentioned\n2. Briefly narrate the departure (1 sentence max)\n3. Describe the NEW location they arrive at\n4. Do NOT let any NPC block movement or keep talking\nThe player's movement intention has ABSOLUTE PRIORITY over any NPC interaction.`)
      }

      if (parts.length > 0) {
        antiRepeatDirective = isES
          ? `\n\n[SISTEMA — ANTI-REPETICIÓN:\n${parts.join('\n')}\nCONTINUÁ desde donde quedó. Narrá SOLO lo que pasa AHORA como consecuencia de la acción del jugador.]`
          : `\n\n[SYSTEM — ANTI-REPETITION:\n${parts.join('\n')}\nCONTINUE from where it left off. Narrate ONLY what happens NOW as a consequence of the player's action.]`
      }
    }

    // Inyectar STATE ANCHOR como último assistant message para anclar a Claude
    // en la ubicación y estado correctos. Claude trata esto como "su última narración"
    // y naturalmente continuará desde aquí, no desde escenas anteriores del historial.
    {
      const npcsHereNames = Object.entries(worldState.npc_states || {})
        .filter(([_, data]) => {
          const info = typeof data === 'string' ? { location: '' } : (data as any)
          const loc = (info.location || '').toLowerCase()
          const scene = (worldState.current_scene || '').toLowerCase()
          return !loc || loc === scene || scene.includes(loc) || loc.includes(scene)
        })
        .map(([name]) => name)
      const npcsStr = npcsHereNames.length > 0
        ? (isEnglish ? `NPCs present: ${npcsHereNames.join(', ')}. ` : `NPCs presentes: ${npcsHereNames.join(', ')}. `)
        : ''
      const prevLocation = worldState.map_state?.previousLocationId
        ? (worldState.map_state.previousLocationId !== worldState.map_state?.currentLocationId ? worldState.map_state.previousLocationId : '')
        : ''
      const leftMsg = prevLocation
        ? (isEnglish ? ` You already LEFT ${prevLocation} — do NOT narrate anything there.` : ` Ya DEJASTE ${prevLocation} — NO narres nada que pase allí.`)
        : ''
      const stateAnchor = isEnglish
        ? `[CURRENT STATE: Location: ${worldState.current_scene || 'Unknown'}. ${npcsStr}Time: ${worldState.time_in_world || 'Unknown'}. Weather: ${worldState.weather || 'Unknown'}.${leftMsg} Continue the story from HERE ONLY.]`
        : `[ESTADO ACTUAL: Ubicación: ${worldState.current_scene || 'Desconocida'}. ${npcsStr}Hora: ${worldState.time_in_world || 'Desconocida'}. Clima: ${worldState.weather || 'Desconocido'}.${leftMsg} Continuá la historia SOLO desde AQUÍ.]`
      conversationHistory.push({ role: 'assistant' as const, content: stateAnchor })
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
      rule2: 'INVENTORY: Use new_item to ADD items (e.g. "3 silver coins", "Elven sword"). Use remove_item to SUBTRACT items (e.g. "2 silver coins" removes 2 from the count). Countable items (coins, rations, arrows) auto-merge. The number at the start IS the quantity.',
      rule2b: 'INVENTORY ANTI-DUPLICATION CRITICAL: Only use new_item/remove_item in the SINGLE turn where the transaction is FINALIZED. During negotiation or conversation about items, do NOT send new_item/remove_item — wait until the deal is DONE. If you already sent new_item or remove_item for this transaction in a PREVIOUS turn, do NOT send it again. The inventory shown above is ALREADY UPDATED. Use the EXACT same item name format as shown in the inventory (e.g. if inventory has "raciones de viaje", use "1 raciones de viaje", not "1 ración").',
      rule3: 'If the player completes an objective, mark quest_completed',
      rule4: 'When the location changes significantly, use scene_change',
      rule5: 'suggested_actions must have 3 options that make sense with the situation',
      rule5b: 'TIME & WEATHER: Use time_update to advance the time of day (e.g. "Midday", "Sunset", "Night"). Use weather_update to change weather (e.g. "Heavy rain", "Clear skies"). Update these when time passes naturally, during travel, or when weather changes narratively.',
      rule5c: 'XP REWARDS: Use xp_reward (number) to award experience points for difficult actions. Combat victory: 20-30 XP. Skill challenge: 10-20 XP. Quest complete: 25-50 XP. Creative/clever solution: 15-25 XP. Simple actions (talking, walking) = 0 XP (omit field). Only award XP when the player does something challenging or risky.',
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
      rule2: 'INVENTARIO: Usar new_item para AÑADIR items (ej: "3 monedas de plata", "Espada élfica"). Usar remove_item para RESTAR items (ej: "2 monedas de plata" resta 2 del total). Items contables (monedas, raciones, flechas) se suman/restan automáticamente. El número al inicio ES la cantidad.',
      rule2b: 'ANTI-DUPLICACIÓN DE INVENTARIO CRÍTICO: Solo usar new_item/remove_item en el ÚNICO turno donde la transacción se CONCRETA. Durante negociación o conversación sobre items, NO enviar new_item/remove_item — esperar hasta que el trato esté CERRADO. Si ya enviaste new_item o remove_item para esta transacción en un turno ANTERIOR, NO volver a enviarlo. El inventario mostrado arriba YA ESTÁ ACTUALIZADO. Usar el MISMO formato de nombre que aparece en el inventario (ej: si dice "raciones de viaje", usar "1 raciones de viaje", no "1 ración").',
      rule3: 'Si el jugador resuelve un objetivo, marca quest_completed',
      rule4: 'Cuando cambie la ubicación significativamente, usa scene_change',
      rule5: 'suggested_actions debe tener 3 opciones que tengan sentido con la situación',
      rule5b: 'TIEMPO Y CLIMA: Usar time_update para avanzar la hora del día (ej: "Mediodía", "Atardecer", "Noche"). Usar weather_update para cambiar el clima (ej: "Lluvia torrencial", "Despejado"). Actualizar cuando pase tiempo naturalmente, durante viajes, o cuando el clima cambie en la narración.',
      rule5c: 'RECOMPENSA DE XP: Usar xp_reward (número) para dar puntos de experiencia por acciones difíciles. Victoria en combate: 20-30 XP. Desafío de habilidad: 10-20 XP. Misión completada: 25-50 XP. Solución creativa/astuta: 15-25 XP. Acciones simples (hablar, caminar) = 0 XP (omitir campo). Solo dar XP cuando el jugador hace algo desafiante o riesgoso.',
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

    // Build 0 HP / death system section
    const characterConditions: string[] = worldState.party?.[character.name]?.conditions || []
    const characterDeathSaves = worldState.party?.[character.name]?.deathSaves
    const isUnconscious = characterConditions.includes('inconsciente')
    const isDead = characterConditions.includes('muerto')

    let zeroHpSection = ''
    if (isUnconscious && !isDead) {
      const engine = session.campaign.engine
      if (engine === 'STORY_MODE' || engine === 'PBTA') {
        zeroHpSection = isEnglish
          ? `\n=== ⚠️ CHARACTER FELL UNCONSCIOUS (0 HP) ===
You MUST narrate a dramatic rescue: an ally finds them, they wake up later, a fortunate event saves them.
The character recovers 1 HP. The rescue MUST have a narrative cost: lose an item, time passes, an opportunity is lost, or an NPC pays the price.
The character NEVER dies in Story Mode / PbtA. Make the rescue dramatic and memorable.
=== END 0 HP ===\n`
          : `\n=== ⚠️ EL PERSONAJE CAYÓ INCONSCIENTE (0 HP) ===
DEBÉS narrar un rescate dramático: un aliado lo encuentra, despierta tiempo después, un evento afortunado lo salva.
El personaje recupera 1 HP. El rescate DEBE tener un costo narrativo: pierde un item, pasa tiempo, se pierde una oportunidad, o un NPC paga el precio.
El personaje NUNCA muere en Story Mode / PbtA. Hacé el rescate dramático y memorable.
=== FIN 0 HP ===\n`
      } else if (characterDeathSaves) {
        const { successes, failures } = characterDeathSaves
        zeroHpSection = isEnglish
          ? `\n=== ⚠️ DEATH SAVING THROWS — CHARACTER AT 0 HP ===
The character is unconscious and dying. You MUST request a death save roll:
dice_request: { reason: "Death saving throw", formula: "1d20", type: "save", difficulty: 10 }
Rules: 10+ = 1 success. 1-9 = 1 failure. Nat 20 = instant recovery (1 HP). Nat 1 = 2 failures.
3 successes = stabilize at 1 HP. 3 failures = character dies.
Current state: ${successes} successes, ${failures} failures.
Narrate each roll as a moment between life and death. The character cannot take actions while unconscious.
=== END DEATH SAVES ===\n`
          : `\n=== ⚠️ TIRADAS DE SALVACIÓN DE MUERTE — PERSONAJE A 0 HP ===
El personaje está inconsciente y muriendo. DEBÉS pedir una tirada de muerte:
dice_request: { reason: "Tirada de salvación de muerte", formula: "1d20", type: "save", difficulty: 10 }
Reglas: 10+ = 1 éxito. 1-9 = 1 fallo. Nat 20 = recuperación instantánea (1 HP). Nat 1 = 2 fallos.
3 éxitos = estabiliza con 1 HP. 3 fallos = muerte del personaje.
Estado actual: ${successes} éxitos, ${failures} fallos.
Narrá cada tirada como un momento entre la vida y la muerte. El personaje no puede actuar mientras esté inconsciente.
=== FIN TIRADAS DE MUERTE ===\n`
      }
    } else if (isDead) {
      zeroHpSection = isEnglish
        ? `\n=== 💀 CHARACTER IS DEAD ===
The character has died. Narrate a solemn, epic epilogue for their story. Honor their journey.
Do NOT continue gameplay. End with a farewell message.
=== END DEATH ===\n`
        : `\n=== 💀 EL PERSONAJE HA MUERTO ===
El personaje ha muerto. Narrá un epílogo solemne y épico para su historia. Honrá su viaje.
NO continúes el gameplay. Terminá con un mensaje de despedida.
=== FIN MUERTE ===\n`
    }

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

    // Versión COMPACTA del location system: la lista completa de ubicaciones y los
    // 3 JSON examples solo se incluyen cuando el jugador quiere moverse. En turnos
    // normales, solo va la ubicación actual y las reglas mínimas de discover_locations.
    // Ahorra ~3000 chars (~750 tokens) en el 80% de los turnos.
    const locationContextSection = isEnglish ? `
=== LOCATION ===
Current: ${currentLocationId || 'unknown'} — ${currentMapLocation?.name || worldState.current_scene}
Nav: ${navigationLocked ? 'LOCKED' : 'FREE'}${mapState?.lockReason ? ` (${mapState.lockReason})` : ''}
${playerWantsToMove ? `
WORLD LOCATIONS:
${buildLocationList(mapLocations, locationKnowledge)}

When player travels: include "location_id" + "scene_change". Narrate journey immersively.
To reveal locations: use "discover_locations": [{"locationId","level":"rumored|discovered","source"}].
To create new locations: use "create_location": {"id","name","description","type","dangerLevel","nearLocationId","direction","distance","connectTo"}.
Directions: north/south/east/west/ne/nw/se/sw. Distances: close/medium/far. Types: city/dungeon/wilderness/landmark/danger/safe/mystery.` : `
Use "discover_locations" if an NPC mentions a new place. Use "location_id" if player moves.`}
=== END LOCATION ===
` : `
=== UBICACIÓN ===
Actual: ${currentLocationId || 'desconocido'} — ${currentMapLocation?.name || worldState.current_scene}
Nav: ${navigationLocked ? 'BLOQUEADA' : 'LIBRE'}${mapState?.lockReason ? ` (${mapState.lockReason})` : ''}
${playerWantsToMove ? `
UBICACIONES DEL MUNDO:
${buildLocationList(mapLocations, locationKnowledge)}

Cuando el jugador viaja: incluí "location_id" + "scene_change". Narrá el viaje inmersivamente.
Para revelar ubicaciones: usá "discover_locations": [{"locationId","level":"rumored|discovered","source"}].
Para crear ubicaciones nuevas: usá "create_location": {"id","name","description","type","dangerLevel","nearLocationId","direction","distance","connectTo"}.
Direcciones: north/south/east/west/ne/nw/se/sw. Distancias: close/medium/far. Tipos: city/dungeon/wilderness/landmark/danger/safe/mystery.` : `
Usá "discover_locations" si un NPC menciona un lugar nuevo. Usá "location_id" si el jugador se mueve.`}
=== FIN UBICACIÓN ===
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

    const languageRule = isEnglish
      ? `\n=== CRITICAL LANGUAGE RULE ===
The player plays in ENGLISH. You MUST narrate ENTIRELY in English.
Translate ALL lore names, location names, NPC names, item names, quest names, and descriptions to English.
Examples: "Posada del Pony Pisador" → "The Prancing Pony Inn", "Tierra Media" → "Middle-earth", "Espada larga forjada en el oeste" → "Longsword forged in the West", "Montaraz" → "Ranger", "Erudito" → "Scholar".
Your suggested_actions MUST be in English. Your narration, dialogue, and ALL text MUST be in English. No Spanish whatsoever.
=== END LANGUAGE RULE ===\n`
      : `\n=== REGLA DE IDIOMA ===
El jugador juega en ESPAÑOL. Toda la narración, diálogo, nombres y descripciones DEBEN estar en español. No uses inglés.
=== FIN REGLA DE IDIOMA ===\n`

    const systemPrompt = `${labels.dmRole}${isMultiplayer ? ` ${labels.multiplayer}` : ''}. ${isEnglish ? 'Your role is to create an immersive and exciting experience.' : 'Tu rol es crear una experiencia inmersiva y emocionante.'}
${languageRule}
${(() => {
  // Separar NPCs por ubicación — los que están AQUÍ vs en otro lugar
  const currentScene = worldState.current_scene || ''
  const npcsHere: string[] = []
  const npcsElsewhere: string[] = []
  Object.entries(worldState.npc_states || {}).forEach(([name, data]) => {
    const info = typeof data === 'string' ? { status: data, location: '' } : (data as any)
    const status = info.status || 'alive'
    const location = info.location || ''
    if (!location || location.toLowerCase() === currentScene.toLowerCase() || currentScene.toLowerCase().includes(location.toLowerCase())) {
      npcsHere.push(`${name} (${status}) — already introduced, do NOT re-introduce`)
    } else {
      npcsElsewhere.push(`${name} (${status}, at ${location})`)
    }
  })
  // Buscar sub-locaciones de la ubicación actual
  const loreLookup = LORE_JSON_DATA[session.campaign.lore] || {}
  const currentLocationData = loreLookup.locations?.find((l: any) =>
    worldState.current_scene?.toLowerCase().includes(l.name?.toLowerCase()) ||
    l.name?.toLowerCase().includes(worldState.current_scene?.toLowerCase()?.split(',')[0]?.trim())
  )
  // Sub-locación actual
  const currentSubLocId = worldState.current_sub_location || null
  const currentSubLoc = currentLocationData?.sub_locations?.find((sl: any) => sl.id === currentSubLocId)
  // sl.name / sl.description son LocalizedString {es,en} en los lore JSON —
  // hay que localizarlos o el template interpola '[object Object]' en el prompt.
  const loc = isEnglish ? 'en' : 'es'
  const locName = (v: any) => (typeof v === 'string' ? v : v?.[loc] || v?.es || v?.en || '')
  const locationDisplay = currentSubLoc
    ? `${locName(currentLocationData?.name) || worldState.current_scene} > ${locName(currentSubLoc.name)}`
    : worldState.current_scene || (isEnglish ? 'Unknown' : 'Desconocida')
  const subLocs = currentLocationData?.sub_locations || []
  const subLocList = subLocs.map((sl: any) => `- ${locName(sl.name)} (${sl.type}): ${locName(sl.description)}`).join('\n')

  const justArrived = turnsInCurrentLocation <= 1
  const locationStatus = isEnglish
    ? (justArrived ? '(just arrived — describe surroundings)' : `(here for ${turnsInCurrentLocation} turns — DO NOT re-describe arrival or journey. Continue from where you left off)`)
    : (justArrived ? '(recién llegó — describí los alrededores)' : `(lleva ${turnsInCurrentLocation} turnos aquí — NO re-describas la llegada ni el viaje. Continuá desde donde dejaste)`)

  return isEnglish
  ? `CURRENT SCENE STATE (you MUST respect this):
📍 Location: ${locationDisplay} ${locationStatus}
🕐 Time: ${worldState.time_in_world || 'Unknown'} ← Your narration is AT THIS TIME. If it says "morning", do NOT narrate night.
🌤️ Weather: ${worldState.weather || 'Unknown'} ← This IS the current weather. To change it, use weather_update.
👥 NPCs IN THIS SCENE: ${npcsHere.length > 0 ? npcsHere.join('; ') : 'None'}
${npcsElsewhere.length > 0 ? `👥 NPCs ELSEWHERE (NOT here — do NOT narrate them): ${npcsElsewhere.join('; ')}` : ''}
🎒 Inventory: ${inventory.join(', ') || 'Empty'}
${subLocList ? `🏘️ Places within this location:\n${subLocList}\nUse scene_change to move between these places.` : ''}
Your narration MUST take place HERE, at this TIME, with this WEATHER.
NPCs MUST keep the SAME name in every turn. NEVER rename an NPC.
NPCs listed as ELSEWHERE must NOT appear in your narration — they are in a different location.
ALWAYS send npc_update when you introduce a NEW NPC (with their current location).
INVENTORY: If items change hands, ALWAYS use new_item/remove_item.`
  : `ESTADO ACTUAL DE LA ESCENA (DEBÉS respetar esto):
📍 Ubicación: ${locationDisplay} ${locationStatus}
🕐 Hora: ${worldState.time_in_world || 'Desconocida'} ← TU NARRACIÓN ES EN ESTE MOMENTO. Si dice "mañana", NO narres noche.
🌤️ Clima: ${worldState.weather || 'Desconocido'} ← ESTE es el clima actual. Para cambiarlo, usá weather_update.
👥 NPCs EN ESTA ESCENA: ${npcsHere.length > 0 ? npcsHere.join('; ') : 'Ninguno'}
${npcsElsewhere.length > 0 ? `👥 NPCs EN OTRO LUGAR (NO están acá — NO los narres): ${npcsElsewhere.join('; ')}` : ''}
🎒 Inventario: ${inventory.join(', ') || 'Vacío'}
${subLocList ? `🏘️ Lugares dentro de esta ubicación:\n${subLocList}\nUsá scene_change para moverte entre estos lugares.` : ''}
Tu narración DEBE transcurrir AQUÍ, en este MOMENTO, con este CLIMA.
Los NPCs DEBEN mantener el MISMO nombre en cada turno. NUNCA renombres un NPC.
Los NPCs marcados como EN OTRO LUGAR NO deben aparecer en tu narración — están en otra ubicación.
SIEMPRE enviá npc_update cuando introduzcas un NPC NUEVO (con su ubicación actual).
INVENTARIO: Si cambian objetos de mano, SIEMPRE usá new_item/remove_item.`
})()}

${engineRulesSection}
${zeroHpSection}
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
${Object.keys(worldState.npc_states || {}).length > 0 ? `- ${isEnglish ? 'NPC States' : 'Estado de NPCs'}: ${Object.entries(worldState.npc_states || {}).map(([name, data]) => { const info = typeof data === 'string' ? { status: data, location: '' } : (data as any); return `${name}: ${info.status}${info.location ? ` (${info.location})` : ''}`; }).join(', ')}` : ''}
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
  "mood_hint": null,
  "time_update": null,
  "weather_update": null,
  "xp_reward": 0,
  "ability_used": null,
  "long_rest": false${isMultiplayer ? `,
  "other_party_effects": []` : ''}
}
${isMultiplayer ? `
${labels.partyEffects}:
[{"character_name": "${isEnglish ? 'Name' : 'Nombre'}", "hp_change": -2, "reason": "${isEnglish ? 'reason' : 'razón'}"}, ...]
` : ''}

${labels.mechanicRules}:
1. ${labels.rule1}
2. ${labels.rule2}
3. ${labels.rule2b}
4. ${labels.rule3}
5. ${labels.rule4}
6. ${labels.rule5}
7. ${labels.rule5b}
${isMultiplayer ? `8. ${labels.rule6} ${character.name}
9. ${labels.rule7}
10. ${labels.rule8}` : ''}

${isEnglish
  ? `WORLD MEMORY (update these to track the story):
- "npc_update": {"name": "NPC Name", "status": "alive/dead/fled/ally/enemy/missing", "location": "Current Location Name"} — ALWAYS send this when you INTRODUCE a new NPC or when an NPC's status/location changes. The location field tracks WHERE the NPC is.
- "world_flag": {"flag": "description_of_decision", "value": true} — when the player makes an important choice or something irreversible happens
Use these to build the world's memory. EVERY new NPC must be registered with npc_update so the system knows where they are.`
  : `MEMORIA DEL MUNDO (actualizá estos para rastrear la historia):
- "npc_update": {"name": "Nombre NPC", "status": "vivo/muerto/huyó/aliado/enemigo/desaparecido", "location": "Nombre de Ubicación Actual"} — SIEMPRE enviar cuando INTRODUZCAS un NPC nuevo o cuando cambie su estado/ubicación. El campo location rastrea DÓNDE está el NPC.
- "world_flag": {"flag": "descripcion_de_la_decision", "value": true} — cuando el jugador toma una decisión importante o pasa algo irreversible
Usá estos para construir la memoria del mundo. CADA NPC nuevo debe registrarse con npc_update para que el sistema sepa dónde está.`}

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

CRITICAL RULE FOR DICE REQUESTS:
When you include "dice_request" in your response, your narration MUST STOP at the moment of tension. DO NOT narrate what happens — the dice haven't been rolled yet. Your narration should be SHORT (2-3 sentences max) describing ONLY the setup.
GOOD: "You creep toward the shadow, holding your breath..."
BAD: "You creep toward the shadow. You notice it's a Nazgul and it turns toward you..." (this resolves the action before the roll)

INTERPRETING A SUBMITTED ROLL:
${diceRoll ? `The player just rolled: ${diceRoll.formula} = ${diceRoll.result} (dice: ${diceRoll.rolls.join(', ')}). Narrate the OUTCOME based on this result.` : 'No dice roll submitted - if the action requires one, REQUEST IT with dice_request.'}

RULES:
- ANY action requiring skill = ALWAYS request a roll. No exceptions.
- Combat = EVERY turn requires a roll (attack, dodge, cast spell).
- Only pure dialogue/conversation turns skip dice. Everything else needs a roll.
- If the player says "I try to...", "I attempt...", "I attack...", "I sneak...", "I search...", "I convince..." → REQUEST A ROLL.
- NEVER auto-succeed or auto-fail a skill action without a dice roll.
=== END DICE SYSTEM ===

=== NARRATIVE PROGRESSION (CRITICAL) ===
The story MUST ALWAYS move forward. NEVER repeat a scene you already narrated.
- If the player tries to move to another place, ALWAYS use "scene_change" and describe the NEW location. DO NOT re-narrate the departure.
- PLAYER MOVEMENT IS SACRED: When the player says they want to go somewhere (leave, return, go to, head to, go back), you MUST move them immediately. No NPC can block voluntary movement unless navigation_locked is true. Use scene_change. Never ignore a movement request.
- If an NPC already introduced themselves, DO NOT have them introduce themselves again.
- If an event already happened (door opened, item given, escape made), it is DONE. Start from the NEW situation.
- Read your previous messages: if you already narrated something, the player already experienced it.
- NPCs MUST keep the same name across ALL turns. If you named someone "Aldric" in turn 5, they are ALWAYS "Aldric".
- When time passes significantly, reflect it: "morning" → "afternoon" → "evening" → "night". Use scene_change if needed.
=== END PROGRESSION ===

=== CONSISTENCY RULES ===
- UNIQUE NPC NAMES: NEVER reuse a name that already exists in the NPC list above for a different character. Every NPC must have a unique name. If you need a new NPC, invent a completely new name.
- ITEMS ALREADY IN INVENTORY: Check the player's inventory above BEFORE narrating finding/discovering items. If the player already HAS an item (gems, weapons, coins), do NOT narrate finding it again. The inventory is the source of truth.
- NPC IDENTITY PERSISTENCE: Once you reveal an NPC's name (e.g., "the hooded figure is Strider"), that NPC is ALWAYS that character. Never change their identity, gender, or role in later turns. An NPC who was revealed as a male Ranger cannot become a female elf.
- NO GENERIC NPCs: Every NPC must have a proper name from their FIRST appearance. Do NOT use generic descriptions like "hooded figure", "the stranger", "a mysterious woman" for multiple different NPCs. If you introduce someone as "a hooded figure", give them a name immediately in their first line of dialogue.
- NO ATMOSPHERIC REPETITION: Do NOT repeat the same atmospheric element (drums, smoke, cold wind, distant howls) more than twice across turns. After mentioning it twice, assume the player knows it's there. Vary your descriptions — don't recycle the same image.
- LOCATION PERMANENCE: Once the player has LEFT a location, NOTHING happens there anymore in your narration. Do not describe events at the old location. The story exists only where the player IS right now.
- TIME & WEATHER COHERENCE: If the time says "morning", your narration MUST describe a morning scene (sunlight, dawn, early hours). If weather says "Clear", do NOT describe storms, rain, or heavy clouds. If you WANT to change time or weather, you MUST send time_update and/or weather_update in your JSON response. NEVER narrate a different time of day or weather than what the state says without updating it first.
- NPC RELATIONSHIPS & ROMANCE: Romantic relationships with NPCs are possible IF the player builds trust naturally over multiple turns (protecting them, helping them, showing genuine interest, making sacrifices). The NPC must have realistic reasons to reciprocate. NEVER allow romance from crude/forced advances — NPCs should react with discomfort or rejection to inappropriate behavior. Track relationship progression in the relationships field. Romance should feel earned, not granted.
=== END CONSISTENCY ===

=== TRAVEL RULES ===
When the player travels between locations:
1. ADVANCE time_in_world by the realistic travel duration
2. Use remove_item to consume rations (e.g. remove_item: "2 raciones de viaje" subtracts 2 from the count automatically)
3. If player has NO rations, narrate hunger/fatigue and apply -1 HP per day with hp_change
4. Narrate 2-3 highlights of the journey (landscapes, camps, weather, encounters)
5. ALWAYS use scene_change + location_id when arriving
${(() => {
  const loc = LORE_JSON_DATA[session.campaign.lore]?.locations?.find((l: any) =>
    worldState.current_scene?.toLowerCase()?.includes(l.name?.toLowerCase())
  )
  const tt = loc?.travel_times
  if (!tt) return ''
  return 'Travel times from current location:\n' + Object.entries(tt).map(([dest, time]) => `- → ${dest}: ${time}`).join('\n')
})()}
=== END TRAVEL ===` : `=== SISTEMA DE TIRADA DE DADOS ===
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

REGLA CRÍTICA PARA TIRADAS:
Cuando incluís "dice_request" en tu respuesta, la narración DEBE PARAR en el momento de tensión. NO narres lo que pasa — los dados no se tiraron todavía. Tu narración debe ser CORTA (2-3 oraciones máx) describiendo SOLO la preparación.
BIEN: "Te acercás sigilosamente a la sombra, conteniendo la respiración..."
MAL: "Te acercás a la sombra. Notás que es un Nazgûl y se gira hacia vos..." (esto resuelve la acción antes de la tirada)

INTERPRETANDO UNA TIRADA ENVIADA:
${diceRoll ? `El jugador acaba de tirar: ${diceRoll.formula} = ${diceRoll.result} (dados: ${diceRoll.rolls.join(', ')}). Narrá el RESULTADO basándote en esta tirada.` : 'Sin tirada de dados enviada - si la acción requiere una, PEDILA con dice_request.'}

REGLAS:
- CUALQUIER acción que requiera habilidad = SIEMPRE pedí tirada. Sin excepciones.
- Combate = CADA turno requiere tirada (atacar, esquivar, lanzar hechizo).
- Solo los turnos de pura conversación/diálogo se saltan dados. Todo lo demás necesita tirada.
- Si el jugador dice "intento...", "ataco...", "me escabullo...", "busco...", "convenzo..." → PEDÍ TIRADA.
- NUNCA auto-éxito o auto-fallo en una acción de habilidad sin tirada de dados.
=== FIN SISTEMA DE DADOS ===

=== PROGRESIÓN NARRATIVA (CRÍTICO) ===
La historia SIEMPRE debe avanzar. NUNCA repitas una escena que ya narraste.
- Si el jugador intenta moverse a otro lugar, SIEMPRE usá "scene_change" y describí la NUEVA ubicación. NO re-narres la partida.
- EL MOVIMIENTO DEL JUGADOR ES SAGRADO: Cuando el jugador dice que quiere ir a algún lugar (irse, volver, dirigirse, ir a, regresar), DEBÉS moverlo inmediatamente. Ningún NPC puede bloquear el movimiento voluntario a menos que navigation_locked sea true. Usá scene_change. Nunca ignores una solicitud de movimiento.
- Si un NPC ya se presentó, NO lo hagas presentarse de nuevo.
- Si un evento ya pasó (puerta abierta, objeto entregado, escape hecho), ESTÁ HECHO. Empezá desde la NUEVA situación.
- Leé tus mensajes anteriores: si ya narraste algo, el jugador ya lo vivió.
- Los NPCs DEBEN mantener el mismo nombre en TODOS los turnos. Si nombraste a alguien "Aldric" en el turno 5, SIEMPRE es "Aldric".
- Cuando pase tiempo significativo, reflejalo: "mañana" → "tarde" → "noche" → "amanecer". Usá scene_change si es necesario.
=== FIN PROGRESIÓN ===

=== REGLAS DE CONSISTENCIA ===
- NOMBRES ÚNICOS DE NPCs: NUNCA reutilices un nombre que ya existe en la lista de NPCs de arriba para un personaje diferente. Cada NPC debe tener un nombre único. Si necesitás un NPC nuevo, inventá un nombre completamente nuevo.
- ITEMS YA EN INVENTARIO: Revisá el inventario del jugador arriba ANTES de narrar encontrar/descubrir items. Si el jugador YA TIENE un item (gemas, armas, monedas), NO narres encontrarlo de nuevo. El inventario es la fuente de verdad.
- PERSISTENCIA DE IDENTIDAD NPC: Una vez que revelás el nombre de un NPC (ej: "la figura encapuchada es Strider"), ese NPC es SIEMPRE ese personaje. Nunca cambies su identidad, género o rol en turnos posteriores. Un NPC revelado como un Montaraz masculino no puede volverse una elfa.
- SIN NPCs GENÉRICOS: Cada NPC debe tener nombre propio desde su PRIMERA aparición. NO uses descripciones genéricas como "figura encapuchada", "el desconocido", "una mujer misteriosa" para múltiples NPCs diferentes. Si introducís a alguien como "una figura encapuchada", dale un nombre inmediatamente en su primera línea de diálogo.
- SIN REPETICIÓN ATMOSFÉRICA: NO repitas el mismo elemento atmosférico (tambores, humo, viento helado, aullidos lejanos) más de dos veces entre turnos. Después de mencionarlo dos veces, asumí que el jugador sabe que está ahí. Variá tus descripciones — no recicles la misma imagen.
- PERMANENCIA DE UBICACIÓN: Una vez que el jugador DEJÓ una ubicación, NADA pasa allí en tu narración. No describas eventos en la ubicación anterior. La historia existe solo donde el jugador ESTÁ ahora mismo.
- COHERENCIA DE HORA Y CLIMA: Si la hora dice "mañana", tu narración DEBE describir una escena de mañana (sol, amanecer, luz matinal). Si el clima dice "Despejado", NO describas tormenta, lluvia ni oscuridad. Si querés cambiar la hora o el clima, DEBÉS enviar time_update y/o weather_update en tu respuesta JSON. NUNCA narres un momento del día o clima diferente al que dice el estado sin actualizarlo primero.
=== FIN CONSISTENCIA ===

=== REGLAS DE VIAJE ===
Cuando el jugador viaja entre ubicaciones:
1. AVANZAR time_in_world por la duración realista del viaje
2. Usar remove_item para consumir raciones (ej: remove_item: "2 raciones de viaje" resta 2 del total automáticamente)
3. Si NO tiene raciones, narrar hambre/fatiga y aplicar -1 HP por día con hp_change
4. Narrar 2-3 momentos del viaje (paisajes, campamentos, clima, encuentros)
5. SIEMPRE usar scene_change + location_id al llegar
${(() => {
  const loc = LORE_JSON_DATA[session.campaign.lore]?.locations?.find((l: any) =>
    worldState.current_scene?.toLowerCase()?.includes(l.name?.toLowerCase())
  )
  const tt = loc?.travel_times
  if (!tt) return ''
  return 'Tiempos de viaje desde ubicación actual:\n' + Object.entries(tt).map(([dest, time]) => `- → ${dest}: ${time}`).join('\n')
})()}
=== FIN VIAJE ===`}

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

${isEnglish ? `=== PACING ===
Turn ${totalTurns}. In "${currentScene}" for ${turnsInCurrentLocation} turns.
${storySoFar ? `STORY SO FAR: ${storySoFar}` : ''}
${allKnownNPCs.length > 0 ? `KNOWN NPCs: ${allKnownNPCs.map(n => `${n.name} (${n.info})`).join('; ')}. Do NOT re-introduce them.` : ''}
${lastDMNarration ? `LAST NARRATION (continue from here): "${lastDMNarration}..."` : ''}
${introducedNPCsList.length > 0 ? `NPCs HERE NOW: ${introducedNPCsList.join(', ')} — already introduced, do NOT re-present.` : ''}
${completedActions.length > 0 ? `ALREADY HAPPENED: ${completedActions.join(', ')} — do NOT re-narrate.` : ''}
CORE RULES: Never go backward. Each turn = new content. Advance time naturally. The world is alive — introduce events proactively.
${(worldState.active_quests || []).length > 0 ? `Active quests: ${(worldState.active_quests || []).join(', ')}. No duplicate quests.` : ''}
${isStagnant ? '⚠️ STAGNATION — introduce an external event NOW.' : ''}
${needsWorldEvent ? '🌍 WORLD EVENT NEEDED this turn.' : ''}
${isNPCLoop ? `⚠️ NPC LOOP: "${loopingNPCName}" dominated 3+ turns. End or interrupt this interaction NOW.` : ''}
${isRepeatedObservation ? '⚠️ Player keeps observing — make something HAPPEN.' : ''}
${ignoredQuests.length > 0 ? `Forgotten quests: ${ignoredQuests.join(', ')} — weave back in.` : ''}
${turnsInCurrentLocation >= 4 ? `Been here ${turnsInCurrentLocation} turns — consider advancing.` : ''}
=== END PACING ===` : `=== RITMO ===
Turno ${totalTurns}. En "${currentScene}" hace ${turnsInCurrentLocation} turnos.
${storySoFar ? `HISTORIA HASTA AHORA: ${storySoFar}` : ''}
${allKnownNPCs.length > 0 ? `NPCs CONOCIDOS: ${allKnownNPCs.map(n => `${n.name} (${n.info})`).join('; ')}. NO los re-presentes.` : ''}
${lastDMNarration ? `ÚLTIMA NARRACIÓN (continuá desde acá): "${lastDMNarration}..."` : ''}
${introducedNPCsList.length > 0 ? `NPCs AQUÍ AHORA: ${introducedNPCsList.join(', ')} — ya presentados, NO re-presentar.` : ''}
${completedActions.length > 0 ? `YA PASÓ: ${completedActions.join(', ')} — NO re-narrar.` : ''}
REGLAS: Nunca retroceder. Cada turno = contenido nuevo. Avanzar el tiempo. El mundo está vivo — introducir eventos proactivamente.
${(worldState.active_quests || []).length > 0 ? `Quests activas: ${(worldState.active_quests || []).join(', ')}. No duplicar quests.` : ''}
${isStagnant ? '⚠️ ESTANCAMIENTO — introducí un evento externo AHORA.' : ''}
${needsWorldEvent ? '🌍 EVENTO DEL MUNDO NECESARIO este turno.' : ''}
${isNPCLoop ? `⚠️ LOOP NPC: "${loopingNPCName}" dominó 3+ turnos. Terminá o interrumpí esta interacción AHORA.` : ''}
${isRepeatedObservation ? '⚠️ Jugador sigue observando — hacé que algo PASE.' : ''}
${ignoredQuests.length > 0 ? `Quests olvidadas: ${ignoredQuests.join(', ')} — entretejelas.` : ''}
${turnsInCurrentLocation >= 4 ? `Lleva ${turnsInCurrentLocation} turnos acá — considerá avanzar.` : ''}
=== FIN RITMO ===`}

${isEnglish ? 'NPC GENDER FOR VOICE' : 'GÉNERO DE NPCs PARA VOZ'}:
- ${isEnglish
  ? 'When introducing a new NPC, always use gendered pronouns or descriptors clearly (he/she, the woman/the man, the old lady/the old man). This is critical for the voice system to assign the correct voice gender.'
  : 'Al introducir un NPC nuevo, siempre usa pronombres o descriptores de género claros (él/ella, la mujer/el hombre, la anciana/el anciano). Esto es crítico para que el sistema de voz asigne el género de voz correcto.'}
`

    // === HABILIDADES DEL PERSONAJE (abilities — daily_uses o cooldown_turns) ===
    // Inyectar lista con estado actual + instrucciones al DM para que marque ability_used.
    const currentAbilities: AbilityRuntime[] =
      (worldState.party?.[character.name]?.abilities as AbilityRuntime[]) || []
    let abilitiesSection = ''
    if (currentAbilities.length > 0) {
      const isDnDEngine = session.campaign.engine === 'DND_5E'
      const localeForAb = isEnglish ? 'en' : 'es'
      const lines = currentAbilities.map((ab) => {
        const abName = typeof ab.name === 'string' ? ab.name : (ab.name as any)[localeForAb] || (ab.name as any).es || ab.id
        const abDesc = typeof ab.description === 'string' ? ab.description : (ab.description as any)[localeForAb] || (ab.description as any).es || ''
        if (ab.resource === 'daily_uses') {
          const remaining = (ab.maxUses ?? 0) - ab.usedToday
          const state = remaining > 0 ? `${remaining}/${ab.maxUses} ${isEnglish ? 'AVAILABLE' : 'DISPONIBLE'}` : (isEnglish ? 'EXHAUSTED' : 'AGOTADA')
          return `- [${ab.id}] ${abName} (${ab.kind}): ${abDesc} [${state}]`
        }
        const state = ab.cooldownRemaining > 0
          ? (isEnglish ? `ON COOLDOWN (${ab.cooldownRemaining} turns left)` : `EN COOLDOWN (${ab.cooldownRemaining} turnos restantes)`)
          : (isEnglish ? 'AVAILABLE' : 'DISPONIBLE')
        return `- [${ab.id}] ${abName} (${ab.kind}): ${abDesc} [${state}, cooldown: ${ab.cooldownTurns}]`
      }).join('\n')

      abilitiesSection = isEnglish
        ? `\n=== CHARACTER SPECIAL ABILITIES ===
${isDnDEngine
  ? 'Each ability has limited DAILY USES and refreshes on long rest.'
  : 'Each ability has a COOLDOWN in turns after use.'}
${lines}

INSTRUCTIONS FOR ABILITIES:
1. If the player explicitly mentions using an ability by name OR their action includes "[Use Ability: X]", set "ability_used": { "id": "exact_id_from_list", "reason": "brief narrative" } in your JSON. Use the id EXACTLY as shown in brackets above.
2. If the ability is EXHAUSTED / ON COOLDOWN, narrate that the character cannot use it right now and DO NOT set ability_used.
3. You MAY suggest using a fitting ability when tactically relevant ("you remember you could try your [name]...").
4. ${isDnDEngine ? 'If the player camps, sleeps for 8+ hours, or takes a long rest, set "long_rest": true to refresh all daily uses.' : 'The cooldowns decrement automatically each player turn — do not track them yourself.'}
=== END ABILITIES ===\n`
        : `\n=== HABILIDADES ESPECIALES DEL PERSONAJE ===
${isDnDEngine
  ? 'Cada habilidad tiene USOS DIARIOS limitados y se recuperan con descanso largo.'
  : 'Cada habilidad tiene un COOLDOWN en turnos después del uso.'}
${lines}

INSTRUCCIONES PARA HABILIDADES:
1. Si el jugador menciona usar una habilidad por nombre O su acción incluye "[Uso Habilidad: X]", seteá "ability_used": { "id": "id_exacto_de_la_lista", "reason": "breve narración" } en el JSON. Usá el id EXACTO tal como aparece entre corchetes.
2. Si la habilidad está AGOTADA / EN COOLDOWN, narrá que el personaje no puede usarla ahora y NO setees ability_used.
3. PODÉS sugerir usar una habilidad cuando sea tácticamente relevante ("te acordás que podrías intentar tu [nombre]...").
4. ${isDnDEngine ? 'Si el jugador acampa, duerme 8+ horas, o toma un descanso largo, seteá "long_rest": true para recuperar todos los usos diarios.' : 'Los cooldowns se decrementan automáticamente cada turno — no los rastrees vos mismo.'}
=== FIN HABILIDADES ===\n`
    }

    // Prepend abilities section to system prompt
    const finalSystemPrompt = systemPrompt + abilitiesSection

    console.log(`[DM] System prompt length: ${finalSystemPrompt.length} chars, conversation: ${conversationHistory.length} messages`)

    let response
    try {
      response = await anthropic.messages.create({
        // Configurable sin deploy: DM_MODEL en env. Default: Sonnet 4.6.
        model: process.env.DM_MODEL || 'claude-sonnet-4-6',
        // 2500 (antes 1500): con narraciones largas + diálogos escapados + todos
        // los campos JSON, 1500 truncaba la respuesta y el JSON quedaba cortado.
        max_tokens: 2500,
        system: finalSystemPrompt,
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
      // NPC state update (when NPC status or location changes) — single or array
      npc_update?: { name: string; status: string; location?: string }
        | Array<{ name: string; status: string; location?: string }> | null
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
      // Time and weather updates
      time_update?: string | null
      weather_update?: string | null
      // XP reward
      xp_reward?: number
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
      // Habilidad especial usada en este turno (gasta un uso diario o activa cooldown)
      ability_used?: { id: string; reason?: string } | null
      // Descanso largo (solo DND_5E): resetea los usos diarios de todas las abilities
      long_rest?: boolean
    }

    // Parseo robusto: si el JSON viene truncado (max_tokens) o malformado,
    // extrae SOLO la narración en vez de filtrar el JSON crudo al jugador.
    {
      const parsed = parseDMResponse(rawResponse)
      dmResponse = parsed.data as typeof dmResponse
      if (!parsed.fullParse) {
        console.warn('[DM] JSON incompleto/truncado — se degradó a solo narración')
      }
    }

    // Validación del contrato del DM contra el schema Zod (modo warning).
    // No bloquea el turno — solo loggea violaciones para observabilidad y
    // para que el playtest/monitoreo las detecte. El enforcement duro puede
    // activarse más adelante viendo la tasa real de violaciones en prod.
    try {
      const validation = validateDMResponse(dmResponse)
      if (!validation.ok) {
        console.warn(`[DM] Respuesta viola el schema: ${validation.issues.slice(0, 5).join(' | ')}`)
      }
    } catch {
      // la validación jamás debe romper el turno
    }

    // Calculate world state updates
    const worldStateUpdates: Record<string, any> = {}

    // Auto-detect NPCs from narration — Claude doesn't always send npc_update
    // so we extract NPC names from dialogue patterns (Name: or Name «)
    try {
      const narratedNPCs = [...(dmResponse.narration || '').matchAll(NPC_DIALOGUE_REGEX)]
      const currentNPCs = worldState.npc_states || {}
      for (const match of narratedNPCs) {
        const npcName = match[1]
        // Skip player character, short names, common false positives
        if (npcName === character.name || npcName.length < 3) continue
        // Blocklist de falsos positivos: palabras comunes que matchean el patrón Nombre:
        const NPC_BLOCKLIST = [
          'Día', 'Noche', 'Ronda', 'Turno', 'Scene', 'Round', 'Resumen', 'Descripción',
          'Resultado', 'Mensaje', 'Escena', 'Nota', 'Sistema', 'Inventario', 'Ubicación',
          'Estado', 'Combate', 'Acción', 'Respuesta', 'Narración', 'Historia', 'Quest',
          'Misión', 'Objetivo', 'Clima', 'Hora', 'Tiempo', 'Lugar', 'Destino', 'Arma',
          'Item', 'Objeto', 'Equipo', 'Hechizo', 'Spell', 'Attack', 'Defense', 'Location',
          'Warning', 'Error', 'Note', 'Summary', 'Description', 'Result', 'Action',
          'Taverna', 'Castillo', 'Posada', 'Mercado', 'Plaza', 'Templo', 'Bosque',
          'Ejemplo', 'Example', 'Important', 'Importante', 'Critical', 'Crítico',
        ]
        if (NPC_BLOCKLIST.some(b => b.toLowerCase() === npcName.toLowerCase())) continue
        if (!currentNPCs[npcName]) {
          if (!worldStateUpdates.npc_states) worldStateUpdates.npc_states = { ...currentNPCs }
          worldStateUpdates.npc_states[npcName] = {
            status: 'alive',
            location: worldState.current_scene || '',
            introduced: true,
          }
          console.log(`[NPC] Auto-detected from narration: ${npcName} @ ${worldState.current_scene}`)
        }
      }
    } catch {
      // Si falla la extracción, continuar sin problemas
    }

    // Guardar valores originales ANTES del guard (para persistir en el turno)
    const originalNewItem = dmResponse.new_item || null
    const originalRemoveItem = dmResponse.remove_item || null

    // Guard: bloquear re-aplicación de cambios de inventario de los últimos 3 turnos DM
    // Usa nombre base (sin cantidad) para detectar que "5 monedas" y "3 monedas" son el mismo item
    const parseBaseName = (item: string): string => {
      const match = item.match(/^\d+\s+(.+)$/)
      return (match ? match[1] : item).toLowerCase().trim()
    }

    const recentDMTurns = session.turns.filter(t => t.role === 'DM').slice(-3)
    let blockNewItem = false
    let blockRemoveItem = false

    for (const prevTurn of recentDMTurns) {
      const patch = prevTurn.worldStatePatch as any

      // Check new_item independientemente
      if (!blockNewItem && patch?._lastNewItem && dmResponse.new_item) {
        const lastBase = parseBaseName(patch._lastNewItem)
        const currBase = parseBaseName(dmResponse.new_item)
        if (lastBase === currBase || lastBase.includes(currBase) || currBase.includes(lastBase)) {
          console.log(`[Inventory] Blocked re-application of new_item: "${dmResponse.new_item}" (matched: "${patch._lastNewItem}")`)
          blockNewItem = true
        }
      }

      // Check remove_item independientemente (NO break compartido)
      if (!blockRemoveItem && patch?._lastRemoveItem && dmResponse.remove_item) {
        const lastBase = parseBaseName(patch._lastRemoveItem)
        const currBase = parseBaseName(dmResponse.remove_item)
        if (lastBase === currBase || lastBase.includes(currBase) || currBase.includes(lastBase)) {
          console.log(`[Inventory] Blocked re-application of remove_item: "${dmResponse.remove_item}" (matched: "${patch._lastRemoveItem}")`)
          blockRemoveItem = true
        }
      }
    }

    if (blockNewItem) dmResponse.new_item = null
    if (blockRemoveItem) dmResponse.remove_item = null

    // Update HP if changed
    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const newHP = Math.max(0, Math.min(maxHPNum, currentHPNum + dmResponse.hp_change))
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      worldStateUpdates.party[character.name].hp = `${newHP}/${maxHPNum}`

      // === 0 HP DETECTION — hybrid system per engine ===
      if (newHP <= 0) {
        const engine = session.campaign.engine
        const currentConditions = worldState.party?.[character.name]?.conditions || []

        if (engine === 'STORY_MODE' || engine === 'PBTA') {
          // Soft death: inconsciente + rescate automático, nunca muere
          worldStateUpdates.party[character.name].hp = `1/${maxHPNum}`
          worldStateUpdates.party[character.name].conditions = [
            ...currentConditions.filter((c: string) => c !== 'inconsciente'),
            'inconsciente',
          ]
          worldStateUpdates._zeroHpEvent = {
            type: 'rescue',
            character: character.name,
            engine,
          }
        } else {
          // Hard death: death saves (Year Zero / D&D 5e)
          const existingDeathSaves = worldState.party?.[character.name]?.deathSaves
          if (!existingDeathSaves) {
            worldStateUpdates.party[character.name].conditions = [
              ...currentConditions.filter((c: string) => c !== 'inconsciente'),
              'inconsciente',
            ]
            worldStateUpdates.party[character.name].deathSaves = {
              successes: 0,
              failures: 0,
            }
            worldStateUpdates._zeroHpEvent = {
              type: 'death_saves',
              character: character.name,
              engine,
            }
          }
        }
      }
    }

    // === DEATH SAVE PROCESSING — when character has deathSaves and a dice roll comes in ===
    const existingDeathSaves = worldState.party?.[character.name]?.deathSaves
    if (existingDeathSaves && diceRoll) {
      const rollTotal = diceRoll.result
      const rolls = diceRoll.rolls || []
      const isNat20 = rolls.includes(20)
      const isNat1 = rolls.includes(1)

      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }

      let successes = existingDeathSaves.successes
      let failures = existingDeathSaves.failures

      if (isNat20) {
        // Nat 20: instant recovery with 1 HP
        worldStateUpdates.party[character.name].hp = `1/${maxHPNum}`
        worldStateUpdates.party[character.name].conditions = (worldState.party?.[character.name]?.conditions || []).filter((c: string) => c !== 'inconsciente')
        worldStateUpdates.party[character.name].deathSaves = undefined
        worldStateUpdates._zeroHpEvent = { type: 'nat20_recovery', character: character.name, engine: session.campaign.engine }
      } else if (isNat1) {
        // Nat 1: 2 failures
        failures += 2
      } else if (rollTotal >= 10) {
        successes += 1
      } else {
        failures += 1
      }

      // Check resolution (unless nat20 already resolved)
      if (!isNat20) {
        if (successes >= 3) {
          // Stabilized
          worldStateUpdates.party[character.name].hp = `1/${maxHPNum}`
          worldStateUpdates.party[character.name].conditions = (worldState.party?.[character.name]?.conditions || []).filter((c: string) => c !== 'inconsciente')
          worldStateUpdates.party[character.name].deathSaves = undefined
          worldStateUpdates._zeroHpEvent = { type: 'stabilized', character: character.name, engine: session.campaign.engine }
        } else if (failures >= 3) {
          // Death
          worldStateUpdates.party[character.name].conditions = ['muerto']
          worldStateUpdates.party[character.name].deathSaves = undefined
          worldStateUpdates._zeroHpEvent = { type: 'death', character: character.name, engine: session.campaign.engine }
        } else {
          // Still in death saves
          worldStateUpdates.party[character.name].deathSaves = { successes, failures }
        }
      }
    }

    // Update inventory con normalización de items contables
    if (dmResponse.new_item || dmResponse.remove_item) {
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      let currentInventory = [...(worldStateUpdates.party[character.name].inventory || inventory)]

      // Helper: extraer cantidad y nombre base de un item contable
      const parseCountable = (item: string): { count: number; baseName: string } | null => {
        const match = item.match(/^(\d+)\s+(.+)$/)
        if (!match) return null
        return { count: parseInt(match[1]), baseName: match[2].toLowerCase().trim() }
      }

      // Helper: normalizar singular/plural para matching
      const normalize = (name: string): string => {
        return name
          .replace(/raciones/gi, 'ración').replace(/ración/gi, 'ración')
          .replace(/monedas/gi, 'moneda').replace(/flechas/gi, 'flecha')
          .replace(/antorchas/gi, 'antorcha').replace(/pociones/gi, 'poción')
          .replace(/raciones/gi, 'ración')
          .toLowerCase().trim()
      }

      // Helper: fuzzy match — "ración" matchea con "ración de viaje", etc.
      const namesMatch = (a: string, b: string): boolean => {
        const na = normalize(a)
        const nb = normalize(b)
        return na === nb || na.includes(nb) || nb.includes(na)
      }

      // REMOVE: restar cantidad del item contable, o quitar item completo
      if (dmResponse.remove_item) {
        const removeInfo = parseCountable(dmResponse.remove_item)
        if (removeInfo) {
          // Item contable: buscar y restar cantidad (fuzzy match)
          let removed = false
          currentInventory = currentInventory.map(item => {
            const itemInfo = parseCountable(item)
            if (itemInfo && namesMatch(itemInfo.baseName, removeInfo.baseName)) {
              removed = true
              const newCount = itemInfo.count - removeInfo.count
              if (newCount <= 0) return null // Eliminar
              return `${newCount} ${itemInfo.baseName}`
            }
            return item
          }).filter(Boolean) as string[]
          // Si no encontró contable, intentar quitar por nombre fuzzy
          if (!removed) {
            currentInventory = currentInventory.filter(i => {
              const lower = i.toLowerCase()
              const removeLower = dmResponse.remove_item!.toLowerCase()
              return lower !== removeLower && !lower.includes(removeLower) && !removeLower.includes(lower)
            })
          }
        } else {
          // Item no contable: quitar por nombre (fuzzy match)
          currentInventory = currentInventory.filter(i => {
            const lower = i.toLowerCase()
            const removeLower = dmResponse.remove_item!.toLowerCase()
            return lower !== removeLower && !lower.includes(removeLower) && !removeLower.includes(lower)
          })
        }
      }

      // ADD: sumar cantidad al item contable existente, o agregar nuevo
      if (dmResponse.new_item) {
        const addInfo = parseCountable(dmResponse.new_item)
        if (addInfo) {
          // Item contable: buscar existente y sumar (fuzzy match)
          let merged = false
          currentInventory = currentInventory.map(item => {
            const itemInfo = parseCountable(item)
            if (itemInfo && namesMatch(itemInfo.baseName, addInfo.baseName)) {
              merged = true
              return `${itemInfo.count + addInfo.count} ${itemInfo.baseName}`
            }
            return item
          })
          if (!merged) {
            currentInventory.push(dmResponse.new_item)
          }
        } else {
          // Guard anti-duplicación: no agregar si ya existe (fuzzy match)
          const alreadyExists = currentInventory.some(i => {
            const lower = i.toLowerCase()
            const newLower = dmResponse.new_item!.toLowerCase()
            return lower === newLower || lower.includes(newLower) || newLower.includes(lower)
          })
          if (!alreadyExists) {
            currentInventory.push(dmResponse.new_item)
          }
        }
      }

      worldStateUpdates.party[character.name].inventory = currentInventory
    }

    // === ABILITY USAGE + COOLDOWN TICK + LONG REST ===
    // Siempre se ejecuta (incluso si el DM no marcó ability_used) porque el tick de cooldowns
    // debe decrementarse cada turno del personaje acting. Idempotente respecto al worldState.
    let abilityUseApplied = false // alimenta el contador de milestones abilities_used
    {
      const abilitiesNow: AbilityRuntime[] =
        (worldState.party?.[character.name]?.abilities as AbilityRuntime[]) || []

      if (abilitiesNow.length > 0) {
        // 1. Tick cooldowns (solo afecta cooldown_turns)
        let updated = tickCooldowns(abilitiesNow)

        // 2. Si el DM marcó ability_used, intentar aplicar
        //    Fallback: si no marcó pero la acción del jugador o la narración
        //    contiene "[Uso Habilidad: X]" / "[Use Ability: X]" / nombre exacto → aplicar igual.
        let abilityIdToApply: string | null = dmResponse.ability_used?.id || null

        // Fallback regex: detectar marcador manual en la acción del player o en la narración
        const combinedTextForDetection = `${action || ''}\n${dmResponse.narration || ''}`
        const markerMatch = combinedTextForDetection.match(
          /\[(?:Uso\s+Habilidad|Use\s+Ability)\s*:\s*([^\]]+)\]/i
        )
        if (!abilityIdToApply && markerMatch) {
          const typedName = markerMatch[1].trim().toLowerCase()
          const byName = updated.find((ab) => {
            const nameEs = typeof ab.name === 'string' ? ab.name.toLowerCase() : (ab.name as any).es?.toLowerCase()
            const nameEn = typeof ab.name === 'string' ? ab.name.toLowerCase() : (ab.name as any).en?.toLowerCase()
            return nameEs === typedName || nameEn === typedName
          })
          if (byName) {
            abilityIdToApply = byName.id
            console.log(`[Ability] Fallback marker detected: "${markerMatch[1]}" → id=${byName.id}`)
          }
        }

        if (abilityIdToApply) {
          const found = findAbilityById(updated, abilityIdToApply)
          if (found && canUseAbility(found)) {
            // Prevenir doble-aplicación en turnos consecutivos (idempotencia)
            const alreadyUsedThisTurn = found.lastUsedAtTurn === totalTurns + 1
            if (!alreadyUsedThisTurn) {
              updated = updated.map((ab) =>
                ab.id === found.id ? applyAbilityUse(ab, totalTurns + 1) : ab
              )
              abilityUseApplied = true
              console.log(`[Ability] Applied use of ${found.id} (${found.resource})`)
            }
          } else if (found && !canUseAbility(found)) {
            console.warn(`[Ability] DM tried to use exhausted/cooldown ability: ${found.id}`)
          } else {
            console.warn(`[Ability] DM referenced unknown ability id: ${abilityIdToApply}`)
          }
        }

        // 3. Long rest (solo DND_5E): resetear usos diarios de todas las abilities
        const isDnDEngine = session.campaign.engine === 'DND_5E'
        const LONG_REST_KEYWORDS = isEnglish
          ? /\blong rest\b|sleep (?:for\s+)?(?:8|eight|several)\s+hours?|camp for the night|rest (?:until|for) (?:dawn|morning)/i
          : /descanso\s+largo|dorm[íi][s]?\s+(?:8|ocho|varias)\s+horas|acamp[áa]mos\s+(?:la\s+noche|por\s+la\s+noche|para\s+descansar)|descans[áa]mos\s+hasta\s+(?:el\s+)?amanecer/i
        const narrationForRest = dmResponse.narration || ''
        const actionForRest = action || ''
        const longRestDetected =
          dmResponse.long_rest === true ||
          LONG_REST_KEYWORDS.test(narrationForRest) ||
          LONG_REST_KEYWORDS.test(actionForRest)

        if (longRestDetected && isDnDEngine) {
          updated = resetDailyUses(updated)
          dmResponse.long_rest = true
          console.log(`[Ability] Long rest applied — daily uses reset`)
        }

        // Persistir en worldStateUpdates
        if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
        if (!worldStateUpdates.party[character.name]) {
          worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
        }
        worldStateUpdates.party[character.name].abilities = updated
      }
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

    // === XP & LEVEL UP SYSTEM ===
    let levelUpData: { newLevel: number; hpIncrease: number; statOptions: string[]; statBonus: number; needsChoice: boolean } | null = null
    if (dmResponse.xp_reward && dmResponse.xp_reward > 0) {
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }

      const currentXP = worldState.party?.[character.name]?.experience || 0
      const currentLevel = worldState.party?.[character.name]?.level || character.level || 1
      const newXP = currentXP + dmResponse.xp_reward
      worldStateUpdates.party[character.name].experience = newXP

      // Level threshold: level * level * 50 + 50
      const xpForNextLevel = currentLevel * currentLevel * 50 + 50

      if (newXP >= xpForNextLevel) {
        const newLevel = currentLevel + 1
        worldStateUpdates.party[character.name].level = newLevel
        worldStateUpdates.party[character.name].experience = newXP - xpForNextLevel // Carry over excess

        const engine = session.campaign.engine
        const charStats = worldState.party?.[character.name] || {}
        let hpIncrease = 2 // default for narrative engines
        const statOptions: string[] = []
        let statBonus = 1
        let needsChoice = true

        // Apply automatic HP increase (always happens)
        if (engine === 'DND_5E') {
          const conMod = charStats.conMod || 0
          const hitDie = charStats.hitDice ? parseInt(String(charStats.hitDice).split('d')[1]) || 8 : 8
          hpIncrease = Math.floor(hitDie / 2) + 1 + conMod

          // Proficiency bonus at levels 5, 9, 13, 17
          if ([5, 9, 13, 17].includes(newLevel)) {
            const newProf = Math.floor((newLevel - 1) / 4) + 2
            worldStateUpdates.party[character.name].proficiencyBonus = newProf
          }

          // Update hit dice
          worldStateUpdates.party[character.name].hitDice = `${newLevel}d${hitDie}`
          worldStateUpdates.party[character.name].hitDiceRemaining = newLevel

          // ASI at 4, 8, 12, 16, 19 — player chooses ability
          if ([4, 8, 12, 16, 19].includes(newLevel)) {
            const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
            for (const ab of abilities) {
              if ((charStats[ab] || 10) < 20) statOptions.push(ab)
            }
            statBonus = 2
          } else {
            needsChoice = false // non-ASI levels just get HP
          }
        } else {
          // Story Mode / PbtA / Year Zero — choose from 4 narrative stats
          statOptions.push('combat', 'exploration', 'social', 'lore')
          statBonus = 1
        }

        // Apply HP increase immediately (no choice needed for HP)
        const maxHPCurrent = parseInt(String(charStats.hp || '20/20').split('/')[1]) || 20
        const currentHP = parseInt(String(charStats.hp || '20/20').split('/')[0]) || 20
        worldStateUpdates.party[character.name].hp = `${currentHP + hpIncrease}/${maxHPCurrent + hpIncrease}`

        // Save pending level-up for player choice (if needed)
        if (needsChoice && statOptions.length > 0) {
          worldStateUpdates.pendingLevelUp = {
            characterName: character.name,
            newLevel,
            hpIncrease,
            statOptions,
            statBonus,
            engine,
          }
        }

        // Update the Character record level
        await prisma.character.update({
          where: { id: character.id },
          data: { level: newLevel },
        })

        levelUpData = { newLevel, hpIncrease, statOptions, statBonus, needsChoice }
      }
    }

    // === MILESTONES & SKILL TREE UNLOCKS ===
    // Acumula contadores de logros del personaje (fuente del árbol de habilidades).
    // Espejo de sesión en worldState.party[char].milestones; Character.milestones
    // (Prisma, source of truth) se flushea en la transacción de persistencia.
    // Los guests también acumulan (si se registran conservan el progreso), pero
    // los skill_unlocks solo se emiten para usuarios registrados.
    let skillUnlocks: Array<{ nodeId: string; name: unknown; tier: number }> | null = null
    let milestonesAfter: MilestoneState | null = null
    try {
      const milestonesBefore = normalizeMilestones(
        worldState.party?.[character.name]?.milestones ?? (character as any).milestones
      )
      let after = recordMilestoneEvent(milestonesBefore, { type: 'turn_played' })

      if (dmResponse.quest_completed) {
        after = recordMilestoneEvent(after, { type: 'quest_completed' })
      }
      if (abilityUseApplied) {
        after = recordMilestoneEvent(after, { type: 'ability_used' })
      }

      // Combate ganado: estábamos bajo lock de combate y este turno lo libera
      // con el personaje vivo (detección determinística vía navigation lock).
      const wasInCombat =
        worldState.map_state?.navigationLocked === true &&
        worldState.map_state?.lockReason === 'combat'
      const characterDied = worldStateUpdates._zeroHpEvent?.type === 'death'
      if (wasInCombat && dmResponse.navigation_locked === false && !characterDied) {
        after = recordMilestoneEvent(after, { type: 'combat_won' })
      }

      // Sobrevivir a la muerte (death saves estabilizados, nat 20, o rescate narrativo)
      const zeroType = worldStateUpdates._zeroHpEvent?.type
      if (zeroType === 'nat20_recovery' || zeroType === 'stabilized' || zeroType === 'rescue') {
        after = recordMilestoneEvent(after, { type: 'death_survived' })
      }

      // Vínculo con NPC: transición a status de aliado/amigo (no re-cuenta)
      if (dmResponse.npc_update) {
        const npcList = Array.isArray(dmResponse.npc_update)
          ? dmResponse.npc_update
          : [dmResponse.npc_update]
        const BOND_RE = /\b(ally|allied|aliado|aliada|friend|amigo|amiga)\b/i
        for (const u of npcList) {
          if (!u?.name || !u?.status) continue
          // npc_states puede guardar el status como objeto {status,...} o como
          // string plano (formato legacy). Sin manejar ambos, un NPC legacy
          // ya-aliado re-cuenta npc_bond cada turno (contador inflado).
          const prevRaw = worldState.npc_states?.[u.name]
          const prevStatus = typeof prevRaw === 'string' ? prevRaw : (prevRaw?.status || '')
          if (BOND_RE.test(u.status) && !BOND_RE.test(prevStatus)) {
            after = recordMilestoneEvent(after, { type: 'npc_bond' })
          }
        }
      }

      // Acto y anchors narrativos (monotónicos — idempotente re-registrarlos)
      const actNow = Number(worldStateUpdates.act ?? worldState.act) || 1
      after = recordMilestoneEvent(after, { type: 'act_reached', act: actNow })
      for (const anchor of worldState.narrative_anchors_hit || []) {
        if (typeof anchor === 'string') {
          after = recordMilestoneEvent(after, { type: 'narrative_anchor', anchor })
        }
      }

      // Espejo en worldState para lectura barata durante la sesión
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      worldStateUpdates.party[character.name].milestones = after
      milestonesAfter = after

      // Nodos del árbol que se volvieron desbloqueables ESTE turno → toast.
      // Solo registrados: los guests ven el teaser, no reciben unlocks.
      if (clerkUserId) {
        const tree = getSkillTree(session.campaign.lore, character.archetype)
        if (tree) {
          const learnedIds: string[] = Array.isArray((character as any).unlockedSkills)
            ? ((character as any).unlockedSkills as string[])
            : []
          // Nivel PRE level-up (para detectar nodos level_reached que se
          // desbloquean justo en el turno del level-up) vs POST.
          const levelBefore =
            worldState.party?.[character.name]?.level || character.level || 1
          const levelNow =
            worldStateUpdates.party[character.name].level || levelBefore
          const nuevos = detectNewUnlockables(tree, milestonesBefore, after, learnedIds, levelNow, levelBefore)
          if (nuevos.length > 0) {
            skillUnlocks = nuevos.map((n) => ({ nodeId: n.id, name: n.name, tier: n.tier }))
            console.log(`[Skills] Unlockable nodes this turn: ${nuevos.map((n) => n.id).join(', ')}`)
          }
        }
      }
    } catch (err) {
      // Los milestones nunca bloquean el turno del jugador
      console.error('[Skills] milestone tracking failed:', err)
    }

    // Update time of day and weather if DM changed them
    if (dmResponse.time_update) {
      worldStateUpdates.time_in_world = dmResponse.time_update
    }
    if (dmResponse.weather_update) {
      worldStateUpdates.weather = dmResponse.weather_update
    }

    // Update scene + track sub-location
    if (dmResponse.scene_change) {
      worldStateUpdates.current_scene = dmResponse.scene_change

      // Detectar si el scene_change es una sub-locación de la ciudad actual
      const currentLoreLoc = LORE_JSON_DATA[session.campaign.lore]?.locations?.find((l: any) =>
        worldState.current_scene?.toLowerCase().includes(l.name?.toLowerCase()) ||
        l.name?.toLowerCase().includes(worldState.current_scene?.toLowerCase()?.split(',')[0]?.trim())
      )
      const sceneLower = dmResponse.scene_change!.toLowerCase()
      const matchedSubLoc = currentLoreLoc?.sub_locations?.find((sl: any) => {
        // sl.name puede ser string o LocalizedString {es,en} según el lore JSON.
        const slName =
          typeof sl.name === 'string'
            ? sl.name
            : sl.name?.es || sl.name?.en || ''
        if (!slName) return false
        const slLower = slName.toLowerCase()
        return sceneLower.includes(slLower) || slLower.includes(sceneLower)
      })
      if (matchedSubLoc) {
        worldStateUpdates.current_sub_location = matchedSubLoc.id
      } else {
        // scene_change que no matchea sub-locación → limpiar para no dejar stale
        worldStateUpdates.current_sub_location = null
      }
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

    // Update NPC state with location tracking — supports single object or array
    if (dmResponse.npc_update) {
      const npcUpdates = Array.isArray(dmResponse.npc_update)
        ? dmResponse.npc_update
        : [dmResponse.npc_update]
      for (const update of npcUpdates) {
        if (update && update.name) {
          const currentNPCStates = worldStateUpdates.npc_states || worldState.npc_states || {}
          if (!worldStateUpdates.npc_states) worldStateUpdates.npc_states = { ...currentNPCStates }
          worldStateUpdates.npc_states[update.name] = {
            status: update.status,
            location: update.location || worldState.current_scene || '',
            introduced: true,
          }
          console.log(`[NPC] Updated: ${update.name} → ${update.status} @ ${update.location || worldState.current_scene}`)
        }
      }
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

    // Persistir suggested_actions y scene image info en worldState para sobrevivir recargas
    if (dmResponse.suggested_actions && dmResponse.suggested_actions.length > 0) {
      worldStateUpdates.last_suggested_actions = dmResponse.suggested_actions
    }

    // Update campaign world state if there are updates
    let campaignUpdateData: { worldState: any } | null = null
    if (Object.keys(worldStateUpdates).length > 0) {
      const newWorldState = {
        ...worldState,
        ...worldStateUpdates,
        // Deep merge per character to avoid losing HP/conditions when only inventory changes
        party: Object.keys(worldStateUpdates.party || {}).reduce((merged: any, charName: string) => {
          merged[charName] = { ...(merged[charName] || {}), ...worldStateUpdates.party[charName] }
          return merged
        }, { ...(worldState.party || {}) }),
        map_state: worldStateUpdates.map_state
          ? {
              ...(worldState.map_state || {}),
              ...worldStateUpdates.map_state,
            }
          : worldState.map_state,
      }

      // Strip transient fields before persisting
      delete newWorldState._zeroHpEvent

      campaignUpdateData = { worldState: newWorldState }
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

    // 4. Persistir USER turn + DM turn + worldState update en una SOLA transacción.
    // Esto evita orphan USER turns: si Claude respondió OK pero la DB falla,
    // ni el USER turn ni el DM turn quedan huérfanos — ambos fallan juntos.
    // Si Claude falló (exception más arriba), nunca se llega acá.
    const dmTurnPatch = Object.keys(worldStateUpdates).length > 0 ? {
      ...worldStateUpdates,
      _lastNewItem: originalNewItem || null,
      _lastRemoveItem: originalRemoveItem || null,
    } : (originalNewItem || originalRemoveItem) ? {
      _lastNewItem: originalNewItem || null,
      _lastRemoveItem: originalRemoveItem || null,
    } : undefined

    await withRetry(() => prisma.$transaction([
      prisma.turn.create({ data: playerTurnData }),
      prisma.turn.create({
        data: {
          sessionId: session.id,
          role: 'DM',
          content: fullNarration,
          worldStatePatch: dmTurnPatch,
        },
      }),
      ...(campaignUpdateData
        ? [prisma.campaign.update({ where: { id: session.campaignId }, data: campaignUpdateData })]
        : []),
      // Flush de milestones del personaje (source of truth para el skill tree)
      ...(milestonesAfter
        ? [prisma.character.update({
            where: { id: character.id },
            data: { milestones: milestonesAfter as any },
          })]
        : []),
    ]))

    // 4.4 Actualizar progreso meta del usuario (streak, XP, achievements).
    // Solo para usuarios logueados con Clerk — los guests no trackean progreso meta.
    // Fire-and-forget: si falla, loggeamos pero no bloqueamos la respuesta al jugador.
    let progressUpdate: ProgressUpdate | null = null
    if (clerkUserId && authUserId) {
      try {
        progressUpdate = await updateUserProgress({
          userId: authUserId,
          event: 'turn',
          characterXpReward: dmResponse.xp_reward,
        })
      } catch (err) {
        console.error('[turn] updateUserProgress failed:', err)
      }
    }

    // 4.5 Trigger fire-and-forget del session summarizer cuando corresponde.
    // Política: cada vez que la cantidad total de turnos cruza un múltiplo de 10
    // (>= 20), comprimimos el chunk de 10 turnos que acaba de salir de la ventana
    // activa con Claude Haiku. El resultado se persiste en SummaryCheckpoint y se
    // consume en el prompt builder reemplazando el storySoFar heurístico.
    //
    // Usamos un count real de la DB (no allTurns.length) porque allTurns está
    // limitado por el take:40 del query principal — en sesiones >40 turnos el
    // cálculo basado en allTurns sería incorrecto.
    try {
      const totalAfterThisTurn = await prisma.turn.count({ where: { sessionId: session.id } })

      if (totalAfterThisTurn >= 20 && totalAfterThisTurn % 10 === 0) {
        // El chunk que queremos comprimir es [end-19, end-10] (los 10 turnos que
        // están justo afuera de la ventana activa de últimos 10).
        const chunkEndIndex = totalAfterThisTurn - 10 // 1-indexed turn number
        const chunkStartIndex = chunkEndIndex - 9
        const existingCheckpoints: any[] = (session as any).summaryCheckpoints || []
        const alreadyDone = existingCheckpoints.some(
          (c) => c.turnIndex === chunkEndIndex && c.turnCount === 10
        )

        if (!alreadyDone) {
          // Traer los 10 turnos del chunk de la DB — no dependemos de allTurns,
          // así sirve también para sesiones >40 turnos.
          const chunkTurnsDb = await prisma.turn.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'asc' },
            skip: chunkStartIndex - 1,
            take: 10,
            select: { role: true, content: true },
          })

          if (chunkTurnsDb.length === 10) {
            // Fire-and-forget — no await, no bloquea la respuesta
            generateSummaryCheckpoint(
              session.id,
              chunkTurnsDb.map(t => ({ role: t.role as string, content: t.content })),
              chunkStartIndex,
              worldState,
              session.campaign.lore,
              locale as 'es' | 'en'
            ).catch((err) => {
              console.error('[turn] background summarizer failed:', err)
            })
          }
        }
      }
    } catch (err) {
      // Nunca bloquear al jugador por un error del summarizer
      console.error('[turn] summarizer trigger error:', err)
    }

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
      // Item/quest notifications for frontend popups
      newItem: originalNewItem || null,
      removeItem: originalRemoveItem || null,
      newQuest: dmResponse.new_quest || dmResponse.quest_create?.title || null,
      questCompleted: dmResponse.quest_completed || null,
      // 0 HP event for frontend
      zeroHpEvent: worldStateUpdates._zeroHpEvent || null,
      // XP & Level up (del personaje)
      xpReward: dmResponse.xp_reward || 0,
      levelUp: levelUpData,
      // Abilities — notificar uso/descanso al frontend
      abilityUsed: dmResponse.ability_used?.id || null,
      longRest: dmResponse.long_rest === true,
      // Progreso meta del usuario (Duolingo-style) — null para guests
      progressUpdate,
      // Nodos del skill tree que se volvieron desbloqueables este turno (toast) — null para guests
      skillUnlocks,
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
