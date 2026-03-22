// Lógica de sincronización entre el mapa y la narrativa del juego
// Maneja viajes, descubrimiento de locaciones, y validación de navegación

import { type MapLocation } from './map-config'
import { generateMapLocations, getExampleMapData } from './lore-map-data'
import {
  type MapState,
  type MapSyncState,
  type MapLocationWithStatus,
  type TravelValidation,
  type NavigationLockReason,
  type LocationKnowledgeLevel,
} from '@/lib/types/map-state'
import { type Lore } from '@/lib/types/lore'
import { getKnowledgeLevel } from './location-knowledge'

// Mensajes de bloqueo de navegación por idioma
const LOCK_MESSAGES: Record<NavigationLockReason, { es: string; en: string }> = {
  combat: {
    es: 'En combate - no puedes viajar',
    en: 'In combat - cannot travel',
  },
  dialogue: {
    es: 'En conversación importante',
    en: 'In important dialogue',
  },
  cutscene: {
    es: 'Escena en progreso',
    en: 'Scene in progress',
  },
  important_choice: {
    es: 'Decisión crucial pendiente',
    en: 'Crucial decision pending',
  },
  ritual: {
    es: 'Ritual en progreso',
    en: 'Ritual in progress',
  },
  trap: {
    es: 'Atrapado - debes escapar primero',
    en: 'Trapped - must escape first',
  },
  none: {
    es: 'Navegación libre',
    en: 'Free navigation',
  },
}

// Razones de fallo de viaje por idioma
const TRAVEL_FAIL_MESSAGES: Record<string, { es: string; en: string }> = {
  not_discovered: {
    es: 'No has descubierto esta locación',
    en: "You haven't discovered this location",
  },
  only_rumored: {
    es: 'Solo has escuchado rumores de este lugar. Necesitas descubrir cómo llegar.',
    en: "You've only heard rumors of this place. You need to discover how to get there.",
  },
  not_connected: {
    es: 'No hay camino directo desde tu ubicación actual',
    en: 'No direct path from your current location',
  },
  locked: {
    es: 'No puedes viajar en este momento',
    en: 'Cannot travel at this time',
  },
  same_location: {
    es: 'Ya estás aquí',
    en: "You're already here",
  },
}

/**
 * Deriva el estado del mapa a partir del worldState y los datos del lore
 */
export function deriveMapState(
  mapState: MapState | undefined,
  lore: Lore,
  loreLocations?: { name: string; description: string; type: string; danger_level: number }[]
): MapSyncState {
  // Si no hay map_state, usar estado por defecto
  const state = mapState || createDefaultMapState(lore)

  // Obtener locaciones del lore o usar ejemplo
  let locations: MapLocation[]

  if (loreLocations && loreLocations.length > 0) {
    locations = generateMapLocations(
      lore as any,
      loreLocations,
      state.discoveredLocationIds,
      state.visitedLocationIds
    )
  } else {
    // Usar datos de ejemplo y aplicar estado de descubrimiento
    const exampleData = getExampleMapData(lore as any)
    locations = exampleData.map((loc) => ({
      ...loc,
      discovered: state.discoveredLocationIds.includes(loc.id),
      visited: state.visitedLocationIds.includes(loc.id),
    }))
  }

  // Convertir a MapLocationWithStatus con knowledge level
  const locationsWithStatus: MapLocationWithStatus[] = locations.map((loc) => ({
    ...loc,
    isCurrent: loc.id === state.currentLocationId,
    knowledgeLevel: getKnowledgeLevel(state, loc.id),
    revealedSecretIds: state.revealedSecrets?.[loc.id] || [],
  }))

  // Encontrar ubicación actual
  const currentLocation = locationsWithStatus.find((l) => l.isCurrent) || null

  return {
    locations: locationsWithStatus,
    currentLocation,
    canNavigate: !state.navigationLocked,
    isInSubmap: state.activeSubmap !== null,
    lockMessage: state.lockReason ? LOCK_MESSAGES[state.lockReason]?.es : undefined,
  }
}

/**
 * Crea un estado de mapa por defecto para un lore
 */
export function createDefaultMapState(lore: Lore): MapState {
  const startingIds = getStartingLocationIds(lore)

  // Crear locationKnowledge inicial
  const locationKnowledge: Record<string, LocationKnowledgeLevel> = {
    [startingIds.starting]: 'visited',
  }

  // Locaciones descubiertas empiezan como 'discovered'
  for (const id of startingIds.discovered) {
    if (id !== startingIds.starting) {
      locationKnowledge[id] = 'discovered'
    }
  }

  return {
    currentLocationId: startingIds.starting,
    previousLocationId: null,
    discoveredLocationIds: startingIds.discovered,
    visitedLocationIds: [startingIds.starting],
    locationKnowledge,
    revealedSecrets: {},
    navigationLocked: false,
    lockReason: undefined,
    activeSubmap: null,
    mapImageUrl: undefined,
    mapImageGeneratedAt: undefined,
  }
}

/**
 * Obtiene las locaciones iniciales por lore
 */
export function getStartingLocationIds(lore: Lore): { starting: string; discovered: string[] } {
  const STARTING_LOCATIONS: Record<Lore, { starting: string; discovered: string[] }> = {
    LOTR: {
      starting: 'comarca',
      discovered: ['comarca', 'bree', 'rivendel'],
    },
    ZOMBIES: {
      starting: 'campamento-base',
      discovered: ['campamento-base', 'centro-comercial', 'estacion-policia'],
    },
    ISEKAI: {
      starting: 'aldea-inicio',
      discovered: ['aldea-inicio', 'bosque-inicial', 'cueva-slimes', 'ciudad-capital'],
    },
    VIKINGOS: {
      starting: 'aldea',
      discovered: ['aldea', 'puerto', 'bosque-sagrado', 'islas-este', 'costa-sajona'],
    },
    STAR_WARS: {
      starting: 'tatooine',
      discovered: ['tatooine', 'mos-eisley', 'coruscant'],
    },
    CYBERPUNK: {
      starting: 'tu-apartamento',
      discovered: ['tu-apartamento', 'downtown', 'afterlife', 'distrito-corpo', 'mercado-negro', 'ripperdoc'],
    },
    LOVECRAFT_HORROR: {
      starting: 'tu-oficina',
      discovered: ['tu-oficina', 'arkham', 'universidad', 'biblioteca', 'cementerio', 'puerto', 'manicomio'],
    },
    CUSTOM: {
      starting: 'start',
      discovered: ['start'],
    },
  }

  return STARTING_LOCATIONS[lore] || STARTING_LOCATIONS.CUSTOM
}

/**
 * Valida si es posible viajar de una locación a otra
 */
export function canTravelTo(
  fromLocation: MapLocationWithStatus | null,
  toLocation: MapLocationWithStatus,
  mapState: MapState
): TravelValidation {
  // Misma ubicación
  if (fromLocation && fromLocation.id === toLocation.id) {
    return { valid: false, reason: 'same_location' }
  }

  // Navegación bloqueada
  if (mapState.navigationLocked) {
    return {
      valid: false,
      reason: 'locked',
      lockReason: mapState.lockReason,
    }
  }

  // Verificar nivel de conocimiento (nueva validación basada en narrativa)
  const knowledgeLevel = getKnowledgeLevel(mapState, toLocation.id)

  // Si es "unknown", no aparece ni en el mapa
  if (knowledgeLevel === 'unknown') {
    return { valid: false, reason: 'not_discovered' }
  }

  // Si es "rumored", solo lo han escuchado pero no saben cómo llegar
  if (knowledgeLevel === 'rumored') {
    return { valid: false, reason: 'only_rumored' }
  }

  // Nivel >= 'discovered' - saben cómo llegar, pueden viajar
  // Pero aún verificamos conexión para viajes largos
  const isConnected = fromLocation ? fromLocation.connections.includes(toLocation.id) : false
  const wasVisited = mapState.visitedLocationIds.includes(toLocation.id)

  if (!isConnected && !wasVisited) {
    return { valid: false, reason: 'not_connected' }
  }

  return { valid: true }
}

/**
 * Genera la acción de viaje para enviar al DM
 */
export function createTravelAction(
  fromLocation: MapLocationWithStatus,
  toLocation: MapLocationWithStatus,
  locale: 'es' | 'en' = 'es'
): string {
  if (locale === 'en') {
    return `I travel from ${fromLocation.name} to ${toLocation.name}`
  }
  return `Viajo desde ${fromLocation.name} hacia ${toLocation.name}`
}

/**
 * Obtiene el mensaje de error para un fallo de viaje
 */
export function getTravelFailMessage(
  validation: TravelValidation,
  locale: 'es' | 'en' = 'es'
): string {
  if (validation.valid) return ''

  const reason = validation.reason || 'locked'
  const message = TRAVEL_FAIL_MESSAGES[reason]?.[locale] || TRAVEL_FAIL_MESSAGES.locked[locale]

  // Si está bloqueado, añadir la razón específica
  if (reason === 'locked' && validation.lockReason) {
    const lockMessage = LOCK_MESSAGES[validation.lockReason]?.[locale]
    return `${message}: ${lockMessage}`
  }

  return message
}

/**
 * Calcula las actualizaciones de map_state después de un viaje exitoso
 */
export function calculateTravelUpdates(
  currentMapState: MapState,
  newLocationId: string,
  allLocations: MapLocationWithStatus[]
): Partial<MapState> {
  const newLocation = allLocations.find((l) => l.id === newLocationId)
  if (!newLocation) return {}

  // Descubrir locaciones conectadas
  const newDiscovered = [...currentMapState.discoveredLocationIds]
  for (const connectedId of newLocation.connections) {
    if (!newDiscovered.includes(connectedId)) {
      newDiscovered.push(connectedId)
    }
  }

  // Añadir a visitadas si no estaba
  const newVisited = [...currentMapState.visitedLocationIds]
  if (!newVisited.includes(newLocationId)) {
    newVisited.push(newLocationId)
  }

  return {
    previousLocationId: currentMapState.currentLocationId,
    currentLocationId: newLocationId,
    discoveredLocationIds: newDiscovered,
    visitedLocationIds: newVisited,
  }
}

/**
 * Aplica actualizaciones de ubicación desde la respuesta del DM
 */
export function applyLocationUpdates(
  currentMapState: MapState,
  dmResponse: {
    location_id?: string
    navigation_locked?: boolean
    lock_reason?: NavigationLockReason
  },
  allLocations: MapLocationWithStatus[]
): Partial<MapState> {
  const updates: Partial<MapState> = {}

  // Actualizar ubicación si cambió
  if (dmResponse.location_id && dmResponse.location_id !== currentMapState.currentLocationId) {
    const travelUpdates = calculateTravelUpdates(
      currentMapState,
      dmResponse.location_id,
      allLocations
    )
    Object.assign(updates, travelUpdates)
  }

  // Actualizar estado de navegación
  if (dmResponse.navigation_locked !== undefined) {
    updates.navigationLocked = dmResponse.navigation_locked
    updates.lockReason = dmResponse.lock_reason || 'none'
  }

  return updates
}

/**
 * Verifica si una locación tiene submapa disponible
 */
export function hasSubmapAvailable(location: MapLocationWithStatus): boolean {
  // Ciudades, dungeons y strongholds tienen submapas
  const submapTypes = ['city', 'dungeon', 'landmark', 'mystery']
  return submapTypes.includes(location.type)
}

/**
 * Obtiene el tipo de submapa para una locación
 */
export function getSubmapType(
  location: MapLocationWithStatus
): 'city' | 'dungeon' | 'wilderness' | 'stronghold' | 'nautical' {
  switch (location.type) {
    case 'city':
    case 'safe':
      return 'city'
    case 'dungeon':
      return 'dungeon'
    case 'wilderness':
      return 'wilderness'
    case 'danger':
    case 'landmark':
      return 'stronghold'
    case 'mystery':
      return location.dangerLevel >= 4 ? 'dungeon' : 'city'
    default:
      return 'wilderness'
  }
}

/**
 * Calcula estadísticas del mapa para mostrar en UI
 */
export function calculateMapStats(
  locations: MapLocationWithStatus[],
  mapState: MapState
): {
  totalLocations: number
  discoveredLocations: number
  visitedLocations: number
  completionPercent: number
} {
  const total = locations.length
  const discovered = mapState.discoveredLocationIds.length
  const visited = mapState.visitedLocationIds.length
  const completion = total > 0 ? Math.round((visited / total) * 100) : 0

  return {
    totalLocations: total,
    discoveredLocations: discovered,
    visitedLocations: visited,
    completionPercent: completion,
  }
}
