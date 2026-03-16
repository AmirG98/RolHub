// Generador de submapas tipo wilderness
// Genera áreas naturales con puntos de interés dispersos y caminos orgánicos

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

// Tipos de áreas en wilderness
type WildernessNodeType = Extract<SubmapNodeType, 'clearing' | 'path' | 'camp' | 'cave_entrance' | 'river_crossing' | 'ruins' | 'grove'>

interface WildernessConfig {
  width: number
  height: number
  poiCount: number        // Puntos de interés
  pathComplexity: number  // Cuántos caminos adicionales
  hasCamp: boolean        // ¿Hay campamento seguro?
  hasCave: boolean        // ¿Hay entrada a cueva?
  hasRuins: boolean       // ¿Hay ruinas?
  hasRiver: boolean       // ¿Hay río?
}

// Configuración por nivel de peligro
function getConfigForDanger(dangerLevel: number): Partial<WildernessConfig> {
  const configs: Record<number, Partial<WildernessConfig>> = {
    1: { poiCount: 4, pathComplexity: 1, hasCamp: true, hasCave: false, hasRuins: false, hasRiver: false },
    2: { poiCount: 5, pathComplexity: 2, hasCamp: true, hasCave: true, hasRuins: false, hasRiver: true },
    3: { poiCount: 6, pathComplexity: 2, hasCamp: true, hasCave: true, hasRuins: true, hasRiver: true },
    4: { poiCount: 8, pathComplexity: 3, hasCamp: false, hasCave: true, hasRuins: true, hasRiver: true },
    5: { poiCount: 10, pathComplexity: 4, hasCamp: false, hasCave: true, hasRuins: true, hasRiver: true },
  }
  return configs[Math.min(Math.max(dangerLevel, 1), 5)]
}

export class WildernessGenerator {
  private config: WildernessConfig
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
      poiCount: dangerConfig.poiCount || 5,
      pathComplexity: dangerConfig.pathComplexity || 2,
      hasCamp: dangerConfig.hasCamp ?? true,
      hasCave: dangerConfig.hasCave ?? false,
      hasRuins: dangerConfig.hasRuins ?? false,
      hasRiver: dangerConfig.hasRiver ?? false,
    }

    const seed = generatorConfig.seed ?? stringToSeed(`${generatorConfig.locationId}-${generatorConfig.lore}`)
    this.random = new SeededRandom(seed)
    this.lore = generatorConfig.lore
    this.locationId = generatorConfig.locationId
    this.locationName = generatorConfig.locationName
  }

  generate(): Submap {
    // 1. Crear entrada (siempre un camino en el borde)
    this.createEntrance()

    // 2. Crear puntos de interés especiales
    if (this.config.hasCamp) this.createSpecialPOI('camp')
    if (this.config.hasCave) this.createSpecialPOI('cave_entrance')
    if (this.config.hasRuins) this.createSpecialPOI('ruins')

    // 3. Crear claros y arboledas aleatorios
    this.createRandomPOIs()

    // 4. Crear cruce de río si aplica
    if (this.config.hasRiver) this.createRiverCrossing()

    // 5. Conectar todos los POIs con caminos
    this.createPaths()

    const entrance = this.nodes[0]?.id || 'wild-0'
    const objectives = this.nodes
      .filter(n => n.type === 'cave_entrance' || n.type === 'ruins')
      .map(n => n.id)

    return {
      id: `submap-${this.locationId}`,
      locationId: this.locationId,
      locationName: this.locationName,
      lore: this.lore,
      type: 'wilderness',
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

  private createEntrance(): void {
    // Entrada en el borde sur del mapa
    const x = this.config.width / 2 + this.random.range(-100, 100)
    const y = this.config.height - 60

    this.createNode(x, y, 'path', true, false, true)
  }

  private createSpecialPOI(type: WildernessNodeType): void {
    const pos = this.findGoodPosition()
    const isObjective = type === 'cave_entrance' || type === 'ruins'
    this.createNode(pos.x, pos.y, type, false, isObjective)
  }

  private createRandomPOIs(): void {
    const currentCount = this.nodes.length
    const needed = this.config.poiCount - currentCount

    for (let i = 0; i < needed; i++) {
      const pos = this.findGoodPosition()
      // Alternar entre claros y arboledas
      const type: WildernessNodeType = this.random.chance(0.6) ? 'clearing' : 'grove'
      this.createNode(pos.x, pos.y, type)
    }
  }

  private createRiverCrossing(): void {
    // Cruce de río en algún punto central
    const x = this.config.width / 2 + this.random.range(-150, 150)
    const y = this.config.height / 2 + this.random.range(-100, 100)

    this.createNode(x, y, 'river_crossing')
  }

  private createPaths(): void {
    // Usar algoritmo de árbol de expansión mínima para conectar todos los nodos
    // Simplificado: conectar cada nodo a los más cercanos

    const connected = new Set<string>()
    const toConnect = [...this.nodes]

    if (toConnect.length === 0) return

    // Empezar desde la entrada
    connected.add(toConnect[0].id)
    toConnect.shift()

    while (toConnect.length > 0) {
      let bestNode: SubmapNode | null = null
      let bestConnectedNode: SubmapNode | null = null
      let bestDistance = Infinity

      // Encontrar el nodo más cercano a cualquier nodo ya conectado
      for (const node of toConnect) {
        for (const connectedId of connected) {
          const connectedNode = this.nodes.find(n => n.id === connectedId)!
          const distance = this.distance(node, connectedNode)

          if (distance < bestDistance) {
            bestDistance = distance
            bestNode = node
            bestConnectedNode = connectedNode
          }
        }
      }

      if (bestNode && bestConnectedNode) {
        // Conectar
        this.createConnection(bestConnectedNode, bestNode)
        connected.add(bestNode.id)
        toConnect.splice(toConnect.indexOf(bestNode), 1)
      } else {
        break
      }
    }

    // Agregar caminos adicionales para más complejidad
    for (let i = 0; i < this.config.pathComplexity; i++) {
      const nodeA = this.random.pick(this.nodes)
      const nodeB = this.random.pick(this.nodes.filter(n => n.id !== nodeA.id && !nodeA.connections.includes(n.id)))

      if (nodeB) {
        this.createConnection(nodeA, nodeB)
      }
    }
  }

  private createConnection(from: SubmapNode, to: SubmapNode): void {
    if (from.connections.includes(to.id)) return

    from.connections.push(to.id)
    to.connections.push(from.id)

    // Crear curva suave entre los puntos
    const midX = (from.x + from.width / 2 + to.x + to.width / 2) / 2
    const midY = (from.y + from.height / 2 + to.y + to.height / 2) / 2

    // Agregar variación para hacer el camino más orgánico
    const variation = this.random.range(-30, 30)

    this.connections.push({
      id: `path-${from.id}-${to.id}`,
      fromId: from.id,
      toId: to.id,
      points: [
        { x: from.x + from.width / 2, y: from.y + from.height / 2 },
        { x: midX + variation, y: midY + variation },
        { x: to.x + to.width / 2, y: to.y + to.height / 2 },
      ],
      style: to.type === 'river_crossing' ? 'bridge' : 'path',
      discovered: from.discovered || to.discovered,
    })
  }

  private createNode(
    x: number,
    y: number,
    type: WildernessNodeType,
    isEntrance: boolean = false,
    isObjective: boolean = false,
    startDiscovered: boolean = false
  ): void {
    const theme = SUBMAP_THEMES[this.lore]
    const names = theme.nodeNames[type] || [`${type} ${this.nodes.length + 1}`]
    const descriptions = theme.descriptions[type] || ['Un lugar en la naturaleza']

    // Tamaños variables según tipo
    const sizes: Record<WildernessNodeType, number> = {
      clearing: 80,
      path: 50,
      camp: 70,
      cave_entrance: 60,
      river_crossing: 90,
      ruins: 100,
      grove: 70,
    }

    const size = sizes[type] || 60

    const node: SubmapNode = {
      id: `wild-${this.nodes.length}`,
      name: this.random.pick(names),
      x: x - size / 2,
      y: y - size / 2,
      width: size,
      height: size,
      type,
      description: this.random.pick(descriptions),
      connections: [],
      isEntrance,
      isObjective,
      discovered: startDiscovered || isEntrance,
      visited: false,
    }

    this.nodes.push(node)
  }

  private findGoodPosition(): { x: number; y: number } {
    const margin = 80
    const attempts = 50
    const minDistance = 100

    for (let i = 0; i < attempts; i++) {
      const x = this.random.range(margin, this.config.width - margin)
      const y = this.random.range(margin, this.config.height - margin - 60) // Evitar zona de entrada

      // Verificar que no esté muy cerca de otros nodos
      let tooClose = false
      for (const node of this.nodes) {
        const dist = Math.sqrt(
          Math.pow(x - (node.x + node.width / 2), 2) +
          Math.pow(y - (node.y + node.height / 2), 2)
        )
        if (dist < minDistance) {
          tooClose = true
          break
        }
      }

      if (!tooClose) {
        return { x, y }
      }
    }

    // Fallback: posición aleatoria
    return {
      x: this.random.range(margin, this.config.width - margin),
      y: this.random.range(margin, this.config.height - margin - 60),
    }
  }

  private distance(a: SubmapNode, b: SubmapNode): number {
    return Math.sqrt(
      Math.pow((a.x + a.width / 2) - (b.x + b.width / 2), 2) +
      Math.pow((a.y + a.height / 2) - (b.y + b.height / 2), 2)
    )
  }
}

// Función helper para generar submapa de wilderness
export function generateWildernessSubmap(config: SubmapGeneratorConfig): Submap {
  const generator = new WildernessGenerator(config)
  return generator.generate()
}
