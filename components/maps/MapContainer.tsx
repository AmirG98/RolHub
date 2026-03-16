'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import { type Lore, getMapConfig, type MapLocation } from '@/lib/maps/map-config'
import { MapControls } from './MapControls'
import { MapBackground } from './MapBackground'
import { MapMarker } from './MapMarker'
import { MapPaths } from './MapPaths'
import { FogOfWar } from './FogOfWar'

interface MapContainerProps {
  lore: Lore
  locations: MapLocation[]
  currentLocationId?: string
  onLocationClick?: (location: MapLocation) => void
  onLocationHover?: (location: MapLocation | null) => void
  width?: number
  height?: number
  showFog?: boolean
  className?: string
}

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const ZOOM_SPEED = 1.1

export function MapContainer({
  lore,
  locations,
  currentLocationId,
  onLocationClick,
  onLocationHover,
  width = 800,
  height = 600,
  showFog = true,
  className = '',
}: MapContainerProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  const config = getMapConfig(lore)

  // Responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      const container = stageRef.current?.container()
      if (container) {
        const parent = container.parentElement
        if (parent) {
          setDimensions({
            width: parent.clientWidth,
            height: parent.clientHeight,
          })
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Zoom con rueda del mouse
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = direction > 0 ? oldScale * ZOOM_SPEED : oldScale / ZOOM_SPEED
    const boundedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))

    setScale(boundedScale)
    setPosition({
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    })
  }, [scale, position])

  // Controles de zoom
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(MAX_SCALE, scale * ZOOM_SPEED)
    setScale(newScale)
  }, [scale])

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(MIN_SCALE, scale / ZOOM_SPEED)
    setScale(newScale)
  }, [scale])

  const handleReset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Centrar en una locación
  const centerOnLocation = useCallback((location: MapLocation) => {
    const centerX = dimensions.width / 2 - location.coordinates.x * scale
    const centerY = dimensions.height / 2 - location.coordinates.y * scale
    setPosition({ x: centerX, y: centerY })
  }, [dimensions, scale])

  // Click en locación
  const handleLocationClick = useCallback((location: MapLocation) => {
    if (location.discovered || !showFog) {
      onLocationClick?.(location)
    }
  }, [onLocationClick, showFog])

  // Hover en locación
  const handleLocationHover = useCallback((location: MapLocation | null) => {
    setHoveredLocation(location)
    onLocationHover?.(location)
  }, [onLocationHover])

  // Drag del mapa
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false)
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    })
  }, [])

  // Locaciones descubiertas (para paths)
  const discoveredLocations = locations.filter(l => l.discovered || !showFog)

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Controles de zoom */}
      <MapControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        lore={lore}
      />

      {/* Canvas del mapa */}
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Capa de fondo */}
        <Layer>
          <MapBackground
            lore={lore}
            width={dimensions.width * 2}
            height={dimensions.height * 2}
          />
        </Layer>

        {/* Capa de caminos entre locaciones */}
        <Layer>
          <MapPaths
            locations={discoveredLocations}
            lore={lore}
          />
        </Layer>

        {/* Capa de niebla de guerra */}
        {showFog && (
          <Layer>
            <FogOfWar
              locations={locations}
              lore={lore}
              width={dimensions.width * 2}
              height={dimensions.height * 2}
            />
          </Layer>
        )}

        {/* Capa de marcadores */}
        <Layer>
          {locations.map((location) => (
            <MapMarker
              key={location.id}
              location={location}
              lore={lore}
              isCurrentLocation={location.id === currentLocationId}
              isHovered={hoveredLocation?.id === location.id}
              onClick={() => handleLocationClick(location)}
              onMouseEnter={() => handleLocationHover(location)}
              onMouseLeave={() => handleLocationHover(null)}
              showFog={showFog}
            />
          ))}
        </Layer>
      </Stage>

      {/* Tooltip de locación */}
      {hoveredLocation && (hoveredLocation.discovered || !showFog) && (
        <div
          className="absolute pointer-events-none z-50 px-3 py-2 rounded shadow-lg max-w-xs"
          style={{
            backgroundColor: config.secondaryColor,
            color: config.textColor,
            border: `1px solid ${config.primaryColor}`,
            fontFamily: config.fontFamily,
            left: '50%',
            bottom: '10px',
            transform: 'translateX(-50%)',
          }}
        >
          <h4
            className="font-bold text-sm"
            style={{ fontFamily: config.titleFontFamily }}
          >
            {hoveredLocation.name}
          </h4>
          <p className="text-xs opacity-80 mt-1">
            {hoveredLocation.description}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span>Peligro: {'⚔️'.repeat(hoveredLocation.dangerLevel)}</span>
            {hoveredLocation.visited && <span className="opacity-60">✓ Visitado</span>}
          </div>
        </div>
      )}

      {/* Indicador de locación actual */}
      {currentLocationId && (
        <div
          className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: config.primaryColor,
            color: config.backgroundColor,
            fontFamily: config.fontFamily,
          }}
        >
          📍 {locations.find(l => l.id === currentLocationId)?.name || 'Ubicación actual'}
        </div>
      )}
    </div>
  )
}
