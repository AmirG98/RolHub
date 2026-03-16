'use client'

import React, { useEffect, useRef } from 'react'
import { Rect, Circle, Line, Group } from 'react-konva'
import Konva from 'konva'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'

interface MapBackgroundProps {
  lore: Lore
  width: number
  height: number
}

export function MapBackground({ lore, width, height }: MapBackgroundProps) {
  const config = getMapConfig(lore)

  // Renderizar según el patrón de fondo del lore
  switch (config.backgroundPattern) {
    case 'parchment':
      return <ParchmentBackground width={width} height={height} config={config} />
    case 'stars':
      return <StarsBackground width={width} height={height} config={config} />
    case 'urban':
      return <UrbanBackground width={width} height={height} config={config} />
    case 'neon':
      return <NeonBackground width={width} height={height} config={config} />
    case 'sepia':
      return <SepiaBackground width={width} height={height} config={config} />
    case 'hexgrid':
      return <HexGridBackground width={width} height={height} config={config} />
    case 'grid':
      return <GridBackground width={width} height={height} config={config} />
    default:
      return <Rect x={0} y={0} width={width} height={height} fill={config.backgroundColor} />
  }
}

// Fondo de pergamino medieval (LOTR)
function ParchmentBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  return (
    <Group>
      {/* Base de pergamino */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Textura de ruido sutil */}
      {Array.from({ length: 100 }).map((_, i) => (
        <Circle
          key={i}
          x={Math.random() * width * 2 - width / 2}
          y={Math.random() * height * 2 - height / 2}
          radius={Math.random() * 3 + 1}
          fill={config.primaryColor}
          opacity={Math.random() * 0.1}
        />
      ))}
      {/* Bordes envejecidos */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        stroke={config.primaryColor}
        strokeWidth={4}
        fill="transparent"
      />
    </Group>
  )
}

// Fondo de estrellas (Star Wars)
function StarsBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    // Animación de parpadeo de estrellas
    const stars = groupRef.current?.children.filter(c => c.getClassName() === 'Circle')
    stars?.forEach((star, i) => {
      const anim = new Konva.Animation((frame) => {
        if (!frame) return
        const opacity = 0.3 + Math.sin(frame.time / 1000 + i * 0.5) * 0.4
        ;(star as Konva.Circle).opacity(Math.max(0.1, opacity))
      }, star.getLayer())
      anim.start()
    })
  }, [])

  return (
    <Group ref={groupRef}>
      {/* Fondo negro espacial */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Estrellas */}
      {Array.from({ length: 200 }).map((_, i) => (
        <Circle
          key={i}
          x={Math.random() * width * 2 - width / 2}
          y={Math.random() * height * 2 - height / 2}
          radius={Math.random() * 2 + 0.5}
          fill={i % 10 === 0 ? config.accentColor : '#ffffff'}
          opacity={Math.random() * 0.5 + 0.3}
        />
      ))}
      {/* Nebulosas sutiles */}
      <Circle
        x={width * 0.3}
        y={height * 0.4}
        radius={150}
        fill={config.primaryColor}
        opacity={0.1}
      />
      <Circle
        x={width * 0.7}
        y={height * 0.6}
        radius={120}
        fill={config.accentColor}
        opacity={0.08}
      />
    </Group>
  )
}

// Fondo urbano post-apocalíptico (Zombies)
function UrbanBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  return (
    <Group>
      {/* Fondo gris oscuro */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Grid de calles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <React.Fragment key={i}>
          {/* Líneas verticales */}
          <Line
            points={[i * 80 - width / 2, -height / 2, i * 80 - width / 2, height * 1.5]}
            stroke={config.primaryColor}
            strokeWidth={1}
            opacity={0.2}
          />
          {/* Líneas horizontales */}
          <Line
            points={[-width / 2, i * 80 - height / 2, width * 1.5, i * 80 - height / 2]}
            stroke={config.primaryColor}
            strokeWidth={1}
            opacity={0.2}
          />
        </React.Fragment>
      ))}
      {/* Manchas de suciedad */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Circle
          key={`dirt-${i}`}
          x={Math.random() * width * 2 - width / 2}
          y={Math.random() * height * 2 - height / 2}
          radius={Math.random() * 20 + 5}
          fill={config.secondaryColor}
          opacity={Math.random() * 0.3}
        />
      ))}
    </Group>
  )
}

// Fondo neon cyberpunk
function NeonBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    // Efecto de scanlines animadas
    const lines = groupRef.current?.findOne('#scanlines')
    if (lines) {
      const anim = new Konva.Animation((frame) => {
        if (!frame) return
        const y = (frame.time / 50) % height
        lines.y(y - height)
      }, lines.getLayer())
      anim.start()
    }
  }, [height])

  return (
    <Group ref={groupRef}>
      {/* Fondo negro */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Grid de ciudad */}
      {Array.from({ length: 30 }).map((_, i) => (
        <React.Fragment key={i}>
          <Line
            points={[i * 60 - width / 2, -height / 2, i * 60 - width / 2, height * 1.5]}
            stroke={config.primaryColor}
            strokeWidth={1}
            opacity={0.15}
          />
          <Line
            points={[-width / 2, i * 60 - height / 2, width * 1.5, i * 60 - height / 2]}
            stroke={config.accentColor}
            strokeWidth={1}
            opacity={0.1}
          />
        </React.Fragment>
      ))}
      {/* Bloques de edificios */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Rect
          key={`building-${i}`}
          x={Math.random() * width * 1.5 - width / 4}
          y={Math.random() * height * 1.5 - height / 4}
          width={Math.random() * 100 + 40}
          height={Math.random() * 100 + 40}
          fill={config.secondaryColor}
          stroke={config.primaryColor}
          strokeWidth={1}
          opacity={0.4}
        />
      ))}
      {/* Scanlines */}
      <Group id="scanlines">
        {Array.from({ length: Math.ceil(height / 3) }).map((_, i) => (
          <Line
            key={`scan-${i}`}
            points={[-width / 2, i * 3, width * 1.5, i * 3]}
            stroke="#000000"
            strokeWidth={1}
            opacity={0.1}
          />
        ))}
      </Group>
    </Group>
  )
}

// Fondo sepia vintage (Lovecraft)
function SepiaBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  return (
    <Group>
      {/* Base sepia */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Viñeta oscura en los bordes */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
        fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={width}
        fillRadialGradientColorStops={[
          0, 'transparent',
          0.6, 'transparent',
          1, 'rgba(0,0,0,0.7)',
        ]}
      />
      {/* Manchas de edad */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Circle
          key={i}
          x={Math.random() * width * 2 - width / 2}
          y={Math.random() * height * 2 - height / 2}
          radius={Math.random() * 15 + 5}
          fill={config.primaryColor}
          opacity={Math.random() * 0.15}
        />
      ))}
      {/* Símbolos arcanos sutiles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Circle
          key={`arcane-${i}`}
          x={Math.random() * width * 1.5}
          y={Math.random() * height * 1.5}
          radius={30}
          stroke={config.accentColor}
          strokeWidth={1}
          opacity={0.1}
        />
      ))}
    </Group>
  )
}

// Fondo de grid hexagonal (Vikingos)
function HexGridBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  const hexSize = 40
  const hexHeight = hexSize * Math.sqrt(3)

  return (
    <Group>
      {/* Fondo oceánico */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Grid hexagonal */}
      {Array.from({ length: Math.ceil(width * 2 / (hexSize * 1.5)) }).map((_, col) =>
        Array.from({ length: Math.ceil(height * 2 / hexHeight) }).map((_, row) => {
          const x = col * hexSize * 1.5 - width / 2
          const y = row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0) - height / 2
          return (
            <Line
              key={`hex-${col}-${row}`}
              points={getHexPoints(x, y, hexSize * 0.9)}
              closed
              stroke={config.primaryColor}
              strokeWidth={0.5}
              opacity={0.2}
            />
          )
        })
      )}
      {/* Olas sutiles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Line
          key={`wave-${i}`}
          points={getWavePoints(width, i * 80 - height / 4)}
          stroke={config.pathColor}
          strokeWidth={1}
          opacity={0.1}
          tension={0.5}
        />
      ))}
    </Group>
  )
}

// Fondo de grid cuadrado (Isekai)
function GridBackground({ width, height, config }: { width: number; height: number; config: ReturnType<typeof getMapConfig> }) {
  const gridSize = 50

  return (
    <Group>
      {/* Fondo claro */}
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width * 2}
        height={height * 2}
        fill={config.backgroundColor}
      />
      {/* Grid de cuadrados */}
      {Array.from({ length: Math.ceil(width * 2 / gridSize) + 1 }).map((_, i) => (
        <React.Fragment key={i}>
          <Line
            points={[i * gridSize - width / 2, -height / 2, i * gridSize - width / 2, height * 1.5]}
            stroke={config.secondaryColor}
            strokeWidth={1}
            opacity={0.2}
          />
          <Line
            points={[-width / 2, i * gridSize - height / 2, width * 1.5, i * gridSize - height / 2]}
            stroke={config.secondaryColor}
            strokeWidth={1}
            opacity={0.2}
          />
        </React.Fragment>
      ))}
      {/* Decoraciones de estrellas */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Circle
          key={`star-${i}`}
          x={Math.random() * width * 1.5}
          y={Math.random() * height * 1.5}
          radius={3}
          fill={config.accentColor}
          opacity={Math.random() * 0.4 + 0.2}
        />
      ))}
    </Group>
  )
}

// Helper: puntos de un hexágono
function getHexPoints(cx: number, cy: number, size: number): number[] {
  const points: number[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    points.push(cx + size * Math.cos(angle))
    points.push(cy + size * Math.sin(angle))
  }
  return points
}

// Helper: puntos de ola
function getWavePoints(width: number, y: number): number[] {
  const points: number[] = []
  for (let x = -width / 2; x < width * 1.5; x += 20) {
    points.push(x)
    points.push(y + Math.sin(x / 30) * 10)
  }
  return points
}
