// Tipos para el sistema de mapas integrado con GameSession
// Controla la sincronización entre narrativa y navegación del mapa

import { Lore, GameEngine } from './lore'
import type {
  LocationKnowledgeLevel,
  Quest,
  QuestUpdate as QuestUpdateFull,
  KnowledgeUpdate,
  SecretReveal,
} from './quest'

// Re-export para uso externo
export type { LocationKnowledgeLevel }

// Razones por las que la navegación puede estar bloqueada
export type NavigationLockReason =
  | 'combat'           // En combate activo
  | 'dialogue'         // Conversación importante con NPC
  | 'cutscene'         // Escena narrativa crucial
  | 'important_choice' // Decisión que afecta la historia
  | 'ritual'           // Ritual o ceremonia en progreso
  | 'trap'             // Atrapado en trampa o situación
  | 'none'             // Sin bloqueo

// Estado del submapa cuando el jugador explora el interior de una locación
export interface ActiveSubmap {
  locationId: string
  currentNodeId: string
  discoveredNodeIds: string[]
  visitedNodeIds: string[]
}

// Estado completo del mapa para una campaña
export interface MapState {
  // Ubicación actual
  currentLocationId: string | null
  previousLocationId: string | null

  // Progreso de exploración (legacy - mantener para compatibilidad)
  discoveredLocationIds: string[]
  visitedLocationIds: string[]

  // NUEVO: Sistema de conocimiento progresivo por locación
  // Reemplaza el binario discovered/visited con niveles graduales
  locationKnowledge: Record<string, LocationKnowledgeLevel>

  // NUEVO: Secretos revelados por locación
  revealedSecrets: Record<string, string[]>  // locationId -> secretIds[]

  // Control de navegación (DM decide cuándo bloquear)
  navigationLocked: boolean
  lockReason?: NavigationLockReason

  // Submapa activo (cuando explora interior)
  activeSubmap: ActiveSubmap | null

  // Imagen del mapa generada con IA (opcional)
  mapImageUrl?: string
  mapImageGeneratedAt?: string
}

// Miembro del party con estado actualizado
export interface PartyMember {
  hp: string                              // "14/20"
  level: number
  experience: number
  conditions: string[]
  active_effects: string[]
  inventory: string[]
  relationships: Record<string, string>   // NPC name -> relationship
}

// WorldState extendido con sistema de mapas y quests
export interface ExtendedWorldState {
  // Campos existentes del CLAUDE.md
  campaign_id: string
  lore: Lore
  engine: GameEngine
  session_count: number
  act: number                              // 1-5
  narrative_anchors_hit: string[]

  party: Record<string, PartyMember>

  world_flags: Record<string, boolean>
  active_quests: string[]                  // Legacy: IDs como strings
  completed_quests: string[]               // Legacy: IDs como strings
  failed_quests: string[]                  // Legacy: IDs como strings
  npc_states: Record<string, string>
  faction_relations: Record<string, number> // -2 a +2
  current_scene: string
  time_in_world: string
  weather: string

  // NUEVO: Sistema de mapas
  map_state: MapState

  // NUEVO: Sistema de quests completo (reemplaza los arrays legacy)
  quests?: Quest[]
}

// Campos de ubicación en la respuesta del DM
export interface DMLocationResponse {
  // ID de la locación en el mapa (debe coincidir con lore-map-data)
  location_id?: string

  // Cambio de ubicación con narración de viaje
  location_change?: {
    from_id: string
    to_id: string
    travel_narration: string     // "Después de dos días de viaje..."
    travel_time?: string         // "2 horas", "un día", etc.
  }

  // Control de navegación
  navigation_locked?: boolean
  lock_reason?: NavigationLockReason

  // Eventos de submapa
  submap_event?: {
    type: 'enter' | 'exit' | 'node_change'
    node_id?: string
    discovery?: string[]          // Nodos descubiertos
  }

  // Prompt para imagen de llegada a locación
  scene_image_prompt?: string
}

// Respuesta completa del DM extendida con ubicación
export interface ExtendedDMResponse extends DMLocationResponse {
  narration: string
  image_prompt: string
  voice_id: string
  ambient_mood: string
  sfx_prompt?: string
  world_state_updates: Partial<ExtendedWorldState>
  active_effects_updates?: ActiveEffectUpdate[]
  dm_notes: string
  dice_required?: DiceRequired
  actions?: string[]
  combat_trigger?: CombatTrigger
  scene_change?: string
  narrative_anchor_reached?: string
  tutorial_hint?: string
  character_name?: string
  hp_change?: number
  inventory_change?: string[]

  // Sistema de quests y conocimiento (nuevo)
  quest_update?: QuestUpdate          // Legacy simple format
  quest_updates?: QuestUpdateFull[]   // Nuevo: múltiples actualizaciones
  knowledge_updates?: KnowledgeUpdate[] // Actualizar nivel de conocimiento de locaciones
  secret_reveals?: SecretReveal[]     // Revelar secretos de locaciones
}

// Tipos auxiliares
export interface ActiveEffectUpdate {
  character: string
  effect_id: string
  action: 'add' | 'remove' | 'decrement'
}

export interface DiceRequired {
  type: string
  attribute: string
  difficulty: number
  on_success: string
  on_failure: string
  on_partial?: string
}

export interface CombatTrigger {
  enemies: string[]
  initiative_order?: string[]
}

export interface QuestUpdate {
  quest_id: string
  action: 'add' | 'complete' | 'fail' | 'update'
  description?: string
}

// Estado derivado del mapa para el componente React
export interface MapSyncState {
  locations: MapLocationWithStatus[]
  currentLocation: MapLocationWithStatus | null
  canNavigate: boolean
  isInSubmap: boolean
  lockMessage?: string
}

// Locación con estado de descubrimiento/visita
export interface MapLocationWithStatus {
  id: string
  name: string
  description: string
  type: 'city' | 'dungeon' | 'wilderness' | 'landmark' | 'danger' | 'safe' | 'mystery'
  dangerLevel: number
  coordinates: { x: number; y: number }
  connections: string[]
  icon: string
  discovered: boolean
  visited: boolean
  isCurrent: boolean

  // NUEVO: Sistema de conocimiento progresivo
  knowledgeLevel: LocationKnowledgeLevel
  revealedSecretIds?: string[]
}

// Resultado de validación de viaje
export interface TravelValidation {
  valid: boolean
  reason?: 'not_discovered' | 'only_rumored' | 'not_connected' | 'locked' | 'same_location'
  lockReason?: NavigationLockReason
}

// Función para crear estado inicial del mapa
export function createInitialMapState(
  startingLocationId: string,
  initialDiscoveredIds: string[]
): MapState {
  // Crear locationKnowledge inicial
  const locationKnowledge: Record<string, LocationKnowledgeLevel> = {
    [startingLocationId]: 'visited',
  }

  // Locaciones conectadas empiezan como 'discovered'
  for (const id of initialDiscoveredIds) {
    if (id !== startingLocationId) {
      locationKnowledge[id] = 'discovered'
    }
  }

  return {
    currentLocationId: startingLocationId,
    previousLocationId: null,
    discoveredLocationIds: initialDiscoveredIds,
    visitedLocationIds: [startingLocationId],
    locationKnowledge,
    revealedSecrets: {},
    navigationLocked: false,
    lockReason: undefined,
    activeSubmap: null,
    mapImageUrl: undefined,
    mapImageGeneratedAt: undefined,
  }
}
