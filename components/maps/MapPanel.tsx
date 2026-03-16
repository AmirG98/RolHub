'use client'

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { type Lore, type MapLocation, getMapConfig } from '@/lib/maps/map-config'

// Importar MapContainer dinámicamente para evitar SSR issues con Konva
const MapContainer = dynamic(
  () => import('./MapContainer').then(mod => mod.MapContainer),
  { ssr: false, loading: () => <MapLoading /> }
)

// Importar SubmapRouter dinámicamente
const DynamicSubmapRouter = dynamic(
  () => import('./submap/SubmapRouter').then(mod => ({ default: mod.SubmapRouter })),
  { ssr: false, loading: () => <SubmapLoading /> }
)

interface MapPanelProps {
  lore: Lore
  locations: MapLocation[]
  currentLocationId?: string
  onLocationClick?: (location: MapLocation) => void
  className?: string
  defaultCollapsed?: boolean
}

export function MapPanel({
  lore,
  locations,
  currentLocationId,
  onLocationClick,
  className = '',
  defaultCollapsed = false,
}: MapPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFog, setShowFog] = useState(true)
  const [submapLocation, setSubmapLocation] = useState<MapLocation | null>(null)

  const config = getMapConfig(lore)

  // Handler para click en ubicación - abre el submapa
  const handleLocationClick = useCallback((location: MapLocation) => {
    // Primero llamar al callback original si existe
    onLocationClick?.(location)
    // Luego abrir el submapa
    setSubmapLocation(location)
  }, [onLocationClick])

  // Handler para cerrar submapa
  const handleCloseSubmap = useCallback(() => {
    setSubmapLocation(null)
  }, [])

  // Handler para movimiento del jugador en submapa
  const handlePlayerMove = useCallback((nodeId: string) => {
    console.log('Player moved to node:', nodeId)
    // Aquí se podría actualizar el estado del juego
  }, [])

  const panelStyle: React.CSSProperties = {
    backgroundColor: config.backgroundColor,
    borderColor: config.primaryColor,
    fontFamily: config.fontFamily,
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: config.secondaryColor,
    color: config.textColor,
    border: `1px solid ${config.primaryColor}`,
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 px-4 py-2 rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
        style={buttonStyle}
      >
        <span className="text-lg">🗺️</span>
        <span>Abrir Mapa</span>
      </button>
    )
  }

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50'
    : `relative ${className}`

  return (
    <div
      className={`${containerClass} rounded-lg border-2 shadow-xl overflow-hidden`}
      style={panelStyle}
    >
      {/* Header del panel */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: config.primaryColor }}
      >
        <h3
          className="font-bold text-sm flex items-center gap-2"
          style={{ fontFamily: config.titleFontFamily, color: config.textColor }}
        >
          <span>🗺️</span>
          <span>Mapa del Mundo</span>
        </h3>

        <div className="flex items-center gap-1">
          {/* Toggle Fog of War */}
          <button
            onClick={() => setShowFog(!showFog)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title={showFog ? 'Ocultar niebla' : 'Mostrar niebla'}
          >
            {showFog ? '👁️' : '👁️‍🗨️'}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? '⊙' : '⛶'}
          </button>

          {/* Collapse */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title="Minimizar mapa"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Contenido del mapa */}
      <div className={isFullscreen ? 'h-[calc(100vh-48px)]' : 'h-96'}>
        <MapContainer
          lore={lore}
          locations={locations}
          currentLocationId={currentLocationId}
          onLocationClick={handleLocationClick}
          showFog={showFog}
          className="w-full h-full"
        />
      </div>

      {/* Leyenda */}
      <div
        className="flex items-center justify-center gap-4 px-3 py-2 border-t text-xs"
        style={{ borderColor: config.primaryColor, color: config.textColor }}
      >
        <span className="flex items-center gap-1">
          <span>{config.icons.city}</span> Ciudad
        </span>
        <span className="flex items-center gap-1">
          <span>{config.icons.dungeon}</span> Dungeon
        </span>
        <span className="flex items-center gap-1">
          <span>{config.icons.danger}</span> Peligro
        </span>
        <span className="flex items-center gap-1">
          <span>{config.icons.safe}</span> Seguro
        </span>
      </div>

      {/* Submapa modal */}
      {submapLocation && (
        <DynamicSubmapRouter
          location={submapLocation}
          lore={lore}
          isOpen={true}
          onClose={handleCloseSubmap}
          onPlayerMove={handlePlayerMove}
        />
      )}
    </div>
  )
}

// Loading skeleton para mapa
function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-shadow">
      <div className="text-center text-gold animate-pulse">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  )
}

// Loading skeleton para submapa
function SubmapLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center text-gold animate-pulse">
        <div className="text-5xl mb-3">🏰</div>
        <p className="text-lg font-heading">Explorando ubicación...</p>
        <p className="text-sm text-parchment/70 mt-1">Generando submapa</p>
      </div>
    </div>
  )
}

// Hook para convertir locaciones de lore a MapLocation
export function useMapLocations(loreLocations: any[], discoveredIds: string[] = [], visitedIds: string[] = []): MapLocation[] {
  return loreLocations.map((loc, index) => ({
    id: loc.id,
    name: loc.name,
    description: loc.description || '',
    type: mapLocationType(loc.type),
    dangerLevel: loc.danger_level || 1,
    coordinates: loc.coordinates || generateCoordinates(index, loreLocations.length),
    connections: loc.connections || [],
    icon: '',
    discovered: discoveredIds.includes(loc.id) || discoveredIds.length === 0, // Si no hay lista, todo visible
    visited: visitedIds.includes(loc.id),
  }))
}

// Mapear tipo de locación del JSON del lore al tipo de MapLocation
function mapLocationType(type?: string): MapLocation['type'] {
  const typeMap: Record<string, MapLocation['type']> = {
    'ciudad': 'city',
    'city': 'city',
    'town': 'city',
    'village': 'city',
    'dungeon': 'dungeon',
    'cave': 'dungeon',
    'ruins': 'dungeon',
    'bosque': 'wilderness',
    'wilderness': 'wilderness',
    'forest': 'wilderness',
    'mountains': 'wilderness',
    'landmark': 'landmark',
    'danger': 'danger',
    'safe': 'safe',
    'campamento': 'safe',
    'mystery': 'mystery',
    'unknown': 'mystery',
  }
  return typeMap[type?.toLowerCase() || ''] || 'landmark'
}

// Generar coordenadas automáticas en espiral si no existen
function generateCoordinates(index: number, total: number): { x: number; y: number } {
  const angle = (index / total) * Math.PI * 2
  const radius = 150 + (index % 3) * 80
  return {
    x: 400 + Math.cos(angle) * radius,
    y: 300 + Math.sin(angle) * radius,
  }
}
