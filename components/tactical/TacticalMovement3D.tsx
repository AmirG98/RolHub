'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { GridCoord, GridType, TacticalCell, TacticalToken } from '@/lib/tactical/types'
import { getReachableCells, findPath } from '@/lib/tactical/grid-utils'

interface TacticalMovement3DProps {
  selectedToken: TacticalToken | null
  cells: TacticalCell[][]
  tokens: TacticalToken[]
  gridType: GridType
  cellSize: number
  hoveredCell: GridCoord | null
  onCellClick?: (coord: GridCoord) => void
  showDifficultTerrain?: boolean
  showPathPreview?: boolean
}

// Colores para rangos de movimiento
const MOVEMENT_COLORS = {
  normal: '#22c55e',       // Verde - movimiento normal
  dash: '#3b82f6',         // Azul - con dash
  difficult: '#f59e0b',    // Amarillo - terreno difícil
  cannotReach: '#ef4444',  // Rojo - no alcanzable
  path: '#ffffff',         // Blanco - camino a seguir
}

/**
 * Convertir coordenadas de grilla a mundo
 */
function gridToWorld(x: number, y: number, gridType: GridType, cellSize: number): [number, number, number] {
  if (gridType === 'square') {
    return [x * cellSize + cellSize / 2, 0, y * cellSize + cellSize / 2]
  } else {
    const offsetX = y % 2 === 0 ? 0 : cellSize / 2
    return [x * cellSize + offsetX + cellSize / 2, 0, y * cellSize * 0.866 + cellSize / 2]
  }
}

/**
 * Componente para mostrar rango de movimiento de un token
 */
export function TacticalMovement3D({
  selectedToken,
  cells,
  tokens,
  gridType,
  cellSize,
  hoveredCell,
  onCellClick,
  showDifficultTerrain = true,
  showPathPreview = true,
}: TacticalMovement3DProps) {
  const normalRangeRef = useRef<THREE.Mesh>(null)
  const dashRangeRef = useRef<THREE.Mesh>(null)

  // Calcular celdas alcanzables
  const { normalRange, dashRange } = useMemo(() => {
    if (!selectedToken) {
      return { normalRange: [], dashRange: [] }
    }

    const movement = selectedToken.movementRemaining
    const dashMovement = movement * 2

    // Obtener celdas ocupadas por otros tokens
    const occupiedCells = new Set<string>()
    tokens.forEach(t => {
      if (t.id !== selectedToken.id) {
        occupiedCells.add(`${t.x},${t.y}`)
      }
    })

    const gridWidth = cells[0]?.length || 0
    const gridHeight = cells.length

    // Calcular rango normal (movimiento en celdas = movimiento en pies / 5)
    const movementCells = Math.floor(movement / 5)
    const normal = getReachableCells(
      { x: selectedToken.x, y: selectedToken.y },
      movementCells,
      cells,
      gridWidth,
      gridHeight,
      gridType
    ).filter(cell => !occupiedCells.has(`${cell.x},${cell.y}`))

    // Calcular rango con dash
    const dashMovementCells = Math.floor(dashMovement / 5)
    const dash = getReachableCells(
      { x: selectedToken.x, y: selectedToken.y },
      dashMovementCells,
      cells,
      gridWidth,
      gridHeight,
      gridType
    ).filter(cell =>
      !occupiedCells.has(`${cell.x},${cell.y}`) &&
      !normal.some(n => n.x === cell.x && n.y === cell.y)
    )

    return { normalRange: normal, dashRange: dash }
  }, [selectedToken, cells, tokens, gridType, cellSize])

  // Calcular camino hacia la celda hovered
  const pathToHovered = useMemo(() => {
    if (!selectedToken || !hoveredCell || !showPathPreview) return null

    // Verificar si la celda está en rango
    const inNormalRange = normalRange.some(c => c.x === hoveredCell.x && c.y === hoveredCell.y)
    const inDashRange = dashRange.some(c => c.x === hoveredCell.x && c.y === hoveredCell.y)

    if (!inNormalRange && !inDashRange) return null

    const gridWidth = cells[0]?.length || 0
    const gridHeight = cells.length

    // Encontrar camino
    const pathResult = findPath(
      { x: selectedToken.x, y: selectedToken.y },
      hoveredCell,
      cells,
      gridWidth,
      gridHeight,
      selectedToken,
      gridType
    )

    return pathResult.canReach ? pathResult.path : null
  }, [selectedToken, hoveredCell, normalRange, dashRange, cells, gridType, showPathPreview])

  // Animación de pulso
  useFrame(({ clock }) => {
    if (normalRangeRef.current) {
      const opacity = 0.25 + Math.sin(clock.elapsedTime * 2) * 0.1
      ;(normalRangeRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
    if (dashRangeRef.current) {
      const opacity = 0.15 + Math.sin(clock.elapsedTime * 2) * 0.05
      ;(dashRangeRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  // Crear geometría para rango de movimiento
  const createRangeGeometry = (cells: GridCoord[], yOffset: number = 0.03) => {
    if (cells.length === 0) return null

    const positions: number[] = []

    cells.forEach(cell => {
      const [x, , z] = gridToWorld(cell.x, cell.y, gridType, cellSize)
      const halfSize = cellSize / 2 * 0.9

      if (gridType === 'square') {
        // Dos triángulos para un cuadrado
        positions.push(
          x - halfSize, yOffset, z - halfSize,
          x + halfSize, yOffset, z - halfSize,
          x + halfSize, yOffset, z + halfSize,
          x - halfSize, yOffset, z - halfSize,
          x + halfSize, yOffset, z + halfSize,
          x - halfSize, yOffset, z + halfSize,
        )
      } else {
        // Hexágono
        const hexRadius = cellSize / Math.sqrt(3) * 0.9
        for (let i = 0; i < 6; i++) {
          const angle1 = (Math.PI / 3) * i
          const angle2 = (Math.PI / 3) * (i + 1)
          positions.push(
            x, yOffset, z,
            x + Math.cos(angle1) * hexRadius, yOffset, z + Math.sin(angle1) * hexRadius,
            x + Math.cos(angle2) * hexRadius, yOffset, z + Math.sin(angle2) * hexRadius,
          )
        }
      }
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }

  // Geometría del rango normal
  const normalRangeGeometry = useMemo(() => {
    return createRangeGeometry(normalRange, 0.03)
  }, [normalRange, gridType, cellSize])

  // Geometría del rango con dash
  const dashRangeGeometry = useMemo(() => {
    return createRangeGeometry(dashRange, 0.025)
  }, [dashRange, gridType, cellSize])

  if (!selectedToken) return null

  return (
    <group>
      {/* Rango de movimiento normal */}
      {normalRangeGeometry && (
        <mesh ref={normalRangeRef} geometry={normalRangeGeometry}>
          <meshBasicMaterial
            color={MOVEMENT_COLORS.normal}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Rango con dash */}
      {dashRangeGeometry && (
        <mesh ref={dashRangeRef} geometry={dashRangeGeometry}>
          <meshBasicMaterial
            color={MOVEMENT_COLORS.dash}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Camino al destino */}
      {pathToHovered && pathToHovered.length >= 2 && (
        <Line
          points={pathToHovered.map(coord => {
            const [x, , z] = gridToWorld(coord.x, coord.y, gridType, cellSize)
            return [x, 0.1, z] as [number, number, number]
          })}
          color={MOVEMENT_COLORS.path}
          lineWidth={3}
          transparent
          opacity={0.8}
        />
      )}

      {/* Puntos del camino */}
      {pathToHovered && pathToHovered.map((coord, i) => {
        const [x, , z] = gridToWorld(coord.x, coord.y, gridType, cellSize)
        const isDestination = i === pathToHovered.length - 1

        return (
          <mesh
            key={i}
            position={[x, 0.15, z]}
          >
            <sphereGeometry args={[isDestination ? 0.15 : 0.08, 16, 16]} />
            <meshBasicMaterial
              color={isDestination ? '#fbbf24' : MOVEMENT_COLORS.path}
              transparent
              opacity={isDestination ? 1 : 0.6}
            />
          </mesh>
        )
      })}

      {/* Indicador de terreno difícil en celdas del rango */}
      {showDifficultTerrain && normalRange.map((coord, i) => {
        const cell = cells[coord.y]?.[coord.x]
        if (!cell || cell.terrain === 'normal') return null

        const [x, , z] = gridToWorld(coord.x, coord.y, gridType, cellSize)

        return (
          <mesh
            key={`diff-${i}`}
            position={[x, 0.05, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[cellSize * 0.3, cellSize * 0.35, 6]} />
            <meshBasicMaterial
              color={MOVEMENT_COLORS.difficult}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Indicador de costo de movimiento en hover */}
      {hoveredCell && pathToHovered && (
        <MovementCostIndicator
          coord={hoveredCell}
          cost={pathToHovered.length * 5}
          remaining={selectedToken.movementRemaining}
          gridType={gridType}
          cellSize={cellSize}
          requiresDash={!normalRange.some(c => c.x === hoveredCell.x && c.y === hoveredCell.y)}
        />
      )}
    </group>
  )
}

/**
 * Indicador de costo de movimiento
 */
function MovementCostIndicator({
  coord,
  cost,
  remaining,
  gridType,
  cellSize,
  requiresDash,
}: {
  coord: GridCoord
  cost: number
  remaining: number
  gridType: GridType
  cellSize: number
  requiresDash: boolean
}) {
  const [x, , z] = gridToWorld(coord.x, coord.y, gridType, cellSize)

  const canReach = cost <= remaining || (requiresDash && cost <= remaining * 2)
  const color = canReach
    ? (requiresDash ? MOVEMENT_COLORS.dash : MOVEMENT_COLORS.normal)
    : MOVEMENT_COLORS.cannotReach

  return (
    <group position={[x, 0.3, z]}>
      {/* Fondo */}
      <mesh>
        <planeGeometry args={[0.4, 0.2]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.9} />
      </mesh>

      {/* Borde */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.42, 0.22]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Contenido se muestra vía HTML en el componente padre si es necesario */}
    </group>
  )
}

/**
 * Componente para mostrar indicadores de ataque
 */
export function TacticalAttackRange3D({
  selectedToken,
  cells,
  gridType,
  cellSize,
  attackRange,
  attackType,
}: {
  selectedToken: TacticalToken | null
  cells: TacticalCell[][]
  gridType: GridType
  cellSize: number
  attackRange: number  // En pies
  attackType: 'melee' | 'ranged' | 'spell'
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Calcular celdas en rango de ataque
  const attackCells = useMemo(() => {
    if (!selectedToken) return []

    const rangeCells = attackRange / 5 // Convertir a celdas
    const result: GridCoord[] = []

    for (let dy = -rangeCells; dy <= rangeCells; dy++) {
      for (let dx = -rangeCells; dx <= rangeCells; dx++) {
        const cx = selectedToken.x + dx
        const cy = selectedToken.y + dy

        if (cx < 0 || cy < 0 || cy >= cells.length || cx >= cells[0]?.length) continue

        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > rangeCells) continue

        // Excluir la celda del token
        if (dx === 0 && dy === 0) continue

        result.push({ x: cx, y: cy })
      }
    }

    return result
  }, [selectedToken, cells, attackRange])

  // Crear geometría del rango de ataque
  const attackRangeGeometry = useMemo(() => {
    if (attackCells.length === 0) return null

    const positions: number[] = []

    attackCells.forEach(cell => {
      const [x, , z] = gridToWorld(cell.x, cell.y, gridType, cellSize)
      const halfSize = cellSize / 2 * 0.85

      if (gridType === 'square') {
        positions.push(
          x - halfSize, 0.04, z - halfSize,
          x + halfSize, 0.04, z - halfSize,
          x + halfSize, 0.04, z + halfSize,
          x - halfSize, 0.04, z - halfSize,
          x + halfSize, 0.04, z + halfSize,
          x - halfSize, 0.04, z + halfSize,
        )
      }
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [attackCells, gridType, cellSize])

  // Color según tipo de ataque
  const attackColor = useMemo(() => {
    switch (attackType) {
      case 'melee': return '#ef4444'  // Rojo
      case 'ranged': return '#f59e0b' // Naranja
      case 'spell': return '#8b5cf6'  // Violeta
      default: return '#ef4444'
    }
  }, [attackType])

  // Animación
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const opacity = 0.15 + Math.sin(clock.elapsedTime * 3) * 0.05
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  if (!selectedToken || !attackRangeGeometry) return null

  return (
    <mesh ref={meshRef} geometry={attackRangeGeometry}>
      <meshBasicMaterial
        color={attackColor}
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default TacticalMovement3D
