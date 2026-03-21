'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import { EnvironmentSetup } from './EnvironmentSetup'
import { TerrainMesh } from './TerrainMesh'
import { LocationMarker3D, type LocationKnowledgeLevel } from './LocationMarker3D'
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
  knowledgeLevel: LocationKnowledgeLevel
}

interface ThreeMapViewerProps {
  lore: Lore
  locations: Location[]
  currentLocation: string | null
  onLocationClick: (locationId: string) => void
  onTravelRequest?: (actionText: string, toLocationId: string) => void
  className?: string
}

/**
 * Visor de mapa 3D principal con fog of war progresivo
 * Muestra TODAS las ubicaciones con efectos visuales según nivel de conocimiento
 */
export function ThreeMapViewer({
  lore,
  locations,
  currentLocation,
  onLocationClick,
  onTravelRequest,
  className = ''
}: ThreeMapViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar soporte de WebGL
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebGLSupported(false)
        setError('WebGL no está soportado en este navegador')
      }
    } catch (e) {
      setWebGLSupported(false)
      setError('Error al inicializar WebGL')
    }
  }, [])

  // Convertir coordenadas 2D a 3D (escalado)
  const mapLocations = locations.map(loc => ({
    ...loc,
    x: (loc.x - 50) * 3, // Centrar y escalar
    y: (loc.y - 50) * 3,
    z: loc.z || 5,
  }))

  // Manejar click en ubicación
  const handleLocationClick = useCallback((location: Location) => {
    // Solo permitir selección si no es unknown
    if (location.knowledgeLevel === 'unknown') return
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

  // Calcular estadísticas basadas en knowledgeLevel
  const knownLocations = locations.filter(l => l.knowledgeLevel !== 'unknown')
  const visitedLocations = locations.filter(l =>
    ['visited', 'explored', 'mastered'].includes(l.knowledgeLevel)
  )

  // Mostrar error si WebGL no está soportado
  if (!webGLSupported || error) {
    return (
      <div
        className={`relative rounded-lg overflow-hidden border border-gold-dim/30 flex items-center justify-center bg-shadow-mid ${className}`}
        style={{ minHeight: '400px' }}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gold font-heading">{error || 'WebGL no disponible'}</p>
          <p className="text-parchment/60 text-sm mt-2">
            Tu navegador no soporta gráficos 3D. Prueba con Chrome o Firefox.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-gold-dim/30 ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      } ${className}`}
      style={{ minHeight: isFullscreen ? undefined : '400px' }}
    >
      {/* Canvas 3D */}
      <Canvas
        onCreated={() => console.log('Three.js Canvas created successfully')}
        onError={(e) => {
          console.error('Three.js Canvas error:', e)
          setError('Error al renderizar el mapa 3D')
        }}
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

          {/* Marcadores de ubicación - ahora muestra TODAS las ubicaciones */}
          {mapLocations.map(location => (
            <LocationMarker3D
              key={location.id}
              location={location}
              lore={lore}
              isCurrentLocation={location.id === currentLocation}
              knowledgeLevel={location.knowledgeLevel}
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

      {/* Stats display - muestra conocidas y visitadas */}
      <div className="absolute bottom-2 left-2 glass-panel-dark rounded-lg px-3 py-1.5 text-xs">
        <span className="text-gold-dim">
          {knownLocations.length}/{locations.length} conocidas
        </span>
        <span className="mx-2 text-gold-dim/30">•</span>
        <span className="text-emerald/80">
          {visitedLocations.length} visitadas
        </span>
        <span className="mx-2 text-gold-dim/30">•</span>
        <span className="text-parchment/60">
          {Math.round((visitedLocations.length / locations.length) * 100)}%
        </span>
      </div>

      {/* Selected location popup */}
      {selectedLocation && (
        <div className="absolute bottom-2 right-2 glass-panel-dark rounded-lg p-3 max-w-[200px]">
          <h4 className="font-heading text-gold text-sm mb-1">
            {selectedLocation.name}
            {selectedLocation.knowledgeLevel === 'rumored' && ' ?'}
          </h4>
          <p className="text-xs text-parchment/60 mb-2">
            {selectedLocation.type === 'city' && '🏰 Ciudad'}
            {selectedLocation.type === 'dungeon' && '🗝️ Mazmorra'}
            {selectedLocation.type === 'quest' && '⚔️ Misión'}
            {selectedLocation.type === 'poi' && '📍 Punto de interés'}
            {selectedLocation.type === 'wilderness' && '🌲 Naturaleza'}
            {!selectedLocation.type && '📍 Ubicación'}
          </p>

          {/* Indicador de nivel de conocimiento */}
          <div className="text-xs text-parchment/50 mb-2">
            {selectedLocation.knowledgeLevel === 'rumored' && '🌫️ Solo rumores'}
            {selectedLocation.knowledgeLevel === 'discovered' && '👁️ Descubierta'}
            {selectedLocation.knowledgeLevel === 'visited' && '✅ Visitada'}
            {selectedLocation.knowledgeLevel === 'explored' && '🔍 Explorada'}
            {selectedLocation.knowledgeLevel === 'mastered' && '⭐ Dominada'}
          </div>

          {currentLocation !== selectedLocation.id && onTravelRequest &&
           ['discovered', 'visited', 'explored', 'mastered'].includes(selectedLocation.knowledgeLevel) && (
            <button
              onClick={handleTravel}
              className="w-full py-1.5 text-xs font-ui bg-gold/20 text-gold rounded hover:bg-gold/30 transition-colors"
            >
              Viajar aquí
            </button>
          )}

          {currentLocation !== selectedLocation.id &&
           selectedLocation.knowledgeLevel === 'rumored' && (
            <p className="text-xs text-parchment/40 italic">
              Necesitas descubrir esta ubicación primero
            </p>
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
