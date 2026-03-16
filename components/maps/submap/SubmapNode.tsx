'use client'

import React from 'react'
import { Group, Rect, Text, Circle } from 'react-konva'
import { type SubmapNode as SubmapNodeType, type SubmapTheme, type SubmapNodeType as NodeTypeEnum } from '@/lib/maps/submap-types'

interface SubmapNodeProps {
  node: SubmapNodeType
  theme: SubmapTheme
  isHovered: boolean
  isSelected: boolean
  isPlayerHere: boolean
  onHover: (nodeId: string | null) => void
  onClick: (node: SubmapNodeType) => void
  onDoubleClick: (nodeId: string) => void
}

// Iconos por tipo de nodo - más grandes y claros
const NODE_ICONS: Partial<Record<NodeTypeEnum, string>> = {
  // City
  street: '🛤️',
  plaza: '⭐',
  market: '🏪',
  tavern: '🍺',
  temple: '⛪',
  palace: '👑',
  gate: '🚪',
  house: '🏠',
  shop: '🛒',
  // Dungeon
  room: '🚪',
  corridor: '➡️',
  treasure_room: '💎',
  boss_room: '💀',
  trap_room: '⚠️',
  safe_room: '🛡️',
  // Wilderness
  clearing: '☀️',
  path: '🛤️',
  camp: '🏕️',
  cave_entrance: '🕳️',
  river_crossing: '🌉',
  ruins: '🏛️',
  grove: '🌲',
  // Stronghold
  wall: '🧱',
  tower: '🗼',
  courtyard: '🏟️',
  keep: '🏰',
  dungeon_cell: '⛓️',
  armory: '⚔️',
  great_hall: '🎭',
  // Nautical
  dock: '⚓',
  ship: '⛵',
  warehouse: '📦',
  lighthouse: '🗼',
  beach: '🏖️',
  reef: '🪸',
}

export function SubmapNode({
  node,
  theme,
  isHovered,
  isSelected,
  isPlayerHere,
  onHover,
  onClick,
  onDoubleClick,
}: SubmapNodeProps) {
  // Determinar color según estado
  const getNodeColor = () => {
    if (isPlayerHere) return theme.colors.nodeCurrent
    if (node.isEntrance) return theme.colors.entrance
    if (node.isObjective) return theme.colors.objective
    if (!node.discovered) return '#333333'
    if (isSelected) return theme.colors.nodeHover
    if (isHovered) return theme.colors.nodeHover
    return theme.colors.node
  }

  // Opacidad según descubrimiento
  const opacity = node.discovered ? 1 : 0.4

  // Obtener icono
  const icon = NODE_ICONS[node.type] || '●'

  return (
    <Group
      x={node.x}
      y={node.y}
      opacity={opacity}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node)}
      onDblClick={() => onDoubleClick(node.id)}
      onTap={() => onClick(node)}
    >
      {/* Sombra */}
      <Rect
        x={3}
        y={3}
        width={node.width}
        height={node.height}
        fill="rgba(0,0,0,0.3)"
        cornerRadius={8}
      />

      {/* Fondo del nodo */}
      <Rect
        width={node.width}
        height={node.height}
        fill={getNodeColor()}
        stroke={isSelected ? '#fff' : theme.colors.connection}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={isHovered ? 10 : 5}
        shadowOpacity={0.3}
      />

      {/* Indicador de objetivo */}
      {node.isObjective && (
        <Circle
          x={node.width - 10}
          y={10}
          radius={8}
          fill="#FFD700"
          stroke="#000"
          strokeWidth={1}
        />
      )}

      {/* Indicador de entrada */}
      {node.isEntrance && (
        <Circle
          x={node.width - 10}
          y={10}
          radius={8}
          fill="#32CD32"
          stroke="#000"
          strokeWidth={1}
        />
      )}

      {/* Icono del tipo - más grande */}
      <Text
        x={0}
        y={node.height / 2 - 18}
        width={node.width}
        align="center"
        text={icon}
        fontSize={Math.min(32, node.width * 0.4)}
        fill={node.discovered ? '#fff' : '#666'}
      />

      {/* Nombre del nodo - siempre visible si hay espacio */}
      {node.width >= 50 && (
        <Text
          x={2}
          y={node.height - 18}
          width={node.width - 4}
          align="center"
          text={node.name.length > 12 ? node.name.slice(0, 10) + '...' : node.name}
          fontSize={Math.min(11, node.width * 0.12)}
          fill={node.discovered ? 'rgba(255,255,255,0.9)' : '#555'}
          fontStyle="bold"
        />
      )}

      {/* Indicador de visitado */}
      {node.visited && (
        <Circle
          x={10}
          y={10}
          radius={5}
          fill="#4CAF50"
          stroke="#fff"
          strokeWidth={1}
        />
      )}

      {/* Glow si el jugador está aquí */}
      {isPlayerHere && (
        <Rect
          x={-4}
          y={-4}
          width={node.width + 8}
          height={node.height + 8}
          stroke={theme.colors.nodeCurrent}
          strokeWidth={2}
          cornerRadius={10}
          dash={[5, 3]}
          opacity={0.8}
        />
      )}
    </Group>
  )
}
