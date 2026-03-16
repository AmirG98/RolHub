'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Line, Group, Text, Circle } from 'react-konva'
import Konva from 'konva'
import {
  type DungeonMap,
  type DungeonRoom,
  type DungeonCorridor,
} from '@/lib/maps/dungeon-generator'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'

interface DungeonRendererProps {
  dungeon: DungeonMap
  currentRoomId?: string
  onRoomClick?: (room: DungeonRoom) => void
  onRoomHover?: (room: DungeonRoom | null) => void
  width?: number
  height?: number
  className?: string
}

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const ZOOM_SPEED = 1.1

export function DungeonRenderer({
  dungeon,
  currentRoomId,
  onRoomClick,
  onRoomHover,
  width = 800,
  height = 600,
  className = '',
}: DungeonRendererProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hoveredRoom, setHoveredRoom] = useState<DungeonRoom | null>(null)

  const config = getMapConfig(dungeon.lore)

  // Colores basados en el lore
  const colors = {
    floor: config.backgroundColor,
    wall: config.secondaryColor,
    corridor: config.primaryColor,
    entrance: config.safeColor,
    boss: config.dangerColor,
    current: config.accentColor,
    unexplored: config.fogColor,
    treasure: '#FFD700',
    monster: config.dangerColor,
    trap: '#FF4500',
    safe: config.safeColor,
    puzzle: config.accentColor,
    text: config.textColor,
  }

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

  const handleRoomClick = useCallback((room: DungeonRoom) => {
    if (room.discovered) {
      onRoomClick?.(room)
    }
  }, [onRoomClick])

  const handleRoomHover = useCallback((room: DungeonRoom | null) => {
    setHoveredRoom(room)
    onRoomHover?.(room)
  }, [onRoomHover])

  // Obtener color de la habitación según su tipo
  const getRoomColor = (room: DungeonRoom): string => {
    if (!room.discovered) return colors.unexplored
    if (room.id === currentRoomId) return colors.current

    switch (room.type) {
      case 'entrance': return colors.entrance
      case 'boss': return colors.boss
      case 'treasure': return colors.treasure
      case 'monster': return colors.monster
      case 'trap': return colors.trap
      case 'safe': return colors.safe
      case 'puzzle': return colors.puzzle
      default: return colors.floor
    }
  }

  // Obtener icono de la habitación
  const getRoomIcon = (room: DungeonRoom): string => {
    if (!room.discovered) return '?'
    switch (room.type) {
      case 'entrance': return '🚪'
      case 'boss': return '💀'
      case 'treasure': return '💎'
      case 'monster': return '👹'
      case 'trap': return '⚠️'
      case 'safe': return '❤️'
      case 'puzzle': return '🧩'
      case 'shrine': return '✨'
      case 'shop': return '🛒'
      default: return ''
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border-2 ${className}`} style={{ borderColor: config.primaryColor }}>
      {/* Controles */}
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
        <button
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }) }}
          className="w-8 h-8 rounded flex items-center justify-center text-sm mt-2 hover:brightness-125"
          style={{ backgroundColor: config.secondaryColor, color: config.textColor, border: `1px solid ${config.primaryColor}` }}
        >
          ⌂
        </button>
      </div>

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        draggable
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        style={{ cursor: 'grab', backgroundColor: config.secondaryColor }}
      >
        {/* Capa de corredores */}
        <Layer>
          {dungeon.corridors.map(corridor => (
            <CorridorShape
              key={corridor.id}
              corridor={corridor}
              color={colors.corridor}
              discovered={areRoomsConnectedDiscovered(corridor, dungeon.rooms)}
              fogColor={colors.unexplored}
            />
          ))}
        </Layer>

        {/* Capa de habitaciones */}
        <Layer>
          {dungeon.rooms.map(room => (
            <RoomShape
              key={room.id}
              room={room}
              color={getRoomColor(room)}
              icon={getRoomIcon(room)}
              isCurrentRoom={room.id === currentRoomId}
              isHovered={hoveredRoom?.id === room.id}
              onClick={() => handleRoomClick(room)}
              onMouseEnter={() => handleRoomHover(room)}
              onMouseLeave={() => handleRoomHover(null)}
              textColor={colors.text}
              config={config}
            />
          ))}
        </Layer>
      </Stage>

      {/* Tooltip */}
      {hoveredRoom && hoveredRoom.discovered && (
        <div
          className="absolute bottom-2 left-2 px-3 py-2 rounded shadow-lg max-w-xs text-sm"
          style={{
            backgroundColor: config.secondaryColor,
            color: config.textColor,
            border: `1px solid ${config.primaryColor}`,
          }}
        >
          <div className="font-bold flex items-center gap-2">
            <span>{getRoomIcon(hoveredRoom)}</span>
            <span className="capitalize">{hoveredRoom.type}</span>
          </div>
          <p className="text-xs opacity-80 mt-1">{hoveredRoom.content.description}</p>
          {hoveredRoom.content.enemies && hoveredRoom.content.enemies.length > 0 && (
            <div className="text-xs mt-1">
              Enemigos: {hoveredRoom.content.enemies.filter(e => !e.defeated).length}/{hoveredRoom.content.enemies.length}
            </div>
          )}
          {hoveredRoom.content.treasure && hoveredRoom.content.treasure.length > 0 && (
            <div className="text-xs mt-1">
              Tesoros: {hoveredRoom.content.treasure.filter(t => !t.collected).length}/{hoveredRoom.content.treasure.length}
            </div>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div
        className="absolute bottom-2 right-2 p-2 rounded text-xs"
        style={{ backgroundColor: config.secondaryColor, color: config.textColor, border: `1px solid ${config.primaryColor}` }}
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span><span style={{ color: colors.entrance }}>■</span> Entrada</span>
          <span><span style={{ color: colors.boss }}>■</span> Jefe</span>
          <span><span style={{ color: colors.monster }}>■</span> Monstruos</span>
          <span><span style={{ color: colors.treasure }}>■</span> Tesoro</span>
          <span><span style={{ color: colors.trap }}>■</span> Trampa</span>
          <span><span style={{ color: colors.safe }}>■</span> Seguro</span>
        </div>
      </div>
    </div>
  )
}

// Componente para renderizar una habitación
interface RoomShapeProps {
  room: DungeonRoom
  color: string
  icon: string
  isCurrentRoom: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  textColor: string
  config: ReturnType<typeof getMapConfig>
}

function RoomShape({
  room,
  color,
  icon,
  isCurrentRoom,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  textColor,
  config,
}: RoomShapeProps) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    if (isHovered || isCurrentRoom) {
      group.to({ scaleX: 1.05, scaleY: 1.05, duration: 0.1 })
    } else {
      group.to({ scaleX: 1, scaleY: 1, duration: 0.1 })
    }
  }, [isHovered, isCurrentRoom])

  return (
    <Group
      ref={groupRef}
      x={room.x + room.width / 2}
      y={room.y + room.height / 2}
      offsetX={room.width / 2}
      offsetY={room.height / 2}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Borde/sombra */}
      <Rect
        x={-2}
        y={-2}
        width={room.width + 4}
        height={room.height + 4}
        fill={isCurrentRoom ? config.glowColor : 'transparent'}
        cornerRadius={4}
        opacity={0.5}
        shadowColor={isCurrentRoom ? config.glowColor : 'transparent'}
        shadowBlur={isCurrentRoom ? 15 : 0}
      />

      {/* Habitación */}
      <Rect
        x={0}
        y={0}
        width={room.width}
        height={room.height}
        fill={color}
        stroke={isCurrentRoom ? config.accentColor : config.primaryColor}
        strokeWidth={isCurrentRoom ? 3 : 1}
        cornerRadius={3}
      />

      {/* Icono */}
      {icon && (
        <Text
          text={icon}
          x={room.width / 2 - 10}
          y={room.height / 2 - 10}
          fontSize={20}
        />
      )}

      {/* Indicador de visitado */}
      {room.visited && (
        <Circle
          x={room.width - 8}
          y={8}
          radius={5}
          fill={config.safeColor}
        />
      )}
    </Group>
  )
}

// Componente para renderizar un corredor
interface CorridorShapeProps {
  corridor: DungeonCorridor
  color: string
  discovered: boolean
  fogColor: string
}

function CorridorShape({ corridor, color, discovered, fogColor }: CorridorShapeProps) {
  return (
    <Line
      points={[corridor.startX, corridor.startY, corridor.endX, corridor.endY]}
      stroke={discovered ? color : fogColor}
      strokeWidth={corridor.width}
      lineCap="round"
      opacity={discovered ? 1 : 0.3}
    />
  )
}

// Helper: verificar si los cuartos conectados por un corredor están descubiertos
function areRoomsConnectedDiscovered(corridor: DungeonCorridor, rooms: DungeonRoom[]): boolean {
  // Simplificado: si algún cuarto cercano está descubierto, mostrar el corredor
  return rooms.some(room => {
    const centerX = room.x + room.width / 2
    const centerY = room.y + room.height / 2
    const corridorMidX = (corridor.startX + corridor.endX) / 2
    const corridorMidY = (corridor.startY + corridor.endY) / 2

    const distance = Math.sqrt(
      Math.pow(centerX - corridorMidX, 2) +
      Math.pow(centerY - corridorMidY, 2)
    )

    return room.discovered && distance < 200
  })
}
