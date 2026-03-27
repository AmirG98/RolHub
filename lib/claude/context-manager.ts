// Context Manager — Sistema de contexto en 3 capas para el DM
// Reemplaza la condensación destructiva con contexto narrativo rico

interface Turn {
  id: string
  role: string
  content: string
  createdAt: Date
}

interface SummaryCheckpoint {
  id: string
  turnIndex: number
  turnCount: number
  summary: string
  keyFacts: any
}

interface ContextInput {
  turns: Turn[]
  checkpoints: SummaryCheckpoint[]
  worldState: any
  playerAction: string
  locale: 'es' | 'en'
  antiRepeatDirective?: string
}

interface ContextPayload {
  // Mensajes para el array `messages` de la API de Claude
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  // Para inyectar en el system prompt (sección de narrative pacing)
  storySoFar: string
  middleContext: string
  // Señales para el caller
  shouldTriggerSummary: boolean
  turnsSinceLastCheckpoint: number
  lastCheckpointTurnIndex: number
  // Datos de anti-estancamiento (detección ligera)
  stagnationData: StagnationData
}

interface StagnationData {
  totalTurns: number
  isStagnant: boolean
  needsWorldEvent: boolean
  turnsInCurrentLocation: number
  ignoredQuests: string[]
  passiveCount: number
  isRepeatedObservation: boolean
  isNPCLoop: boolean
  loopingNPCName: string
}

const RECENT_WINDOW_SIZE = 8
const SUMMARY_TRIGGER_INTERVAL = 8
const MAX_MIDDLE_TURNS = 10
const NPC_LOOP_SOFT_THRESHOLD = 6
const NPC_LOOP_HARD_THRESHOLD = 8

export function buildContextPayload(input: ContextInput): ContextPayload {
  const { turns, checkpoints, worldState, playerAction, locale } = input

  // --- Capa 1: Session Summaries (checkpoints de Haiku) ---
  const storySoFar = buildStorySoFar(checkpoints, turns, locale)

  // --- Determinar límites de las capas ---
  const lastCheckpointTurnIndex = checkpoints.length > 0
    ? checkpoints[checkpoints.length - 1].turnIndex
    : 0

  // Turnos después del último checkpoint
  const turnsAfterCheckpoint = turns.filter((_, i) => i >= lastCheckpointTurnIndex)
  const recentWindow = turnsAfterCheckpoint.slice(-RECENT_WINDOW_SIZE)
  const middleTurns = turnsAfterCheckpoint.slice(0, -RECENT_WINDOW_SIZE)

  // --- Capa 2: Middle zone (condensación ligera) ---
  const middleContext = buildMiddleContext(middleTurns, locale)

  // --- Capa 3: Recent window (turnos completos SIN MODIFICAR) ---
  const conversationHistory = buildRecentWindow(recentWindow)

  // Agregar acción del jugador como último mensaje
  // Si el último mensaje ya es 'user', mergear para evitar mensajes consecutivos del mismo rol
  if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
    conversationHistory[conversationHistory.length - 1].content += '\n\n' + playerAction
  } else {
    conversationHistory.push({
      role: 'user',
      content: playerAction,
    })
  }

  // --- Señal de summarización ---
  const turnsSinceLastCheckpoint = turns.length - lastCheckpointTurnIndex
  const shouldTriggerSummary = turnsSinceLastCheckpoint >= SUMMARY_TRIGGER_INTERVAL

  // --- Detección de estancamiento (versión relajada) ---
  const stagnationData = detectStagnation(turns, worldState, locale)

  return {
    conversationHistory,
    storySoFar,
    middleContext,
    shouldTriggerSummary,
    turnsSinceLastCheckpoint,
    lastCheckpointTurnIndex,
    stagnationData,
  }
}

// --- Capa 1: Construir "Historia hasta ahora" ---
function buildStorySoFar(
  checkpoints: SummaryCheckpoint[],
  turns: Turn[],
  locale: 'es' | 'en'
): string {
  // Si hay checkpoints reales, usarlos
  if (checkpoints.length > 0) {
    return checkpoints.map(cp => cp.summary).join('\n\n')
  }

  // Fallback: extracción mejorada para sesiones sin checkpoints
  // Toma turnos fuera de la middle zone y la ventana reciente
  const olderDMTurns = turns
    .slice(0, -(RECENT_WINDOW_SIZE + MAX_MIDDLE_TURNS))
    .filter(t => t.role === 'DM' && t.content.length > 30)

  if (olderDMTurns.length === 0) return ''

  // Tomar hasta 15 puntos distribuidos uniformemente, con oraciones más largas
  const maxPoints = 15
  const step = Math.max(1, Math.floor(olderDMTurns.length / maxPoints))
  const points: string[] = []

  for (let i = 0; i < olderDMTurns.length; i += step) {
    // Tomar las primeras 2 oraciones completas con más espacio (300 chars)
    const sentences = olderDMTurns[i].content
      .split(/(?<=[.!?»"])\s+/)
      .filter(s => s.trim().length > 15)
    const summary = sentences.slice(0, 2).join(' ').substring(0, 300)
    if (summary.length > 20) {
      points.push(summary)
    }
    if (points.length >= maxPoints) break
  }

  return points.join('. ')
}

// --- Capa 2: Middle zone con condensación ligera ---
// Limitada a MAX_MIDDLE_TURNS más recientes para controlar el tamaño del contexto
function buildMiddleContext(middleTurns: Turn[], locale: 'es' | 'en'): string {
  if (middleTurns.length === 0) return ''

  // Solo tomar los más recientes (justo antes de la ventana reciente)
  const turnsToProcess = middleTurns.slice(-MAX_MIDDLE_TURNS)

  const isES = locale === 'es'
  const condensed: string[] = []

  for (const turn of turnsToProcess) {
    if (turn.role === 'USER') {
      const prefix = isES ? 'Jugador' : 'Player'
      condensed.push(`${prefix}: ${turn.content}`)
    } else if (turn.role === 'DM') {
      // DM turns: primeras 3 oraciones completas
      const sentences = turn.content
        .split(/(?<=[.!?»"])\s+/)
        .filter(s => s.trim().length > 10)
      const summary = sentences.slice(0, 3).join(' ').substring(0, 300)
      condensed.push(`DM: ${summary}`)
    }
  }

  return condensed.join('\n')
}

// --- Capa 3: Ventana reciente con turnos completos ---
function buildRecentWindow(
  recentTurns: Turn[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // Solo incluir turnos USER y DM (ignorar SYSTEM)
  const filtered = recentTurns.filter(t => t.role === 'USER' || t.role === 'DM')

  const messages = filtered.map(turn => ({
    role: turn.role === 'USER' ? 'user' as const : 'assistant' as const,
    content: turn.content,
  }))

  // Claude API requiere que el primer mensaje sea 'user'
  while (messages.length > 0 && messages[0].role === 'assistant') {
    messages.shift()
  }

  // Claude API no permite mensajes consecutivos del mismo rol
  // Mergear mensajes consecutivos del mismo rol
  const merged: Array<{ role: 'user' | 'assistant'; content: string }> = []
  for (const msg of messages) {
    if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
      merged[merged.length - 1].content += '\n\n' + msg.content
    } else {
      merged.push({ ...msg })
    }
  }

  return merged
}

// --- Detección de estancamiento (versión relajada) ---
function detectStagnation(
  allTurns: Turn[],
  worldState: any,
  locale: 'es' | 'en'
): StagnationData {
  const totalTurns = allTurns.length
  const recentUserActions = allTurns
    .slice(-8)
    .filter(t => t.role === 'USER')
    .map(t => t.content.toLowerCase().trim())

  // Acciones pasivas
  const passiveWords = [
    'espero', 'esperar', 'descanso', 'descansar', 'miro', 'observo',
    'no hago nada', 'me quedo', 'wait', 'rest', 'look around', 'do nothing', 'stay',
  ]
  const passiveCount = recentUserActions.filter(a =>
    passiveWords.some(w => a.includes(w))
  ).length

  // Repetición de acciones
  const wordSimilarity = (a: string, b: string): number => {
    const wordsA = new Set(a.split(/\s+/))
    const wordsB = new Set(b.split(/\s+/))
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length
    return intersection / Math.max(wordsA.size, wordsB.size, 1)
  }
  const hasRepetition = recentUserActions.length >= 2 &&
    recentUserActions.some((a, i) =>
      i > 0 && (a === recentUserActions[i - 1] || wordSimilarity(a, recentUserActions[i - 1]) > 0.6)
    )

  // Turnos en ubicación actual
  const currentScene = worldState.current_scene || ''
  const turnsInCurrentLocation = allTurns.slice(-12).filter(t => t.role === 'DM').length

  // Quests ignoradas
  const activeQuests = worldState.active_quests || []
  const recentDMText = allTurns
    .slice(-6)
    .filter(t => t.role === 'DM')
    .map(t => t.content.toLowerCase())
    .join(' ')
  const ignoredQuests = activeQuests.filter((q: string) =>
    !recentDMText.includes(q.toLowerCase().substring(0, 10))
  )

  const isStagnant = hasRepetition || passiveCount >= 2 || (totalTurns > 12 && worldState.act === 1)
  const needsWorldEvent = passiveCount >= 3 || turnsInCurrentLocation >= 6 || ignoredQuests.length >= 2

  // Observación repetida
  const obsWords = ['observ', 'mir', 'examin', 'fij', 'watch', 'look', 'study']
  const recentUserContent = allTurns.slice(-6).filter(t => t.role === 'USER').map(t => (t.content || '').toLowerCase())
  const isRepeatedObservation = recentUserContent.filter(a =>
    obsWords.some(w => a.includes(w))
  ).length >= 2

  // NPC Loop — threshold relajado (6 en vez de 3)
  let isNPCLoop = false
  let loopingNPCName = ''
  const recentDMContent = allTurns.slice(-8).filter(t => t.role === 'DM').map(t => t.content || '')

  if (recentDMContent.length >= NPC_LOOP_SOFT_THRESHOLD) {
    const npcMentions = recentDMContent.map(c => {
      const match = c.match(/([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)\s*[:«]/)?.[1]
      return match || ''
    }).filter(Boolean)

    if (npcMentions.length >= NPC_LOOP_SOFT_THRESHOLD) {
      const lastNPC = npcMentions[npcMentions.length - 1]
      const sameNPCCount = npcMentions.filter(n => n === lastNPC).length

      // Solo activar si el jugador NO está haciendo preguntas activamente
      const isPlayerAsking = recentUserContent.some(a =>
        a.includes('?') || a.includes('pregunt') || a.includes('ask') || a.includes('qué') || a.includes('what')
      )

      if (sameNPCCount >= NPC_LOOP_SOFT_THRESHOLD && !isPlayerAsking) {
        isNPCLoop = true
        loopingNPCName = lastNPC
      }
    }
  }

  return {
    totalTurns,
    isStagnant,
    needsWorldEvent,
    turnsInCurrentLocation,
    ignoredQuests,
    passiveCount,
    isRepeatedObservation,
    isNPCLoop,
    loopingNPCName,
  }
}
