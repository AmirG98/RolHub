'use client'

import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import { EnvironmentSetup } from './EnvironmentSetup'
import { TerrainMesh } from './TerrainMesh'
import { LocationMarker3D } from './LocationMarker3D'
import { type Lore } from '@/lib/maps/map-config'
import { Loader2, Eye, EyeOff, Maximize2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  x: number
  y: number
  z?: number
  type?: 'city' | 'dungeon' | 'wilderness' | 'poi' | 'quest'
  icon?: string
  knowledge?: 'unknown' | 'discovered' | 'visited'
}

interface ThreeMapViewerProps {
  lore: Lore
  locations: Location[]
  currentLocation: string | null
  visitedLocations: string[]
  discoveredLocations: string[]
  onLocationClick: (locationId: string) => void
  onTravelRequest?: (actionText: string, toLocationId: string) => void
  className?: string
}

/**
 * Visor de mapa 3D principal
 * Integra terreno, marcadores, ambiente y controles
 */
export function ThreeMapViewer({
  lore,
  locations,
  currentLocation,
  visitedLocations,
  discoveredLocations,
  onLocationClick,
  onTravelRequest,
  className = ''
}: ThreeMapViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Convertir coordenadas 2D a 3D (escalado)
  const mapLocations = locations.map(loc => ({
    ...loc,
    x: (loc.x - 50) * 3, // Centrar y escalar
    y: (loc.y - 50) * 3,
    z: loc.z || 5,
  }))

  // Manejar click en ubicación
  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location)
    onLocationClick(location.id)
  }, [onLocationClick])

  // Manejar viaje
  const handleTravel = useCallback(() => {
    if (selectedLocation && onTravelRequest) {
      onTravelRequest(
        `Viajo hacia ${selectedLocation.name}`,
        selectedLocation.id
      )
      setSelectedLocation(null)
    }
  }, [selectedLocation, onTravelRequest])

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-gold-dim/30 ${
        isFullscreen ? 'fixed inset-4 z-50' : 'h-[400px]'
      } ${className}`}
    >
      {/* Canvas 3D */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <PerspectiveCamera
            makeDefault
            position={[0, 80, 120]}
            fov={60}
            near={1}
            far={1000}
          />

          {/* Ambiente (luces, cielo, niebla) */}
          <EnvironmentSetup lore={lore} />

          {/* Terreno */}
          <TerrainMesh lore={lore} size={400} segments={64} />

          {/* Marcadores de ubicación */}
          {mapLocations.map(location => (
            <LocationMarker3D
              key={location.id}
              location={location}
              lore={lore}
              isCurrentLocation={location.id === currentLocation}
              isVisited={visitedLocations.includes(location.id)}
              isDiscovered={discoveredLocations.includes(location.id)}
              onClick={() => handleLocationClick(location)}
            />
          ))}

          {/* Controles de cámara */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={30}
            maxDistance={250}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 6}
            panSpeed={0.5}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-2 right-2 flex gap-2">
        {/* Toggle labels */}
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="p-2 rounded-lg glass-panel-dark text-gold hover:bg-gold/10 transition-colors"
          title={showLabels ? 'Ocultar nombres' : 'Mostrar nombres'}
        >
          {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg glass-panel-dark text-gold hover:bg-gold/10 transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stats display */}
      <div className="absolute bottom-2 left-2 glass-panel-dark rounded-lg px-3 py-1.5 text-xs">
        <span className="text-gold-dim">
          {discoveredLocations.length}/{locations.length} descubiertas
        </span>
        <span className="mx-2 text-gold-dim/30">•</span>
        <span className="text-parchment/60">
          {Math.round((discoveredLocations.length / locations.length) * 100)}%
        </span>
      </div>

      {/* Selected location popup */}
      {selectedLocation && (
        <div className="absolute bottom-2 right-2 glass-panel-dark rounded-lg p-3 max-w-[200px]">
          <h4 className="font-heading text-gold text-sm mb-1">
            {selectedLocation.name}
          </h4>
          <p className="text-xs text-parchment/60 mb-2">
            {selectedLocation.type === 'city' && '🏰 Ciudad'}
            {selectedLocation.type === 'dungeon' && '🗝️ Mazmorra'}
            {selectedLocation.type === 'quest' && '⚔️ Misión'}
            {selectedLocation.type === 'poi' && '📍 Punto de interés'}
            {selectedLocation.type === 'wilderness' && '🌲 Naturaleza'}
          </p>

          {currentLocation !== selectedLocation.id && onTravelRequest && (
            <button
              onClick={handleTravel}
              className="w-full py-1.5 text-xs font-ui bg-gold/20 text-gold rounded hover:bg-gold/30 transition-colors"
            >
              Viajar aquí
            </button>
          )}

          {currentLocation === selectedLocation.id && (
            <span className="text-xs text-emerald">📍 Estás aquí</span>
          )}
        </div>
      )}

      {/* Fullscreen overlay close button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-3 rounded-full bg-blood/80 text-parchment hover:bg-blood transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/**
 * Fallback de carga mientras se inicializa Three.js
 */
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-gold">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="font-ui text-sm">Cargando mapa 3D...</span>
      </div>
    </Html>
  )
}

export default ThreeMapViewer
