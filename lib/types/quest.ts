// Sistema de Quests vinculadas a locaciones
// Permite al DM crear quests desde plot_hooks y trackear progreso del jugador

import type { Lore } from '@/lib/engines/types'

// Nivel de conocimiento que el jugador tiene sobre una locación
export type LocationKnowledgeLevel =
  | 'unknown'      // No aparece en mapa
  | 'rumored'      // Nombre + "?" en mapa (escuchó hablar)
  | 'discovered'   // Nombre + tipo + peligro
  | 'visited'      // + descripción + servicios
  | 'explored'     // + NPCs + plot_hooks visibles
  | 'mastered'     // + secretos revelados

// Objetivo individual dentro de una quest
export interface QuestObjective {
  id: string
  description: string
  completed: boolean
  locationId?: string  // Dónde cumplir este objetivo
}

// Quest completa con vinculación a locaciones
export interface Quest {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'failed'

  // Vinculación a locaciones
  targetLocationId?: string      // Dónde completar la quest
  relatedLocationIds?: string[]  // Locaciones relacionadas

  // Progresión
  objectives: QuestObjective[]
  rewards?: string[]

  // Origen de la quest
  sourceType: 'plot_hook' | 'npc' | 'event' | 'narrative'
  sourceLocationId?: string

  // Metadata
  lore: Lore
  priority: 'main' | 'side'
  createdAt: number  // timestamp
}

// Tipo de marcador visual en el mapa
export type QuestMarkerType = 'main' | 'side' | 'completable' | 'next'

// Marcador de quest para overlay en MapMarker
export interface QuestMarker {
  type: QuestMarkerType
  questId: string
  questTitle: string
  locationId: string
  pulse: boolean  // Animación de atención
}

// Actualización de quest desde respuesta del DM
export interface QuestUpdate {
  action: 'create' | 'complete' | 'fail' | 'update_objective' | 'add_objective'
  questId?: string  // Para updates/complete/fail

  // Para crear nueva quest
  newQuest?: Omit<Quest, 'id' | 'createdAt'>

  // Para actualizar objetivo
  objectiveId?: string
  objectiveCompleted?: boolean

  // Para agregar objetivo
  newObjective?: Omit<QuestObjective, 'id'>
}

// Revelación de secreto de locación
export interface SecretReveal {
  locationId: string
  secretId: string
  content: string
}

// Actualización de nivel de conocimiento
export interface KnowledgeUpdate {
  locationId: string
  newLevel: LocationKnowledgeLevel
}

// Secreto de una locación (definición en datos de lore)
export interface LocationSecret {
  id: string
  content: string
  reveal_condition: 'visit' | 'npc_talk' | 'quest_complete' | 'investigate'
  revealed?: boolean
}

// Evento dinámico de una locación (definición en datos de lore)
export interface DynamicEvent {
  id: string
  trigger: 'first_visit' | 'revisit' | 'quest_active' | 'random'
  probability?: number  // Para eventos random (0-1)
  description: string
  effects?: {
    knowledge_upgrade?: KnowledgeUpdate
    secret_reveal?: SecretReveal
    quest_create?: Omit<Quest, 'id' | 'createdAt'>
  }
}

// Helpers

// Generar ID único para quest
export function generateQuestId(): string {
  return `quest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Generar ID único para objetivo
export function generateObjectiveId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Crear quest desde un plot_hook de locación
export function createQuestFromPlotHook(
  plotHook: string,
  sourceLocationId: string,
  lore: Lore,
  targetLocationId?: string
): Quest {
  return {
    id: generateQuestId(),
    title: extractTitleFromHook(plotHook),
    description: plotHook,
    status: 'active',
    targetLocationId,
    relatedLocationIds: targetLocationId ? [sourceLocationId, targetLocationId] : [sourceLocationId],
    objectives: [{
      id: generateObjectiveId(),
      description: plotHook,
      completed: false,
      locationId: targetLocationId,
    }],
    sourceType: 'plot_hook',
    sourceLocationId,
    lore,
    priority: 'side',
    createdAt: Date.now(),
  }
}

// Extraer título corto de un plot_hook
function extractTitleFromHook(hook: string): string {
  // Tomar las primeras palabras significativas
  const words = hook.split(' ').slice(0, 5)
  let title = words.join(' ')
  if (title.length > 40) {
    title = title.substring(0, 37) + '...'
  }
  return title
}

// Verificar si una quest está completable en una locación
export function isQuestCompletableAt(quest: Quest, locationId: string): boolean {
  if (quest.status !== 'active') return false

  // Es la locación target
  if (quest.targetLocationId === locationId) return true

  // Tiene un objetivo pendiente en esta locación
  return quest.objectives.some(
    obj => !obj.completed && obj.locationId === locationId
  )
}

// Obtener progreso de quest (0-100)
export function getQuestProgress(quest: Quest): number {
  if (quest.objectives.length === 0) return 0
  const completed = quest.objectives.filter(obj => obj.completed).length
  return Math.round((completed / quest.objectives.length) * 100)
}

// Obtener icono de marcador según tipo
export function getQuestMarkerIcon(type: QuestMarkerType): string {
  switch (type) {
    case 'main': return '!'
    case 'side': return '?'
    case 'completable': return '★'
    case 'next': return '→'
  }
}

// Obtener color de marcador según tipo
export function getQuestMarkerColor(type: QuestMarkerType): string {
  switch (type) {
    case 'main': return '#F5C842'      // gold-bright (amarillo)
    case 'side': return '#4A9EFF'      // azul
    case 'completable': return '#FFD700' // dorado
    case 'next': return '#4ADE80'      // verde
  }
}

// Comparar niveles de conocimiento (retorna -1, 0, 1)
export function compareKnowledgeLevels(a: LocationKnowledgeLevel, b: LocationKnowledgeLevel): number {
  const order: LocationKnowledgeLevel[] = ['unknown', 'rumored', 'discovered', 'visited', 'explored', 'mastered']
  return order.indexOf(a) - order.indexOf(b)
}

// Verificar si un nivel es suficiente para ver cierta info
export function hasMinimumKnowledge(
  current: LocationKnowledgeLevel,
  required: LocationKnowledgeLevel
): boolean {
  return compareKnowledgeLevels(current, required) >= 0
}
