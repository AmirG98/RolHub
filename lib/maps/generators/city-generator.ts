// Generador de submapas tipo ciudad
// Genera un layout urbano con calles, plazas, edificios y puntos de interés

import { type Lore } from '../map-config'
import { SeededRandom } from '../dungeon-generator'
import {
  type Submap,
  type SubmapNode,
  type SubmapConnection,
  type SubmapNodeType,
  type SubmapGeneratorConfig,
  SUBMAP_THEMES,
  stringToSeed,
} from '../submap-types'

// Tipos de edificios/áreas en una ciudad
type CityNodeType = Extract<SubmapNodeType, 'street' | 'plaza' | 'market' | 'tavern' | 'temple' | 'palace' | 'gate' | 'house' | 'shop'>

interface CityConfig {
  width: number
  height: number
  gridSize: number      // Tamaño de cada celda del grid
  plazaCount: number    // Número de plazas principales
  marketCount: number   // Número de mercados
  tavernCount: number   // Número de tabernas
  templeCount: number   // Número de templos
  hasWalls: boolean     // ¿Tiene murallas?
  hasPalace: boolean    // ¿Tiene palacio/edificio principal?
}

// Configuración por nivel de peligro - SIMPLIFICADA para mejor visualización
function getConfigForDanger(dangerLevel: number): Partial<CityConfig> {
  // Menos nodos, más grandes y claros
  const configs: Record<number, Partial<CityConfig>> = {
    1: { gridSize: 120, plazaCount: 1, marketCount: 1, tavernCount: 1, templeCount: 0, hasWalls: false, hasPalace: false },
    2: { gridSize: 110, plazaCount: 1, marketCount: 1, tavernCount: 1, templeCount: 1, hasWalls: false, hasPalace: false },
    3: { gridSize: 100, plazaCount: 2, marketCount: 1, tavernCount: 1, templeCount: 1, hasWalls: true, hasPalace: false },
    4: { gridSize: 100, plazaCount: 2, marketCount: 1, tavernCount: 2, templeCount: 1, hasWalls: true, hasPalace: true },
    5: { gridSize: 90, plazaCount: 2, marketCount: 2, tavernCount: 2, templeCount: 1, hasWalls: true, hasPalace: true },
  }
  return configs[Math.min(Math.max(dangerLevel, 1), 5)]
}

export class CityGenerator {
  private config: CityConfig
  private random: SeededRandom
  private nodes: SubmapNode[] = []
  private connections: SubmapConnection[] = []
  private grid: (string | null)[][] = []  // Grid para tracking de ocupación
  private lore: Lore
  private locationId: string
  private locationName: string

  constructor(generatorConfig: SubmapGeneratorConfig) {
    const dangerConfig = getConfigForDanger(generatorConfig.dangerLevel)

    this.config = {
      width: generatorConfig.width || 800,
      height: generatorConfig.height || 600,
      gridSize: dangerConfig.gridSize || 60,
      plazaCount: dangerConfig.plazaCount || 1,
      marketCount: dangerConfig.marketCount || 1,
      tavernCount: dangerConfig.tavernCount || 1,
      templeCount: dangerConfig.templeCount || 0,
      hasWalls: dangerConfig.hasWalls || false,
      hasPalace: dangerConfig.hasPalace || false,
    }

    const seed = generatorConfig.seed ?? stringToSeed(`${generatorConfig.locationId}-${generatorConfig.lore}`)
    this.random = new SeededRandom(seed)
    this.lore = generatorConfig.lore
    this.locationId = generatorConfig.locationId
    this.locationName = generatorConfig.locationName

    // Inicializar grid
    const gridCols = Math.floor(this.config.width / this.config.gridSize)
    const gridRows = Math.floor(this.config.height / this.config.gridSize)
    this.grid = Array(gridRows).fill(null).map(() => Array(gridCols).fill(null))
  }

  generate(): Submap {
    // 1. Crear calles principales (cruz central)
    this.createMainStreets()

    // 2. Crear plazas en intersecciones
    this.createPlazas()

    // 3. Colocar edificios especiales
    if (this.config.hasPalace) this.createPalace()
    this.createMarkets()
    this.createTaverns()
    this.createTemples()

    // 4. Crear puertas si hay murallas
    if (this.config.hasWalls) this.createGates()

    // 5. Rellenar con casas y tiendas
    this.fillWithBuildings()

    // 6. Conectar todos los nodos
    this.createConnections()

    // Determinar entrada (primera puerta o primera plaza)
    const entrance = this.nodes.find(n => n.type === 'gate')?.id ||
                    this.nodes.find(n => n.type === 'plaza')?.id ||
                    this.nodes[0]?.id || 'city-0'

    // Determinar objetivo (palacio o templo principal)
    const objectives = this.nodes
      .filter(n => n.type === 'palace' || n.type === 'temple')
      .map(n => n.id)

    return {
      id: `submap-${this.locationId}`,
      locationId: this.locationId,
      locationName: this.locationName,
      lore: this.lore,
      type: 'city',
      seed: this.random['seed'], // Acceder al seed actual
      width: this.config.width,
      height: this.config.height,
      nodes: this.nodes,
      connections: this.connections,
      entrance,
      objectives,
      playerNodeId: entrance,
    }
  }

  private createMainStreets(): void {
    const gridCols = Math.floor(this.config.width / this.config.gridSize)
    const gridRows = Math.floor(this.config.height / this.config.gridSize)
    const centerX = Math.floor(gridCols / 2)
    const centerY = Math.floor(gridRows / 2)

    // Calle horizontal principal
    for (let x = 1; x < gridCols - 1; x++) {
      if (x === centerX) continue // Skip centro para plaza
      this.createNode(x, centerY, 'street')
    }

    // Calle vertical principal
    for (let y = 1; y < gridRows - 1; y++) {
      if (y === centerY) continue // Skip centro para plaza
      this.createNode(centerX, y, 'street')
    }
  }

  private createPlazas(): void {
    const gridCols = Math.floor(this.config.width / this.config.gridSize)
    const gridRows = Math.floor(this.config.height / this.config.gridSize)
    const centerX = Math.floor(gridCols / 2)
    const centerY = Math.floor(gridRows / 2)

    // Plaza central (siempre)
    this.createNode(centerX, centerY, 'plaza', true)

    // Plazas adicionales en cuadrantes
    for (let i = 1; i < this.config.plazaCount; i++) {
      const quadrant = i % 4
      let x: number, y: number

      switch (quadrant) {
        case 0: x = Math.floor(centerX / 2); y = Math.floor(centerY / 2); break
        case 1: x = centerX + Math.floor(centerX / 2); y = Math.floor(centerY / 2); break
        case 2: x = Math.floor(centerX / 2); y = centerY + Math.floor(centerY / 2); break
        default: x = centerX + Math.floor(centerX / 2); y = centerY + Math.floor(centerY / 2); break
      }

      if (this.isGridEmpty(x, y)) {
        this.createNode(x, y, 'plaza')
      }
    }
  }

  private createPalace(): void {
    const gridCols = Math.floor(this.config.width / this.config.gridSize)
    const gridRows = Math.floor(this.config.height / this.config.gridSize)

    // Palacio en la parte superior central
    const x = Math.floor(gridCols / 2)
    const y = 1

    if (this.isGridEmpty(x, y)) {
      this.createNode(x, y, 'palace')
    }
  }

  private createMarkets(): void {
    for (let i = 0; i < this.config.marketCount; i++) {
      const pos = this.findEmptySpot()
      if (pos) {
        this.createNode(pos.x, pos.y, 'market')
      }
    }
  }

  private createTaverns(): void {
    for (let i = 0; i < this.config.tavernCount; i++) {
      const pos = this.findEmptySpot()
      if (pos) {
        this.createNode(pos.x, pos.y, 'tavern')
      }
    }
  }

  private createTemples(): void {
    for (let i = 0; i < this.config.templeCount; i++) {
      const pos = this.findEmptySpot()
      if (pos) {
        this.createNode(pos.x, pos.y, 'temple')
      }
    }
  }

  private createGates(): void {
    const gridCols = Math.floor(this.config.width / this.config.gridSize)
    const gridRows = Math.floor(this.config.height / this.config.gridSize)
    const centerX = Math.floor(gridCols / 2)
    const centerY = Math.floor(gridRows / 2)

    // Puertas en los 4 puntos cardinales
    const gatePositions = [
      { x: centerX, y: 0 },            // Norte
      { x: centerX, y: gridRows - 1 }, // Sur
      { x: 0, y: centerY },            // Oeste
      { x: gridCols - 1, y: centerY }, // Este
    ]

    for (const pos of gatePositions) {
      this.createNode(pos.x, pos.y, 'gate')
    }
  }

  private fillWithBuildings(): void {
    // NO llenamos todo - solo dejamos los edificios importantes
    // Esto crea un mapa más limpio y visual
    // Los edificios ya creados (plazas, mercados, tavernas, templos, etc.) son suficientes
  }

  private createConnections(): void {
    // Conectar nodos adyacentes
    for (const node of this.nodes) {
      const gridX = Math.floor(node.x / this.config.gridSize)
      const gridY = Math.floor(node.y / this.config.gridSize)

      // Buscar vecinos en las 4 direcciones
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ]

      for (const dir of directions) {
        const neighborX = gridX + dir.dx
        const neighborY = gridY + dir.dy

        if (neighborX >= 0 && neighborX < this.grid[0]?.length &&
            neighborY >= 0 && neighborY < this.grid.length) {
          const neighborId = this.grid[neighborY]?.[neighborX]
          if (neighborId && neighborId !== node.id && !node.connections.includes(neighborId)) {
            node.connections.push(neighborId)

            // Crear conexión visual
            const neighbor = this.nodes.find(n => n.id === neighborId)
            if (neighbor) {
              const connectionId = `conn-${node.id}-${neighborId}`
              const reverseId = `conn-${neighborId}-${node.id}`

              // Evitar duplicados
              if (!this.connections.find(c => c.id === connectionId || c.id === reverseId)) {
                this.connections.push({
                  id: connectionId,
                  fromId: node.id,
                  toId: neighborId,
                  points: [
                    { x: node.x + this.config.gridSize / 2, y: node.y + this.config.gridSize / 2 },
                    { x: neighbor.x + this.config.gridSize / 2, y: neighbor.y + this.config.gridSize / 2 },
                  ],
                  style: node.type === 'street' || neighbor.type === 'street' ? 'road' : 'path',
                  discovered: true,
                })
              }
            }
          }
        }
      }
    }
  }

  private createNode(gridX: number, gridY: number, type: CityNodeType, isLarger: boolean = false): void {
    const theme = SUBMAP_THEMES[this.lore]
    const names = theme.nodeNames[type] || [`${type} ${this.nodes.length + 1}`]
    const descriptions = theme.descriptions[type] || ['Un lugar en la ciudad']

    // Tamaños más grandes y diferenciados
    const baseSizes: Partial<Record<CityNodeType, number>> = {
      plaza: 100,
      palace: 90,
      temple: 85,
      market: 80,
      tavern: 75,
      gate: 70,
      street: 65,
      shop: 60,
      house: 55,
    }

    const baseSize = baseSizes[type] || 70
    const size = isLarger ? baseSize * 1.3 : baseSize

    // Centrar en la celda del grid
    const cellCenterX = gridX * this.config.gridSize + this.config.gridSize / 2
    const cellCenterY = gridY * this.config.gridSize + this.config.gridSize / 2

    const node: SubmapNode = {
      id: `city-${this.nodes.length}`,
      name: this.random.pick(names),
      x: cellCenterX - size / 2,
      y: cellCenterY - size / 2,
      width: size,
      height: size,
      type,
      description: this.random.pick(descriptions),
      connections: [],
      isEntrance: type === 'gate',
      isObjective: type === 'palace' || type === 'temple',
      discovered: true, // Todo descubierto por defecto para mejor visualización
      visited: false,
    }

    this.nodes.push(node)

    // Marcar en grid
    if (this.grid[gridY]) {
      this.grid[gridY][gridX] = node.id
    }
  }

  private isGridEmpty(x: number, y: number): boolean {
    return this.grid[y]?.[x] === null
  }

  private findEmptySpot(): { x: number; y: number } | null {
    const gridCols = Math.floor(this.config.width / this.config.gridSize)
    const gridRows = Math.floor(this.config.height / this.config.gridSize)
    const attempts = 50

    for (let i = 0; i < attempts; i++) {
      const x = this.random.range(1, gridCols - 2)
      const y = this.random.range(1, gridRows - 2)
      if (this.isGridEmpty(x, y)) {
        return { x, y }
      }
    }
    return null
  }
}

// Función helper para generar submapa de ciudad
export function generateCitySubmap(config: SubmapGeneratorConfig): Submap {
  const generator = new CityGenerator(config)
  return generator.generate()
}
