'use client'

import React from 'react'
import { Group, Line, Arrow } from 'react-konva'
import { type SubmapConnection, type SubmapNode, type SubmapTheme } from '@/lib/maps/submap-types'

interface SubmapConnectionsProps {
  connections: SubmapConnection[]
  nodes: SubmapNode[]
  theme: SubmapTheme
}

// Estilos de línea por tipo de conexión
const CONNECTION_STYLES: Record<SubmapConnection['style'], {
  color: string
  dash?: number[]
  width: number
  opacity: number
}> = {
  path: { color: '#8B7355', dash: undefined, width: 3, opacity: 0.7 },
  road: { color: '#A0522D', dash: undefined, width: 5, opacity: 0.8 },
  corridor: { color: '#696969', dash: undefined, width: 8, opacity: 0.9 },
  bridge: { color: '#8B4513', dash: [10, 5], width: 4, opacity: 0.8 },
  stairs: { color: '#4A4A4A', dash: [5, 5], width: 4, opacity: 0.8 },
  water: { color: '#4169E1', dash: undefined, width: 6, opacity: 0.6 },
}

export function SubmapConnections({ connections, nodes, theme }: SubmapConnectionsProps) {
  // Encontrar nodo por ID
  const findNode = (id: string) => nodes.find(n => n.id === id)

  return (
    <Group>
      {connections.map(connection => {
        const fromNode = findNode(connection.fromId)
        const toNode = findNode(connection.toId)

        if (!fromNode || !toNode) return null

        // Calcular puntos de la línea
        const points = connection.points.length > 0
          ? connection.points.flatMap(p => [p.x, p.y])
          : [
              fromNode.x + fromNode.width / 2,
              fromNode.y + fromNode.height / 2,
              toNode.x + toNode.width / 2,
              toNode.y + toNode.height / 2,
            ]

        const style = CONNECTION_STYLES[connection.style] || CONNECTION_STYLES.path

        // Opacidad reducida si no está descubierta
        const opacity = connection.discovered ? style.opacity : 0.2

        return (
          <Group key={connection.id}>
            {/* Sombra de la conexión */}
            <Line
              points={points.map((p, i) => i % 2 === 0 ? p + 2 : p + 2)}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={style.width + 2}
              lineCap="round"
              lineJoin="round"
              dash={style.dash}
              opacity={opacity * 0.5}
            />

            {/* Línea principal */}
            <Line
              points={points}
              stroke={connection.discovered ? (theme.colors.connection || style.color) : '#333'}
              strokeWidth={style.width}
              lineCap="round"
              lineJoin="round"
              dash={style.dash}
              opacity={opacity}
              tension={0.3}
            />

            {/* Indicador de puente */}
            {connection.style === 'bridge' && connection.discovered && (
              <BridgeIndicator
                points={points}
                color={theme.colors.connection || style.color}
              />
            )}

            {/* Indicador de escaleras */}
            {connection.style === 'stairs' && connection.discovered && (
              <StairsIndicator
                points={points}
                color={theme.colors.connection || style.color}
              />
            )}

            {/* Indicador de agua */}
            {connection.style === 'water' && connection.discovered && (
              <WaterIndicator
                points={points}
              />
            )}
          </Group>
        )
      })}
    </Group>
  )
}

// Indicador visual para puentes
function BridgeIndicator({ points, color }: { points: number[]; color: string }) {
  if (points.length < 4) return null

  const midX = (points[0] + points[points.length - 2]) / 2
  const midY = (points[1] + points[points.length - 1]) / 2

  return (
    <Group x={midX} y={midY}>
      {/* Tablones del puente */}
      {[-8, 0, 8].map((offset, i) => (
        <Line
          key={i}
          points={[-10, offset, 10, offset]}
          stroke={color}
          strokeWidth={2}
          rotation={Math.atan2(
            points[points.length - 1] - points[1],
            points[points.length - 2] - points[0]
          ) * (180 / Math.PI) + 90}
        />
      ))}
    </Group>
  )
}

// Indicador visual para escaleras
function StairsIndicator({ points, color }: { points: number[]; color: string }) {
  if (points.length < 4) return null

  const midX = (points[0] + points[points.length - 2]) / 2
  const midY = (points[1] + points[points.length - 1]) / 2

  return (
    <Group x={midX} y={midY}>
      {/* Símbolo de escaleras */}
      {[-6, -2, 2, 6].map((offset, i) => (
        <Line
          key={i}
          points={[-6 + i * 2, offset, 6 - i * 2, offset]}
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </Group>
  )
}

// Indicador visual para agua
function WaterIndicator({ points }: { points: number[] }) {
  if (points.length < 4) return null

  const midX = (points[0] + points[points.length - 2]) / 2
  const midY = (points[1] + points[points.length - 1]) / 2

  return (
    <Group x={midX} y={midY}>
      {/* Ondas de agua */}
      <Line
        points={[-15, 0, -10, -3, -5, 0, 0, -3, 5, 0, 10, -3, 15, 0]}
        stroke="#4169E1"
        strokeWidth={2}
        tension={0.5}
        opacity={0.8}
      />
    </Group>
  )
}
