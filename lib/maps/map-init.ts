// Inicialización de estado de mapa para nuevas campañas
// Usado al crear una campaña para establecer el estado inicial del mapa

import { type MapState, createInitialMapState } from '@/lib/types/map-state'
import { type Lore } from '@/lib/types/lore'
import { getExampleMapData } from './lore-map-data'

// Locaciones iniciales por lore
// - starting: donde comienza el jugador
// - discovered: locaciones visibles desde el inicio
const LORE_STARTING_CONFIG: Record<
  Lore,
  {
    starting: string
    discoveredNames: string[]
  }
> = {
  LOTR: {
    starting: 'comarca',
    discoveredNames: ['La Comarca', 'Bree', 'Rivendel'],
  },
  ZOMBIES: {
    starting: 'campamento-base',
    discoveredNames: ['Campamento Base', 'Centro Comercial', 'Estación de Policía'],
  },
  ISEKAI: {
    starting: 'aldea-inicio',
    discoveredNames: ['Aldea de Inicio', 'Bosque Inicial', 'Cueva de Slimes', 'Ciudad Capital', 'Gremio de Aventureros'],
  },
  VIKINGOS: {
    starting: 'aldea',
    discoveredNames: ['Tu Aldea', 'Puerto del Norte', 'Bosque Sagrado', 'Islas del Este', 'Costa Sajona'],
  },
  STAR_WARS: {
    starting: 'tatooine',
    discoveredNames: ['Tatooine', 'Mos Eisley', 'Coruscant'],
  },
  CYBERPUNK: {
    starting: 'tu-apartamento',
    discoveredNames: ['Tu Apartamento', 'Downtown', 'Club Afterlife', 'Distrito Corporativo', 'Mercado Negro', 'Clínica del Ripperdoc'],
  },
  LOVECRAFT_HORROR: {
    starting: 'tu-oficina',
    discoveredNames: ['Tu Oficina', 'Arkham', 'Universidad Miskatonic', 'Biblioteca Orne', 'Cementerio de Arkham', 'Puerto de Arkham', 'Manicomio de Arkham'],
  },
  CUSTOM: {
    starting: 'start',
    discoveredNames: [],
  },
}

/**
 * Obtiene el ID de la locación inicial para un lore
 */
export function getStartingLocationId(lore: Lore): string {
  return LORE_STARTING_CONFIG[lore]?.starting || 'start'
}

/**
 * Obtiene los IDs de las locaciones inicialmente descubiertas para un lore
 */
export function getInitialDiscoveredLocationIds(lore: Lore): string[] {
  const config = LORE_STARTING_CONFIG[lore]
  if (!config) return ['start']

  // Obtener datos del mapa para este lore
  const mapData = getExampleMapData(lore as any)

  // Convertir nombres a IDs
  const discoveredIds: string[] = []
  for (const name of config.discoveredNames) {
    const location = mapData.find((l) => l.name === name)
    if (location) {
      discoveredIds.push(location.id)
    }
  }

  // Asegurar que la locación inicial está incluida
  if (!discoveredIds.includes(config.starting)) {
    discoveredIds.unshift(config.starting)
  }

  return discoveredIds
}

/**
 * Crea el estado inicial del mapa para una nueva campaña
 */
export function createCampaignMapState(lore: Lore): MapState {
  const startingId = getStartingLocationId(lore)
  const discoveredIds = getInitialDiscoveredLocationIds(lore)

  return createInitialMapState(startingId, discoveredIds)
}

/**
 * Obtiene el nombre de la escena inicial para el world state
 */
export function getStartingSceneName(lore: Lore): string {
  const mapData = getExampleMapData(lore as any)
  const startingId = getStartingLocationId(lore)
  const startingLocation = mapData.find((l) => l.id === startingId)

  return startingLocation?.name || 'Inicio'
}

/**
 * Valida que un location_id existe en el mapa del lore
 */
export function isValidLocationId(lore: Lore, locationId: string): boolean {
  const mapData = getExampleMapData(lore as any)
  return mapData.some((l) => l.id === locationId)
}

/**
 * Obtiene información de una locación por ID
 */
export function getLocationById(
  lore: Lore,
  locationId: string
): { name: string; description: string; type: string; dangerLevel: number } | null {
  const mapData = getExampleMapData(lore as any)
  const location = mapData.find((l) => l.id === locationId)

  if (!location) return null

  return {
    name: location.name,
    description: location.description,
    type: location.type,
    dangerLevel: location.dangerLevel,
  }
}

/**
 * Obtiene las locaciones conectadas a una locación dada
 */
export function getConnectedLocationIds(lore: Lore, locationId: string): string[] {
  const mapData = getExampleMapData(lore as any)
  const location = mapData.find((l) => l.id === locationId)

  return location?.connections || []
}

/**
 * Migra un worldState antiguo (sin map_state) al nuevo formato
 */
export function migrateWorldStateMapState(
  worldState: any,
  lore: Lore
): MapState {
  // Si ya tiene map_state, devolverlo
  if (worldState.map_state) {
    return worldState.map_state as MapState
  }

  // Crear estado inicial
  const initialState = createCampaignMapState(lore)

  // Intentar inferir ubicación actual desde current_scene
  if (worldState.current_scene) {
    const mapData = getExampleMapData(lore as any)
    const currentLocation = mapData.find(
      (l) =>
        l.name.toLowerCase() === worldState.current_scene.toLowerCase() ||
        l.id === worldState.current_scene.toLowerCase().replace(/\s+/g, '-')
    )

    if (currentLocation) {
      initialState.currentLocationId = currentLocation.id

      // Marcar como visitada
      if (!initialState.visitedLocationIds.includes(currentLocation.id)) {
        initialState.visitedLocationIds.push(currentLocation.id)
      }

      // Descubrir locaciones conectadas
      for (const connectedId of currentLocation.connections) {
        if (!initialState.discoveredLocationIds.includes(connectedId)) {
          initialState.discoveredLocationIds.push(connectedId)
        }
      }
    }
  }

  return initialState
}
