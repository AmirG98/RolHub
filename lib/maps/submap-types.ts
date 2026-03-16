// Tipos para el sistema de submapas jerárquicos
// Cada ubicación del mapa mundial puede tener un submapa detallado

import { type Lore, type MapLocation } from './map-config'

// Posición del jugador en el submapa
export interface SubmapPosition {
  worldLocationId: string
  submapNodeId: string
  // Coordenadas dentro del nodo actual (0-1 normalizadas)
  localX: number
  localY: number
}

// Tipos de submapa según el tipo de ubicación
export type SubmapType =
  | 'city'       // Calles, edificios, plazas
  | 'dungeon'    // Habitaciones conectadas (BSP)
  | 'wilderness' // Terreno con puntos de interés
  | 'stronghold' // Murallas, torres, patios
  | 'nautical'   // Muelles, barcos, rutas marítimas

// Mapeo de tipo de ubicación a tipo de submapa
export const LOCATION_TO_SUBMAP: Record<MapLocation['type'], SubmapType> = {
  city: 'city',
  dungeon: 'dungeon',
  wilderness: 'wilderness',
  landmark: 'city',      // Landmarks suelen tener estructura urbana
  danger: 'dungeon',     // Áreas peligrosas como dungeons
  safe: 'city',          // Zonas seguras como pueblos
  mystery: 'wilderness', // Misterios en áreas abiertas
}

// Nodo individual dentro de un submapa
export interface SubmapNode {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: SubmapNodeType
  description: string
  connections: string[]  // IDs de nodos conectados
  isEntrance: boolean    // ¿Es punto de entrada?
  isObjective: boolean   // ¿Es objetivo principal?
  discovered: boolean
  visited: boolean
  content?: SubmapNodeContent
}

// Tipos de nodos según el submapa
export type SubmapNodeType =
  // City nodes
  | 'street' | 'plaza' | 'market' | 'tavern' | 'temple' | 'palace' | 'gate' | 'house' | 'shop'
  // Dungeon nodes
  | 'room' | 'corridor' | 'treasure_room' | 'boss_room' | 'trap_room' | 'safe_room'
  // Wilderness nodes
  | 'clearing' | 'path' | 'camp' | 'cave_entrance' | 'river_crossing' | 'ruins' | 'grove'
  // Stronghold nodes
  | 'wall' | 'tower' | 'courtyard' | 'keep' | 'dungeon_cell' | 'armory' | 'great_hall'
  // Nautical nodes
  | 'dock' | 'ship' | 'warehouse' | 'lighthouse' | 'beach' | 'reef'

// Contenido opcional de un nodo
export interface SubmapNodeContent {
  npcs?: string[]
  items?: string[]
  enemies?: string[]
  interactables?: string[]
  notes?: string  // Notas del DM
}

// Conexión visual entre nodos
export interface SubmapConnection {
  id: string
  fromId: string
  toId: string
  // Puntos de control para curvas Bezier
  points: Array<{ x: number; y: number }>
  style: 'path' | 'road' | 'corridor' | 'bridge' | 'stairs' | 'water'
  discovered: boolean
}

// Submapa completo
export interface Submap {
  id: string
  locationId: string      // ID de la ubicación en el mapa mundial
  locationName: string
  lore: Lore
  type: SubmapType
  seed: number            // Para generación consistente
  width: number
  height: number
  nodes: SubmapNode[]
  connections: SubmapConnection[]
  entrance: string        // ID del nodo de entrada
  objectives: string[]    // IDs de nodos objetivo
  playerNodeId?: string   // Nodo donde está el jugador
}

// Configuración para generar submapas
export interface SubmapGeneratorConfig {
  locationId: string
  locationName: string
  locationType: MapLocation['type']
  description: string
  lore: Lore
  dangerLevel: number     // 1-5, afecta cantidad de peligros
  seed?: number           // Para consistencia
  width?: number
  height?: number
}

// Theming por lore para submapas
export interface SubmapTheme {
  // Nombres temáticos por tipo de nodo
  nodeNames: Partial<Record<SubmapNodeType, string[]>>
  // Descripciones temáticas
  descriptions: Partial<Record<SubmapNodeType, string[]>>
  // Colores específicos
  colors: {
    node: string
    nodeHover: string
    nodeCurrent: string
    connection: string
    entrance: string
    objective: string
  }
}

// Temas por lore
export const SUBMAP_THEMES: Record<Lore, SubmapTheme> = {
  LOTR: {
    nodeNames: {
      street: ['Calle del Rey', 'Sendero de los Hobbits', 'Camino Élfico', 'Vía de los Enanos'],
      plaza: ['Plaza del Árbol Blanco', 'Explanada del Concilio', 'Patio de los Anillos'],
      tavern: ['El Poney Pisador', 'La Última Casa', 'Taberna del Dragón Verde'],
      temple: ['Salón de los Reyes', 'Templo de Eru', 'Santuario de Elbereth'],
      market: ['Mercado de Bree', 'Feria de la Comarca', 'Bazares de Dale'],
      room: ['Cámara de Mithril', 'Salón del Trono', 'Cripta Antigua'],
      clearing: ['Claro de Lothlórien', 'Explanada del Bosque', 'Prado de Ithilien'],
      tower: ['Torre de Vigilancia', 'Atalaya Élfica', 'Bastión del Norte'],
    },
    descriptions: {
      street: ['Piedras antiguas marcan el camino', 'Runas élficas brillan tenuemente'],
      plaza: ['Un árbol milenario domina el centro', 'Estatuas de héroes olvidados'],
      tavern: ['El aroma de cerveza y tabaco de pipa', 'Risas y canciones llenan el aire'],
      room: ['Columnas talladas con historias antiguas', 'La luz de las antorchas parpadea'],
    },
    colors: {
      node: '#C9A84C',
      nodeHover: '#F5C842',
      nodeCurrent: '#FFD700',
      connection: '#8B6914',
      entrance: '#1A3A2A',
      objective: '#8B1A1A',
    },
  },
  ZOMBIES: {
    nodeNames: {
      street: ['Calle Principal', 'Avenida Abandonada', 'Callejón Oscuro', 'Ruta de Evacuación'],
      plaza: ['Plaza del Centro', 'Estacionamiento', 'Parque Urbano'],
      tavern: ['Bar de Mike', 'El Último Refugio', 'Cantina Abandonada'],
      market: ['Supermercado', 'Centro Comercial', 'Almacén de Suministros'],
      room: ['Habitación Segura', 'Oficina', 'Almacén', 'Laboratorio'],
      clearing: ['Zona de Aterrizaje', 'Campo Abierto', 'Terreno Baldío'],
      tower: ['Torre de Control', 'Antena de Comunicaciones', 'Silo de Agua'],
    },
    descriptions: {
      street: ['Vehículos abandonados bloquean el paso', 'Manchas de sangre seca en el asfalto'],
      plaza: ['Tiendas saqueadas rodean la zona', 'Un silencio inquietante'],
      room: ['Barricadas improvisadas en las puertas', 'Provisiones esparcidas por el suelo'],
    },
    colors: {
      node: '#4a4a4a',
      nodeHover: '#666666',
      nodeCurrent: '#228B22',
      connection: '#333333',
      entrance: '#228B22',
      objective: '#cc0000',
    },
  },
  ISEKAI: {
    nodeNames: {
      street: ['Calle del Mercader', 'Avenida del Héroe', 'Sendero del Gremio', 'Callejón de Skills'],
      plaza: ['Plaza del Portal', 'Centro del Reino', 'Punto de Spawn'],
      tavern: ['Taberna del Aventurero', 'Posada de Inicio', 'Guild Hall'],
      temple: ['Templo de la Diosa', 'Altar de Respawn', 'Santuario de Buffs'],
      market: ['Tienda de Items', 'NPC de Misiones', 'Herrero Legendario'],
      room: ['Sala del Tesoro', 'Boss Room', 'Habitación Secreta', 'Punto de Control'],
      clearing: ['Área de Spawn de Mobs', 'Zona de Farmeo', 'Campo de Entrenamiento'],
    },
    descriptions: {
      street: ['¡Hay NPCs con iconos de misión!', 'Un cartel muestra el ranking de aventureros'],
      plaza: ['Cristales de teletransporte brillan', '¡Evento especial en progreso!'],
      room: ['¡Cofre del tesoro detectado!', 'El aura de un boss llena la sala'],
    },
    colors: {
      node: '#ff69b4',
      nodeHover: '#ff8dc7',
      nodeCurrent: '#ffd700',
      connection: '#87ceeb',
      entrance: '#32cd32',
      objective: '#ff4500',
    },
  },
  VIKINGOS: {
    nodeNames: {
      street: ['Senda del Jarl', 'Camino de Guerra', 'Ruta de los Ancestros'],
      plaza: ['Plaza del Thing', 'Campo de Entrenamiento', 'Lugar de Sacrificio'],
      tavern: ['Salón del Hidromiel', 'Casa Larga', 'Hogar del Skald'],
      temple: ['Templo de Odin', 'Altar de Thor', 'Santuario de Freya'],
      market: ['Mercado del Puerto', 'Feria de Esclavos', 'Tiendas de los Herreros'],
      room: ['Cámara del Jarl', 'Cripta del Guerrero', 'Sala del Tesoro'],
      clearing: ['Círculo de Piedras', 'Claro Sagrado', 'Campo de Batalla'],
      tower: ['Atalaya del Fiordo', 'Torre del Vigía', 'Faro del Norte'],
    },
    descriptions: {
      street: ['Runas nórdicas marcan el camino', 'El viento trae cantos de guerra'],
      plaza: ['Estandartes de clanes ondean al viento', 'Guerreros entrenan con hachas'],
      room: ['Armas de héroes caídos decoran las paredes', 'El fuego crepita en el centro'],
    },
    colors: {
      node: '#bdc3c7',
      nodeHover: '#ecf0f1',
      nodeCurrent: '#f39c12',
      connection: '#3498db',
      entrance: '#27ae60',
      objective: '#c0392b',
    },
  },
  STAR_WARS: {
    nodeNames: {
      street: ['Corredor Principal', 'Pasillo de Servicio', 'Hangar Bay', 'Conducto de Escape'],
      plaza: ['Centro de Comando', 'Bahía de Carga', 'Puente de la Nave'],
      tavern: ['Cantina', 'Sala de Descanso', 'Comedor de la Tripulación'],
      temple: ['Templo Jedi', 'Cámara del Consejo', 'Sala de Meditación'],
      market: ['Comerciante de Chatarra', 'Armero', 'Traficante de Información'],
      room: ['Celda de Detención', 'Sala de Máquinas', 'Centro de Control'],
      clearing: ['Superficie del Planeta', 'Zona de Aterrizaje', 'Campo de Batalla'],
      tower: ['Torre de Control', 'Torreta de Defensa', 'Antena de Comunicaciones'],
    },
    descriptions: {
      street: ['Droides de servicio se mueven por los pasillos', 'Pantallas holográficas muestran datos'],
      plaza: ['El zumbido de los hiperdirectores resuena', 'Naves entran y salen del hangar'],
      room: ['Consolas parpadean con advertencias', 'El aire huele a ozono y aceite'],
    },
    colors: {
      node: '#4fc3f7',
      nodeHover: '#81d4fa',
      nodeCurrent: '#ffeb3b',
      connection: '#2196f3',
      entrance: '#4caf50',
      objective: '#f44336',
    },
  },
  CYBERPUNK: {
    nodeNames: {
      street: ['Calle Neón', 'Callejón de los Fixers', 'Avenida Corpo', 'Zona Baja'],
      plaza: ['Plaza del Mercado Negro', 'Hub de Netrunners', 'Centro de Datos'],
      tavern: ['Bar de Afterlife', 'Club de Joytoys', 'Ripperdoc Clandestino'],
      market: ['Tienda de Implantes', 'Vendedor de Armas', 'Hacker de Mercado'],
      room: ['Servidor Central', 'Sala de Seguridad', 'Oficina del CEO'],
      clearing: ['Basurero Tecnológico', 'Zona Desmilitarizada', 'Páramo Urbano'],
      tower: ['Rascacielos Corpo', 'Antena de Red', 'Torre de Vigilancia'],
    },
    descriptions: {
      street: ['Luces de neón parpadean en la niebla', 'Implantes baratos se anuncian en hologramas'],
      plaza: ['Drones de reparto zumban sobre tu cabeza', 'Pantallas gigantes muestran propaganda'],
      room: ['Servidores zumban con datos robados', 'ICE hostil protege los sistemas'],
    },
    colors: {
      node: '#00ffff',
      nodeHover: '#00ffcc',
      nodeCurrent: '#ff00ff',
      connection: '#ff00ff',
      entrance: '#00ff80',
      objective: '#ff0040',
    },
  },
  LOVECRAFT: {
    nodeNames: {
      street: ['Calle de los Susurros', 'Callejón sin Nombre', 'Sendero Imposible'],
      plaza: ['Plaza de la Iglesia', 'Centro del Pueblo', 'Lugar del Ritual'],
      tavern: ['Posada del Viajero', 'Taberna del Puerto', 'Casa de Huéspedes'],
      temple: ['Iglesia Abandonada', 'Altar de los Antiguos', 'Templo Sumergido'],
      market: ['Tienda de Antigüedades', 'Librería de lo Oculto', 'Mercader Extraño'],
      room: ['Biblioteca Prohibida', 'Laboratorio', 'Cripta', 'Cámara de los Ritos'],
      clearing: ['Círculo de Piedras', 'Pantano Brumoso', 'Costa Desolada'],
      tower: ['Faro Abandonado', 'Torre del Observatorio', 'Campanario Siniestro'],
    },
    descriptions: {
      street: ['Las sombras se mueven de formas imposibles', 'El aire huele a sal y a algo más antiguo'],
      plaza: ['Los edificios parecen observarte', 'La geometría no es del todo correcta'],
      room: ['Libros encuadernados en piel desconocida', 'Símbolos que dañan la vista'],
    },
    colors: {
      node: '#8b7355',
      nodeHover: '#a08060',
      nodeCurrent: '#6b4c8c',
      connection: '#4a3a2a',
      entrance: '#3d5c3d',
      objective: '#4a0080',
    },
  },
}

// Función helper para convertir string a seed numérico
export function stringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Función para determinar el tipo de submapa basado en la ubicación
export function getSubmapType(location: MapLocation): SubmapType {
  // Primero verificar por palabras clave en el nombre/descripción
  const nameLower = location.name.toLowerCase()
  const descLower = location.description.toLowerCase()

  // Palabras clave para cada tipo
  const keywords: Record<SubmapType, string[]> = {
    city: ['ciudad', 'pueblo', 'villa', 'aldea', 'capital', 'city', 'town', 'village', 'capital', 'metrópolis', 'distrito'],
    dungeon: ['dungeon', 'mazmorra', 'cueva', 'mina', 'cripta', 'tumba', 'ruinas', 'cave', 'crypt', 'tomb', 'mine', 'catacumbas'],
    wilderness: ['bosque', 'montaña', 'desierto', 'selva', 'pradera', 'forest', 'mountain', 'desert', 'jungle', 'valley', 'paso', 'camino'],
    stronghold: ['castillo', 'fortaleza', 'torre', 'fuerte', 'bastión', 'castle', 'fortress', 'tower', 'fort', 'bastion', 'ciudadela'],
    nautical: ['puerto', 'muelle', 'barco', 'isla', 'costa', 'port', 'harbor', 'ship', 'island', 'coast', 'bahía', 'faro'],
  }

  for (const [type, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (nameLower.includes(word) || descLower.includes(word)) {
        return type as SubmapType
      }
    }
  }

  // Fallback al mapeo por tipo de ubicación
  return LOCATION_TO_SUBMAP[location.type]
}
