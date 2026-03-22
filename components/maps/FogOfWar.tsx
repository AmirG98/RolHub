'use client'

import React, { useEffect, useRef } from 'react'
import { Rect, Circle, Group } from 'react-konva'
import Konva from 'konva'
import { type Lore, type MapLocation, getMapConfig } from '@/lib/maps/map-config'

interface FogOfWarProps {
  locations: MapLocation[]
  lore: Lore
  width: number
  height: number
}

export function FogOfWar({ locations, lore, width, height }: FogOfWarProps) {
  const groupRef = useRef<Konva.Group>(null)
  const config = getMapConfig(lore)

  // Locaciones descubiertas crean "huecos" en la niebla
  const discoveredLocations = locations.filter(l => l.discovered)

  // Animación de niebla para Lovecraft
  useEffect(() => {
    if (config.ambientAnimationType === 'fog' && groupRef.current) {
      const fogElements = groupRef.current.children.filter(c => c.getClassName() === 'Circle')
      fogElements.forEach((fog, i) => {
        const anim = new Konva.Animation((frame) => {
          if (!frame) return
          const opacity = config.fogOpacity - 0.1 + Math.sin(frame.time / 2000 + i) * 0.1
          ;(fog as Konva.Circle).opacity(Math.max(0.3, opacity))
          const scale = 1 + Math.sin(frame.time / 3000 + i * 0.5) * 0.05
          fog.scaleX(scale)
          fog.scaleY(scale)
        }, fog.getLayer())
        anim.start()
      })
    }
  }, [config.ambientAnimationType, config.fogOpacity])

  // Renderizar estilo de niebla según lore
  const renderFogStyle = () => {
    switch (lore) {
      case 'LOVECRAFT_HORROR':
        return <LovecraftFog width={width} height={height} config={config} discoveredLocations={discoveredLocations} />
      case 'STAR_WARS':
        return <SpaceFog width={width} height={height} config={config} discoveredLocations={discoveredLocations} />
      case 'CYBERPUNK':
        return <DataFog width={width} height={height} config={config} discoveredLocations={discoveredLocations} />
      case 'ZOMBIES':
        return <DarknessFog width={width} height={height} config={config} discoveredLocations={discoveredLocations} />
      default:
        return <StandardFog width={width} height={height} config={config} discoveredLocations={discoveredLocations} />
    }
  }

  return (
    <Group ref={groupRef}>
      {renderFogStyle()}
    </Group>
  )
}

interface FogStyleProps {
  width: number
  height: number
  config: ReturnType<typeof getMapConfig>
  discoveredLocations: MapLocation[]
}

// Niebla estándar (LOTR, Vikingos, Isekai)
function StandardFog({ width, height, config, discoveredLocations }: FogStyleProps) {
  // Radio de visibilidad más grande para ubicaciones visitadas
  const getVisibilityRadius = (loc: MapLocation) => loc.visited ? 140 : 100

  // Crear puntos de niebla que cubren áreas no descubiertas
  const fogCells: Array<{ x: number; y: number; radius: number; opacity: number }> = []
  const cellSize = 70

  for (let x = -width / 2; x < width * 1.5; x += cellSize) {
    for (let y = -height / 2; y < height * 1.5; y += cellSize) {
      // Calcular distancia mínima a cualquier locación descubierta
      let minDistance = Infinity
      discoveredLocations.forEach(loc => {
        const dx = loc.coordinates.x - x
        const dy = loc.coordinates.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const visRadius = getVisibilityRadius(loc)
        const adjustedDistance = distance - visRadius
        if (adjustedDistance < minDistance) {
          minDistance = adjustedDistance
        }
      })

      // Solo crear fog si está lejos de ubicaciones descubiertas
      if (minDistance > 0) {
        // Opacity gradual basada en distancia (más cerca = más transparente)
        const fadeDistance = 60 // Distancia de transición
        const opacity = minDistance < fadeDistance
          ? (minDistance / fadeDistance) * config.fogOpacity * 0.8
          : config.fogOpacity * 0.8

        fogCells.push({
          x: x + Math.random() * 15 - 7.5,
          y: y + Math.random() * 15 - 7.5,
          radius: cellSize * 0.75 + Math.random() * 15,
          opacity,
        })
      }
    }
  }

  return (
    <Group>
      {/* Celdas de niebla con opacity gradual */}
      {fogCells.map((cell, i) => (
        <Circle
          key={i}
          x={cell.x}
          y={cell.y}
          radius={cell.radius}
          fill={config.fogColor}
          opacity={cell.opacity}
        />
      ))}
      {/* Bordes suaves con gradiente radial mejorado */}
      {discoveredLocations.map((loc, i) => {
        const radius = getVisibilityRadius(loc) + 40
        return (
          <Circle
            key={`edge-${i}`}
            x={loc.coordinates.x}
            y={loc.coordinates.y}
            radius={radius}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={radius * 0.5}
            fillRadialGradientEndRadius={radius}
            fillRadialGradientColorStops={[
              0, 'transparent',
              0.6, 'transparent',
              0.85, `${config.fogColor}40`,
              1, config.fogColor,
            ]}
            opacity={config.fogOpacity * 0.7}
          />
        )
      })}
    </Group>
  )
}

// Niebla lovecraftiana - más densa y perturbadora
function LovecraftFog({ width, height, config, discoveredLocations }: FogStyleProps) {
  const fogElements: Array<{ x: number; y: number; radius: number }> = []

  // Niebla más densa y con formas orgánicas
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width * 2 - width / 2
    const y = Math.random() * height * 2 - height / 2

    // Verificar distancia a locaciones descubiertas
    const nearDiscovered = discoveredLocations.some(loc => {
      const dx = loc.coordinates.x - x
      const dy = loc.coordinates.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 80
    })

    if (!nearDiscovered) {
      fogElements.push({
        x,
        y,
        radius: Math.random() * 100 + 50,
      })
    }
  }

  return (
    <Group>
      {/* Capa base de oscuridad */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.fogColor}
        opacity={config.fogOpacity * 0.3}
      />
      {/* Elementos de niebla orgánicos */}
      {fogElements.map((el, i) => (
        <Circle
          key={i}
          x={el.x}
          y={el.y}
          radius={el.radius}
          fill={config.fogColor}
          opacity={config.fogOpacity * (0.5 + Math.random() * 0.3)}
        />
      ))}
      {/* Ojos que observan desde la oscuridad (easter egg) */}
      {fogElements.slice(0, 3).map((el, i) => (
        <Circle
          key={`eye-${i}`}
          x={el.x}
          y={el.y}
          radius={5}
          fill={config.accentColor}
          opacity={0.3}
        />
      ))}
      {/* Zonas claras alrededor de lo descubierto */}
      {discoveredLocations.map((loc, i) => (
        <Circle
          key={`clear-${i}`}
          x={loc.coordinates.x}
          y={loc.coordinates.y}
          radius={100}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={40}
          fillRadialGradientEndRadius={100}
          fillRadialGradientColorStops={[
            0, 'transparent',
            0.5, 'rgba(0,0,0,0.3)',
            1, config.fogColor,
          ]}
          opacity={0.8}
        />
      ))}
    </Group>
  )
}

// Niebla espacial (Star Wars) - regiones inexploradas del espacio
function SpaceFog({ width, height, config, discoveredLocations }: FogStyleProps) {
  return (
    <Group>
      {/* El espacio desconocido es simplemente más oscuro */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.fogColor}
        opacity={config.fogOpacity}
      />
      {/* Huecos en la niebla para zonas descubiertas */}
      {discoveredLocations.map((loc, i) => (
        <Circle
          key={i}
          x={loc.coordinates.x}
          y={loc.coordinates.y}
          radius={150}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={150}
          fillRadialGradientColorStops={[
            0, 'transparent',
            0.6, 'transparent',
            1, config.fogColor,
          ]}
          globalCompositeOperation="destination-out"
        />
      ))}
      {/* Texto de "Regiones Desconocidas" */}
      <Rect
        x={-width / 4}
        y={-height / 4}
        width={80}
        height={20}
        fill="transparent"
      />
    </Group>
  )
}

// Niebla de datos (Cyberpunk) - zonas sin cobertura de red
function DataFog({ width, height, config, discoveredLocations }: FogStyleProps) {
  const gridSize = 30

  return (
    <Group>
      {/* Grid de fondo con "static" */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.fogColor}
        opacity={config.fogOpacity * 0.7}
      />
      {/* Efecto de glitch/ruido */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Rect
          key={i}
          x={Math.random() * width * 2 - width / 2}
          y={Math.random() * height * 2 - height / 2}
          width={Math.random() * 100 + 20}
          height={Math.random() * 5 + 2}
          fill={config.primaryColor}
          opacity={0.1}
        />
      ))}
      {/* Zonas con "señal" */}
      {discoveredLocations.map((loc, i) => (
        <Group key={i}>
          <Circle
            x={loc.coordinates.x}
            y={loc.coordinates.y}
            radius={120}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={120}
            fillRadialGradientColorStops={[
              0, 'transparent',
              0.7, 'transparent',
              1, config.fogColor,
            ]}
          />
          {/* Hexágono de "zona conectada" */}
          <Circle
            x={loc.coordinates.x}
            y={loc.coordinates.y}
            radius={80}
            stroke={config.primaryColor}
            strokeWidth={1}
            opacity={0.2}
            dash={[5, 5]}
          />
        </Group>
      ))}
    </Group>
  )
}

// Oscuridad total (Zombies) - zonas de alto peligro
function DarknessFog({ width, height, config, discoveredLocations }: FogStyleProps) {
  return (
    <Group>
      {/* Oscuridad densa */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.fogColor}
        opacity={config.fogOpacity}
      />
      {/* Zonas "seguras" con visibilidad */}
      {discoveredLocations.map((loc, i) => (
        <Circle
          key={i}
          x={loc.coordinates.x}
          y={loc.coordinates.y}
          radius={loc.type === 'safe' ? 150 : 100}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={loc.type === 'safe' ? 150 : 100}
          fillRadialGradientColorStops={[
            0, 'transparent',
            0.5, 'transparent',
            0.8, 'rgba(0,0,0,0.5)',
            1, config.fogColor,
          ]}
          opacity={0.9}
        />
      ))}
    </Group>
  )
}
