/**
 * Sistema de Mapas Tácticos para RPG Hub
 * Tipos y interfaces para combate táctico estilo Foundry VTT / D&D
 */

// Tipos de grilla soportados
export type GridType = 'square' | 'hex'

// Coordenadas de grilla
export interface GridCoord {
  x: number
  y: number
}

// Coordenadas hexagonales (axial + cube)
export interface HexCoord {
  q: number  // Columna
  r: number  // Fila
  s: number  // Computado: -q-r
}

// Tipos de terreno con efectos mecánicos
export type TerrainType =
  | 'normal'           // Sin modificadores
  | 'difficult'        // Doble costo de movimiento
  | 'water_shallow'    // Difícil + puede apagar fuego
  | 'water_deep'       // Requiere nadar
  | 'lava'             // Daño al entrar (2d10 fuego)
  | 'ice'              // Difícil + check de caída
  | 'mud'              // Difícil + puede quedar atrapado
  | 'forest'           // Cobertura media + difícil
  | 'dense_forest'     // Cobertura total + muy difícil
  | 'rubble'           // Difícil
  | 'pit'              // Daño de caída, difícil salir
  | 'elevated'         // +2 a ataques a rango
  | 'stairs'           // Cambio de elevación
  | 'wall'             // Bloquea movimiento y visión
  | 'half_wall'        // Bloquea movimiento, cobertura media
  | 'window'           // Cobertura media, permite visión
  | 'door_closed'      // Bloquea hasta que se abra
  | 'door_open'        // No bloquea
  | 'trap_hidden'      // Parece normal hasta activarse
  | 'trap_visible'     // Trampa visible
  | 'magic_field'      // Efectos mágicos especiales
  | 'darkness'         // Oscuridad mágica
  | 'holy_ground'      // Bonus a divinos, daño a undead
  | 'cursed_ground'    // Penalizaciones varias

// Efectos de terreno
export interface TerrainEffect {
  type: TerrainType
  movementCost: number        // 1 = normal, 2 = difícil, Infinity = impassable
  provideCover: 'none' | 'half' | 'three_quarters' | 'full'
  blocksVision: boolean
  blocksMovement: boolean
  damageOnEnter?: {
    dice: string              // "2d6", "1d10", etc.
    type: string              // "fire", "cold", "acid", etc.
  }
  damagePerTurn?: {
    dice: string
    type: string
  }
  conditionOnEnter?: string   // "prone", "restrained", etc.
  elevationChange?: number    // +10, -10, etc (pies)
  specialEffect?: string      // Descripción de efecto especial
}

// Celda de la grilla táctica
export interface TacticalCell {
  x: number
  y: number
  terrain: TerrainType
  elevation: number           // Altura en pies (0 = nivel del suelo)
  isRevealed: boolean         // Para fog of war
  isVisible: boolean          // Actualmente visible por algún token
  isHighlighted: boolean      // Para mostrar rango de movimiento/ataque
  highlightColor?: string     // Color del highlight
  contents: string[]          // IDs de tokens/objetos en esta celda
  notes?: string              // Notas del DM para esta celda
}

// Token de personaje/NPC/objeto
export interface TacticalToken {
  id: string
  name: string
  type: 'player' | 'ally' | 'enemy' | 'neutral' | 'object' | 'hazard'

  // Posición
  x: number
  y: number
  elevation: number
  facing: number              // Dirección en grados (0-360)

  // Tamaño (en celdas)
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'
  sizeInCells: number         // 1, 2, 3, 4, etc.

  // Stats de combate
  hp: number
  maxHp: number
  tempHp: number
  ac: number
  speed: number               // Velocidad base en pies

  // Estado
  conditions: TokenCondition[]
  concentrating?: string      // Nombre del hechizo
  initiative?: number

  // Acciones
  hasMovedThisTurn: boolean
  hasTakenAction: boolean
  hasTakenBonusAction: boolean
  hasReaction: boolean
  movementRemaining: number

  // Visual
  imageUrl?: string
  tokenColor: string
  borderColor: string
  aura?: TokenAura

  // Visión
  visionRange: number         // Rango de visión en pies
  darkvision: number          // Rango de darkvision en pies
  blindsight: number          // Rango de blindsight
  truesight: number           // Rango de truesight
}

// Condiciones de estado
export interface TokenCondition {
  name: string
  icon: string
  duration: number            // -1 = permanente, 0+ = turnos restantes
  source?: string             // Quién/qué causó la condición
  description?: string
}

// Auras de token
export interface TokenAura {
  radius: number              // En pies
  color: string
  opacity: number
  effect?: string             // Descripción del efecto del aura
  affectsAllies: boolean
  affectsEnemies: boolean
}

// Efecto de área (hechizos, habilidades)
export interface AreaEffect {
  id: string
  name: string
  caster: string              // ID del token que lo lanzó

  // Forma
  shape: 'circle' | 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder'

  // Posición y dimensiones
  originX: number
  originY: number
  originElevation: number
  radius?: number             // Para circle/sphere
  length?: number             // Para line/cone
  width?: number              // Para line/cube
  height?: number             // Para cylinder/cube/sphere
  direction?: number          // Dirección en grados (para cone/line)

  // Visual
  color: string
  opacity: number
  animated: boolean
  particleEffect?: 'fire' | 'ice' | 'lightning' | 'poison' | 'radiant' | 'necrotic'

  // Mecánicas
  duration: number            // Turnos restantes, -1 = hasta dispersar
  damagePerTurn?: {
    dice: string
    type: string
  }
  savingThrow?: {
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
    dc: number
    effectOnFail: string
    effectOnSuccess: string
  }
  conditionApplied?: string

  // Terreno
  createsDifficultTerrain: boolean
  blocksVision: boolean
}

// Estado del mapa táctico completo
export interface TacticalMapState {
  id: string
  name: string
  lore: string

  // Configuración de grilla
  gridType: GridType
  gridWidth: number           // Número de celdas
  gridHeight: number
  cellSizeInFeet: number      // Típicamente 5 pies por celda

  // Datos de la grilla
  cells: TacticalCell[][]

  // Tokens
  tokens: TacticalToken[]

  // Efectos activos
  activeEffects: AreaEffect[]

  // Combate
  inCombat: boolean
  currentRound: number
  initiativeOrder: string[]   // IDs de tokens en orden
  currentTurnIndex: number

  // Iluminación
  globalLight: 'bright' | 'dim' | 'dark' | 'magical_darkness'
  lightSources: LightSource[]

  // Fog of war
  fogOfWarEnabled: boolean
  exploredCells: boolean[][]  // Celdas que han sido vistas alguna vez

  // Elementos interactivos
  interactiveElements: InteractiveElement[]

  // Metadatos
  backgroundImage?: string
  ambientSound?: string
  weatherEffect?: 'none' | 'rain' | 'snow' | 'fog' | 'sandstorm'
}

// Fuente de luz
export interface LightSource {
  id: string
  x: number
  y: number
  elevation: number
  brightRadius: number        // Radio de luz brillante en pies
  dimRadius: number           // Radio de luz tenue en pies
  color: string
  intensity: number
  flickering: boolean
  attachedToToken?: string    // ID del token que lleva la luz
}

// Elemento interactivo (puertas, trampas, cofres, etc.)
export interface InteractiveElement {
  id: string
  type: 'door' | 'trap' | 'chest' | 'lever' | 'portal' | 'secret_door' | 'pressure_plate'
  x: number
  y: number

  // Estado
  state: 'closed' | 'open' | 'locked' | 'broken' | 'hidden' | 'triggered' | 'disarmed'

  // Mecánicas
  lockDC?: number             // DC para abrir cerradura
  trapDC?: number             // DC para detectar trampa
  disarmDC?: number           // DC para desactivar
  trapDamage?: string         // "3d6 fire" por ejemplo
  trapEffect?: string         // Condición que aplica

  // Interacción
  requiresKey?: string        // ID de item necesario
  linkedTo?: string[]         // IDs de otros elementos que activa

  // Visual
  imageOpen?: string
  imageClosed?: string
  hidden: boolean             // Solo visible para el DM
}

// Resultado de cálculo de movimiento
export interface MovementResult {
  path: GridCoord[]
  totalCost: number
  canReach: boolean
  blockedBy?: string          // Razón si no puede llegar
}

// Resultado de línea de visión
export interface LineOfSightResult {
  hasLineOfSight: boolean
  distance: number
  cover: 'none' | 'half' | 'three_quarters' | 'full'
  blockedBy?: GridCoord       // Primera celda que bloquea
}

// Resultado de ataque
export interface AttackResult {
  hit: boolean
  critical: boolean
  roll: number
  modifier: number
  total: number
  targetAC: number
  damage?: {
    dice: string
    roll: number
    modifier: number
    total: number
    type: string
  }
  effectsApplied?: string[]
}

// Constantes de tamaño de token
export const TOKEN_SIZES: Record<TacticalToken['size'], { cells: number; reach: number }> = {
  tiny: { cells: 0.5, reach: 0 },
  small: { cells: 1, reach: 5 },
  medium: { cells: 1, reach: 5 },
  large: { cells: 2, reach: 5 },
  huge: { cells: 3, reach: 10 },
  gargantuan: { cells: 4, reach: 15 },
}

// Efectos de terreno predefinidos
export const TERRAIN_EFFECTS: Record<TerrainType, TerrainEffect> = {
  normal: {
    type: 'normal',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
  },
  difficult: {
    type: 'difficult',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
  },
  water_shallow: {
    type: 'water_shallow',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Apaga fuego, puede mojar objetos',
  },
  water_deep: {
    type: 'water_deep',
    movementCost: 3,
    provideCover: 'half',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Requiere nadar (Athletics check)',
  },
  lava: {
    type: 'lava',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    damageOnEnter: { dice: '10d10', type: 'fire' },
    damagePerTurn: { dice: '10d10', type: 'fire' },
  },
  ice: {
    type: 'ice',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'DEX save DC 10 o caer prone',
  },
  mud: {
    type: 'mud',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'STR save DC 10 o quedar restrained',
  },
  forest: {
    type: 'forest',
    movementCost: 2,
    provideCover: 'half',
    blocksVision: false,
    blocksMovement: false,
  },
  dense_forest: {
    type: 'dense_forest',
    movementCost: 3,
    provideCover: 'three_quarters',
    blocksVision: true,
    blocksMovement: false,
  },
  rubble: {
    type: 'rubble',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
  },
  pit: {
    type: 'pit',
    movementCost: 3,
    provideCover: 'three_quarters',
    blocksVision: false,
    blocksMovement: false,
    damageOnEnter: { dice: '1d6', type: 'bludgeoning' },
    specialEffect: 'Requiere Athletics check DC 10 para salir',
  },
  elevated: {
    type: 'elevated',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    elevationChange: 10,
    specialEffect: '+2 a ataques a distancia desde aquí',
  },
  stairs: {
    type: 'stairs',
    movementCost: 2,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    elevationChange: 10,
  },
  wall: {
    type: 'wall',
    movementCost: Infinity,
    provideCover: 'full',
    blocksVision: true,
    blocksMovement: true,
  },
  half_wall: {
    type: 'half_wall',
    movementCost: Infinity,
    provideCover: 'half',
    blocksVision: false,
    blocksMovement: true,
  },
  window: {
    type: 'window',
    movementCost: 2,
    provideCover: 'half',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Puede romperse con ataque',
  },
  door_closed: {
    type: 'door_closed',
    movementCost: Infinity,
    provideCover: 'full',
    blocksVision: true,
    blocksMovement: true,
    specialEffect: 'Puede abrirse con acción',
  },
  door_open: {
    type: 'door_open',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
  },
  trap_hidden: {
    type: 'trap_hidden',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Se activa al pisar (Perception DC 15 para detectar)',
  },
  trap_visible: {
    type: 'trap_visible',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Trampa visible - puede evitarse o desactivarse',
  },
  magic_field: {
    type: 'magic_field',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Efecto mágico especial definido por el DM',
  },
  darkness: {
    type: 'darkness',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: true,
    blocksMovement: false,
    specialEffect: 'Oscuridad mágica - ni darkvision funciona',
  },
  holy_ground: {
    type: 'holy_ground',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    specialEffect: 'Undead y fiends tienen desventaja en ataques',
  },
  cursed_ground: {
    type: 'cursed_ground',
    movementCost: 1,
    provideCover: 'none',
    blocksVision: false,
    blocksMovement: false,
    damagePerTurn: { dice: '1d4', type: 'necrotic' },
    specialEffect: 'Healing reducido a la mitad',
  },
}

// Condiciones estándar de D&D 5e
export const STANDARD_CONDITIONS: Record<string, { icon: string; description: string }> = {
  blinded: { icon: '👁️‍🗨️', description: 'No puede ver, falla checks de visión, desventaja en ataques, ataques contra tienen ventaja' },
  charmed: { icon: '💕', description: 'No puede atacar al encantador, encantador tiene ventaja en checks sociales' },
  deafened: { icon: '🔇', description: 'No puede oír, falla checks de audición' },
  frightened: { icon: '😨', description: 'Desventaja mientras pueda ver la fuente del miedo, no puede acercarse voluntariamente' },
  grappled: { icon: '🤝', description: 'Velocidad 0, termina si el grappler está incapacitado o es alejado' },
  incapacitated: { icon: '💫', description: 'No puede tomar acciones ni reacciones' },
  invisible: { icon: '👻', description: 'Imposible de ver sin magia, muy oculto, ventaja en ataques, ataques contra tienen desventaja' },
  paralyzed: { icon: '⚡', description: 'Incapacitado, no puede moverse ni hablar, falla saves de STR y DEX, ataques tienen ventaja, crítico automático en melee' },
  petrified: { icon: '🗿', description: 'Transformado en piedra, incapacitado, resistencia a todo daño, no envejece' },
  poisoned: { icon: '🤢', description: 'Desventaja en ataques y checks de habilidad' },
  prone: { icon: '🛏️', description: 'Solo puede arrastrarse, desventaja en ataques, ataques melee tienen ventaja, ataques ranged tienen desventaja' },
  restrained: { icon: '⛓️', description: 'Velocidad 0, desventaja en ataques y saves de DEX, ataques contra tienen ventaja' },
  stunned: { icon: '💥', description: 'Incapacitado, no puede moverse, habla entrecortada, falla saves de STR y DEX, ataques tienen ventaja' },
  unconscious: { icon: '😴', description: 'Incapacitado, no puede moverse ni hablar, no percibe, suelta objetos, cae prone, falla saves, ataques tienen ventaja, crítico en melee' },
  exhaustion_1: { icon: '😓', description: 'Desventaja en checks de habilidad' },
  exhaustion_2: { icon: '😩', description: 'Velocidad reducida a la mitad' },
  exhaustion_3: { icon: '😫', description: 'Desventaja en ataques y saves' },
  exhaustion_4: { icon: '🥵', description: 'HP máximo reducido a la mitad' },
  exhaustion_5: { icon: '💀', description: 'Velocidad 0' },
  exhaustion_6: { icon: '☠️', description: 'Muerte' },
  concentrating: { icon: '🧘', description: 'Concentrándose en un hechizo' },
  hidden: { icon: '🥷', description: 'Oculto de enemigos' },
  dodging: { icon: '🏃', description: 'Acción de esquivar activa' },
  helping: { icon: '🤲', description: 'Ayudando a un aliado' },
  readied: { icon: '⏱️', description: 'Tiene una acción preparada' },
}
