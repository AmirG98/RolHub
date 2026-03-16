// Generador de Dungeons Procedural usando BSP (Binary Space Partitioning)
// Este algoritmo divide el espacio recursivamente para crear habitaciones conectadas

import { type Lore } from './map-config'

// Tipos para el dungeon
export interface DungeonRoom {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: RoomType
  content: RoomContent
  connections: string[]
  visited: boolean
  discovered: boolean
}

export interface DungeonCorridor {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  width: number
}

export interface DungeonMap {
  width: number
  height: number
  rooms: DungeonRoom[]
  corridors: DungeonCorridor[]
  entrance: string // ID de la habitación de entrada
  boss: string // ID de la habitación del jefe
  lore: Lore
  level: number
  seed: number
}

export type RoomType =
  | 'entrance'
  | 'corridor'
  | 'treasure'
  | 'monster'
  | 'trap'
  | 'puzzle'
  | 'boss'
  | 'safe'
  | 'shop'
  | 'shrine'
  | 'empty'

export interface RoomContent {
  enemies?: Enemy[]
  treasure?: Treasure[]
  trap?: Trap
  puzzle?: Puzzle
  npc?: string
  description: string
  examined: boolean
}

export interface Enemy {
  id: string
  name: string
  level: number
  hp: number
  defeated: boolean
}

export interface Treasure {
  id: string
  name: string
  value: number
  collected: boolean
}

export interface Trap {
  id: string
  type: string
  damage: number
  disarmed: boolean
  triggered: boolean
}

export interface Puzzle {
  id: string
  description: string
  solution: string
  solved: boolean
}

// Configuración del generador
export interface DungeonConfig {
  width: number
  height: number
  minRoomSize: number
  maxRoomSize: number
  minRooms: number
  maxRooms: number
  corridorWidth: number
  level: number
  lore: Lore
  seed?: number
}

// Nodo BSP para la generación
interface BSPNode {
  x: number
  y: number
  width: number
  height: number
  left?: BSPNode
  right?: BSPNode
  room?: { x: number; y: number; width: number; height: number }
}

// Generador de números aleatorios con seed - EXPORTADO para reutilización
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  // Método para obtener un booleano con probabilidad
  chance(probability: number): boolean {
    return this.next() < probability
  }
}

// Contenido temático por lore
const LORE_CONTENT: Record<Lore, {
  enemies: string[]
  treasures: string[]
  traps: string[]
  puzzles: string[]
  descriptions: Record<RoomType, string[]>
}> = {
  LOTR: {
    enemies: ['Orco', 'Trasgo', 'Troll de las Cavernas', 'Wargo', 'Araña Gigante', 'Espectro'],
    treasures: ['Mithril', 'Espada Élfica', 'Anillo Mágico', 'Pergamino Antiguo', 'Gema de Luz'],
    traps: ['Foso con pinchos', 'Trampa de red', 'Puerta falsa', 'Baldosa de presión'],
    puzzles: ['Acertijo en lengua élfica', 'Puerta de Durin', 'Runas enanas encriptadas'],
    descriptions: {
      entrance: ['Una entrada tallada en la piedra con runas antiguas', 'Un portal custodiado por estatuas de guerreros enanos'],
      corridor: ['Un pasillo húmedo con musgo en las paredes', 'Columnas erosionadas flanquean el camino'],
      treasure: ['Una cámara con cofres de mithril', 'Un altar con ofrendas antiguas'],
      monster: ['Huesos y garras marcan el territorio de algo terrible', 'El aire huele a azufre y muerte'],
      trap: ['El suelo tiene patrones sospechosos', 'Las paredes tienen agujeros diminutos'],
      puzzle: ['Runas brillan en un arco de piedra', 'Una puerta sellada con mecanismo misterioso'],
      boss: ['Una caverna inmensa con un trono de huesos', 'El corazón de la montaña late con maldad'],
      safe: ['Una pequeña capilla con luz cálida', 'Un refugio escondido con provisiones'],
      shop: ['Un enano mercader ha establecido puesto aquí', 'Mercancías de dudosa procedencia'],
      shrine: ['Un altar a los Valar emana paz', 'Estatuas élficas contemplan desde las sombras'],
      empty: ['Una cámara vacía y polvorienta', 'Solo ecos responden a tus pasos'],
    },
  },
  ZOMBIES: {
    enemies: ['Zombie', 'Corredor', 'Spitter', 'Tank', 'Horda Pequeña', 'Infectado Especial'],
    treasures: ['Kit médico', 'Munición', 'Arma mejorada', 'Ración MRE', 'Radio funcional'],
    traps: ['Alarma sonora', 'Cable trampa', 'Suelo debilitado', 'Puerta atascada'],
    puzzles: ['Código de puerta de seguridad', 'Generador sin combustible', 'Sistema de ventilación'],
    descriptions: {
      entrance: ['Una puerta de emergencia forzada', 'Barricadas destrozadas bloquean parcialmente la entrada'],
      corridor: ['Manchas de sangre seca en las paredes', 'Luces parpadeantes iluminan el pasillo'],
      treasure: ['Un armario de suministros intacto', 'Cadáveres con equipo útil'],
      monster: ['Sonidos de arrastre vienen de la oscuridad', 'El hedor de la muerte es abrumador'],
      trap: ['Una lata atada con hilo de pescar', 'El suelo cruje peligrosamente'],
      puzzle: ['Un panel electrónico necesita código', 'La puerta está soldada desde dentro'],
      boss: ['Una masa de carne infectada bloquea el paso', 'El nido de la horda principal'],
      safe: ['Una habitación reforzada con puerta de acero', 'Alguien vivió aquí... hace tiempo'],
      shop: ['Un superviviente comercia desde su refugio', 'Intercambio de suministros'],
      shrine: ['Velas encendidas junto a fotos de desaparecidos', 'Un mensaje de esperanza en la pared'],
      empty: ['Oficinas abandonadas con papeles dispersos', 'Todo valor ya fue saqueado'],
    },
  },
  ISEKAI: {
    enemies: ['Slime', 'Goblin', 'Lobo Mágico', 'Esqueleto Guerrero', 'Mimic', 'Mini-Boss'],
    treasures: ['Cristal de Maná', 'Equipo Raro', 'Poción de Nivel', 'Skill Book', 'Oro'],
    traps: ['Trampa de fuego mágico', 'Suelo ilusorio', 'Estatua que dispara', 'Cofre Mimic'],
    puzzles: ['Puzzle de gemas de colores', 'Secuencia mágica', 'Acertijo del guardián'],
    descriptions: {
      entrance: ['¡Dungeon Rango F descubierto!', 'Un portal brillante marca la entrada'],
      corridor: ['Antorchas mágicas iluminan el camino', 'Cristales luminosos en las paredes'],
      treasure: ['¡Cofre del tesoro detectado!', 'Un resplandor dorado emana de la sala'],
      monster: ['¡Encuentro de monstruos!', 'Sombras se mueven en la oscuridad'],
      trap: ['¡Cuidado! Sensación de peligro', 'El suelo tiene símbolos extraños'],
      puzzle: ['Un mecanismo antiguo bloquea el paso', 'Runas de diferentes colores brillan'],
      boss: ['¡BOSS ROOM! Prepárate para la batalla', 'Una presencia poderosa te observa'],
      safe: ['Punto de guardado encontrado', 'Cristal de recuperación disponible'],
      shop: ['¡NPC Mercader! Revisa el inventario', 'Tienda de pociones y equipo'],
      shrine: ['Altar de bendición disponible', 'Estatua de la Diosa otorga buff'],
      empty: ['Habitación explorada', 'Nada de interés aquí'],
    },
  },
  VIKINGOS: {
    enemies: ['Draugr', 'Lobo de Fenrir', 'Troll de Hielo', 'Einherjar Caído', 'Serpiente Gigante'],
    treasures: ['Hacha de guerra', 'Tesoro de oro', 'Hidromiel Mágica', 'Runa de poder', 'Amuleto de Thor'],
    traps: ['Trampa de lanzas', 'Foso con pinchos de hielo', 'Techo que colapsa', 'Runa explosiva'],
    puzzles: ['Altar que requiere sangre', 'Runas a ordenar', 'Prueba de los dioses'],
    descriptions: {
      entrance: ['Un túmulo funerario de un jarl antiguo', 'Puertas de piedra con knotwork vikingo'],
      corridor: ['Paredes con escenas de batalla talladas', 'Antorchas con llamas que no mueren'],
      treasure: ['El tesoro de un rey del mar', 'Armas de guerreros caídos con honor'],
      monster: ['Los muertos no descansan en esta tumba', 'Un guerrero muerto se levanta'],
      trap: ['El suelo tiene grabados de advertencia', 'Las paredes tienen ranuras sospechosas'],
      puzzle: ['Un altar a Odin requiere ofrenda', 'Nueve runas deben ser ordenadas'],
      boss: ['El Draugr señor de esta tumba despierta', 'Un rey no-muerto protege su tesoro'],
      safe: ['Un refugio donde los muertos no entran', 'Símbolos de protección cubren las paredes'],
      shop: ['Un espíritu ofrece intercambio', 'Reliquias por hazañas'],
      shrine: ['Altar a los Aesir', 'Runas de bendición brillan'],
      empty: ['Una cámara funeraria saqueada', 'Huesos sin perturbar en nichos'],
    },
  },
  STAR_WARS: {
    enemies: ['Droide de batalla', 'Stormtrooper', 'Cazarrecompensas', 'Criatura alienígena', 'Droide asesino'],
    treasures: ['Cristal Kyber', 'Créditos Imperiales', 'Datos secretos', 'Arma modificada', 'Holocrón'],
    traps: ['Rayo láser', 'Puerta de seguridad', 'Droide centinela', 'Campo de fuerza'],
    puzzles: ['Terminal encriptado', 'Sistema de seguridad', 'Puerta blindada'],
    descriptions: {
      entrance: ['Compuerta de hangar semiabierta', 'Entrada de servicio a la estación'],
      corridor: ['Pasillos metálicos con luces rojas', 'El zumbido de los sistemas resuena'],
      treasure: ['Cargamento de contrabando', 'Armería imperial abandonada'],
      monster: ['Sonidos de droides patrullando', 'Algo acecha en los conductos'],
      trap: ['Rayos láser cruzan el pasillo', 'Cámaras de seguridad activas'],
      puzzle: ['Un terminal requiere códigos de acceso', 'La puerta está sellada magnéticamente'],
      boss: ['Centro de mando con presencia hostil', 'El comandante te está esperando'],
      safe: ['Cápsula de escape preparada', 'Sala de meditación Jedi'],
      shop: ['Contrabandista con mercancía', 'Droide vendedor automático'],
      shrine: ['Templo Jedi en ruinas', 'Artefactos de la Fuerza'],
      empty: ['Barracas vacías', 'Depósito abandonado'],
    },
  },
  CYBERPUNK: {
    enemies: ['Ganger', 'Drone de seguridad', 'Cyberpsicópata', 'Agente corpo', 'Netrunner hostil'],
    treasures: ['Implante cibernético', 'Eddies', 'Datos valiosos', 'Arma tecnológica', 'Drogas de combate'],
    traps: ['Torretas automáticas', 'ICE hostil', 'Minas láser', 'Gas tóxico'],
    puzzles: ['Firewall corporativo', 'Cerradura biométrica', 'Sistema de seguridad'],
    descriptions: {
      entrance: ['Puerta de servicio de una megacorporación', 'Entrada al submundo de la ciudad'],
      corridor: ['Cables expuestos y luces de neon', 'Paredes cubiertas de graffiti holográfico'],
      treasure: ['Servidor con datos valiosos', 'Alijo de implantes robados'],
      monster: ['Algo se mueve en las sombras cibernéticas', 'El zumbido de servos de combate'],
      trap: ['Torretas apuntan al pasillo', 'El suelo está electrificado'],
      puzzle: ['Terminal necesita hackeo', 'Sistema biométrico bloquea el acceso'],
      boss: ['Centro de operaciones corpo', 'El jefe de la pandilla espera'],
      safe: ['Clínica de ripperdoc clandestina', 'Safe house de fixers'],
      shop: ['Vendedor de implantes de mercado negro', 'Traficante de datos'],
      shrine: ['Altar improvisado a Alt Cunningham', 'Memorial de netrunners caídos'],
      empty: ['Oficina corpo abandonada', 'Apartamento saqueado'],
    },
  },
  LOVECRAFT: {
    enemies: ['Cultista', 'Ghoul', 'Profundo', 'Horror Innombrable', 'Shoggoth menor', 'Mi-Go'],
    treasures: ['Tomo prohibido', 'Artefacto alienígena', 'Reliquia antigua', 'Diario de investigador', 'Símbolo Elder'],
    traps: ['Sello mágico', 'Visión de locura', 'Puerta dimensional', 'Círculo de invocación'],
    puzzles: ['Texto en R\'lyehiano', 'Configuración de estrellas', 'Ritual incompleto'],
    descriptions: {
      entrance: ['Una puerta que no debería existir', 'Escaleras que descienden más de lo posible'],
      corridor: ['La geometría es... incorrecta', 'Las paredes parecen respirar'],
      treasure: ['Libros encuadernados en piel humana', 'Artefactos de civilizaciones imposibles'],
      monster: ['Algo que tu mente rechaza comprender', 'Tentáculos emergen de las sombras'],
      trap: ['Símbolos que dañan la mente', 'El suelo tiene patrones hipnóticos'],
      puzzle: ['Texto que cambia cuando no lo miras', 'Las estrellas deben alinearse'],
      boss: ['Una presencia cósmica te observa', 'El altar central pulsa con vida antinatural'],
      safe: ['Un círculo de protección apenas funciona', 'La única habitación con ángulos normales'],
      shop: ['Un cultista desertor ofrece información', 'Comercio de secretos prohibidos'],
      shrine: ['Altar a los Grandes Antiguos', 'La piedra negra emite susurros'],
      empty: ['Celdas de prisión abandonadas', 'Marcas de garras en todas las superficies'],
    },
  },
}

// Clase principal del generador
export class DungeonGenerator {
  private config: DungeonConfig
  private random: SeededRandom
  private rooms: DungeonRoom[] = []
  private corridors: DungeonCorridor[] = []
  private loreContent: typeof LORE_CONTENT[Lore]

  constructor(config: DungeonConfig) {
    this.config = {
      ...config,
      seed: config.seed ?? Math.floor(Math.random() * 1000000),
    }
    this.random = new SeededRandom(this.config.seed!)
    this.loreContent = LORE_CONTENT[config.lore]
  }

  generate(): DungeonMap {
    // 1. Crear árbol BSP
    const root = this.createBSPTree({
      x: 0,
      y: 0,
      width: this.config.width,
      height: this.config.height,
    })

    // 2. Crear habitaciones en las hojas
    this.createRooms(root)

    // 3. Conectar habitaciones con corredores
    this.createCorridors(root)

    // 4. Asignar tipos y contenido a las habitaciones
    this.assignRoomTypes()
    this.generateRoomContent()

    // 5. Marcar entrada y boss
    const entrance = this.rooms[0].id
    const boss = this.rooms[this.rooms.length - 1].id

    this.rooms[0].type = 'entrance'
    this.rooms[0].discovered = true
    this.rooms[this.rooms.length - 1].type = 'boss'

    return {
      width: this.config.width,
      height: this.config.height,
      rooms: this.rooms,
      corridors: this.corridors,
      entrance,
      boss,
      lore: this.config.lore,
      level: this.config.level,
      seed: this.config.seed!,
    }
  }

  private createBSPTree(node: BSPNode, depth = 0): BSPNode {
    const maxDepth = 4 // Limitar profundidad para controlar número de habitaciones
    const minSize = this.config.minRoomSize * 2

    // Decidir si dividir
    if (depth >= maxDepth || (node.width < minSize && node.height < minSize)) {
      return node
    }

    // Decidir dirección de división
    const splitHorizontal = node.width > node.height
      ? this.random.next() > 0.3
      : this.random.next() > 0.7

    if (splitHorizontal && node.width >= minSize * 2) {
      // División vertical
      const split = this.random.range(
        Math.floor(node.width * 0.3),
        Math.floor(node.width * 0.7)
      )

      node.left = this.createBSPTree({
        x: node.x,
        y: node.y,
        width: split,
        height: node.height,
      }, depth + 1)

      node.right = this.createBSPTree({
        x: node.x + split,
        y: node.y,
        width: node.width - split,
        height: node.height,
      }, depth + 1)
    } else if (!splitHorizontal && node.height >= minSize * 2) {
      // División horizontal
      const split = this.random.range(
        Math.floor(node.height * 0.3),
        Math.floor(node.height * 0.7)
      )

      node.left = this.createBSPTree({
        x: node.x,
        y: node.y,
        width: node.width,
        height: split,
      }, depth + 1)

      node.right = this.createBSPTree({
        x: node.x,
        y: node.y + split,
        width: node.width,
        height: node.height - split,
      }, depth + 1)
    }

    return node
  }

  private createRooms(node: BSPNode): void {
    if (node.left && node.right) {
      this.createRooms(node.left)
      this.createRooms(node.right)
      return
    }

    // Crear habitación en la hoja
    const padding = 2
    const roomWidth = this.random.range(
      this.config.minRoomSize,
      Math.min(this.config.maxRoomSize, node.width - padding * 2)
    )
    const roomHeight = this.random.range(
      this.config.minRoomSize,
      Math.min(this.config.maxRoomSize, node.height - padding * 2)
    )

    const roomX = node.x + this.random.range(padding, node.width - roomWidth - padding)
    const roomY = node.y + this.random.range(padding, node.height - roomHeight - padding)

    node.room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight }

    const room: DungeonRoom = {
      id: `room-${this.rooms.length}`,
      x: roomX,
      y: roomY,
      width: roomWidth,
      height: roomHeight,
      type: 'empty',
      content: { description: '', examined: false },
      connections: [],
      visited: false,
      discovered: false,
    }

    this.rooms.push(room)
  }

  private createCorridors(node: BSPNode): void {
    if (!node.left || !node.right) return

    this.createCorridors(node.left)
    this.createCorridors(node.right)

    // Conectar habitaciones de los dos lados
    const leftRoom = this.getRoom(node.left)
    const rightRoom = this.getRoom(node.right)

    if (leftRoom && rightRoom) {
      this.connectRooms(leftRoom, rightRoom)
    }
  }

  private getRoom(node: BSPNode): DungeonRoom | undefined {
    if (node.room) {
      return this.rooms.find(r =>
        r.x === node.room!.x && r.y === node.room!.y
      )
    }

    if (node.left) {
      const leftRoom = this.getRoom(node.left)
      if (leftRoom) return leftRoom
    }

    if (node.right) {
      return this.getRoom(node.right)
    }

    return undefined
  }

  private connectRooms(room1: DungeonRoom, room2: DungeonRoom): void {
    const center1 = {
      x: room1.x + room1.width / 2,
      y: room1.y + room1.height / 2,
    }
    const center2 = {
      x: room2.x + room2.width / 2,
      y: room2.y + room2.height / 2,
    }

    // Crear corredor en forma de L
    const corridorId = `corridor-${this.corridors.length}`

    if (this.random.next() > 0.5) {
      // Horizontal primero, luego vertical
      this.corridors.push({
        id: `${corridorId}-a`,
        startX: center1.x,
        startY: center1.y,
        endX: center2.x,
        endY: center1.y,
        width: this.config.corridorWidth,
      })
      this.corridors.push({
        id: `${corridorId}-b`,
        startX: center2.x,
        startY: center1.y,
        endX: center2.x,
        endY: center2.y,
        width: this.config.corridorWidth,
      })
    } else {
      // Vertical primero, luego horizontal
      this.corridors.push({
        id: `${corridorId}-a`,
        startX: center1.x,
        startY: center1.y,
        endX: center1.x,
        endY: center2.y,
        width: this.config.corridorWidth,
      })
      this.corridors.push({
        id: `${corridorId}-b`,
        startX: center1.x,
        startY: center2.y,
        endX: center2.x,
        endY: center2.y,
        width: this.config.corridorWidth,
      })
    }

    // Marcar conexión entre habitaciones
    room1.connections.push(room2.id)
    room2.connections.push(room1.id)
  }

  private assignRoomTypes(): void {
    // Distribución de tipos de habitación
    const distribution: Array<{ type: RoomType; weight: number }> = [
      { type: 'monster', weight: 30 },
      { type: 'treasure', weight: 15 },
      { type: 'trap', weight: 15 },
      { type: 'empty', weight: 15 },
      { type: 'safe', weight: 10 },
      { type: 'puzzle', weight: 10 },
      { type: 'shrine', weight: 5 },
    ]

    const totalWeight = distribution.reduce((sum, d) => sum + d.weight, 0)

    // Asignar tipos (excepto primera y última que son entrance y boss)
    for (let i = 1; i < this.rooms.length - 1; i++) {
      let roll = this.random.next() * totalWeight
      for (const { type, weight } of distribution) {
        roll -= weight
        if (roll <= 0) {
          this.rooms[i].type = type
          break
        }
      }
    }
  }

  private generateRoomContent(): void {
    for (const room of this.rooms) {
      // Descripción basada en el lore y tipo
      room.content.description = this.random.pick(
        this.loreContent.descriptions[room.type] || this.loreContent.descriptions.empty
      )

      switch (room.type) {
        case 'monster':
          const numEnemies = this.random.range(1, Math.min(3, this.config.level))
          room.content.enemies = Array.from({ length: numEnemies }, (_, i) => ({
            id: `${room.id}-enemy-${i}`,
            name: this.random.pick(this.loreContent.enemies),
            level: this.random.range(1, this.config.level),
            hp: this.random.range(10, 30) * this.config.level,
            defeated: false,
          }))
          break

        case 'treasure':
          const numTreasures = this.random.range(1, 3)
          room.content.treasure = Array.from({ length: numTreasures }, (_, i) => ({
            id: `${room.id}-treasure-${i}`,
            name: this.random.pick(this.loreContent.treasures),
            value: this.random.range(10, 100) * this.config.level,
            collected: false,
          }))
          break

        case 'trap':
          room.content.trap = {
            id: `${room.id}-trap`,
            type: this.random.pick(this.loreContent.traps),
            damage: this.random.range(5, 15) * this.config.level,
            disarmed: false,
            triggered: false,
          }
          break

        case 'puzzle':
          room.content.puzzle = {
            id: `${room.id}-puzzle`,
            description: this.random.pick(this.loreContent.puzzles),
            solution: 'resolver', // El DM determina la solución real
            solved: false,
          }
          break

        case 'boss':
          room.content.enemies = [{
            id: `${room.id}-boss`,
            name: `Jefe del Dungeon Nivel ${this.config.level}`,
            level: this.config.level + 2,
            hp: 100 * this.config.level,
            defeated: false,
          }]
          room.content.treasure = [{
            id: `${room.id}-boss-treasure`,
            name: 'Tesoro del Jefe',
            value: 500 * this.config.level,
            collected: false,
          }]
          break
      }
    }
  }
}

// Función helper para generar un dungeon
export function generateDungeon(
  lore: Lore,
  level: number = 1,
  seed?: number
): DungeonMap {
  const config: DungeonConfig = {
    width: 800,
    height: 600,
    minRoomSize: 60,
    maxRoomSize: 120,
    minRooms: 5,
    maxRooms: 10,
    corridorWidth: 15,
    level,
    lore,
    seed,
  }

  const generator = new DungeonGenerator(config)
  return generator.generate()
}

// Importar tipos de submap para la conversión
import {
  type Submap,
  type SubmapNode,
  type SubmapConnection,
  type SubmapNodeType,
  SUBMAP_THEMES,
} from './submap-types'

// Mapeo de RoomType a SubmapNodeType
const ROOM_TO_NODE_TYPE: Record<RoomType, SubmapNodeType> = {
  entrance: 'room',
  corridor: 'corridor',
  treasure: 'treasure_room',
  monster: 'room',
  trap: 'trap_room',
  puzzle: 'room',
  boss: 'boss_room',
  safe: 'safe_room',
  shop: 'room',
  shrine: 'room',
  empty: 'room',
}

// Convertir un DungeonMap a formato Submap para visualización unificada
export function dungeonToSubmap(dungeon: DungeonMap, locationId: string, locationName: string): Submap {
  const theme = SUBMAP_THEMES[dungeon.lore]

  // Convertir habitaciones a nodos
  const nodes: SubmapNode[] = dungeon.rooms.map(room => ({
    id: room.id,
    name: theme.nodeNames.room
      ? theme.nodeNames.room[Math.floor(Math.random() * theme.nodeNames.room.length)]
      : room.content.description.slice(0, 30),
    x: room.x,
    y: room.y,
    width: room.width,
    height: room.height,
    type: ROOM_TO_NODE_TYPE[room.type],
    description: room.content.description,
    connections: room.connections,
    isEntrance: room.id === dungeon.entrance,
    isObjective: room.id === dungeon.boss,
    discovered: room.discovered,
    visited: room.visited,
    content: {
      enemies: room.content.enemies?.map(e => e.name),
      items: room.content.treasure?.map(t => t.name),
    },
  }))

  // Convertir corredores a conexiones
  const connections: SubmapConnection[] = dungeon.corridors.map(corridor => ({
    id: corridor.id,
    fromId: corridor.id.split('-')[0] + '-' + corridor.id.split('-')[1], // Extraer room id
    toId: corridor.id,
    points: [
      { x: corridor.startX, y: corridor.startY },
      { x: corridor.endX, y: corridor.endY },
    ],
    style: 'corridor' as const,
    discovered: true,
  }))

  return {
    id: `submap-${locationId}`,
    locationId,
    locationName,
    lore: dungeon.lore,
    type: 'dungeon',
    seed: dungeon.seed,
    width: dungeon.width,
    height: dungeon.height,
    nodes,
    connections,
    entrance: dungeon.entrance,
    objectives: [dungeon.boss],
    playerNodeId: dungeon.entrance,
  }
}

// Generar un submapa tipo dungeon directamente
export function generateDungeonSubmap(
  locationId: string,
  locationName: string,
  lore: Lore,
  dangerLevel: number = 1,
  seed?: number
): Submap {
  const dungeon = generateDungeon(lore, dangerLevel, seed)
  return dungeonToSubmap(dungeon, locationId, locationName)
}
