// Índice de generadores de submapas
// Exporta todos los generadores y una función unificada para generar cualquier tipo

import { type MapLocation } from '../map-config'
import { type Submap, type SubmapGeneratorConfig, getSubmapType } from '../submap-types'
import { generateDungeonSubmap } from '../dungeon-generator'
import { generateCitySubmap } from './city-generator'
import { generateWildernessSubmap } from './wilderness-generator'
import { generateStrongholdSubmap } from './stronghold-generator'

// Re-exportar generadores individuales
export { generateCitySubmap } from './city-generator'
export { generateWildernessSubmap } from './wilderness-generator'
export { generateStrongholdSubmap } from './stronghold-generator'
export { generateDungeonSubmap } from '../dungeon-generator'

// Función unificada para generar submapa según el tipo de ubicación
export function generateSubmap(location: MapLocation, config: Omit<SubmapGeneratorConfig, 'locationId' | 'locationName' | 'locationType' | 'description'>): Submap {
  const fullConfig: SubmapGeneratorConfig = {
    ...config,
    locationId: location.id,
    locationName: location.name,
    locationType: location.type,
    description: location.description,
    dangerLevel: location.dangerLevel,
  }

  const submapType = getSubmapType(location)

  switch (submapType) {
    case 'city':
      return generateCitySubmap(fullConfig)
    case 'dungeon':
      return generateDungeonSubmap(
        fullConfig.locationId,
        fullConfig.locationName,
        fullConfig.lore,
        fullConfig.dangerLevel,
        fullConfig.seed
      )
    case 'wilderness':
      return generateWildernessSubmap(fullConfig)
    case 'stronghold':
      return generateStrongholdSubmap(fullConfig)
    case 'nautical':
      // Por ahora, usar city generator para áreas náuticas
      return generateCitySubmap(fullConfig)
    default:
      // Fallback a wilderness
      return generateWildernessSubmap(fullConfig)
  }
}

// Función para generar submapa desde parámetros básicos
export function generateSubmapFromParams(
  locationId: string,
  locationName: string,
  locationType: MapLocation['type'],
  description: string,
  lore: SubmapGeneratorConfig['lore'],
  dangerLevel: number = 1,
  seed?: number
): Submap {
  const mockLocation: MapLocation = {
    id: locationId,
    name: locationName,
    description,
    type: locationType,
    dangerLevel,
    coordinates: { x: 0, y: 0 },
    connections: [],
    icon: '',
    discovered: true,
    visited: false,
  }

  return generateSubmap(mockLocation, { lore, seed, dangerLevel })
}
