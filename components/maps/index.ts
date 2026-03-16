// Exportar tipos y configuración (estos no tienen dependencias de canvas)
export {
  type Lore,
  type MapLocation,
  type LoreMapConfig,
  getMapConfig,
  LORE_MAP_CONFIGS,
  DIFFICULTY_COLORS,
  dangerToRank
} from '@/lib/maps/map-config'

// Exportar datos de mapa por lore (sin dependencias de canvas)
export {
  generateMapLocations,
  getExampleMapData
} from '@/lib/maps/lore-map-data'

// Los componentes con Konva deben importarse dinámicamente desde sus archivos directamente
// No los exportamos aquí para evitar problemas de SSR
