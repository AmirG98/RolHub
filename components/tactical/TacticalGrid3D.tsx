'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  GridType,
  TacticalCell,
  GridCoord,
  TERRAIN_EFFECTS,
} from '@/lib/tactical/types'

interface TacticalGrid3DProps {
  gridType: GridType
  width: number
  height: number
  cellSize: number
  cells: TacticalCell[][]
  highlightedCells?: GridCoord[]
  highlightColor?: string
  selectedCell?: GridCoord | null
  onCellClick?: (coord: GridCoord) => void
  onCellHover?: (coord: GridCoord | null) => void
  showGrid?: boolean
  showTerrain?: boolean
}

// Colores de terreno
const TERRAIN_COLORS: Record<string, string> = {
  normal: '#2a2a2a',
  difficult: '#4a3a2a',
  water_shallow: '#1a3a5a',
  water_deep: '#0a2a4a',
  lava: '#8a2a0a',
  ice: '#5a7a9a',
  mud: '#3a2a1a',
  forest: '#1a3a1a',
  dense_forest: '#0a2a0a',
  rubble: '#4a4a4a',
  pit: '#1a1a1a',
  elevated: '#3a3a3a',
  stairs: '#3a3a3a',
  wall: '#5a5a5a',
  half_wall: '#4a4a4a',
  window: '#3a5a7a',
  door_closed: '#5a3a2a',
  door_open: '#3a2a1a',
  trap_hidden: '#2a2a2a',
  trap_visible: '#5a2a2a',
  magic_field: '#3a2a5a',
  darkness: '#0a0a0a',
  holy_ground: '#5a5a3a',
  cursed_ground: '#2a1a2a',
}

/**
 * Grilla táctica 3D con soporte para terrenos y highlights
 */
export function TacticalGrid3D({
  gridType,
  width,
  height,
  cellSize,
  cells,
  highlightedCells = [],
  highlightColor = '#4488ff',
  selectedCell,
  onCellClick,
  onCellHover,
  showGrid = true,
  showTerrain = true,
}: TacticalGrid3DProps) {
  const gridRef = useRef<THREE.Group>(null)
  const highlightRef = useRef<THREE.Mesh>(null)
  const hoverRef = useRef<THREE.Mesh>(null)

  // Crear geometría de la grilla
  const gridGeometry = useMemo(() => {
    if (gridType === 'square') {
      return createSquareGrid(width, height, cellSize)
    } else {
      return createHexGrid(width, height, cellSize)
    }
  }, [gridType, width, height, cellSize])

  // Crear geometría del terreno
  const terrainMeshes = useMemo(() => {
    if (!showTerrain) return null

    const meshes: { position: [number, number, number]; color: string; terrain: string }[] = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y]?.[x]
        if (!cell) continue

        const terrain = cell.terrain
        if (terrain !== 'normal') {
          const worldPos = cellToWorld(x, y, gridType, cellSize)
          meshes.push({
            position: [worldPos.x, 0.01, worldPos.z],
            color: TERRAIN_COLORS[terrain] || TERRAIN_COLORS.normal,
            terrain,
          })
        }
      }
    }

    return meshes
  }, [cells, width, height, gridType, cellSize, showTerrain])

  // Crear geometría de highlights
  const highlightGeometry = useMemo(() => {
    if (highlightedCells.length === 0) return null

    const positions: number[] = []
    const colors: number[] = []
    const color = new THREE.Color(highlightColor)

    highlightedCells.forEach(coord => {
      const worldPos = cellToWorld(coord.x, coord.y, gridType, cellSize)

      if (gridType === 'square') {
        // Cuadrado
        const halfSize = cellSize / 2 * 0.9
        positions.push(
          worldPos.x - halfSize, 0.02, worldPos.z - halfSize,
          worldPos.x + halfSize, 0.02, worldPos.z - halfSize,
          worldPos.x + halfSize, 0.02, worldPos.z + halfSize,
          worldPos.x - halfSize, 0.02, worldPos.z - halfSize,
          worldPos.x + halfSize, 0.02, worldPos.z + halfSize,
          worldPos.x - halfSize, 0.02, worldPos.z + halfSize,
        )
        for (let i = 0; i < 6; i++) {
          colors.push(color.r, color.g, color.b)
        }
      }
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    return geometry
  }, [highlightedCells, highlightColor, gridType, cellSize])

  // Animación de highlight pulsante
  useFrame(({ clock }) => {
    if (highlightRef.current) {
      const material = highlightRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.15
    }
  })

  // Handler de click en la grilla
  const handleClick = (event: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    if (!onCellClick) return
    event.stopPropagation()

    const point = event.point
    const coord = worldToCell(point.x, point.z, gridType, cellSize)

    if (coord.x >= 0 && coord.x < width && coord.y >= 0 && coord.y < height) {
      onCellClick(coord)
    }
  }

  // Handler de hover
  const handlePointerMove = (event: { point: THREE.Vector3 }) => {
    if (!onCellHover) return

    const point = event.point
    const coord = worldToCell(point.x, point.z, gridType, cellSize)

    if (coord.x >= 0 && coord.x < width && coord.y >= 0 && coord.y < height) {
      onCellHover(coord)
    }
  }

  const handlePointerOut = () => {
    if (onCellHover) {
      onCellHover(null)
    }
  }

  return (
    <group ref={gridRef}>
      {/* Plano base clickeable */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(width * cellSize) / 2, 0, (height * cellSize) / 2]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[width * cellSize, height * cellSize]} />
        <meshBasicMaterial
          color="#1a1a1a"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Terrenos especiales */}
      {terrainMeshes?.map((mesh, i) => (
        <mesh key={i} position={mesh.position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[cellSize * 0.95, cellSize * 0.95]} />
          <meshStandardMaterial
            color={mesh.color}
            transparent
            opacity={0.7}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Líneas de la grilla */}
      {showGrid && (
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial color="#444444" transparent opacity={0.5} />
        </lineSegments>
      )}

      {/* Celdas resaltadas (rango de movimiento, etc) */}
      {highlightGeometry && (
        <mesh ref={highlightRef} geometry={highlightGeometry}>
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Celda seleccionada */}
      {selectedCell && (
        <mesh
          position={[
            ...Object.values(cellToWorld(selectedCell.x, selectedCell.y, gridType, cellSize)),
            0.03,
          ].slice(0, 2).concat([0.03]) as [number, number, number]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[cellSize * 0.35, cellSize * 0.45, gridType === 'hex' ? 6 : 4]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

// Crear geometría de grilla cuadrada
function createSquareGrid(width: number, height: number, cellSize: number): THREE.BufferGeometry {
  const positions: number[] = []

  // Líneas horizontales
  for (let y = 0; y <= height; y++) {
    positions.push(0, 0.01, y * cellSize)
    positions.push(width * cellSize, 0.01, y * cellSize)
  }

  // Líneas verticales
  for (let x = 0; x <= width; x++) {
    positions.push(x * cellSize, 0.01, 0)
    positions.push(x * cellSize, 0.01, height * cellSize)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

// Crear geometría de grilla hexagonal
function createHexGrid(width: number, height: number, cellSize: number): THREE.BufferGeometry {
  const positions: number[] = []
  const hexRadius = cellSize / Math.sqrt(3)

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const offsetX = row % 2 === 0 ? 0 : cellSize / 2
      const centerX = col * cellSize + offsetX + cellSize / 2
      const centerZ = row * cellSize * 0.866 + cellSize / 2

      // 6 lados del hexágono
      for (let i = 0; i < 6; i++) {
        const angle1 = (Math.PI / 3) * i
        const angle2 = (Math.PI / 3) * (i + 1)

        positions.push(
          centerX + Math.cos(angle1) * hexRadius, 0.01,
          centerZ + Math.sin(angle1) * hexRadius
        )
        positions.push(
          centerX + Math.cos(angle2) * hexRadius, 0.01,
          centerZ + Math.sin(angle2) * hexRadius
        )
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

// Convertir coordenadas de celda a posición 3D
function cellToWorld(x: number, y: number, gridType: GridType, cellSize: number): { x: number; z: number } {
  if (gridType === 'square') {
    return {
      x: x * cellSize + cellSize / 2,
      z: y * cellSize + cellSize / 2,
    }
  } else {
    const offsetX = y % 2 === 0 ? 0 : cellSize / 2
    return {
      x: x * cellSize + offsetX + cellSize / 2,
      z: y * cellSize * 0.866 + cellSize / 2,
    }
  }
}

// Convertir posición 3D a coordenadas de celda
function worldToCell(worldX: number, worldZ: number, gridType: GridType, cellSize: number): GridCoord {
  if (gridType === 'square') {
    return {
      x: Math.floor(worldX / cellSize),
      y: Math.floor(worldZ / cellSize),
    }
  } else {
    // Aproximación para hex
    const row = Math.floor(worldZ / (cellSize * 0.866))
    const offsetX = row % 2 === 0 ? 0 : cellSize / 2
    const col = Math.floor((worldX - offsetX) / cellSize)
    return { x: col, y: row }
  }
}

export default TacticalGrid3D
