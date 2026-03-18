// Quest Manager - Gestiona quests activas y su relación con locaciones
// Funciones para crear, actualizar, completar quests y generar marcadores de mapa

import type { Lore } from '@/lib/engines/types'
import type { MapLocation } from '@/lib/maps/map-config'
import {
  type Quest,
  type QuestObjective,
  type QuestMarker,
  type QuestUpdate,
  type LocationKnowledgeLevel,
  generateQuestId,
  generateObjectiveId,
  isQuestCompletableAt,
} from '@/lib/types/quest'

// Estado de quests en una campaña
export interface QuestState {
  quests: Quest[]
  locationKnowledge: Record<string, LocationKnowledgeLevel>
  revealedSecrets: Record<string, string[]>  // locationId -> secretIds[]
}

// Estado inicial vacío
export function createInitialQuestState(): QuestState {
  return {
    quests: [],
    locationKnowledge: {},
    revealedSecrets: {},
  }
}

// ============================================================================
// CRUD de Quests
// ============================================================================

// Crear quest desde plot_hook de una locación
export function createQuestFromPlotHook(
  state: QuestState,
  locationId: string,
  plotHook: string,
  lore: Lore,
  options?: {
    title?: string
    targetLocationId?: string
    priority?: 'main' | 'side'
  }
): { state: QuestState; quest: Quest } {
  const quest: Quest = {
    id: generateQuestId(),
    title: options?.title || extractTitleFromHook(plotHook),
    description: plotHook,
    status: 'active',
    targetLocationId: options?.targetLocationId,
    relatedLocationIds: options?.targetLocationId
      ? [locationId, options.targetLocationId]
      : [locationId],
    objectives: [{
      id: generateObjectiveId(),
      description: plotHook,
      completed: false,
      locationId: options?.targetLocationId,
    }],
    sourceType: 'plot_hook',
    sourceLocationId: locationId,
    lore,
    priority: options?.priority || 'side',
    createdAt: Date.now(),
  }

  return {
    state: {
      ...state,
      quests: [...state.quests, quest],
    },
    quest,
  }
}

// Crear quest desde respuesta del DM
export function createQuestFromDM(
  state: QuestState,
  questData: Omit<Quest, 'id' | 'createdAt'>
): { state: QuestState; quest: Quest } {
  const quest: Quest = {
    ...questData,
    id: generateQuestId(),
    createdAt: Date.now(),
    objectives: questData.objectives.map(obj => ({
      ...obj,
      id: obj.id || generateObjectiveId(),
    })),
  }

  return {
    state: {
      ...state,
      quests: [...state.quests, quest],
    },
    quest,
  }
}

// Completar una quest
export function completeQuest(
  state: QuestState,
  questId: string
): QuestState {
  return {
    ...state,
    quests: state.quests.map(q =>
      q.id === questId
        ? { ...q, status: 'completed' as const, objectives: q.objectives.map(o => ({ ...o, completed: true })) }
        : q
    ),
  }
}

// Fallar una quest
export function failQuest(
  state: QuestState,
  questId: string
): QuestState {
  return {
    ...state,
    quests: state.quests.map(q =>
      q.id === questId ? { ...q, status: 'failed' as const } : q
    ),
  }
}

// Actualizar un objetivo de quest
export function updateQuestObjective(
  state: QuestState,
  questId: string,
  objectiveId: string,
  completed: boolean
): QuestState {
  return {
    ...state,
    quests: state.quests.map(q => {
      if (q.id !== questId) return q

      const updatedObjectives = q.objectives.map(obj =>
        obj.id === objectiveId ? { ...obj, completed } : obj
      )

      // Auto-completar quest si todos los objetivos están completados
      const allCompleted = updatedObjectives.every(obj => obj.completed)

      return {
        ...q,
        objectives: updatedObjectives,
        status: allCompleted ? 'completed' as const : q.status,
      }
    }),
  }
}

// Agregar objetivo a una quest
export function addQuestObjective(
  state: QuestState,
  questId: string,
  objective: Omit<QuestObjective, 'id'>
): QuestState {
  return {
    ...state,
    quests: state.quests.map(q =>
      q.id === questId
        ? {
            ...q,
            objectives: [...q.objectives, { ...objective, id: generateObjectiveId() }],
          }
        : q
    ),
  }
}

// ============================================================================
// Queries de Quests
// ============================================================================

// Obtener quests activas
export function getActiveQuests(state: QuestState): Quest[] {
  return state.quests.filter(q => q.status === 'active')
}

// Obtener quests completadas
export function getCompletedQuests(state: QuestState): Quest[] {
  return state.quests.filter(q => q.status === 'completed')
}

// Obtener quests relacionadas con una locación
export function getQuestsForLocation(state: QuestState, locationId: string): Quest[] {
  return state.quests.filter(q =>
    q.status === 'active' && (
      q.targetLocationId === locationId ||
      q.sourceLocationId === locationId ||
      q.relatedLocationIds?.includes(locationId) ||
      q.objectives.some(obj => obj.locationId === locationId)
    )
  )
}

// Obtener quest principal activa (si existe)
export function getMainQuest(state: QuestState): Quest | undefined {
  return state.quests.find(q => q.status === 'active' && q.priority === 'main')
}

// ============================================================================
// Marcadores de Quest para Mapa
// ============================================================================

// Generar marcadores de quest para todas las locaciones
export function getQuestMarkers(
  state: QuestState,
  locations: MapLocation[],
  currentLocationId?: string
): QuestMarker[] {
  const markers: QuestMarker[] = []
  const activeQuests = getActiveQuests(state)

  for (const location of locations) {
    const locationQuests = activeQuests.filter(q =>
      q.targetLocationId === location.id ||
      q.objectives.some(obj => !obj.completed && obj.locationId === location.id)
    )

    if (locationQuests.length === 0) continue

    // Determinar tipo de marcador (priorizar main > completable > side)
    const mainQuest = locationQuests.find(q => q.priority === 'main')
    const completableQuest = locationQuests.find(q => isQuestCompletableAt(q, location.id))

    let markerType: QuestMarker['type'] = 'side'
    let primaryQuest = locationQuests[0]

    if (mainQuest) {
      markerType = 'main'
      primaryQuest = mainQuest
    } else if (completableQuest) {
      markerType = 'completable'
      primaryQuest = completableQuest
    }

    // Si es el siguiente paso del main quest, marcar como "next"
    const mainActiveQuest = getMainQuest(state)
    if (mainActiveQuest) {
      const nextObjective = mainActiveQuest.objectives.find(obj => !obj.completed)
      if (nextObjective?.locationId === location.id) {
        markerType = 'next'
        primaryQuest = mainActiveQuest
      }
    }

    markers.push({
      type: markerType,
      questId: primaryQuest.id,
      questTitle: primaryQuest.title,
      locationId: location.id,
      pulse: markerType === 'main' || markerType === 'next',
    })
  }

  return markers
}

// Obtener marcador de quest para una locación específica
export function getQuestMarkerForLocation(
  state: QuestState,
  locationId: string
): QuestMarker | null {
  const markers = getQuestMarkers(state, [{ id: locationId } as MapLocation])
  return markers[0] || null
}

// ============================================================================
// Knowledge Level Management
// ============================================================================

// Obtener nivel de conocimiento de una locación
export function getKnowledgeLevel(
  state: QuestState,
  locationId: string
): LocationKnowledgeLevel {
  return state.locationKnowledge[locationId] || 'unknown'
}

// Actualizar nivel de conocimiento
export function upgradeKnowledge(
  state: QuestState,
  locationId: string,
  newLevel: LocationKnowledgeLevel
): QuestState {
  const currentLevel = getKnowledgeLevel(state, locationId)
  const levels: LocationKnowledgeLevel[] = ['unknown', 'rumored', 'discovered', 'visited', 'explored', 'mastered']

  // Solo actualizar si el nuevo nivel es mayor
  if (levels.indexOf(newLevel) <= levels.indexOf(currentLevel)) {
    return state
  }

  return {
    ...state,
    locationKnowledge: {
      ...state.locationKnowledge,
      [locationId]: newLevel,
    },
  }
}

// Inicializar conocimiento para locación inicial y adyacentes
export function initializeKnowledge(
  state: QuestState,
  startLocationId: string,
  connectedLocationIds: string[]
): QuestState {
  const knowledge: Record<string, LocationKnowledgeLevel> = {
    ...state.locationKnowledge,
    [startLocationId]: 'visited',
  }

  for (const id of connectedLocationIds) {
    if (!knowledge[id]) {
      knowledge[id] = 'discovered'
    }
  }

  return {
    ...state,
    locationKnowledge: knowledge,
  }
}

// ============================================================================
// Secrets Management
// ============================================================================

// Revelar un secreto de locación
export function revealSecret(
  state: QuestState,
  locationId: string,
  secretId: string
): QuestState {
  const currentSecrets = state.revealedSecrets[locationId] || []

  if (currentSecrets.includes(secretId)) {
    return state
  }

  return {
    ...state,
    revealedSecrets: {
      ...state.revealedSecrets,
      [locationId]: [...currentSecrets, secretId],
    },
  }
}

// Verificar si un secreto está revelado
export function isSecretRevealed(
  state: QuestState,
  locationId: string,
  secretId: string
): boolean {
  return state.revealedSecrets[locationId]?.includes(secretId) || false
}

// Obtener secretos revelados de una locación
export function getRevealedSecrets(
  state: QuestState,
  locationId: string
): string[] {
  return state.revealedSecrets[locationId] || []
}

// ============================================================================
// Procesar Updates del DM
// ============================================================================

// Aplicar update de quest desde respuesta del DM
export function applyQuestUpdate(
  state: QuestState,
  update: QuestUpdate,
  lore: Lore
): QuestState {
  switch (update.action) {
    case 'create':
      if (update.newQuest) {
        const { state: newState } = createQuestFromDM(state, update.newQuest)
        return newState
      }
      return state

    case 'complete':
      if (update.questId) {
        return completeQuest(state, update.questId)
      }
      return state

    case 'fail':
      if (update.questId) {
        return failQuest(state, update.questId)
      }
      return state

    case 'update_objective':
      if (update.questId && update.objectiveId && update.objectiveCompleted !== undefined) {
        return updateQuestObjective(state, update.questId, update.objectiveId, update.objectiveCompleted)
      }
      return state

    case 'add_objective':
      if (update.questId && update.newObjective) {
        return addQuestObjective(state, update.questId, update.newObjective)
      }
      return state

    default:
      return state
  }
}

// ============================================================================
// Helpers Internos
// ============================================================================

function extractTitleFromHook(hook: string): string {
  const words = hook.split(' ').slice(0, 5)
  let title = words.join(' ')
  if (title.length > 40) {
    title = title.substring(0, 37) + '...'
  }
  return title
}

// ============================================================================
// Serialización para WorldState
// ============================================================================

// Convertir QuestState a formato JSON para guardar en DB
export function serializeQuestState(state: QuestState): string {
  return JSON.stringify(state)
}

// Parsear QuestState desde JSON de DB
export function parseQuestState(json: string | null | undefined): QuestState {
  if (!json) return createInitialQuestState()

  try {
    const parsed = JSON.parse(json)
    return {
      quests: parsed.quests || [],
      locationKnowledge: parsed.locationKnowledge || {},
      revealedSecrets: parsed.revealedSecrets || {},
    }
  } catch {
    return createInitialQuestState()
  }
}
