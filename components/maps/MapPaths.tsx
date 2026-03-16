'use client'

import React, { useEffect, useRef } from 'react'
import { Line, Group, Arrow } from 'react-konva'
import Konva from 'konva'
import { type Lore, type MapLocation, getMapConfig } from '@/lib/maps/map-config'

interface MapPathsProps {
  locations: MapLocation[]
  lore: Lore
}

export function MapPaths({ locations, lore }: MapPathsProps) {
  const groupRef = useRef<Konva.Group>(null)
  const config = getMapConfig(lore)

  // Crear mapa de locaciones por ID para búsqueda rápida
  const locationMap = new Map(locations.map(l => [l.id, l]))

  // Generar paths únicos (evitar duplicados A->B y B->A)
  const paths: Array<{ from: MapLocation; to: MapLocation }> = []
  const processedPairs = new Set<string>()

  locations.forEach(location => {
    location.connections.forEach(connId => {
      const connected = locationMap.get(connId)
      if (connected && connected.discovered) {
        const pairKey = [location.id, connId].sort().join('-')
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey)
          paths.push({ from: location, to: connected })
        }
      }
    })
  })

  // Animación para paths animados (hyperespacio, rutas marítimas)
  useEffect(() => {
    if (config.pathStyle === 'animated') {
      const lines = groupRef.current?.children
      lines?.forEach((line, i) => {
        if (line instanceof Konva.Line) {
          const anim = new Konva.Animation((frame) => {
            if (!frame) return
            const dashOffset = (frame.time / 50 + i * 10) % 20
            line.dashOffset(-dashOffset)
          }, line.getLayer())
          anim.start()
          return () => anim.stop()
        }
      })
    }
  }, [config.pathStyle])

  const getPathPoints = (from: MapLocation, to: MapLocation): number[] => {
    return [from.coordinates.x, from.coordinates.y, to.coordinates.x, to.coordinates.y]
  }

  const getDash = (): number[] | undefined => {
    switch (config.pathStyle) {
      case 'dashed':
        return [15, 10]
      case 'dotted':
        return [5, 5]
      case 'animated':
        return [10, 10]
      default:
        return undefined
    }
  }

  const renderPath = (from: MapLocation, to: MapLocation, index: number) => {
    const points = getPathPoints(from, to)
    const dash = getDash()

    // Estilo especial según lore
    switch (lore) {
      case 'STAR_WARS':
        return (
          <Group key={index}>
            {/* Línea de hyperespacio con glow */}
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={3}
              opacity={0.3}
              shadowColor={config.pathColor}
              shadowBlur={15}
            />
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={1}
              dash={dash}
              opacity={0.8}
            />
          </Group>
        )

      case 'CYBERPUNK':
        return (
          <Group key={index}>
            {/* Línea de datos con efecto neon */}
            <Line
              points={points}
              stroke={config.accentColor}
              strokeWidth={2}
              opacity={0.3}
              shadowColor={config.accentColor}
              shadowBlur={10}
            />
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={1}
              dash={dash}
            />
          </Group>
        )

      case 'VIKINGOS':
        return (
          <Group key={index}>
            {/* Ruta marítima con ondas */}
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={2}
              dash={[20, 10, 5, 10]}
              opacity={0.6}
              tension={0.3}
            />
            {/* Flecha de dirección */}
            <Arrow
              points={getArrowPoints(from, to)}
              fill={config.pathColor}
              stroke={config.pathColor}
              strokeWidth={1}
              pointerLength={8}
              pointerWidth={6}
              opacity={0.5}
            />
          </Group>
        )

      case 'LOVECRAFT':
        return (
          <Group key={index}>
            {/* Línea misteriosa y fragmentada */}
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={1}
              dash={[3, 8, 1, 8]}
              opacity={0.4}
            />
          </Group>
        )

      case 'ISEKAI':
        return (
          <Group key={index}>
            {/* Camino de aventura colorido */}
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={3}
              opacity={0.3}
            />
            <Line
              points={points}
              stroke="#ffffff"
              strokeWidth={1}
              dash={[5, 5]}
              opacity={0.8}
            />
          </Group>
        )

      case 'ZOMBIES':
        return (
          <Group key={index}>
            {/* Ruta de escape/peligro */}
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={2}
              dash={[10, 5]}
              opacity={0.4}
            />
          </Group>
        )

      default:
        // LOTR - camino medieval en pergamino
        return (
          <Group key={index}>
            <Line
              points={points}
              stroke={config.pathColor}
              strokeWidth={2}
              dash={dash}
              opacity={0.6}
              lineCap="round"
              lineJoin="round"
            />
          </Group>
        )
    }
  }

  return (
    <Group ref={groupRef}>
      {paths.map((path, index) => renderPath(path.from, path.to, index))}
    </Group>
  )
}

// Helper: calcular punto medio para flecha de dirección
function getArrowPoints(from: MapLocation, to: MapLocation): number[] {
  const midX = (from.coordinates.x + to.coordinates.x) / 2
  const midY = (from.coordinates.y + to.coordinates.y) / 2

  // Punto un poco antes del medio hacia el destino
  const dx = to.coordinates.x - from.coordinates.x
  const dy = to.coordinates.y - from.coordinates.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const normX = dx / len
  const normY = dy / len

  return [
    midX - normX * 20,
    midY - normY * 20,
    midX + normX * 20,
    midY + normY * 20,
  ]
}
