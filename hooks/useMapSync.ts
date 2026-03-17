'use client'

import { useMemo, useCallback, useState } from 'react'
import { type MapState, type MapSyncState, type MapLocationWithStatus, type TravelValidation } from '@/lib/types/map-state'
import { type Lore } from '@/lib/types/lore'
import {
  deriveMapState,
  canTravelTo,
  createTravelAction,
  getTravelFailMessage,
  calculateTravelUpdates,
  hasSubmapAvailable,
  getSubmapType,
  calculateMapStats,
} from '@/lib/maps/map-sync'
import { migrateWorldStateMapState } from '@/lib/maps/map-init'

interface UseMapSyncOptions {
  locale?: 'es' | 'en'
  onTravelRequest?: (action: string, toLocationId: string) => void
  onTravelFailed?: (message: string) => void
  onExploreInterior?: (locationId: string, submapType: string) => void
}

interface UseMapSyncReturn {
  // Estado derivado
  mapSyncState: MapSyncState
  currentLocation: MapLocationWithStatus | null
  locations: MapLocationWithStatus[]

  // Estadísticas
  stats: {
    totalLocations: number
    discoveredLocations: number
    visitedLocations: number
    completionPercent: number
  }

  // Acciones
  handleLocationClick: (location: MapLocationWithStatus) => void
  handleExploreInterior: () => void
  validateTravel: (toLocation: MapLocationWithStatus) => TravelValidation

  // Estado UI
  canNavigate: boolean
  isInSubmap: boolean
  lockMessage: string | undefined
  selectedLocation: MapLocationWithStatus | null
  setSelectedLocation: (location: MapLocationWithStatus | null) => void

  // Helpers
  hasSubmapAvailable: (location: MapLocationWithStatus) => boolean
  getSubmapType: (location: MapLocationWithStatus) => 'city' | 'dungeon' | 'wilderness' | 'stronghold' | 'nautical'
}

/**
 * Hook para sincronizar el mapa con el estado del juego
 */
export function useMapSync(
  worldState: any,
  lore: Lore,
  options: UseMapSyncOptions = {}
): UseMapSyncReturn {
  const {
    locale = 'es',
    onTravelRequest,
    onTravelFailed,
    onExploreInterior,
  } = options

  // Estado local para la locación seleccionada (hover/click)
  const [selectedLocation, setSelectedLocation] = useState<MapLocationWithStatus | null>(null)

  // Migrar worldState si no tiene map_state
  const mapState: MapState = useMemo(() => {
    return migrateWorldStateMapState(worldState, lore)
  }, [worldState, lore])

  // Derivar estado del mapa
  const mapSyncState: MapSyncState = useMemo(() => {
    return deriveMapState(mapState, lore)
  }, [mapState, lore])

  // Calcular estadísticas
  const stats = useMemo(() => {
    return calculateMapStats(mapSyncState.locations, mapState)
  }, [mapSyncState.locations, mapState])

  // Validar si se puede viajar a una locación
  const validateTravel = useCallback(
    (toLocation: MapLocationWithStatus): TravelValidation => {
      return canTravelTo(mapSyncState.currentLocation, toLocation, mapState)
    },
    [mapSyncState.currentLocation, mapState]
  )

  // Manejar click en locación del mapa
  const handleLocationClick = useCallback(
    (location: MapLocationWithStatus) => {
      // Si es la misma ubicación, no hacer nada
      if (location.id === mapSyncState.currentLocation?.id) {
        setSelectedLocation(location)
        return
      }

      // Validar el viaje
      const validation = validateTravel(location)

      if (validation.valid) {
        // Generar acción de viaje
        if (mapSyncState.currentLocation && onTravelRequest) {
          const action = createTravelAction(mapSyncState.currentLocation, location, locale)
          onTravelRequest(action, location.id)
        }
      } else {
        // Mostrar mensaje de error
        const message = getTravelFailMessage(validation, locale)
        if (onTravelFailed) {
          onTravelFailed(message)
        }
        // Igualmente seleccionar la locación para mostrar info
        setSelectedLocation(location)
      }
    },
    [mapSyncState.currentLocation, validateTravel, locale, onTravelRequest, onTravelFailed]
  )

  // Manejar explorar interior
  const handleExploreInterior = useCallback(() => {
    const current = mapSyncState.currentLocation
    if (!current) return

    if (!hasSubmapAvailable(current)) {
      if (onTravelFailed) {
        onTravelFailed(
          locale === 'es'
            ? 'Esta locación no tiene interior explorable'
            : "This location doesn't have an explorable interior"
        )
      }
      return
    }

    const submapType = getSubmapType(current)
    if (onExploreInterior) {
      onExploreInterior(current.id, submapType)
    }
  }, [mapSyncState.currentLocation, locale, onTravelFailed, onExploreInterior])

  return {
    // Estado derivado
    mapSyncState,
    currentLocation: mapSyncState.currentLocation,
    locations: mapSyncState.locations,

    // Estadísticas
    stats,

    // Acciones
    handleLocationClick,
    handleExploreInterior,
    validateTravel,

    // Estado UI
    canNavigate: mapSyncState.canNavigate,
    isInSubmap: mapSyncState.isInSubmap,
    lockMessage: mapSyncState.lockMessage,
    selectedLocation,
    setSelectedLocation,

    // Helpers exportados
    hasSubmapAvailable,
    getSubmapType,
  }
}

/**
 * Hook para obtener solo las estadísticas del mapa (versión ligera)
 */
export function useMapStats(worldState: any, lore: Lore) {
  const mapState: MapState = useMemo(() => {
    return migrateWorldStateMapState(worldState, lore)
  }, [worldState, lore])

  const mapSyncState: MapSyncState = useMemo(() => {
    return deriveMapState(mapState, lore)
  }, [mapState, lore])

  return useMemo(() => {
    return calculateMapStats(mapSyncState.locations, mapState)
  }, [mapSyncState.locations, mapState])
}
