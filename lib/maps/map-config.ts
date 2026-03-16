// Configuración de mapas por lore
// Cada lore tiene su estética única para crear inmersión visual

export type Lore = 'LOTR' | 'ZOMBIES' | 'ISEKAI' | 'VIKINGOS' | 'STAR_WARS' | 'CYBERPUNK' | 'LOVECRAFT'

export interface MapLocation {
  id: string
  name: string
  description: string
  type: 'city' | 'dungeon' | 'wilderness' | 'landmark' | 'danger' | 'safe' | 'mystery'
  dangerLevel: number // 1-5
  coordinates: { x: number; y: number }
  connections: string[] // IDs de locaciones conectadas
  icon: string
  discovered: boolean
  visited: boolean
}

export interface LoreMapConfig {
  // Colores principales
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  dangerColor: string
  safeColor: string
  textColor: string

  // Efectos visuales
  fogColor: string
  fogOpacity: number
  glowColor: string
  pathColor: string
  pathStyle: 'solid' | 'dashed' | 'dotted' | 'animated'

  // Tipografía
  fontFamily: string
  titleFontFamily: string

  // Textura de fondo
  backgroundPattern: 'parchment' | 'grid' | 'stars' | 'hexgrid' | 'urban' | 'sepia' | 'neon'

  // Animaciones
  hasAmbientAnimation: boolean
  ambientAnimationType?: 'flicker' | 'stars' | 'scanlines' | 'fog' | 'waves'

  // Iconos por tipo de locación
  icons: {
    city: string
    dungeon: string
    wilderness: string
    landmark: string
    danger: string
    safe: string
    mystery: string
  }

  // Estilo de marcadores
  markerStyle: 'medieval' | 'modern' | 'anime' | 'scifi' | 'gothic' | 'neon' | 'norse'
  markerSize: number
}

export const LORE_MAP_CONFIGS: Record<Lore, LoreMapConfig> = {
  LOTR: {
    backgroundColor: '#F4E8C1',
    primaryColor: '#8B6914',
    secondaryColor: '#2C2416',
    accentColor: '#C9A84C',
    dangerColor: '#8B1A1A',
    safeColor: '#1A3A2A',
    textColor: '#1C1208',

    fogColor: '#D4B896',
    fogOpacity: 0.7,
    glowColor: '#F5C842',
    pathColor: '#8B6914',
    pathStyle: 'solid',

    fontFamily: 'EB Garamond, serif',
    titleFontFamily: 'Cinzel Decorative, serif',

    backgroundPattern: 'parchment',
    hasAmbientAnimation: true,
    ambientAnimationType: 'flicker',

    icons: {
      city: '🏰',
      dungeon: '⚔️',
      wilderness: '🌲',
      landmark: '⛰️',
      danger: '💀',
      safe: '🏠',
      mystery: '❓',
    },

    markerStyle: 'medieval',
    markerSize: 32,
  },

  ZOMBIES: {
    backgroundColor: '#1a1a1a',
    primaryColor: '#4a4a4a',
    secondaryColor: '#2d2d2d',
    accentColor: '#ff4444',
    dangerColor: '#cc0000',
    safeColor: '#228B22',
    textColor: '#cccccc',

    fogColor: '#333333',
    fogOpacity: 0.8,
    glowColor: '#ff6666',
    pathColor: '#666666',
    pathStyle: 'dashed',

    fontFamily: 'Courier Prime, monospace',
    titleFontFamily: 'Courier Prime, monospace',

    backgroundPattern: 'urban',
    hasAmbientAnimation: false,

    icons: {
      city: '🏚️',
      dungeon: '🏥',
      wilderness: '🌾',
      landmark: '📡',
      danger: '☠️',
      safe: '🏕️',
      mystery: '❔',
    },

    markerStyle: 'modern',
    markerSize: 28,
  },

  ISEKAI: {
    backgroundColor: '#e8f4fc',
    primaryColor: '#ff69b4',
    secondaryColor: '#87ceeb',
    accentColor: '#ffd700',
    dangerColor: '#ff4500',
    safeColor: '#32cd32',
    textColor: '#333333',

    fogColor: '#ffffff',
    fogOpacity: 0.5,
    glowColor: '#ffff00',
    pathColor: '#ff69b4',
    pathStyle: 'dotted',

    fontFamily: 'system-ui, sans-serif',
    titleFontFamily: 'system-ui, sans-serif',

    backgroundPattern: 'grid',
    hasAmbientAnimation: true,
    ambientAnimationType: 'stars',

    icons: {
      city: '👑',
      dungeon: '⚔️',
      wilderness: '🌸',
      landmark: '✨',
      danger: '🐉',
      safe: '🏡',
      mystery: '🔮',
    },

    markerStyle: 'anime',
    markerSize: 36,
  },

  VIKINGOS: {
    backgroundColor: '#2c3e50',
    primaryColor: '#bdc3c7',
    secondaryColor: '#34495e',
    accentColor: '#c0392b',
    dangerColor: '#e74c3c',
    safeColor: '#27ae60',
    textColor: '#ecf0f1',

    fogColor: '#1a252f',
    fogOpacity: 0.6,
    glowColor: '#f39c12',
    pathColor: '#3498db',
    pathStyle: 'animated',

    fontFamily: 'EB Garamond, serif',
    titleFontFamily: 'Cinzel, serif',

    backgroundPattern: 'hexgrid',
    hasAmbientAnimation: true,
    ambientAnimationType: 'waves',

    icons: {
      city: '🏛️',
      dungeon: '🗡️',
      wilderness: '🌊',
      landmark: '⚓',
      danger: '🐺',
      safe: '🛖',
      mystery: '🪨',
    },

    markerStyle: 'norse',
    markerSize: 30,
  },

  STAR_WARS: {
    backgroundColor: '#0a0a1a',
    primaryColor: '#4fc3f7',
    secondaryColor: '#1a1a2e',
    accentColor: '#ffeb3b',
    dangerColor: '#f44336',
    safeColor: '#4caf50',
    textColor: '#e0e0e0',

    fogColor: '#000000',
    fogOpacity: 0.9,
    glowColor: '#4fc3f7',
    pathColor: '#2196f3',
    pathStyle: 'animated',

    fontFamily: 'system-ui, sans-serif',
    titleFontFamily: 'system-ui, sans-serif',

    backgroundPattern: 'stars',
    hasAmbientAnimation: true,
    ambientAnimationType: 'stars',

    icons: {
      city: '🌍',
      dungeon: '🚀',
      wilderness: '🪐',
      landmark: '⭐',
      danger: '💥',
      safe: '🛸',
      mystery: '🌌',
    },

    markerStyle: 'scifi',
    markerSize: 40,
  },

  CYBERPUNK: {
    backgroundColor: '#0d0d0d',
    primaryColor: '#00ffff',
    secondaryColor: '#1a1a2e',
    accentColor: '#ff00ff',
    dangerColor: '#ff0040',
    safeColor: '#00ff80',
    textColor: '#ffffff',

    fogColor: '#1a0a2e',
    fogOpacity: 0.7,
    glowColor: '#00ffff',
    pathColor: '#ff00ff',
    pathStyle: 'animated',

    fontFamily: 'Courier Prime, monospace',
    titleFontFamily: 'Courier Prime, monospace',

    backgroundPattern: 'neon',
    hasAmbientAnimation: true,
    ambientAnimationType: 'scanlines',

    icons: {
      city: '🏙️',
      dungeon: '🔧',
      wilderness: '🌃',
      landmark: '📶',
      danger: '⚠️',
      safe: '💊',
      mystery: '👁️',
    },

    markerStyle: 'neon',
    markerSize: 32,
  },

  LOVECRAFT: {
    backgroundColor: '#1a1510',
    primaryColor: '#8b7355',
    secondaryColor: '#2d2520',
    accentColor: '#6b4c8c',
    dangerColor: '#4a0080',
    safeColor: '#3d5c3d',
    textColor: '#c4b998',

    fogColor: '#0a0a0a',
    fogOpacity: 0.85,
    glowColor: '#6b4c8c',
    pathColor: '#8b7355',
    pathStyle: 'dotted',

    fontFamily: 'EB Garamond, serif',
    titleFontFamily: 'Cinzel, serif',

    backgroundPattern: 'sepia',
    hasAmbientAnimation: true,
    ambientAnimationType: 'fog',

    icons: {
      city: '🏛️',
      dungeon: '📚',
      wilderness: '🌑',
      landmark: '🕯️',
      danger: '👁️',
      safe: '🏠',
      mystery: '❓',
    },

    markerStyle: 'gothic',
    markerSize: 28,
  },
}

// Función helper para obtener config
export function getMapConfig(lore: Lore): LoreMapConfig {
  return LORE_MAP_CONFIGS[lore]
}

// Colores de dificultad para rangos de dungeon (estilo JRPG)
export const DIFFICULTY_COLORS = {
  F: '#32cd32', // Verde - Muy fácil
  E: '#7cfc00', // Verde claro
  D: '#ffff00', // Amarillo
  C: '#ffa500', // Naranja
  B: '#ff6347', // Rojo claro
  A: '#ff0000', // Rojo
  S: '#8b0000', // Rojo oscuro - Muy difícil
}

// Convertir nivel de peligro (1-5) a rango de dificultad
export function dangerToRank(dangerLevel: number): keyof typeof DIFFICULTY_COLORS {
  const ranks: (keyof typeof DIFFICULTY_COLORS)[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S']
  const index = Math.min(Math.max(dangerLevel - 1, 0), ranks.length - 1)
  return ranks[index]
}
