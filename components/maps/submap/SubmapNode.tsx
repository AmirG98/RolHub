'use client'

import React from 'react'
import { Group, Rect, Text, Circle, Line } from 'react-konva'
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

// Categorías visuales: color de fondo + label corto + icono simple
const NODE_VISUAL: Partial<Record<NodeTypeEnum, { bg: string; label: string; icon: string }>> = {
  // Ciudad
  street: { bg: '#3A3528', label: 'Calle', icon: '━' },
  plaza: { bg: '#4A3A1A', label: 'Plaza', icon: '◆' },
  market: { bg: '#4A4020', label: 'Mercado', icon: '◈' },
  tavern: { bg: '#5A3020', label: 'Taberna', icon: '◉' },
  temple: { bg: '#2A3A4A', label: 'Templo', icon: '△' },
  palace: { bg: '#5A4A2A', label: 'Palacio', icon: '♛' },
  gate: { bg: '#3A3A3A', label: 'Puerta', icon: '▣' },
  house: { bg: '#3A3020', label: 'Casa', icon: '▪' },
  shop: { bg: '#3A4030', label: 'Tienda', icon: '◇' },
  // Dungeon
  room: { bg: '#2A2A30', label: 'Sala', icon: '□' },
  corridor: { bg: '#252530', label: 'Pasillo', icon: '═' },
  treasure_room: { bg: '#4A3A10', label: 'Tesoro', icon: '★' },
  boss_room: { bg: '#4A1A1A', label: 'Jefe', icon: '☠' },
  trap_room: { bg: '#4A3020', label: 'Trampa', icon: '⚠' },
  safe_room: { bg: '#1A3A2A', label: 'Refugio', icon: '♦' },
  // Wilderness
  clearing: { bg: '#2A3A1A', label: 'Claro', icon: '○' },
  path: { bg: '#3A3A20', label: 'Sendero', icon: '~' },
  camp: { bg: '#3A2A10', label: 'Campamento', icon: '▲' },
  cave_entrance: { bg: '#2A2A2A', label: 'Cueva', icon: '◖' },
  river_crossing: { bg: '#1A3040', label: 'Río', icon: '≈' },
  ruins: { bg: '#3A3030', label: 'Ruinas', icon: '▨' },
  grove: { bg: '#1A3A1A', label: 'Arboleda', icon: '♣' },
  // Stronghold
  wall: { bg: '#3A3A3A', label: 'Muro', icon: '▬' },
  tower: { bg: '#3A3540', label: 'Torre', icon: '▲' },
  courtyard: { bg: '#2A3020', label: 'Patio', icon: '□' },
  keep: { bg: '#4A3A2A', label: 'Torreón', icon: '♜' },
  dungeon_cell: { bg: '#1A1A20', label: 'Celda', icon: '▥' },
  armory: { bg: '#3A3030', label: 'Armería', icon: '⚔' },
  great_hall: { bg: '#4A3A1A', label: 'Salón', icon: '♔' },
  // Nautical
  dock: { bg: '#2A3040', label: 'Muelle', icon: '⚓' },
  ship: { bg: '#2A3545', label: 'Barco', icon: '⛵' },
  warehouse: { bg: '#3A3530', label: 'Almacén', icon: '▣' },
  lighthouse: { bg: '#3A3A40', label: 'Faro', icon: '◈' },
  beach: { bg: '#3A3A20', label: 'Playa', icon: '~' },
  reef: { bg: '#1A3040', label: 'Arrecife', icon: '≋' },
}

const DEFAULT_VISUAL = { bg: '#2A2A2A', label: '???', icon: '●' }

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
  const visual = NODE_VISUAL[node.type] || DEFAULT_VISUAL

  // === ESTADOS VISUALES CLAROS ===

  // No descubierto: silueta difusa con "?"
  if (!node.discovered) {
    return (
      <Group
        x={node.x}
        y={node.y}
        opacity={0.3}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
      >
        <Rect
          width={node.width}
          height={node.height}
          fill="#1A1A1A"
          stroke="#333"
          strokeWidth={1}
          cornerRadius={6}
          dash={[4, 4]}
        />
        <Text
          x={0}
          y={node.height / 2 - 10}
          width={node.width}
          align="center"
          text="?"
          fontSize={20}
          fill="#555"
          fontStyle="bold"
        />
      </Group>
    )
  }

  // Descubierto pero no visitado: visible pero apagado
  const isKnownButUnvisited = node.discovered && !node.visited && !isPlayerHere

  // Color del borde según estado
  const getBorderColor = () => {
    if (isPlayerHere) return '#F5C842'  // Dorado brillante
    if (node.isEntrance) return '#4CAF50' // Verde
    if (node.isObjective) return '#FF9800' // Naranja
    if (isSelected) return '#C9A84C' // Dorado
    if (isHovered) return '#8B6914' // Dorado dim
    if (isKnownButUnvisited) return '#555' // Gris — no visitado
    return '#6B5A3A' // Marrón — visitado
  }

  const borderWidth = isPlayerHere || isSelected ? 3 : isHovered ? 2.5 : 1.5
  const nodeOpacity = isKnownButUnvisited ? 0.6 : 1

  return (
    <Group
      x={node.x}
      y={node.y}
      opacity={nodeOpacity}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(node)}
      onDblClick={() => onDoubleClick(node.id)}
      onTap={() => onClick(node)}
    >
      {/* Glow del jugador */}
      {isPlayerHere && (
        <Rect
          x={-5}
          y={-5}
          width={node.width + 10}
          height={node.height + 10}
          fill="transparent"
          stroke="#F5C842"
          strokeWidth={2}
          cornerRadius={10}
          opacity={0.5}
          dash={[6, 3]}
        />
      )}

      {/* Fondo del nodo con color por tipo */}
      <Rect
        width={node.width}
        height={node.height}
        fill={visual.bg}
        stroke={getBorderColor()}
        strokeWidth={borderWidth}
        cornerRadius={6}
        shadowColor="black"
        shadowBlur={isHovered || isPlayerHere ? 12 : 4}
        shadowOpacity={0.4}
      />

      {/* Icono + Label de tipo (arriba) */}
      <Text
        x={0}
        y={6}
        width={node.width}
        align="center"
        text={visual.icon}
        fontSize={Math.min(18, node.width * 0.25)}
        fill={isPlayerHere ? '#F5C842' : node.visited ? '#C9A84C' : '#888'}
      />

      {/* Nombre del nodo — más legible */}
      <Text
        x={3}
        y={node.height / 2 - 2}
        width={node.width - 6}
        align="center"
        text={node.name.length > 14 ? node.name.slice(0, 12) + '…' : node.name}
        fontSize={Math.min(10, node.width * 0.13)}
        fill={node.visited ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)'}
        fontStyle="bold"
        fontFamily="Cinzel, serif"
      />

      {/* Label de tipo (abajo) — categoría clara */}
      <Text
        x={0}
        y={node.height - 14}
        width={node.width}
        align="center"
        text={visual.label}
        fontSize={8}
        fill={node.visited ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.3)'}
        fontFamily="Crimson Text, serif"
        fontStyle="italic"
      />

      {/* Badge de estado especial */}
      {node.isObjective && (
        <Group x={node.width - 12} y={-4}>
          <Circle radius={7} fill="#FF9800" stroke="#000" strokeWidth={1} />
          <Text x={-4} y={-5} text="!" fontSize={10} fill="#000" fontStyle="bold" />
        </Group>
      )}

      {node.isEntrance && (
        <Group x={node.width - 12} y={-4}>
          <Circle radius={7} fill="#4CAF50" stroke="#000" strokeWidth={1} />
          <Text x={-4} y={-6} text="▶" fontSize={8} fill="#000" />
        </Group>
      )}

      {/* Checkmark si visitado */}
      {node.visited && !isPlayerHere && (
        <Group x={-4} y={-4}>
          <Circle radius={6} fill="#1A3A2A" stroke="#4CAF50" strokeWidth={1} />
          <Text x={-4} y={-5} text="✓" fontSize={9} fill="#4CAF50" />
        </Group>
      )}
    </Group>
  )
}
