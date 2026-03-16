'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Line, Group, Circle, Text, RegularPolygon } from 'react-konva'
import Konva from 'konva'
import {
  type BattleMap,
  type BattleToken,
  type TerrainCell,
  type AreaEffect,
  type GridType,
  TERRAIN_COLORS,
  CONDITION_ICONS,
  calculateDistance,
} from '@/lib/maps/battle-types'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'

interface BattleGridProps {
  battleMap: BattleMap
  onTokenMove?: (tokenId: string, x: number, y: number) => void
  onTokenSelect?: (token: BattleToken | null) => void
  onCellClick?: (x: number, y: number) => void
  selectedTokenId?: string
  showDistance?: boolean
  className?: string
}

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const ZOOM_SPEED = 1.1

export function BattleGrid({
  battleMap,
  onTokenMove,
  onTokenSelect,
  onCellClick,
  selectedTokenId,
  showDistance = true,
  className = '',
}: BattleGridProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  const [draggingToken, setDraggingToken] = useState<string | null>(null)

  const config = getMapConfig(battleMap.lore)
  const { cellSize, width, height, gridType } = battleMap

  const canvasWidth = gridType === 'hex'
    ? width * cellSize * 1.5 + cellSize
    : width * cellSize
  const canvasHeight = gridType === 'hex'
    ? height * cellSize * Math.sqrt(3) / 2 + cellSize
    : height * cellSize

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

  // Convertir coordenadas de pixel a celda
  const pixelToCell = useCallback((px: number, py: number): { x: number; y: number } => {
    if (gridType === 'hex') {
      const hexHeight = cellSize * Math.sqrt(3) / 2
      const row = Math.floor(py / hexHeight)
      const offset = row % 2 === 1 ? cellSize * 0.75 : 0
      const col = Math.floor((px - offset) / (cellSize * 1.5))
      return { x: Math.max(0, Math.min(width - 1, col)), y: Math.max(0, Math.min(height - 1, row)) }
    } else {
      return {
        x: Math.max(0, Math.min(width - 1, Math.floor(px / cellSize))),
        y: Math.max(0, Math.min(height - 1, Math.floor(py / cellSize))),
      }
    }
  }, [gridType, cellSize, width, height])

  // Convertir coordenadas de celda a pixel (centro)
  const cellToPixel = useCallback((cx: number, cy: number): { x: number; y: number } => {
    if (gridType === 'hex') {
      const hexHeight = cellSize * Math.sqrt(3) / 2
      const offset = cy % 2 === 1 ? cellSize * 0.75 : 0
      return {
        x: cx * cellSize * 1.5 + cellSize / 2 + offset,
        y: cy * hexHeight + hexHeight / 2,
      }
    } else {
      return {
        x: cx * cellSize + cellSize / 2,
        y: cy * cellSize + cellSize / 2,
      }
    }
  }, [gridType, cellSize])

  // Handle click en celda vacía
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.currentTarget || e.target.getClassName() === 'Rect' || e.target.getClassName() === 'RegularPolygon') {
      const stage = stageRef.current
      if (!stage) return

      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const adjustedX = (pointer.x - position.x) / scale
      const adjustedY = (pointer.y - position.y) / scale

      const cell = pixelToCell(adjustedX, adjustedY)
      onCellClick?.(cell.x, cell.y)
      onTokenSelect?.(null)
    }
  }, [position, scale, pixelToCell, onCellClick, onTokenSelect])

  // Handle mouse move para hover
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const adjustedX = (pointer.x - position.x) / scale
    const adjustedY = (pointer.y - position.y) / scale

    setHoveredCell(pixelToCell(adjustedX, adjustedY))
  }, [position, scale, pixelToCell])

  // Token seleccionado
  const selectedToken = battleMap.tokens.find(t => t.id === selectedTokenId)

  return (
    <div className={`relative overflow-hidden rounded-lg border-2 ${className}`} style={{ borderColor: config.primaryColor }}>
      {/* Controles de zoom */}
      <div className="absolute top-2 right-2 z-50 flex flex-col gap-1">
        <button
          onClick={() => setScale(Math.min(MAX_SCALE, scale * ZOOM_SPEED))}
          className="w-8 h-8 rounded flex items-center justify-center text-lg hover:brightness-125"
          style={{ backgroundColor: config.secondaryColor, color: config.textColor, border: `1px solid ${config.primaryColor}` }}
        >
          +
        </button>
        <div
          className="w-8 h-6 rounded flex items-center justify-center text-xs"
          style={{ backgroundColor: config.backgroundColor, color: config.textColor, border: `1px solid ${config.primaryColor}` }}
        >
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={() => setScale(Math.max(MIN_SCALE, scale / ZOOM_SPEED))}
          className="w-8 h-8 rounded flex items-center justify-center text-lg hover:brightness-125"
          style={{ backgroundColor: config.secondaryColor, color: config.textColor, border: `1px solid ${config.primaryColor}` }}
        >
          −
        </button>
      </div>

      {/* Grid */}
      <Stage
        ref={stageRef}
        width={800}
        height={600}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCell(null)}
        draggable
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        style={{ cursor: draggingToken ? 'grabbing' : 'grab', backgroundColor: config.secondaryColor }}
      >
        {/* Capa de terreno */}
        <Layer>
          {battleMap.terrain.map((cell, i) => (
            <TerrainCellShape
              key={i}
              cell={cell}
              cellSize={cellSize}
              gridType={gridType}
              isHovered={hoveredCell?.x === cell.x && hoveredCell?.y === cell.y}
              cellToPixel={cellToPixel}
            />
          ))}
        </Layer>

        {/* Capa de grid */}
        <Layer>
          <GridLines
            width={width}
            height={height}
            cellSize={cellSize}
            gridType={gridType}
            color={config.primaryColor}
          />
        </Layer>

        {/* Capa de efectos de área */}
        <Layer>
          {battleMap.effects.map(effect => (
            <AreaEffectShape
              key={effect.id}
              effect={effect}
              cellSize={cellSize}
              cellToPixel={cellToPixel}
            />
          ))}
        </Layer>

        {/* Capa de distancia (si hay token seleccionado) */}
        {showDistance && selectedToken && hoveredCell && (
          <Layer>
            <DistanceLine
              from={cellToPixel(selectedToken.x, selectedToken.y)}
              to={cellToPixel(hoveredCell.x, hoveredCell.y)}
              distance={calculateDistance(
                selectedToken.x, selectedToken.y,
                hoveredCell.x, hoveredCell.y,
                gridType
              )}
              color={config.accentColor}
            />
          </Layer>
        )}

        {/* Capa de tokens */}
        <Layer>
          {battleMap.tokens.map(token => (
            <TokenShape
              key={token.id}
              token={token}
              cellSize={cellSize}
              isSelected={token.id === selectedTokenId}
              cellToPixel={cellToPixel}
              onSelect={() => onTokenSelect?.(token)}
              onDragStart={() => setDraggingToken(token.id)}
              onDragEnd={(x, y) => {
                setDraggingToken(null)
                const cell = pixelToCell(x, y)
                onTokenMove?.(token.id, cell.x, cell.y)
              }}
              config={config}
            />
          ))}
        </Layer>
      </Stage>

      {/* Info de celda */}
      {hoveredCell && (
        <div
          className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs"
          style={{ backgroundColor: config.secondaryColor, color: config.textColor, border: `1px solid ${config.primaryColor}` }}
        >
          Celda: ({hoveredCell.x}, {hoveredCell.y})
          {selectedToken && (
            <span className="ml-2">
              Distancia: {calculateDistance(selectedToken.x, selectedToken.y, hoveredCell.x, hoveredCell.y, gridType)} ft
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para renderizar una celda de terreno
function TerrainCellShape({
  cell,
  cellSize,
  gridType,
  isHovered,
  cellToPixel,
}: {
  cell: TerrainCell
  cellSize: number
  gridType: GridType
  isHovered: boolean
  cellToPixel: (x: number, y: number) => { x: number; y: number }
}) {
  const pos = cellToPixel(cell.x, cell.y)
  const color = TERRAIN_COLORS[cell.type]

  if (gridType === 'hex') {
    return (
      <RegularPolygon
        x={pos.x}
        y={pos.y}
        sides={6}
        radius={cellSize / 2}
        fill={color}
        stroke={isHovered ? '#FFFFFF' : 'transparent'}
        strokeWidth={isHovered ? 2 : 0}
        opacity={cell.difficult ? 0.7 : 1}
      />
    )
  }

  return (
    <Rect
      x={cell.x * cellSize}
      y={cell.y * cellSize}
      width={cellSize}
      height={cellSize}
      fill={color}
      stroke={isHovered ? '#FFFFFF' : 'transparent'}
      strokeWidth={isHovered ? 2 : 0}
      opacity={cell.difficult ? 0.7 : 1}
    />
  )
}

// Líneas del grid
function GridLines({
  width,
  height,
  cellSize,
  gridType,
  color,
}: {
  width: number
  height: number
  cellSize: number
  gridType: GridType
  color: string
}) {
  if (gridType === 'hex') {
    // Grid hexagonal - solo dibujar bordes
    return null // Los hexágonos del terreno ya tienen bordes
  }

  // Grid cuadrado
  const lines: React.ReactElement[] = []

  // Líneas verticales
  for (let x = 0; x <= width; x++) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x * cellSize, 0, x * cellSize, height * cellSize]}
        stroke={color}
        strokeWidth={0.5}
        opacity={0.3}
      />
    )
  }

  // Líneas horizontales
  for (let y = 0; y <= height; y++) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y * cellSize, width * cellSize, y * cellSize]}
        stroke={color}
        strokeWidth={0.5}
        opacity={0.3}
      />
    )
  }

  return <Group>{lines}</Group>
}

// Componente para efecto de área
function AreaEffectShape({
  effect,
  cellSize,
  cellToPixel,
}: {
  effect: AreaEffect
  cellSize: number
  cellToPixel: (x: number, y: number) => { x: number; y: number }
}) {
  const pos = cellToPixel(effect.x, effect.y)

  if (effect.shape === 'circle' && effect.radius) {
    return (
      <Circle
        x={pos.x}
        y={pos.y}
        radius={effect.radius * cellSize / 5} // 5ft per cell
        fill={effect.color}
        opacity={effect.opacity}
        stroke={effect.color}
        strokeWidth={2}
      />
    )
  }

  if (effect.shape === 'square' && effect.length) {
    const size = effect.length * cellSize / 5
    return (
      <Rect
        x={pos.x - size / 2}
        y={pos.y - size / 2}
        width={size}
        height={size}
        fill={effect.color}
        opacity={effect.opacity}
        stroke={effect.color}
        strokeWidth={2}
      />
    )
  }

  return null
}

// Línea de distancia
function DistanceLine({
  from,
  to,
  distance,
  color,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  distance: number
  color: string
}) {
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  return (
    <Group>
      <Line
        points={[from.x, from.y, to.x, to.y]}
        stroke={color}
        strokeWidth={2}
        dash={[5, 5]}
        opacity={0.7}
      />
      <Circle
        x={midX}
        y={midY}
        radius={15}
        fill="#000000"
        opacity={0.7}
      />
      <Text
        x={midX - 10}
        y={midY - 5}
        text={`${distance}ft`}
        fontSize={10}
        fill="#FFFFFF"
      />
    </Group>
  )
}

// Componente para token
function TokenShape({
  token,
  cellSize,
  isSelected,
  cellToPixel,
  onSelect,
  onDragStart,
  onDragEnd,
  config,
}: {
  token: BattleToken
  cellSize: number
  isSelected: boolean
  cellToPixel: (x: number, y: number) => { x: number; y: number }
  onSelect: () => void
  onDragStart: () => void
  onDragEnd: (x: number, y: number) => void
  config: ReturnType<typeof getMapConfig>
}) {
  const groupRef = useRef<Konva.Group>(null)
  const pos = cellToPixel(token.x, token.y)
  const radius = (cellSize / 2 - 4) * token.size

  // HP bar
  const hpPercent = Math.max(0, token.hp / token.maxHp)
  const hpColor = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336'

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    if (isSelected) {
      group.to({ scaleX: 1.1, scaleY: 1.1, duration: 0.1 })
    } else {
      group.to({ scaleX: 1, scaleY: 1, duration: 0.1 })
    }
  }, [isSelected])

  return (
    <Group
      ref={groupRef}
      x={pos.x}
      y={pos.y}
      draggable={token.type === 'player' || token.type === 'ally'}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragEnd={(e) => {
        onDragEnd(e.target.x(), e.target.y())
        // Reset position (será actualizado por el padre)
        e.target.position(pos)
      }}
    >
      {/* Indicador de selección */}
      {isSelected && (
        <Circle
          radius={radius + 5}
          stroke={config.accentColor}
          strokeWidth={3}
          dash={[5, 3]}
        />
      )}

      {/* Token base */}
      <Circle
        radius={radius}
        fill={token.color}
        stroke={isSelected ? config.accentColor : '#000000'}
        strokeWidth={2}
        shadowColor={token.color}
        shadowBlur={isSelected ? 15 : 0}
        shadowOpacity={0.5}
      />

      {/* Imagen o inicial */}
      <Text
        text={token.name.charAt(0).toUpperCase()}
        fontSize={radius}
        fill="#FFFFFF"
        fontStyle="bold"
        x={-radius / 3}
        y={-radius / 2}
      />

      {/* HP bar */}
      <Rect
        x={-radius}
        y={radius + 2}
        width={radius * 2}
        height={4}
        fill="#333333"
        cornerRadius={2}
      />
      <Rect
        x={-radius}
        y={radius + 2}
        width={radius * 2 * hpPercent}
        height={4}
        fill={hpColor}
        cornerRadius={2}
      />

      {/* Indicadores de condiciones */}
      {token.conditions.slice(0, 3).map((condition, i) => (
        <Text
          key={condition}
          text={CONDITION_ICONS[condition] || '⚡'}
          fontSize={12}
          x={radius - 8 + (i * 12 - 12)}
          y={-radius - 14}
        />
      ))}

      {/* Indicador de turno usado */}
      {(token.hasMoved || token.hasActed) && (
        <Circle
          x={radius - 5}
          y={-radius + 5}
          radius={5}
          fill={token.hasMoved && token.hasActed ? '#F44336' : '#FF9800'}
        />
      )}
    </Group>
  )
}
