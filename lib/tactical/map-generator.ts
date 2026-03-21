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

export default generateTacticalMap
