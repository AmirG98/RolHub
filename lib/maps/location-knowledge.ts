// Sistema de conocimiento progresivo de locaciones
// Controla qué información ve el jugador según su nivel de conocimiento

import type { MapLocation } from './map-config'
import type {
  LocationKnowledgeLevel,
  LocationSecret,
  DynamicEvent,
} from '@/lib/types/quest'
import type { MapState, LocationKnowledgeLevel as MapKnowledgeLevel } from '@/lib/types/map-state'

// Orden de niveles para comparación
const KNOWLEDGE_ORDER: LocationKnowledgeLevel[] = [
  'unknown',
  'rumored',
  'discovered',
  'visited',
  'explored',
  'mastered',
]

// ============================================================================
// Queries de Knowledge Level
// ============================================================================

// Obtener nivel de conocimiento de una locación
export function getKnowledgeLevel(
  mapState: MapState,
  locationId: string
): LocationKnowledgeLevel {
  // Primero verificar el nuevo sistema
  if (mapState.locationKnowledge?.[locationId]) {
    return mapState.locationKnowledge[locationId]
  }

  // Fallback al sistema legacy (discovered/visited arrays)
  if (mapState.visitedLocationIds?.includes(locationId)) {
    return 'visited'
  }
  if (mapState.discoveredLocationIds?.includes(locationId)) {
    return 'discovered'
  }

  return 'unknown'
}

// Comparar niveles (-1, 0, 1)
export function compareKnowledgeLevels(
  a: LocationKnowledgeLevel,
  b: LocationKnowledgeLevel
): number {
  return KNOWLEDGE_ORDER.indexOf(a) - KNOWLEDGE_ORDER.indexOf(b)
}

// Verificar si tiene el nivel mínimo requerido
export function hasMinimumKnowledge(
  current: LocationKnowledgeLevel,
  required: LocationKnowledgeLevel
): boolean {
  return compareKnowledgeLevels(current, required) >= 0
}

// ============================================================================
// Filtrado de Información por Knowledge Level
// ============================================================================

// Información visible de una locación según nivel de conocimiento
export interface VisibleLocationInfo {
  // Siempre visible si level >= rumored
  name?: string
  showQuestionMark: boolean  // Para "rumored"

  // Visible desde "discovered"
  type?: string
  dangerLevel?: number

  // Visible desde "visited"
  description?: string
  availableServices?: string[]

  // Visible desde "explored"
  notableNpcs?: string[]
  plotHooks?: string[]

  // Visible desde "mastered" o revelado específicamente
  secrets?: LocationSecret[]
  dynamicEvents?: DynamicEvent[]

  // Estado visual
  iconOpacity: number
  canNavigateTo: boolean
}

// Obtener información filtrada de una locación
export function getVisibleLocationInfo(
  location: MapLocation & {
    notable_npcs?: string[]
    available_services?: string[]
    plot_hooks?: string[]
    secrets?: LocationSecret[]
    dynamic_events?: DynamicEvent[]
  },
  knowledgeLevel: LocationKnowledgeLevel,
  revealedSecretIds: string[] = []
): VisibleLocationInfo {
  const result: VisibleLocationInfo = {
    showQuestionMark: knowledgeLevel === 'rumored',
    iconOpacity: 0,
    canNavigateTo: false,
  }

  // Unknown: no aparece en mapa
  if (knowledgeLevel === 'unknown') {
    return result
  }

  // Rumored: solo nombre con "?"
  if (hasMinimumKnowledge(knowledgeLevel, 'rumored')) {
    result.name = location.name
    result.iconOpacity = 0.4
    result.canNavigateTo = false
  }

  // Discovered: nombre, tipo, peligro
  if (hasMinimumKnowledge(knowledgeLevel, 'discovered')) {
    result.showQuestionMark = false
    result.type = location.type
    result.dangerLevel = location.dangerLevel
    result.iconOpacity = 0.7
    result.canNavigateTo = true
  }

  // Visited: + descripción, servicios
  if (hasMinimumKnowledge(knowledgeLevel, 'visited')) {
    result.description = location.description
    result.availableServices = location.available_services
    result.iconOpacity = 1.0
  }

  // Explored: + NPCs, plot_hooks
  if (hasMinimumKnowledge(knowledgeLevel, 'explored')) {
    result.notableNpcs = location.notable_npcs
    result.plotHooks = location.plot_hooks
  }

  // Mastered: + secretos (todos)
  if (hasMinimumKnowledge(knowledgeLevel, 'mastered')) {
    result.secrets = location.secrets
    result.dynamicEvents = location.dynamic_events
  } else if (revealedSecretIds.length > 0 && location.secrets) {
    // Secretos revelados específicamente (aunque no sea "mastered")
    result.secrets = location.secrets.filter(s =>
      revealedSecretIds.includes(s.id)
    )
  }

  return result
}

// ============================================================================
// Mutaciones de Knowledge Level
// ============================================================================

// Actualizar nivel de conocimiento (solo sube, nunca baja)
export function upgradeKnowledge(
  mapState: MapState,
  locationId: string,
  newLevel: LocationKnowledgeLevel
): MapState {
  const currentLevel = getKnowledgeLevel(mapState, locationId)

  // Solo actualizar si el nuevo nivel es mayor
  if (compareKnowledgeLevels(newLevel, currentLevel) <= 0) {
    return mapState
  }

  // Actualizar también los arrays legacy para compatibilidad
  let discoveredLocationIds = [...(mapState.discoveredLocationIds || [])]
  let visitedLocationIds = [...(mapState.visitedLocationIds || [])]

  if (hasMinimumKnowledge(newLevel, 'discovered') && !discoveredLocationIds.includes(locationId)) {
    discoveredLocationIds.push(locationId)
  }
  if (hasMinimumKnowledge(newLevel, 'visited') && !visitedLocationIds.includes(locationId)) {
    visitedLocationIds.push(locationId)
  }

  return {
    ...mapState,
    locationKnowledge: {
      ...mapState.locationKnowledge,
      [locationId]: newLevel,
    },
    discoveredLocationIds,
    visitedLocationIds,
  }
}

// Inicializar conocimiento para nueva campaña
export function initializeKnowledgeForCampaign(
  mapState: MapState,
  startLocationId: string,
  connectedLocationIds: string[]
): MapState {
  const locationKnowledge: Record<string, LocationKnowledgeLevel> = {
    ...mapState.locationKnowledge,
    [startLocationId]: 'visited',
  }

  // Locaciones conectadas empiezan como "discovered"
  for (const id of connectedLocationIds) {
    if (!locationKnowledge[id]) {
      locationKnowledge[id] = 'discovered'
    }
  }

  return {
    ...mapState,
    locationKnowledge,
    currentLocationId: startLocationId,
    visitedLocationIds: Array.from(new Set([...(mapState.visitedLocationIds || []), startLocationId])),
    discoveredLocationIds: Array.from(new Set([
      ...(mapState.discoveredLocationIds || []),
      startLocationId,
      ...connectedLocationIds,
    ])),
  }
}

// Al llegar a una nueva locación
export function onLocationArrival(
  mapState: MapState,
  locationId: string,
  connectedLocationIds: string[]
): MapState {
  let newState = upgradeKnowledge(mapState, locationId, 'visited')

  // Descubrir locaciones conectadas
  for (const connId of connectedLocationIds) {
    const currentLevel = getKnowledgeLevel(newState, connId)
    if (currentLevel === 'unknown') {
      newState = upgradeKnowledge(newState, connId, 'discovered')
    }
  }

  return {
    ...newState,
    currentLocationId: locationId,
    previousLocationId: mapState.currentLocationId,
  }
}

// Al explorar una locación (hablar con NPCs, investigar)
export function onLocationExplored(
  mapState: MapState,
  locationId: string
): MapState {
  return upgradeKnowledge(mapState, locationId, 'explored')
}

// Al completar quest principal relacionada con locación
export function onLocationMastered(
  mapState: MapState,
  locationId: string
): MapState {
  return upgradeKnowledge(mapState, locationId, 'mastered')
}

// Al escuchar rumor sobre una locación
export function onLocationRumored(
  mapState: MapState,
  locationId: string
): MapState {
  const currentLevel = getKnowledgeLevel(mapState, locationId)

  // Solo aplicar si era unknown
  if (currentLevel === 'unknown') {
    return upgradeKnowledge(mapState, locationId, 'rumored')
  }

  return mapState
}

// ============================================================================
// Gestión de Secretos
// ============================================================================

// Revelar un secreto de locación
export function revealLocationSecret(
  mapState: MapState,
  locationId: string,
  secretId: string
): MapState {
  const currentSecrets = mapState.revealedSecrets?.[locationId] || []

  if (currentSecrets.includes(secretId)) {
    return mapState
  }

  return {
    ...mapState,
    revealedSecrets: {
      ...mapState.revealedSecrets,
      [locationId]: [...currentSecrets, secretId],
    },
  }
}

// Verificar si un secreto está revelado
export function isSecretRevealed(
  mapState: MapState,
  locationId: string,
  secretId: string
): boolean {
  return mapState.revealedSecrets?.[locationId]?.includes(secretId) || false
}

// Obtener todos los secretos revelados de una locación
export function getRevealedSecrets(
  mapState: MapState,
  locationId: string
): string[] {
  return mapState.revealedSecrets?.[locationId] || []
}

// ============================================================================
// Utilidades de UI
// ============================================================================

// Obtener estilo visual según nivel de conocimiento
export interface KnowledgeLevelStyle {
  opacity: number
  showName: boolean
  showDetails: boolean
  showQuestionMark: boolean
  borderStyle: 'none' | 'dashed' | 'solid' | 'double' | 'gold'
  glowEffect: boolean
}

export function getKnowledgeLevelStyle(level: LocationKnowledgeLevel): KnowledgeLevelStyle {
  switch (level) {
    case 'unknown':
      return {
        opacity: 0,
        showName: false,
        showDetails: false,
        showQuestionMark: false,
        borderStyle: 'none',
        glowEffect: false,
      }
    case 'rumored':
      return {
        opacity: 0.4,
        showName: true,
        showDetails: false,
        showQuestionMark: true,
        borderStyle: 'dashed',
        glowEffect: false,
      }
    case 'discovered':
      return {
        opacity: 0.7,
        showName: true,
        showDetails: false,
        showQuestionMark: false,
        borderStyle: 'solid',
        glowEffect: false,
      }
    case 'visited':
      return {
        opacity: 1.0,
        showName: true,
        showDetails: true,
        showQuestionMark: false,
        borderStyle: 'solid',
        glowEffect: false,
      }
    case 'explored':
      return {
        opacity: 1.0,
        showName: true,
        showDetails: true,
        showQuestionMark: false,
        borderStyle: 'double',
        glowEffect: true,
      }
    case 'mastered':
      return {
        opacity: 1.0,
        showName: true,
        showDetails: true,
        showQuestionMark: false,
        borderStyle: 'gold',
        glowEffect: true,
      }
  }
}

// Obtener nombre del nivel en español para UI
export function getKnowledgeLevelLabel(level: LocationKnowledgeLevel): string {
  switch (level) {
    case 'unknown': return 'Desconocido'
    case 'rumored': return 'Rumoreado'
    case 'discovered': return 'Descubierto'
    case 'visited': return 'Visitado'
    case 'explored': return 'Explorado'
    case 'mastered': return 'Dominado'
  }
}

// Obtener icono del nivel para UI
export function getKnowledgeLevelIcon(level: LocationKnowledgeLevel): string {
  switch (level) {
    case 'unknown': return '❓'
    case 'rumored': return '👂'
    case 'discovered': return '🔍'
    case 'visited': return '👣'
    case 'explored': return '🗺️'
    case 'mastered': return '⭐'
  }
}
