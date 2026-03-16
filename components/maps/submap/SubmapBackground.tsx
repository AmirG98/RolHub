'use client'

import React from 'react'
import { Group, Rect, Line, Circle } from 'react-konva'
import { type Lore } from '@/lib/maps/map-config'
import { type SubmapType, SUBMAP_THEMES } from '@/lib/maps/submap-types'

interface SubmapBackgroundProps {
  width: number
  height: number
  lore: Lore
  type: SubmapType
}

// Colores de fondo por tipo de submapa y lore
const BACKGROUND_COLORS: Record<SubmapType, Record<Lore, { bg: string; pattern: string }>> = {
  city: {
    LOTR: { bg: '#2C2416', pattern: '#3D3220' },
    ZOMBIES: { bg: '#1a1a1a', pattern: '#252525' },
    ISEKAI: { bg: '#e8f4fc', pattern: '#d0e8f5' },
    VIKINGOS: { bg: '#2c3e50', pattern: '#34495e' },
    STAR_WARS: { bg: '#0a0a1a', pattern: '#12122a' },
    CYBERPUNK: { bg: '#0d0d0d', pattern: '#1a1a2e' },
    LOVECRAFT: { bg: '#1a1510', pattern: '#2d2520' },
  },
  dungeon: {
    LOTR: { bg: '#1C1208', pattern: '#2A1C0F' },
    ZOMBIES: { bg: '#151515', pattern: '#1f1f1f' },
    ISEKAI: { bg: '#3d3d5c', pattern: '#4a4a6a' },
    VIKINGOS: { bg: '#1a252f', pattern: '#243440' },
    STAR_WARS: { bg: '#05050f', pattern: '#0a0a1a' },
    CYBERPUNK: { bg: '#0a0a0a', pattern: '#151520' },
    LOVECRAFT: { bg: '#0a0805', pattern: '#15120d' },
  },
  wilderness: {
    LOTR: { bg: '#1A3A2A', pattern: '#2A4A3A' },
    ZOMBIES: { bg: '#1a2a1a', pattern: '#253025' },
    ISEKAI: { bg: '#a8d8a8', pattern: '#b8e8b8' },
    VIKINGOS: { bg: '#1e3a3a', pattern: '#284848' },
    STAR_WARS: { bg: '#2a1a0a', pattern: '#3a2a1a' },
    CYBERPUNK: { bg: '#0a1a0a', pattern: '#152515' },
    LOVECRAFT: { bg: '#1a2020', pattern: '#252a2a' },
  },
  stronghold: {
    LOTR: { bg: '#2C2416', pattern: '#3D3220' },
    ZOMBIES: { bg: '#202020', pattern: '#2a2a2a' },
    ISEKAI: { bg: '#d8d8e8', pattern: '#c8c8d8' },
    VIKINGOS: { bg: '#2c3e50', pattern: '#34495e' },
    STAR_WARS: { bg: '#101020', pattern: '#1a1a30' },
    CYBERPUNK: { bg: '#15151f', pattern: '#1f1f2a' },
    LOVECRAFT: { bg: '#201a15', pattern: '#2a2520' },
  },
  nautical: {
    LOTR: { bg: '#1a3050', pattern: '#254060' },
    ZOMBIES: { bg: '#152535', pattern: '#203545' },
    ISEKAI: { bg: '#87ceeb', pattern: '#9dd8f5' },
    VIKINGOS: { bg: '#1a3a4a', pattern: '#254a5a' },
    STAR_WARS: { bg: '#050515', pattern: '#0a0a25' },
    CYBERPUNK: { bg: '#0a1525', pattern: '#152035' },
    LOVECRAFT: { bg: '#101a25', pattern: '#1a2530' },
  },
}

export function SubmapBackground({ width, height, lore, type }: SubmapBackgroundProps) {
  const colors = BACKGROUND_COLORS[type]?.[lore] || { bg: '#1a1a1a', pattern: '#252525' }
  const theme = SUBMAP_THEMES[lore]

  // Diferentes patrones según el tipo
  const renderPattern = () => {
    switch (type) {
      case 'city':
        return <CityPattern width={width} height={height} color={colors.pattern} />
      case 'dungeon':
        return <DungeonPattern width={width} height={height} color={colors.pattern} />
      case 'wilderness':
        return <WildernessPattern width={width} height={height} color={colors.pattern} lore={lore} />
      case 'stronghold':
        return <StrongholdPattern width={width} height={height} color={colors.pattern} />
      case 'nautical':
        return <NauticalPattern width={width} height={height} color={colors.pattern} />
      default:
        return null
    }
  }

  return (
    <Group>
      {/* Fondo base */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={colors.bg}
      />

      {/* Patrón según tipo */}
      {renderPattern()}

      {/* Borde del mapa */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke={theme.colors.node}
        strokeWidth={4}
        listening={false}
      />

      {/* Esquinas decorativas */}
      <CornerDecorations width={width} height={height} color={theme.colors.node} />
    </Group>
  )
}

// Patrón de ciudad (grid de calles)
function CityPattern({ width, height, color }: { width: number; height: number; color: string }) {
  const gridSize = 80
  const lines: JSX.Element[] = []

  // Líneas verticales
  for (let x = gridSize; x < width; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={color}
        strokeWidth={1}
        opacity={0.3}
      />
    )
  }

  // Líneas horizontales
  for (let y = gridSize; y < height; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={color}
        strokeWidth={1}
        opacity={0.3}
      />
    )
  }

  return <Group>{lines}</Group>
}

// Patrón de dungeon (piedras)
function DungeonPattern({ width, height, color }: { width: number; height: number; color: string }) {
  const stones: JSX.Element[] = []
  const stoneSize = 40

  for (let y = 0; y < height; y += stoneSize) {
    const offset = (Math.floor(y / stoneSize) % 2) * (stoneSize / 2)
    for (let x = offset; x < width; x += stoneSize) {
      stones.push(
        <Rect
          key={`stone-${x}-${y}`}
          x={x + 2}
          y={y + 2}
          width={stoneSize - 4}
          height={stoneSize - 4}
          stroke={color}
          strokeWidth={1}
          cornerRadius={2}
          opacity={0.2}
        />
      )
    }
  }

  return <Group>{stones}</Group>
}

// Patrón de wilderness (árboles/vegetación)
function WildernessPattern({ width, height, color, lore }: { width: number; height: number; color: string; lore: Lore }) {
  const elements: JSX.Element[] = []
  const spacing = 60

  // Diferentes símbolos según lore
  const getSymbol = (x: number, y: number) => {
    const hash = (x * 31 + y * 17) % 10

    switch (lore) {
      case 'LOTR':
      case 'VIKINGOS':
        // Árboles pequeños
        return hash < 6 ? (
          <Group key={`tree-${x}-${y}`} x={x} y={y}>
            <Line points={[0, 10, 0, 0]} stroke={color} strokeWidth={2} opacity={0.3} />
            <Circle y={-5} radius={8} fill={color} opacity={0.15} />
          </Group>
        ) : null
      case 'ZOMBIES':
        // Escombros
        return hash < 4 ? (
          <Rect
            key={`debris-${x}-${y}`}
            x={x - 5}
            y={y - 5}
            width={10}
            height={10}
            fill={color}
            rotation={(hash * 36) % 360}
            opacity={0.2}
          />
        ) : null
      case 'ISEKAI':
        // Flores
        return hash < 5 ? (
          <Circle
            key={`flower-${x}-${y}`}
            x={x}
            y={y}
            radius={4}
            fill={hash % 2 === 0 ? '#FF69B4' : '#FFD700'}
            opacity={0.4}
          />
        ) : null
      case 'STAR_WARS':
        // Estrellas
        return (
          <Circle
            key={`star-${x}-${y}`}
            x={x}
            y={y}
            radius={1 + (hash % 2)}
            fill="#ffffff"
            opacity={0.3 + (hash % 3) * 0.1}
          />
        )
      case 'CYBERPUNK':
        // Líneas de circuito
        return hash < 3 ? (
          <Line
            key={`circuit-${x}-${y}`}
            points={[x, y, x + 20, y, x + 20, y + 20]}
            stroke={color}
            strokeWidth={1}
            opacity={0.2}
          />
        ) : null
      case 'LOVECRAFT':
        // Tentáculos/símbolos
        return hash < 2 ? (
          <Line
            key={`tentacle-${x}-${y}`}
            points={[x, y, x + 10, y - 10, x + 15, y + 5]}
            stroke={color}
            strokeWidth={2}
            opacity={0.15}
            tension={0.5}
          />
        ) : null
      default:
        return null
    }
  }

  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      const jitterX = ((x * 17 + y * 23) % 20) - 10
      const jitterY = ((x * 13 + y * 31) % 20) - 10
      const element = getSymbol(x + jitterX, y + jitterY)
      if (element) elements.push(element)
    }
  }

  return <Group>{elements}</Group>
}

// Patrón de fortaleza (líneas estructurales)
function StrongholdPattern({ width, height, color }: { width: number; height: number; color: string }) {
  return (
    <Group>
      {/* Marco interno */}
      <Rect
        x={40}
        y={40}
        width={width - 80}
        height={height - 80}
        stroke={color}
        strokeWidth={2}
        opacity={0.2}
      />
      {/* Líneas de refuerzo */}
      <Line
        points={[40, 40, width - 40, height - 40]}
        stroke={color}
        strokeWidth={1}
        opacity={0.1}
        dash={[20, 10]}
      />
      <Line
        points={[width - 40, 40, 40, height - 40]}
        stroke={color}
        strokeWidth={1}
        opacity={0.1}
        dash={[20, 10]}
      />
    </Group>
  )
}

// Patrón náutico (olas)
function NauticalPattern({ width, height, color }: { width: number; height: number; color: string }) {
  const waves: JSX.Element[] = []
  const waveHeight = 30

  for (let y = waveHeight; y < height; y += waveHeight * 2) {
    const points: number[] = []
    for (let x = 0; x <= width; x += 20) {
      points.push(x, y + Math.sin(x / 30) * 5)
    }
    waves.push(
      <Line
        key={`wave-${y}`}
        points={points}
        stroke={color}
        strokeWidth={1}
        opacity={0.3}
        tension={0.5}
      />
    )
  }

  return <Group>{waves}</Group>
}

// Decoraciones de esquinas
function CornerDecorations({ width, height, color }: { width: number; height: number; color: string }) {
  const size = 20
  const offset = 5

  return (
    <Group>
      {/* Esquina superior izquierda */}
      <Line points={[offset, offset + size, offset, offset, offset + size, offset]} stroke={color} strokeWidth={3} />
      {/* Esquina superior derecha */}
      <Line points={[width - offset - size, offset, width - offset, offset, width - offset, offset + size]} stroke={color} strokeWidth={3} />
      {/* Esquina inferior izquierda */}
      <Line points={[offset, height - offset - size, offset, height - offset, offset + size, height - offset]} stroke={color} strokeWidth={3} />
      {/* Esquina inferior derecha */}
      <Line points={[width - offset - size, height - offset, width - offset, height - offset, width - offset, height - offset - size]} stroke={color} strokeWidth={3} />
    </Group>
  )
}
