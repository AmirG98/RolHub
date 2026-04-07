// Regiones de terreno para cada lore
// Polígonos semitransparentes que dan contexto geográfico al mapa
// Coordenadas en sistema lógico 0-1000

import { type Lore } from './map-config'

export interface TerrainRegion {
  id: string
  name: string
  type: 'mountains' | 'forest' | 'water' | 'desert' | 'plains' | 'urban' | 'swamp' | 'void' | 'ice'
  points: number[]       // Pares [x, y, x, y, ...] para polígono Konva
  color: string
  opacity: number
  labelPosition?: { x: number; y: number }
  // Para ríos/caminos (no polígono cerrado)
  isPath?: boolean
  strokeWidth?: number
}

// Colores de terreno reutilizables
const TERRAIN_COLORS = {
  mountains: '#6B4C3B',
  forest: '#2D5A27',
  water: '#1A4B6E',
  waterLight: '#2E6B9E',
  desert: '#C4A35A',
  plains: '#7B8A3E',
  urban: '#4A4A4A',
  swamp: '#3D4A2C',
  void: '#1A0A0A',
  ice: '#B8D4E3',
  lava: '#8B1A1A',
  magic: '#5B2D8E',
  neon: '#00FF88',
  nebula: '#4A2080',
  corruption: '#3A1A4A',
}

// ===== LOTR =====
const LOTR_REGIONS: TerrainRegion[] = [
  {
    id: 'misty-mountains',
    name: 'Montañas Nubladas',
    type: 'mountains',
    points: [
      380, 50,   // Pico norte
      520, 100,
      550, 250,
      500, 400,
      450, 450,
      400, 380,
      350, 300,
      320, 180,
    ],
    color: TERRAIN_COLORS.mountains,
    opacity: 0.15,
    labelPosition: { x: 430, y: 220 },
  },
  {
    id: 'fangorn-forest',
    name: 'Bosque de Fangorn',
    type: 'forest',
    points: [
      520, 350,
      620, 320,
      660, 400,
      620, 450,
      540, 430,
      500, 380,
    ],
    color: TERRAIN_COLORS.forest,
    opacity: 0.18,
    labelPosition: { x: 570, y: 380 },
  },
  {
    id: 'lothlorien-forest',
    name: 'Bosque Dorado',
    type: 'forest',
    points: [
      530, 250,
      620, 230,
      660, 310,
      630, 370,
      540, 350,
      500, 300,
    ],
    color: '#4A6B2A',
    opacity: 0.15,
    labelPosition: { x: 570, y: 300 },
  },
  {
    id: 'rohan-plains',
    name: 'Llanuras de Rohan',
    type: 'plains',
    points: [
      550, 450,
      700, 430,
      750, 550,
      680, 620,
      550, 600,
      480, 520,
    ],
    color: TERRAIN_COLORS.plains,
    opacity: 0.12,
    labelPosition: { x: 620, y: 520 },
  },
  {
    id: 'mordor',
    name: 'Mordor',
    type: 'void',
    points: [
      780, 350,
      950, 300,
      980, 500,
      900, 600,
      780, 550,
      750, 450,
    ],
    color: TERRAIN_COLORS.void,
    opacity: 0.2,
    labelPosition: { x: 860, y: 450 },
  },
  {
    id: 'anduin-river',
    name: 'Río Anduin',
    type: 'water',
    points: [
      350, 150,
      360, 250,
      380, 350,
      420, 450,
      500, 550,
      580, 650,
      620, 700,
    ],
    color: TERRAIN_COLORS.waterLight,
    opacity: 0.3,
    isPath: true,
    strokeWidth: 4,
  },
  {
    id: 'shire-hills',
    name: 'La Comarca',
    type: 'plains',
    points: [
      50, 150,
      220, 120,
      280, 200,
      260, 310,
      150, 330,
      60, 270,
    ],
    color: '#5A8A3E',
    opacity: 0.15,
    labelPosition: { x: 160, y: 220 },
  },
]

// ===== ZOMBIES =====
const ZOMBIES_REGIONS: TerrainRegion[] = [
  {
    id: 'city-center',
    name: 'Centro Urbano',
    type: 'urban',
    points: [
      300, 100,
      700, 100,
      750, 250,
      700, 400,
      400, 420,
      280, 300,
    ],
    color: TERRAIN_COLORS.urban,
    opacity: 0.15,
    labelPosition: { x: 500, y: 250 },
  },
  {
    id: 'danger-zone',
    name: 'Zona Roja',
    type: 'void',
    points: [
      650, 250,
      900, 200,
      950, 400,
      850, 500,
      700, 450,
    ],
    color: '#6B1A1A',
    opacity: 0.18,
    labelPosition: { x: 800, y: 350 },
  },
  {
    id: 'safe-perimeter',
    name: 'Perímetro Seguro',
    type: 'plains',
    points: [
      50, 100,
      250, 80,
      300, 200,
      280, 380,
      150, 400,
      50, 300,
    ],
    color: '#2A5A2A',
    opacity: 0.12,
    labelPosition: { x: 170, y: 240 },
  },
  {
    id: 'port-area',
    name: 'Zona Portuaria',
    type: 'water',
    points: [
      300, 500,
      650, 480,
      700, 600,
      650, 700,
      300, 720,
      250, 600,
    ],
    color: TERRAIN_COLORS.water,
    opacity: 0.15,
    labelPosition: { x: 480, y: 590 },
  },
  {
    id: 'industrial',
    name: 'Zona Industrial',
    type: 'urban',
    points: [
      180, 450,
      400, 430,
      430, 550,
      350, 620,
      180, 600,
    ],
    color: '#3A3A2A',
    opacity: 0.12,
    labelPosition: { x: 310, y: 520 },
  },
]

// ===== ISEKAI =====
const ISEKAI_REGIONS: TerrainRegion[] = [
  {
    id: 'starter-meadow',
    name: 'Praderas de Inicio',
    type: 'plains',
    points: [
      50, 250,
      280, 200,
      350, 350,
      300, 500,
      150, 530,
      50, 400,
    ],
    color: '#6BA85A',
    opacity: 0.15,
    labelPosition: { x: 200, y: 370 },
  },
  {
    id: 'magic-forest',
    name: 'Bosque Encantado',
    type: 'forest',
    points: [
      150, 100,
      350, 80,
      380, 220,
      300, 300,
      150, 280,
      100, 180,
    ],
    color: TERRAIN_COLORS.magic,
    opacity: 0.12,
    labelPosition: { x: 250, y: 190 },
  },
  {
    id: 'capital-region',
    name: 'Reino Central',
    type: 'plains',
    points: [
      350, 200,
      550, 180,
      600, 350,
      550, 450,
      400, 450,
      330, 350,
    ],
    color: '#C4A35A',
    opacity: 0.1,
    labelPosition: { x: 460, y: 320 },
  },
  {
    id: 'demon-territory',
    name: 'Territorio Oscuro',
    type: 'void',
    points: [
      650, 250,
      900, 200,
      950, 400,
      880, 550,
      700, 530,
      620, 400,
    ],
    color: '#2A0A2A',
    opacity: 0.18,
    labelPosition: { x: 780, y: 380 },
  },
  {
    id: 'dungeon-depths',
    name: 'Profundidades',
    type: 'mountains',
    points: [
      550, 400,
      700, 380,
      750, 550,
      680, 620,
      550, 580,
    ],
    color: TERRAIN_COLORS.mountains,
    opacity: 0.15,
    labelPosition: { x: 650, y: 490 },
  },
]

// ===== VIKINGOS =====
const VIKINGOS_REGIONS: TerrainRegion[] = [
  {
    id: 'northern-sea',
    name: 'Mar del Norte',
    type: 'water',
    points: [
      0, 0,
      400, 0,
      350, 150,
      500, 200,
      700, 80,
      1000, 0,
      1000, 180,
      800, 250,
      600, 220,
      400, 280,
      200, 250,
      0, 200,
    ],
    color: TERRAIN_COLORS.water,
    opacity: 0.2,
    labelPosition: { x: 500, y: 100 },
  },
  {
    id: 'homeland',
    name: 'Tierras del Clan',
    type: 'plains',
    points: [
      300, 250,
      550, 220,
      600, 350,
      550, 450,
      400, 450,
      280, 380,
    ],
    color: '#5A7A3E',
    opacity: 0.15,
    labelPosition: { x: 440, y: 340 },
  },
  {
    id: 'sacred-woods',
    name: 'Bosques Sagrados',
    type: 'forest',
    points: [
      550, 300,
      700, 280,
      750, 420,
      700, 500,
      580, 470,
      530, 380,
    ],
    color: TERRAIN_COLORS.forest,
    opacity: 0.18,
    labelPosition: { x: 640, y: 390 },
  },
  {
    id: 'saxon-coast',
    name: 'Costa Sajona',
    type: 'plains',
    points: [
      50, 300,
      250, 280,
      280, 450,
      200, 550,
      80, 520,
      30, 400,
    ],
    color: '#8A7A5A',
    opacity: 0.12,
    labelPosition: { x: 160, y: 410 },
  },
  {
    id: 'jotunheim-ice',
    name: 'Jötunheim',
    type: 'ice',
    points: [
      700, 50,
      950, 30,
      980, 200,
      900, 280,
      750, 230,
      680, 140,
    ],
    color: TERRAIN_COLORS.ice,
    opacity: 0.15,
    labelPosition: { x: 830, y: 150 },
  },
]

// ===== STAR WARS =====
const STAR_WARS_REGIONS: TerrainRegion[] = [
  {
    id: 'outer-rim',
    name: 'Borde Exterior',
    type: 'desert',
    points: [
      0, 50,
      250, 30,
      300, 200,
      280, 400,
      200, 550,
      0, 500,
    ],
    color: '#5A4A2A',
    opacity: 0.1,
    labelPosition: { x: 150, y: 280 },
  },
  {
    id: 'core-worlds',
    name: 'Mundos del Núcleo',
    type: 'plains',
    points: [
      350, 180,
      580, 150,
      620, 350,
      550, 450,
      380, 420,
      320, 300,
    ],
    color: '#3A5A8A',
    opacity: 0.12,
    labelPosition: { x: 470, y: 300 },
  },
  {
    id: 'nebula-alpha',
    name: 'Nebulosa Kessel',
    type: 'void',
    points: [
      620, 80,
      850, 50,
      900, 200,
      830, 320,
      680, 280,
      600, 180,
    ],
    color: TERRAIN_COLORS.nebula,
    opacity: 0.12,
    labelPosition: { x: 750, y: 180 },
  },
  {
    id: 'imperial-space',
    name: 'Espacio Imperial',
    type: 'void',
    points: [
      550, 300,
      800, 280,
      850, 480,
      750, 550,
      580, 500,
      520, 400,
    ],
    color: '#2A2A3A',
    opacity: 0.15,
    labelPosition: { x: 680, y: 400 },
  },
  {
    id: 'trade-route',
    name: 'Ruta Comercial Corelliana',
    type: 'water',
    points: [
      150, 200,
      250, 230,
      350, 260,
      450, 300,
      550, 310,
    ],
    color: '#6090C0',
    opacity: 0.25,
    isPath: true,
    strokeWidth: 3,
  },
]

// ===== CYBERPUNK =====
const CYBERPUNK_REGIONS: TerrainRegion[] = [
  {
    id: 'downtown-district',
    name: 'Downtown',
    type: 'urban',
    points: [
      300, 180,
      550, 150,
      580, 350,
      520, 430,
      350, 420,
      280, 300,
    ],
    color: '#2A2A4A',
    opacity: 0.15,
    labelPosition: { x: 430, y: 290 },
  },
  {
    id: 'corpo-plaza',
    name: 'Plaza Corporativa',
    type: 'urban',
    points: [
      500, 50,
      720, 30,
      750, 200,
      680, 280,
      520, 250,
      470, 150,
    ],
    color: '#1A2A4A',
    opacity: 0.18,
    labelPosition: { x: 610, y: 150 },
  },
  {
    id: 'undercity',
    name: 'Submundo',
    type: 'void',
    points: [
      80, 350,
      300, 320,
      350, 500,
      280, 650,
      120, 620,
      50, 480,
    ],
    color: '#1A0A1A',
    opacity: 0.2,
    labelPosition: { x: 200, y: 490 },
  },
  {
    id: 'industrial-zone',
    name: 'Zona Industrial',
    type: 'urban',
    points: [
      600, 300,
      850, 280,
      900, 450,
      820, 550,
      650, 520,
      580, 400,
    ],
    color: '#3A3A2A',
    opacity: 0.12,
    labelPosition: { x: 740, y: 410 },
  },
  {
    id: 'neon-strip',
    name: 'Franja Neón',
    type: 'urban',
    points: [
      250, 200,
      350, 180,
      380, 320,
      320, 380,
      240, 340,
    ],
    color: '#0A2A2A',
    opacity: 0.12,
    labelPosition: { x: 310, y: 270 },
  },
]

// ===== LOVECRAFT =====
const LOVECRAFT_REGIONS: TerrainRegion[] = [
  {
    id: 'arkham-town',
    name: 'Arkham',
    type: 'urban',
    points: [
      320, 200,
      580, 180,
      620, 380,
      560, 450,
      370, 440,
      300, 330,
    ],
    color: TERRAIN_COLORS.urban,
    opacity: 0.12,
    labelPosition: { x: 460, y: 310 },
  },
  {
    id: 'miskatonic-river',
    name: 'Río Miskatonic',
    type: 'water',
    points: [
      200, 350,
      300, 320,
      400, 340,
      500, 380,
      600, 350,
      700, 380,
    ],
    color: TERRAIN_COLORS.water,
    opacity: 0.25,
    isPath: true,
    strokeWidth: 5,
  },
  {
    id: 'harbor-waters',
    name: 'Aguas del Puerto',
    type: 'water',
    points: [
      50, 350,
      250, 330,
      280, 500,
      220, 600,
      80, 580,
      30, 450,
    ],
    color: '#0A2A4A',
    opacity: 0.18,
    labelPosition: { x: 160, y: 460 },
  },
  {
    id: 'corrupted-zone',
    name: 'Zona Corrompida',
    type: 'swamp',
    points: [
      580, 320,
      800, 280,
      850, 450,
      780, 550,
      620, 500,
      560, 400,
    ],
    color: TERRAIN_COLORS.corruption,
    opacity: 0.15,
    labelPosition: { x: 700, y: 410 },
  },
  {
    id: 'fog-zone',
    name: 'Niebla Perpetua',
    type: 'swamp',
    points: [
      250, 400,
      450, 380,
      480, 550,
      400, 600,
      250, 580,
    ],
    color: '#4A4A5A',
    opacity: 0.1,
    labelPosition: { x: 370, y: 490 },
  },
]

// ===== DND CLASSIC (Costa de la Espada) =====
const DND_CLASSIC_REGIONS: TerrainRegion[] = [
  {
    id: 'sword-coast',
    name: 'Costa de la Espada',
    type: 'water',
    points: [0, 200, 150, 150, 200, 300, 180, 500, 100, 600, 0, 550],
    color: TERRAIN_COLORS.water,
    opacity: 0.18,
    labelPosition: { x: 80, y: 380 },
  },
  {
    id: 'sword-mountains',
    name: 'Montañas de la Espada',
    type: 'mountains',
    points: [450, 150, 600, 100, 650, 250, 600, 350, 500, 300, 430, 220],
    color: TERRAIN_COLORS.mountains,
    opacity: 0.15,
    labelPosition: { x: 530, y: 220 },
  },
  {
    id: 'neverwinter-wood',
    name: 'Bosque de Neverwinter',
    type: 'forest',
    points: [380, 50, 550, 30, 580, 150, 500, 200, 400, 170],
    color: TERRAIN_COLORS.forest,
    opacity: 0.18,
    labelPosition: { x: 470, y: 110 },
  },
  {
    id: 'icewind-tundra',
    name: 'Tundra Helada',
    type: 'ice',
    points: [400, 0, 700, 0, 680, 80, 550, 100, 420, 60],
    color: '#B8D4E3',
    opacity: 0.15,
    labelPosition: { x: 550, y: 40 },
  },
  {
    id: 'trade-way',
    name: 'Camino del Comercio',
    type: 'plains',
    points: [250, 250, 400, 280, 380, 400, 300, 500, 200, 480, 220, 350],
    color: '#7B8A3E',
    opacity: 0.1,
    labelPosition: { x: 310, y: 380 },
  },
]

// COZY_WITCH terrain - jardín de hierbas, bosque amistoso, acantilado, mar
const COZY_WITCH_REGIONS: TerrainRegion[] = [
  {
    id: 'jardin-hierbas-region',
    name: 'Jardín de Hierbas',
    type: 'plains',
    points: [280, 220, 420, 200, 440, 340, 360, 380, 260, 360],
    color: '#9BB87C',
    opacity: 0.2,
    labelPosition: { x: 350, y: 290 },
  },
  {
    id: 'bosque-susurrante-region',
    name: 'Bosque Susurrante',
    type: 'forest',
    points: [100, 100, 300, 80, 320, 260, 220, 320, 80, 280],
    color: '#5A8050',
    opacity: 0.22,
    labelPosition: { x: 200, y: 200 },
  },
  {
    id: 'acantilado-cala',
    name: 'Acantilado del Faro',
    type: 'mountains',
    points: [560, 380, 720, 380, 720, 540, 560, 540],
    color: '#A89880',
    opacity: 0.18,
    labelPosition: { x: 640, y: 460 },
  },
  {
    id: 'mar-cala-quieta',
    name: 'Mar de Cala Quieta',
    type: 'water',
    points: [400, 460, 720, 460, 720, 600, 400, 600],
    color: '#6BA8C8',
    opacity: 0.22,
    labelPosition: { x: 560, y: 530 },
  },
]

// ROMANTASY terrain - jardines feéricos, bosque encantado y muro mágico
const ROMANTASY_REGIONS: TerrainRegion[] = [
  {
    id: 'jardines-primavera',
    name: 'Jardines Eternos',
    type: 'plains',
    points: [200, 180, 400, 160, 420, 320, 350, 380, 220, 360],
    color: '#E8A8C8',
    opacity: 0.18,
    labelPosition: { x: 310, y: 270 },
  },
  {
    id: 'bosque-espinas-region',
    name: 'Bosque de Espinas',
    type: 'forest',
    points: [320, 280, 520, 260, 560, 440, 480, 500, 340, 460],
    color: '#6B7A4C',
    opacity: 0.22,
    labelPosition: { x: 430, y: 380 },
  },
  {
    id: 'muro-mistico',
    name: 'El Muro',
    type: 'mountains',
    points: [120, 380, 320, 380, 320, 520, 120, 520],
    color: '#9B8AB8',
    opacity: 0.2,
    labelPosition: { x: 220, y: 450 },
  },
  {
    id: 'velaris-noche',
    name: 'Reino de la Noche',
    type: 'plains',
    points: [450, 100, 700, 80, 720, 250, 500, 280],
    color: '#3A2A5C',
    opacity: 0.18,
    labelPosition: { x: 580, y: 180 },
  },
]

// Mapa de regiones por lore
const LORE_TERRAIN: Record<string, TerrainRegion[]> = {
  LOTR: LOTR_REGIONS,
  ZOMBIES: ZOMBIES_REGIONS,
  ISEKAI: ISEKAI_REGIONS,
  VIKINGOS: VIKINGOS_REGIONS,
  STAR_WARS: STAR_WARS_REGIONS,
  CYBERPUNK: CYBERPUNK_REGIONS,
  LOVECRAFT_HORROR: LOVECRAFT_REGIONS,
  DND_CLASSIC: DND_CLASSIC_REGIONS,
  ROMANTASY: ROMANTASY_REGIONS,
  COZY_WITCH: COZY_WITCH_REGIONS,
  CUSTOM: [],
}

/**
 * Obtiene las regiones de terreno para un lore
 */
export function getTerrainRegions(lore: Lore): TerrainRegion[] {
  return LORE_TERRAIN[lore] || []
}

/**
 * Escala las regiones de terreno al tamaño del canvas
 */
export function scaleTerrainRegions(
  regions: TerrainRegion[],
  canvasWidth: number,
  canvasHeight: number
): TerrainRegion[] {
  const scaleX = canvasWidth / 1000
  const scaleY = canvasHeight / 1000

  return regions.map(region => ({
    ...region,
    points: region.points.map((val, i) => i % 2 === 0 ? val * scaleX : val * scaleY),
    labelPosition: region.labelPosition
      ? { x: region.labelPosition.x * scaleX, y: region.labelPosition.y * scaleY }
      : undefined,
    strokeWidth: region.strokeWidth ? region.strokeWidth * Math.min(scaleX, scaleY) : undefined,
  }))
}
