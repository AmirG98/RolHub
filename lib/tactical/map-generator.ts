/**
 * Generador de mapas tácticos de ejemplo
 * Crea mapas procedurales para demos y testing
 */

import {
  TacticalMapState,
  TacticalCell,
  TacticalToken,
  InteractiveElement,
  AreaEffect,
  LightSource,
  TerrainType,
  GridType,
} from './types'

interface MapGeneratorOptions {
  width?: number
  height?: number
  gridType?: GridType
  cellSizeInFeet?: number
  type?: 'dungeon' | 'forest' | 'castle' | 'cavern' | 'arena'
  difficulty?: 'easy' | 'medium' | 'hard'
  includeTokens?: boolean
  includeFogOfWar?: boolean
  includeInteractives?: boolean
  includeEffects?: boolean
}

/**
 * Genera un mapa táctico de ejemplo
 */
export function generateTacticalMap(options: MapGeneratorOptions = {}): TacticalMapState {
  const {
    width = 20,
    height = 15,
    gridType = 'square',
    cellSizeInFeet = 5,
    type = 'dungeon',
    difficulty = 'medium',
    includeTokens = true,
    includeFogOfWar = true,
    includeInteractives = true,
    includeEffects = false,
  } = options

  // Crear celdas base
  const cells = generateCells(width, height, type)

  // Crear tokens
  const tokens = includeTokens ? generateTokens(width, height, difficulty, cells) : []

  // Crear elementos interactivos
  const interactiveElements = includeInteractives ? generateInteractives(width, height, type, cells) : []

  // Crear efectos de área (si están en combate activo)
  const activeEffects = includeEffects ? generateEffects(width, height) : []

  // Crear fuentes de luz
  const lightSources = generateLightSources(width, height, type, cells, interactiveElements)

  // Calcular orden de iniciativa (si hay combate)
  const combatTokens = tokens.filter(t => t.type === 'player' || t.type === 'enemy')
  const initiativeOrder = combatTokens
    .map(t => ({ id: t.id, init: t.initiative || Math.floor(Math.random() * 20) + 1 }))
    .sort((a, b) => b.init - a.init)
    .map(t => t.id)

  return {
    id: `tactical-${Date.now()}`,
    name: getMapName(type),
    lore: 'LOTR',

    gridType,
    gridWidth: width,
    gridHeight: height,
    cellSizeInFeet,

    cells,
    tokens,
    activeEffects,

    inCombat: tokens.some(t => t.type === 'enemy'),
    currentRound: 1,
    initiativeOrder,
    currentTurnIndex: 0,

    globalLight: type === 'cavern' ? 'dark' : type === 'forest' ? 'dim' : 'bright',
    lightSources,

    fogOfWarEnabled: includeFogOfWar,
    exploredCells: cells.map(row => row.map(() => false)),

    interactiveElements,

    weatherEffect: type === 'forest' ? 'fog' : 'none',
  }
}

/**
 * Genera la matriz de celdas según el tipo de mapa
 */
function generateCells(width: number, height: number, type: string): TacticalCell[][] {
  const cells: TacticalCell[][] = []

  for (let y = 0; y < height; y++) {
    const row: TacticalCell[] = []
    for (let x = 0; x < width; x++) {
      const terrain = getTerrainForCell(x, y, width, height, type)

      row.push({
        x,
        y,
        terrain,
        elevation: getElevation(terrain),
        isRevealed: type !== 'cavern', // Cuevas empiezan con fog
        isVisible: true,
        isHighlighted: false,
        contents: [],
      })
    }
    cells.push(row)
  }

  return cells
}

/**
 * Determina el terreno para una celda
 */
function getTerrainForCell(
  x: number,
  y: number,
  width: number,
  height: number,
  type: string
): TerrainType {
  // Bordes siempre son muros (excepto arena)
  if (type !== 'arena' && (x === 0 || x === width - 1 || y === 0 || y === height - 1)) {
    return 'wall'
  }

  switch (type) {
    case 'dungeon':
      return getDungeonTerrain(x, y, width, height)
    case 'forest':
      return getForestTerrain(x, y, width, height)
    case 'castle':
      return getCastleTerrain(x, y, width, height)
    case 'cavern':
      return getCavernTerrain(x, y, width, height)
    case 'arena':
      return getArenaTerrain(x, y, width, height)
    default:
      return 'normal'
  }
}

function getDungeonTerrain(x: number, y: number, width: number, height: number): TerrainType {
  const random = seededRandom(x * 1000 + y)

  // Habitaciones (áreas abiertas)
  const inRoom1 = x >= 3 && x <= 8 && y >= 3 && y <= 7
  const inRoom2 = x >= 12 && x <= 17 && y >= 3 && y <= 7
  const inRoom3 = x >= 7 && x <= 13 && y >= 9 && y <= 13

  if (inRoom1 || inRoom2 || inRoom3) {
    if (random < 0.1) return 'rubble'
    if (random < 0.15) return 'pit'
    return 'normal'
  }

  // Pasillos
  const inHallway = (y >= 5 && y <= 6) || (x >= 10 && x <= 11)
  if (inHallway) {
    if (random < 0.05) return 'trap_hidden'
    return 'normal'
  }

  // Paredes internas
  return 'wall'
}

function getForestTerrain(x: number, y: number, width: number, height: number): TerrainType {
  const random = seededRandom(x * 1000 + y)
  const centerX = width / 2
  const centerY = height / 2
  const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

  // Centro más despejado
  if (distFromCenter < 3) {
    if (random < 0.1) return 'mud'
    return 'normal'
  }

  // Área intermedia - bosque
  if (distFromCenter < 6) {
    if (random < 0.4) return 'forest'
    if (random < 0.5) return 'difficult'
    return 'normal'
  }

  // Borde - bosque denso
  if (random < 0.3) return 'dense_forest'
  if (random < 0.6) return 'forest'
  return 'difficult'
}

function getCastleTerrain(x: number, y: number, width: number, height: number): TerrainType {
  const random = seededRandom(x * 1000 + y)

  // Patio central
  const inCourtyard = x >= 5 && x <= width - 6 && y >= 5 && y <= height - 6
  if (inCourtyard) {
    if (random < 0.05) return 'rubble'
    return 'normal'
  }

  // Torres en las esquinas
  const inTower = (
    (x <= 4 && y <= 4) ||
    (x >= width - 5 && y <= 4) ||
    (x <= 4 && y >= height - 5) ||
    (x >= width - 5 && y >= height - 5)
  )
  if (inTower) {
    if (x === 2 && y === 2) return 'stairs'
    if (x === width - 3 && y === 2) return 'stairs'
    return 'elevated'
  }

  // Muros
  if (x === 1 || x === width - 2 || y === 1 || y === height - 2) {
    if (random < 0.1) return 'window'
    return 'half_wall'
  }

  return 'wall'
}

function getCavernTerrain(x: number, y: number, width: number, height: number): TerrainType {
  const random = seededRandom(x * 1000 + y)
  const noise = perlinNoise(x * 0.3, y * 0.3)

  // Usando ruido para crear cavernas orgánicas
  if (noise > 0.4) return 'wall'

  if (noise > 0.2) {
    if (random < 0.2) return 'rubble'
    if (random < 0.3) return 'pit'
    return 'difficult'
  }

  // Centro abierto
  if (random < 0.1) return 'water_shallow'
  if (random < 0.15) return 'mud'
  return 'normal'
}

function getArenaTerrain(x: number, y: number, width: number, height: number): TerrainType {
  const centerX = width / 2
  const centerY = height / 2
  const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
  const maxDist = Math.min(width, height) / 2

  // Arena circular
  if (distFromCenter > maxDist - 1) return 'wall'
  if (distFromCenter > maxDist - 2) return 'half_wall'

  // Algunos obstáculos en el centro
  if (
    (x === Math.floor(centerX) - 3 && y === Math.floor(centerY)) ||
    (x === Math.floor(centerX) + 3 && y === Math.floor(centerY)) ||
    (x === Math.floor(centerX) && y === Math.floor(centerY) - 3) ||
    (x === Math.floor(centerX) && y === Math.floor(centerY) + 3)
  ) {
    return 'half_wall'
  }

  return 'normal'
}

/**
 * Obtiene la elevación según el terreno
 */
function getElevation(terrain: TerrainType): number {
  switch (terrain) {
    case 'elevated':
    case 'stairs':
      return 10
    case 'pit':
      return -10
    default:
      return 0
  }
}

/**
 * Genera tokens de ejemplo
 */
function generateTokens(
  width: number,
  height: number,
  difficulty: string,
  cells: TacticalCell[][]
): TacticalToken[] {
  const tokens: TacticalToken[] = []

  // Encontrar celdas válidas (no muros)
  const validCells: { x: number; y: number }[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cells[y][x].terrain !== 'wall' && cells[y][x].terrain !== 'half_wall') {
        validCells.push({ x, y })
      }
    }
  }

  // Jugadores (cerca del borde inferior)
  const playerNames = ['Aragorn', 'Legolas', 'Gimli', 'Gandalf']
  const playerTypes = ['Guerrero', 'Arquero', 'Bárbaro', 'Mago']

  for (let i = 0; i < playerNames.length; i++) {
    const startCells = validCells.filter(c => c.y > height - 5)
    if (startCells.length === 0) continue

    const cell = startCells[Math.floor(Math.random() * startCells.length)]

    tokens.push({
      id: `player-${i}`,
      name: playerNames[i],
      type: 'player',
      x: cell.x,
      y: cell.y,
      elevation: cells[cell.y][cell.x].elevation,
      facing: 0,
      size: 'medium',
      sizeInCells: 1,
      hp: 30 + Math.floor(Math.random() * 20),
      maxHp: 50,
      tempHp: 0,
      ac: 15 + Math.floor(Math.random() * 5),
      speed: 30,
      conditions: [],
      hasMovedThisTurn: false,
      hasTakenAction: false,
      hasTakenBonusAction: false,
      hasReaction: true,
      movementRemaining: 30,
      tokenColor: '#2563eb',
      borderColor: '#c9a84c',
      visionRange: 60,
      darkvision: playerTypes[i] === 'Arquero' ? 60 : 0,
      blindsight: 0,
      truesight: playerTypes[i] === 'Mago' ? 30 : 0,
      initiative: 10 + Math.floor(Math.random() * 10),
    })
  }

  // Enemigos según dificultad
  const enemyCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6
  const enemyNames = ['Orco', 'Goblin', 'Troll', 'Espectro', 'Warg', 'Nazgûl']

  for (let i = 0; i < enemyCount; i++) {
    const startCells = validCells.filter(c => c.y < 5)
    if (startCells.length === 0) continue

    const cell = startCells[Math.floor(Math.random() * startCells.length)]
    const enemyType = enemyNames[i % enemyNames.length]
    const isBoss = i === 0 && difficulty === 'hard'

    tokens.push({
      id: `enemy-${i}`,
      name: isBoss ? `${enemyType} Jefe` : enemyType,
      type: 'enemy',
      x: cell.x,
      y: cell.y,
      elevation: cells[cell.y][cell.x].elevation,
      facing: 180,
      size: isBoss ? 'large' : 'medium',
      sizeInCells: isBoss ? 2 : 1,
      hp: isBoss ? 80 : 20 + Math.floor(Math.random() * 20),
      maxHp: isBoss ? 100 : 40,
      tempHp: 0,
      ac: isBoss ? 18 : 12 + Math.floor(Math.random() * 4),
      speed: 30,
      conditions: [],
      hasMovedThisTurn: false,
      hasTakenAction: false,
      hasTakenBonusAction: false,
      hasReaction: true,
      movementRemaining: 30,
      tokenColor: '#dc2626',
      borderColor: '#7f1d1d',
      visionRange: 60,
      darkvision: 60,
      blindsight: 0,
      truesight: 0,
      initiative: 5 + Math.floor(Math.random() * 10),
    })
  }

  return tokens
}

/**
 * Genera elementos interactivos
 */
function generateInteractives(
  width: number,
  height: number,
  type: string,
  cells: TacticalCell[][]
): InteractiveElement[] {
  const elements: InteractiveElement[] = []

  if (type === 'dungeon') {
    // Puertas entre habitaciones
    elements.push({
      id: 'door-1',
      type: 'door',
      x: 9,
      y: 5,
      state: 'closed',
      hidden: false,
    })
    elements.push({
      id: 'door-2',
      type: 'door',
      x: 11,
      y: 8,
      state: 'locked',
      lockDC: 15,
      hidden: false,
    })

    // Cofre del tesoro
    elements.push({
      id: 'chest-1',
      type: 'chest',
      x: 15,
      y: 5,
      state: 'closed',
      hidden: false,
    })

    // Trampa
    elements.push({
      id: 'trap-1',
      type: 'trap',
      x: 10,
      y: 11,
      state: 'hidden',
      trapDC: 14,
      disarmDC: 14,
      trapDamage: '2d6 piercing',
      hidden: true,
    })

    // Palanca
    elements.push({
      id: 'lever-1',
      type: 'lever',
      x: 5,
      y: 5,
      state: 'closed',
      linkedTo: ['door-2'],
      hidden: false,
    })
  }

  if (type === 'castle') {
    // Portal mágico
    elements.push({
      id: 'portal-1',
      type: 'portal',
      x: Math.floor(width / 2),
      y: Math.floor(height / 2),
      state: 'closed',
      hidden: false,
    })

    // Puerta secreta
    elements.push({
      id: 'secret-1',
      type: 'secret_door',
      x: 2,
      y: Math.floor(height / 2),
      state: 'hidden',
      hidden: true,
    })
  }

  return elements
}

/**
 * Genera efectos de área de ejemplo
 */
function generateEffects(width: number, height: number): AreaEffect[] {
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)

  return [
    {
      id: 'effect-1',
      name: 'Bola de Fuego',
      caster: 'player-3',
      shape: 'sphere',
      originX: centerX - 3,
      originY: centerY - 2,
      originElevation: 0,
      radius: 20,
      color: '#ef4444',
      opacity: 0.4,
      animated: true,
      particleEffect: 'fire',
      duration: 1,
      createsDifficultTerrain: false,
      blocksVision: false,
    },
  ]
}

/**
 * Genera fuentes de luz
 */
function generateLightSources(
  width: number,
  height: number,
  type: string,
  cells: TacticalCell[][],
  interactives: InteractiveElement[]
): LightSource[] {
  const lights: LightSource[] = []

  if (type === 'dungeon' || type === 'castle') {
    // Antorchas en las paredes
    const torchPositions = [
      { x: 3, y: 3 },
      { x: 8, y: 3 },
      { x: 12, y: 3 },
      { x: 17, y: 3 },
      { x: 10, y: 10 },
    ]

    torchPositions.forEach((pos, i) => {
      if (pos.x < width && pos.y < height) {
        lights.push({
          id: `torch-${i}`,
          x: pos.x,
          y: pos.y,
          elevation: 5,
          brightRadius: 20,
          dimRadius: 40,
          color: '#ffa500',
          intensity: 1,
          flickering: true,
        })
      }
    })
  }

  // Luz del portal
  const portal = interactives.find(e => e.type === 'portal')
  if (portal && portal.state === 'open') {
    lights.push({
      id: 'portal-light',
      x: portal.x,
      y: portal.y,
      elevation: 3,
      brightRadius: 15,
      dimRadius: 30,
      color: '#8b5cf6',
      intensity: 1.5,
      flickering: false,
    })
  }

  return lights
}

/**
 * Obtiene un nombre temático para el mapa
 */
function getMapName(type: string): string {
  const names: Record<string, string[]> = {
    dungeon: ['Cripta de Moria', 'Catacumbas del Terror', 'Mazmorras de Dol Guldur'],
    forest: ['Bosque de Fangorn', 'Bosque Negro', 'Claro de Lothlórien'],
    castle: ['Torre de Orthanc', 'Ciudadela de Minas Tirith', 'Fortaleza de Helm'],
    cavern: ['Cuevas de Shelob', 'Minas de Khazad-dûm', 'Cavernas de los Trolls'],
    arena: ['Arena de Combate', 'Coliseo de Gondor', 'Ruedo de los Campeones'],
  }

  const typeNames = names[type] || ['Mapa Táctico']
  return typeNames[Math.floor(Math.random() * typeNames.length)]
}

/**
 * Generador de números aleatorios con semilla
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Ruido Perlin simplificado para terreno orgánico
 */
function perlinNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi

  const aa = seededRandom(xi + yi * 57)
  const ab = seededRandom(xi + (yi + 1) * 57)
  const ba = seededRandom((xi + 1) + yi * 57)
  const bb = seededRandom((xi + 1) + (yi + 1) * 57)

  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)

  const x1 = aa + u * (ba - aa)
  const x2 = ab + u * (bb - ab)

  return x1 + v * (x2 - x1)
}

/**
 * Genera un mapa predefinido para demo
 */
export function generateDemoMap(): TacticalMapState {
  return generateTacticalMap({
    width: 20,
    height: 15,
    gridType: 'square',
    type: 'dungeon',
    difficulty: 'medium',
    includeTokens: true,
    includeFogOfWar: true,
    includeInteractives: true,
    includeEffects: true,
  })
}

/**
 * Genera un mapa táctico contextual basado en el CombatTrigger
 * Usa la ubicación, ambiente y características para crear un mapa coherente
 */
export function generateContextualTacticalMap(
  trigger: {
    locationType?: 'city' | 'dungeon' | 'wilderness' | 'building' | 'cave' | 'ship' | 'tower'
    locationName?: string
    environmentFeatures?: string[]
    terrain?: 'dungeon' | 'forest' | 'castle' | 'cavern' | 'arena' | 'ship' | 'tavern' | 'street'
    lightLevel?: 'bright' | 'dim' | 'darkness'
    weatherConditions?: string
    difficulty?: 'easy' | 'medium' | 'hard' | 'deadly'
  },
  playerTokens: TacticalToken[],
  enemyTokens: TacticalToken[]
): TacticalMapState {
  // Mapear locationType a tipo de mapa
  const mapType = getMapTypeFromLocation(trigger.locationType, trigger.terrain)

  // Tamaño basado en cantidad de combatientes
  const totalCombatants = playerTokens.length + enemyTokens.length
  const width = Math.min(25, Math.max(15, 10 + totalCombatants * 2))
  const height = Math.min(20, Math.max(12, 8 + totalCombatants * 2))

  // Generar celdas base
  const cells = generateContextualCells(width, height, mapType, trigger.environmentFeatures || [])

  // Posicionar tokens
  const positionedTokens = positionTokensContextually(
    cells,
    playerTokens,
    enemyTokens,
    width,
    height
  )

  // Generar elementos interactivos basados en features
  const interactiveElements = generateContextualInteractives(
    width,
    height,
    trigger.environmentFeatures || [],
    cells
  )

  // Generar fuentes de luz
  const lightSources = generateContextualLighting(
    width,
    height,
    mapType,
    trigger.lightLevel || 'bright',
    cells
  )

  // Orden de iniciativa
  const initiativeOrder = positionedTokens
    .map(t => ({ id: t.id, init: t.initiative || Math.floor(Math.random() * 20) + 1 }))
    .sort((a, b) => b.init - a.init)
    .map(t => t.id)

  return {
    id: `tactical-contextual-${Date.now()}`,
    name: trigger.locationName || getMapName(mapType),
    lore: 'LOTR',

    gridType: 'square',
    gridWidth: width,
    gridHeight: height,
    cellSizeInFeet: 5,

    cells,
    tokens: positionedTokens,
    activeEffects: [],

    inCombat: true,
    currentRound: 1,
    initiativeOrder,
    currentTurnIndex: 0,

    globalLight: mapLightLevel(trigger.lightLevel) || (mapType === 'cavern' ? 'dark' : 'bright'),
    lightSources,

    fogOfWarEnabled: mapType === 'cavern' || mapType === 'dungeon',
    exploredCells: cells.map(row => row.map(() => mapType !== 'cavern')),

    interactiveElements,

    weatherEffect: getWeatherEffect(trigger.weatherConditions),
  }
}

function getMapTypeFromLocation(
  locationType?: string,
  terrain?: string
): 'dungeon' | 'forest' | 'castle' | 'cavern' | 'arena' | 'tavern' | 'street' {
  if (terrain) {
    return terrain as any
  }

  switch (locationType) {
    case 'dungeon':
    case 'cave':
      return 'cavern'
    case 'city':
    case 'building':
      return 'tavern'
    case 'wilderness':
      return 'forest'
    case 'tower':
      return 'castle'
    default:
      return 'arena'
  }
}

function generateContextualCells(
  width: number,
  height: number,
  mapType: string,
  features: string[]
): TacticalCell[][] {
  const cells: TacticalCell[][] = []

  // Generar base según tipo
  for (let y = 0; y < height; y++) {
    const row: TacticalCell[] = []
    for (let x = 0; x < width; x++) {
      let terrain: TerrainType

      // Bordes son paredes (excepto para algunas ubicaciones)
      if (mapType !== 'forest' && mapType !== 'street' && (x === 0 || x === width - 1 || y === 0 || y === height - 1)) {
        terrain = 'wall'
      } else {
        terrain = getContextualTerrain(x, y, width, height, mapType, features)
      }

      row.push({
        x,
        y,
        terrain,
        elevation: getElevation(terrain),
        isRevealed: mapType !== 'cavern',
        isVisible: true,
        isHighlighted: false,
        contents: [],
      })
    }
    cells.push(row)
  }

  // Añadir features específicas
  placeEnvironmentFeatures(cells, features, width, height)

  return cells
}

function getContextualTerrain(
  x: number,
  y: number,
  width: number,
  height: number,
  mapType: string,
  features: string[]
): TerrainType {
  const random = seededRandom(x * 1000 + y)

  switch (mapType) {
    case 'tavern':
      // Interior de posada/taberna
      if (random < 0.08) return 'difficult' // Mesas
      if (random < 0.12) return 'half_wall' // Columnas/pilares
      return 'normal'

    case 'street':
      // Calle de ciudad
      if (y < 2 || y > height - 3) return 'half_wall' // Edificios a los lados
      if (random < 0.05) return 'difficult' // Carros/barriles
      return 'normal'

    case 'forest':
      return getForestTerrain(x, y, width, height)

    case 'cavern':
      return getCavernTerrain(x, y, width, height)

    case 'castle':
      return getCastleTerrain(x, y, width, height)

    case 'dungeon':
      return getDungeonTerrain(x, y, width, height)

    default:
      return 'normal'
  }
}

function placeEnvironmentFeatures(
  cells: TacticalCell[][],
  features: string[],
  width: number,
  height: number
): void {
  const featurePositions: { x: number; y: number; terrain: TerrainType }[] = []

  for (const feature of features) {
    const featureLower = feature.toLowerCase()

    // Mesas
    if (featureLower.includes('mesa') || featureLower.includes('table')) {
      // Colocar algunas mesas
      for (let i = 0; i < 3; i++) {
        const x = 3 + Math.floor(seededRandom(i * 100) * (width - 6))
        const y = 3 + Math.floor(seededRandom(i * 200) * (height - 6))
        featurePositions.push({ x, y, terrain: 'difficult' })
      }
    }

    // Bar/Barra
    if (featureLower.includes('bar') || featureLower.includes('barra')) {
      // Barra a lo largo de un lado
      for (let x = 2; x < width / 2; x++) {
        featurePositions.push({ x, y: 2, terrain: 'half_wall' })
      }
    }

    // Escaleras
    if (featureLower.includes('escaler') || featureLower.includes('stair')) {
      featurePositions.push({ x: width - 3, y: height - 3, terrain: 'stairs' })
    }

    // Chimenea - usamos magic_field para representar fuego en chimenea
    if (featureLower.includes('chimenea') || featureLower.includes('fireplace')) {
      featurePositions.push({ x: Math.floor(width / 2), y: 1, terrain: 'magic_field' })
    }

    // Agua
    if (featureLower.includes('agua') || featureLower.includes('fuente') || featureLower.includes('water')) {
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      featurePositions.push({ x: centerX, y: centerY, terrain: 'water_shallow' })
    }

    // Árboles/Rocas
    if (featureLower.includes('árbol') || featureLower.includes('tree') || featureLower.includes('roca')) {
      for (let i = 0; i < 5; i++) {
        const x = 2 + Math.floor(seededRandom(i * 300) * (width - 4))
        const y = 2 + Math.floor(seededRandom(i * 400) * (height - 4))
        featurePositions.push({ x, y, terrain: 'forest' })
      }
    }
  }

  // Aplicar features a las celdas
  for (const pos of featurePositions) {
    if (pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < cells.length) {
      const cell = cells[pos.y][pos.x]
      if (cell.terrain !== 'wall') {
        cell.terrain = pos.terrain
      }
    }
  }
}

function positionTokensContextually(
  cells: TacticalCell[][],
  players: TacticalToken[],
  enemies: TacticalToken[],
  width: number,
  height: number
): TacticalToken[] {
  const tokens: TacticalToken[] = []

  // Encontrar celdas válidas
  const validCells = cells.flatMap((row, y) =>
    row.map((cell, x) => ({ x, y, terrain: cell.terrain }))
      .filter(c => c.terrain === 'normal' || c.terrain === 'difficult')
  )

  const playerArea = validCells.filter(c => c.y > height / 2)
  const enemyArea = validCells.filter(c => c.y < height / 2)

  // Posicionar jugadores
  let usedPositions: { x: number; y: number }[] = []
  for (const player of players) {
    const availablePositions = playerArea.filter(
      p => !usedPositions.some(u => u.x === p.x && u.y === p.y)
    )
    if (availablePositions.length > 0) {
      const pos = availablePositions[Math.floor(Math.random() * availablePositions.length)]
      tokens.push({
        ...player,
        x: pos.x,
        y: pos.y,
        elevation: cells[pos.y][pos.x].elevation,
      })
      usedPositions.push(pos)
    }
  }

  // Posicionar enemigos
  usedPositions = []
  for (const enemy of enemies) {
    const availablePositions = enemyArea.filter(
      p => !usedPositions.some(u => u.x === p.x && u.y === p.y)
    )
    if (availablePositions.length > 0) {
      const pos = availablePositions[Math.floor(Math.random() * availablePositions.length)]
      tokens.push({
        ...enemy,
        x: pos.x,
        y: pos.y,
        elevation: cells[pos.y][pos.x].elevation,
      })
      usedPositions.push(pos)
    }
  }

  return tokens
}

function generateContextualInteractives(
  width: number,
  height: number,
  features: string[],
  cells: TacticalCell[][]
): InteractiveElement[] {
  const elements: InteractiveElement[] = []

  for (const feature of features) {
    const featureLower = feature.toLowerCase()

    // Puertas
    if (featureLower.includes('puerta') || featureLower.includes('door')) {
      elements.push({
        id: `door-${elements.length}`,
        type: 'door',
        x: Math.floor(width / 2),
        y: 0,
        state: 'closed',
        hidden: false,
      })
    }

    // Cofres
    if (featureLower.includes('cofre') || featureLower.includes('chest') || featureLower.includes('tesoro')) {
      elements.push({
        id: `chest-${elements.length}`,
        type: 'chest',
        x: width - 3,
        y: 2,
        state: 'closed',
        hidden: false,
      })
    }

    // Palancas
    if (featureLower.includes('palanca') || featureLower.includes('lever')) {
      elements.push({
        id: `lever-${elements.length}`,
        type: 'lever',
        x: 2,
        y: Math.floor(height / 2),
        state: 'closed',
        hidden: false,
      })
    }
  }

  return elements
}

function generateContextualLighting(
  width: number,
  height: number,
  mapType: string,
  lightLevel: 'bright' | 'dim' | 'darkness',
  cells: TacticalCell[][]
): LightSource[] {
  const lights: LightSource[] = []

  if (lightLevel === 'bright' && mapType === 'forest') {
    // Luz natural
    return []
  }

  if (mapType === 'tavern' || mapType === 'dungeon' || mapType === 'castle') {
    // Antorchas
    const torchPositions = [
      { x: 2, y: 2 },
      { x: width - 3, y: 2 },
      { x: 2, y: height - 3 },
      { x: width - 3, y: height - 3 },
      { x: Math.floor(width / 2), y: Math.floor(height / 2) },
    ]

    torchPositions.forEach((pos, i) => {
      if (pos.x < width && pos.y < height) {
        lights.push({
          id: `torch-${i}`,
          x: pos.x,
          y: pos.y,
          elevation: 5,
          brightRadius: lightLevel === 'darkness' ? 10 : 20,
          dimRadius: lightLevel === 'darkness' ? 20 : 40,
          color: '#ffa500',
          intensity: lightLevel === 'darkness' ? 0.7 : 1,
          flickering: true,
        })
      }
    })
  }

  // Chimenea da luz extra (usamos magic_field para representar chimeneas)
  const fireCell = cells.flatMap((row, y) =>
    row.map((cell, x) => ({ x, y, terrain: cell.terrain }))
  ).find(c => c.terrain === 'magic_field')

  if (fireCell) {
    lights.push({
      id: 'fireplace-light',
      x: fireCell.x,
      y: fireCell.y,
      elevation: 0,
      brightRadius: 15,
      dimRadius: 30,
      color: '#ff6b35',
      intensity: 1.2,
      flickering: true,
    })
  }

  return lights
}

/**
 * Mapea los niveles de luz del CombatTrigger a los tipos de globalLight de TacticalMapState
 */
function mapLightLevel(lightLevel?: 'bright' | 'dim' | 'darkness'): 'bright' | 'dim' | 'dark' | 'magical_darkness' | undefined {
  if (!lightLevel) return undefined

  switch (lightLevel) {
    case 'bright': return 'bright'
    case 'dim': return 'dim'
    case 'darkness': return 'dark'
    default: return undefined
  }
}

function getWeatherEffect(weather?: string): 'none' | 'rain' | 'snow' | 'fog' | 'sandstorm' {
  if (!weather) return 'none'

  const weatherLower = weather.toLowerCase()
  if (weatherLower.includes('lluv') || weatherLower.includes('rain')) return 'rain'
  if (weatherLower.includes('niev') || weatherLower.includes('snow')) return 'snow'
  if (weatherLower.includes('niebl') || weatherLower.includes('fog')) return 'fog'
  if (weatherLower.includes('tormenta de arena') || weatherLower.includes('sandstorm')) return 'sandstorm'

  return 'none'
}

export default generateTacticalMap
