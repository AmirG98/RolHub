// Generador de submapas tipo fortaleza/castillo
// Genera estructuras defensivas con murallas, torres, patios y edificios internos

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

// Tipos de áreas en fortaleza
type StrongholdNodeType = Extract<SubmapNodeType, 'wall' | 'tower' | 'courtyard' | 'keep' | 'dungeon_cell' | 'armory' | 'great_hall' | 'gate'>

interface StrongholdConfig {
  width: number
  height: number
  towerCount: number
  hasKeep: boolean
  hasGreatHall: boolean
  hasArmory: boolean
  hasDungeon: boolean
  wallThickness: number
}

// Configuración por nivel de peligro
function getConfigForDanger(dangerLevel: number): Partial<StrongholdConfig> {
  const configs: Record<number, Partial<StrongholdConfig>> = {
    1: { towerCount: 2, hasKeep: false, hasGreatHall: true, hasArmory: false, hasDungeon: false, wallThickness: 20 },
    2: { towerCount: 3, hasKeep: true, hasGreatHall: true, hasArmory: true, hasDungeon: false, wallThickness: 25 },
    3: { towerCount: 4, hasKeep: true, hasGreatHall: true, hasArmory: true, hasDungeon: true, wallThickness: 30 },
    4: { towerCount: 5, hasKeep: true, hasGreatHall: true, hasArmory: true, hasDungeon: true, wallThickness: 35 },
    5: { towerCount: 6, hasKeep: true, hasGreatHall: true, hasArmory: true, hasDungeon: true, wallThickness: 40 },
  }
  return configs[Math.min(Math.max(dangerLevel, 1), 5)]
}

export class StrongholdGenerator {
  private config: StrongholdConfig
  private random: SeededRandom
  private nodes: SubmapNode[] = []
  private connections: SubmapConnection[] = []
  private lore: Lore
  private locationId: string
  private locationName: string

  constructor(generatorConfig: SubmapGeneratorConfig) {
    const dangerConfig = getConfigForDanger(generatorConfig.dangerLevel)

    this.config = {
      width: generatorConfig.width || 800,
      height: generatorConfig.height || 600,
      towerCount: dangerConfig.towerCount || 4,
      hasKeep: dangerConfig.hasKeep ?? true,
      hasGreatHall: dangerConfig.hasGreatHall ?? true,
      hasArmory: dangerConfig.hasArmory ?? false,
      hasDungeon: dangerConfig.hasDungeon ?? false,
      wallThickness: dangerConfig.wallThickness || 30,
    }

    const seed = generatorConfig.seed ?? stringToSeed(`${generatorConfig.locationId}-${generatorConfig.lore}`)
    this.random = new SeededRandom(seed)
    this.lore = generatorConfig.lore
    this.locationId = generatorConfig.locationId
    this.locationName = generatorConfig.locationName
  }

  generate(): Submap {
    const margin = 50
    const innerMargin = margin + this.config.wallThickness + 20

    // 1. Crear puerta principal (entrada)
    this.createGate(margin)

    // 2. Crear torres en las esquinas y puntos intermedios
    this.createTowers(margin)

    // 3. Crear murallas conectando las torres
    this.createWalls()

    // 4. Crear patio central
    this.createCourtyard(innerMargin)

    // 5. Crear edificios internos
    if (this.config.hasKeep) this.createKeep(innerMargin)
    if (this.config.hasGreatHall) this.createGreatHall(innerMargin)
    if (this.config.hasArmory) this.createArmory(innerMargin)
    if (this.config.hasDungeon) this.createDungeon(innerMargin)

    // 6. Conectar todo
    this.createInternalConnections()

    const entrance = this.nodes.find(n => n.type === 'gate')?.id || this.nodes[0]?.id || 'strong-0'
    const objectives = this.nodes
      .filter(n => n.type === 'keep' || n.type === 'great_hall')
      .map(n => n.id)

    return {
      id: `submap-${this.locationId}`,
      locationId: this.locationId,
      locationName: this.locationName,
      lore: this.lore,
      type: 'stronghold',
      seed: this.random['seed'],
      width: this.config.width,
      height: this.config.height,
      nodes: this.nodes,
      connections: this.connections,
      entrance,
      objectives: objectives.length > 0 ? objectives : [entrance],
      playerNodeId: entrance,
    }
  }

  private createGate(margin: number): void {
    // Puerta en el centro del muro sur
    const x = this.config.width / 2
    const y = this.config.height - margin

    this.createNode(x, y, 'gate', 80, 50, true, false)
  }

  private createTowers(margin: number): void {
    const positions: Array<{ x: number; y: number }> = []

    // Torres en las 4 esquinas
    positions.push({ x: margin, y: margin })
    positions.push({ x: this.config.width - margin, y: margin })
    positions.push({ x: margin, y: this.config.height - margin })
    positions.push({ x: this.config.width - margin, y: this.config.height - margin })

    // Torres adicionales en los puntos medios si hay más de 4
    if (this.config.towerCount > 4) {
      positions.push({ x: this.config.width / 2, y: margin }) // Norte
    }
    if (this.config.towerCount > 5) {
      positions.push({ x: margin, y: this.config.height / 2 }) // Oeste
      positions.push({ x: this.config.width - margin, y: this.config.height / 2 }) // Este
    }

    // Crear las torres necesarias
    const towersToCreate = Math.min(this.config.towerCount, positions.length)
    for (let i = 0; i < towersToCreate; i++) {
      this.createNode(positions[i].x, positions[i].y, 'tower', 60, 60)
    }
  }

  private createWalls(): void {
    // Las murallas son conexiones entre torres
    const towers = this.nodes.filter(n => n.type === 'tower')
    const gate = this.nodes.find(n => n.type === 'gate')

    // Ordenar torres por posición para conectarlas en orden
    const sortedTowers = [...towers].sort((a, b) => {
      // Ordenar en sentido horario desde la esquina superior izquierda
      const angleA = Math.atan2(a.y + a.height / 2 - this.config.height / 2, a.x + a.width / 2 - this.config.width / 2)
      const angleB = Math.atan2(b.y + b.height / 2 - this.config.height / 2, b.x + b.width / 2 - this.config.width / 2)
      return angleA - angleB
    })

    // Conectar torres consecutivas
    for (let i = 0; i < sortedTowers.length; i++) {
      const current = sortedTowers[i]
      const next = sortedTowers[(i + 1) % sortedTowers.length]

      // Si la puerta está en este segmento, conectar torre-puerta y puerta-torre
      if (gate && this.isGateBetween(current, next, gate)) {
        this.createWallConnection(current, gate)
        this.createWallConnection(gate, next)
      } else {
        this.createWallConnection(current, next)
      }
    }
  }

  private isGateBetween(tower1: SubmapNode, tower2: SubmapNode, gate: SubmapNode): boolean {
    // Verificar si la puerta está entre dos torres (aproximadamente en el mismo eje)
    const gateY = gate.y + gate.height / 2
    const tower1Y = tower1.y + tower1.height / 2
    const tower2Y = tower2.y + tower2.height / 2

    // La puerta está en el muro sur, así que verificar si ambas torres están en el sur
    const threshold = this.config.height * 0.3
    return Math.abs(gateY - tower1Y) < threshold && Math.abs(gateY - tower2Y) < threshold
  }

  private createWallConnection(from: SubmapNode, to: SubmapNode): void {
    from.connections.push(to.id)
    to.connections.push(from.id)

    this.connections.push({
      id: `wall-${from.id}-${to.id}`,
      fromId: from.id,
      toId: to.id,
      points: [
        { x: from.x + from.width / 2, y: from.y + from.height / 2 },
        { x: to.x + to.width / 2, y: to.y + to.height / 2 },
      ],
      style: 'corridor', // Estilo de muralla
      discovered: true,
    })
  }

  private createCourtyard(innerMargin: number): void {
    // Patio central grande
    const x = this.config.width / 2
    const y = this.config.height / 2 + 30 // Ligeramente hacia el sur

    this.createNode(x, y, 'courtyard', 150, 120)
  }

  private createKeep(innerMargin: number): void {
    // Torreón principal al norte del patio
    const x = this.config.width / 2
    const y = innerMargin + 60

    this.createNode(x, y, 'keep', 100, 80, false, true)
  }

  private createGreatHall(innerMargin: number): void {
    // Gran salón al este del patio
    const x = this.config.width - innerMargin - 80
    const y = this.config.height / 2

    this.createNode(x, y, 'great_hall', 90, 110, false, true)
  }

  private createArmory(innerMargin: number): void {
    // Armería al oeste del patio
    const x = innerMargin + 50
    const y = this.config.height / 2 - 30

    this.createNode(x, y, 'armory', 70, 60)
  }

  private createDungeon(innerMargin: number): void {
    // Mazmorras bajo el torreón (representado junto a él)
    const x = innerMargin + 50
    const y = innerMargin + 60

    this.createNode(x, y, 'dungeon_cell', 60, 60)
  }

  private createInternalConnections(): void {
    // Conectar edificios internos al patio
    const courtyard = this.nodes.find(n => n.type === 'courtyard')
    const gate = this.nodes.find(n => n.type === 'gate')
    const internalBuildings = this.nodes.filter(n =>
      n.type === 'keep' || n.type === 'great_hall' || n.type === 'armory' || n.type === 'dungeon_cell'
    )

    if (courtyard) {
      // Conectar puerta al patio
      if (gate) {
        this.createPathConnection(gate, courtyard)
      }

      // Conectar edificios al patio
      for (const building of internalBuildings) {
        this.createPathConnection(courtyard, building)
      }
    }

    // Conectar mazmorra al torreón si ambos existen
    const keep = this.nodes.find(n => n.type === 'keep')
    const dungeon = this.nodes.find(n => n.type === 'dungeon_cell')
    if (keep && dungeon) {
      this.createPathConnection(keep, dungeon, 'stairs')
    }
  }

  private createPathConnection(from: SubmapNode, to: SubmapNode, style: 'path' | 'road' | 'corridor' | 'bridge' | 'stairs' | 'water' = 'path'): void {
    if (from.connections.includes(to.id)) return

    from.connections.push(to.id)
    to.connections.push(from.id)

    this.connections.push({
      id: `path-${from.id}-${to.id}`,
      fromId: from.id,
      toId: to.id,
      points: [
        { x: from.x + from.width / 2, y: from.y + from.height / 2 },
        { x: to.x + to.width / 2, y: to.y + to.height / 2 },
      ],
      style,
      discovered: from.discovered || to.discovered,
    })
  }

  private createNode(
    x: number,
    y: number,
    type: StrongholdNodeType,
    width: number = 60,
    height: number = 60,
    isEntrance: boolean = false,
    isObjective: boolean = false
  ): void {
    const theme = SUBMAP_THEMES[this.lore]
    const names = theme.nodeNames[type] || [`${type} ${this.nodes.length + 1}`]
    const descriptions = theme.descriptions[type] || ['Una estructura de la fortaleza']

    const node: SubmapNode = {
      id: `strong-${this.nodes.length}`,
      name: this.random.pick(names),
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      type,
      description: this.random.pick(descriptions),
      connections: [],
      isEntrance,
      isObjective,
      discovered: isEntrance || type === 'tower' || type === 'gate',
      visited: false,
    }

    this.nodes.push(node)
  }
}

// Función helper para generar submapa de fortaleza
export function generateStrongholdSubmap(config: SubmapGeneratorConfig): Submap {
  const generator = new StrongholdGenerator(config)
  return generator.generate()
}
