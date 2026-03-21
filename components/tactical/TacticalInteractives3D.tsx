'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { InteractiveElement, GridType } from '@/lib/tactical/types'

interface TacticalInteractives3DProps {
  elements: InteractiveElement[]
  gridType: GridType
  cellSize: number
  onElementClick?: (elementId: string) => void
  onElementHover?: (elementId: string | null) => void
  showHiddenElements?: boolean  // Solo para el DM
}

// Colores y configuración por tipo de elemento
const ELEMENT_CONFIG: Record<InteractiveElement['type'], {
  color: string
  emissive: string
  icon: string
  height: number
}> = {
  door: {
    color: '#8b4513',
    emissive: '#4a2508',
    icon: '🚪',
    height: 1.0,
  },
  trap: {
    color: '#dc2626',
    emissive: '#7f1d1d',
    icon: '⚠️',
    height: 0.1,
  },
  chest: {
    color: '#ca8a04',
    emissive: '#713f12',
    icon: '📦',
    height: 0.4,
  },
  lever: {
    color: '#6b7280',
    emissive: '#374151',
    icon: '🔧',
    height: 0.6,
  },
  portal: {
    color: '#8b5cf6',
    emissive: '#5b21b6',
    icon: '🌀',
    height: 1.2,
  },
  secret_door: {
    color: '#4b5563',
    emissive: '#1f2937',
    icon: '🔍',
    height: 1.0,
  },
  pressure_plate: {
    color: '#9ca3af',
    emissive: '#4b5563',
    icon: '⬜',
    height: 0.05,
  },
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
 * Componente de puerta 3D
 */
function Door3D({
  element,
  gridType,
  cellSize,
  onClick,
  onHover,
}: {
  element: InteractiveElement
  gridType: GridType
  cellSize: number
  onClick?: () => void
  onHover?: (hover: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const doorRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const position = gridToWorld(element.x, element.y, gridType, cellSize)
  const isOpen = element.state === 'open' || element.state === 'broken'
  const isLocked = element.state === 'locked'

  useFrame(({ clock }) => {
    if (doorRef.current) {
      // Rotación para puerta abierta/cerrada
      const targetRotation = isOpen ? -Math.PI / 2 : 0
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        targetRotation,
        0.1
      )
    }
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Marco de la puerta */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[cellSize * 0.1, 1.0, cellSize * 0.8]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Puerta */}
      <group position={[-cellSize * 0.35, 0, 0]}>
        <mesh
          ref={doorRef}
          position={[cellSize * 0.35, 0.5, 0]}
          onClick={handleClick}
          onPointerOver={() => { setHovered(true); onHover?.(true) }}
          onPointerOut={() => { setHovered(false); onHover?.(false) }}
        >
          <boxGeometry args={[cellSize * 0.7, 0.95, 0.08]} />
          <meshStandardMaterial
            color={hovered ? '#a0522d' : '#8b4513'}
            roughness={0.7}
            emissive={hovered ? '#4a2508' : '#000000'}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>

        {/* Manija */}
        <mesh position={[cellSize * 0.55, 0.5, 0.05]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Indicador de candado */}
      {isLocked && (
        <mesh position={[0, 0.6, 0.1]}>
          <boxGeometry args={[0.1, 0.12, 0.05]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      )}

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-shadow/90 text-parchment px-2 py-1 rounded text-xs whitespace-nowrap">
            {isLocked ? '🔒 Puerta cerrada con llave' : isOpen ? '🚪 Puerta abierta' : '🚪 Puerta cerrada'}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Componente de trampa 3D
 */
function Trap3D({
  element,
  gridType,
  cellSize,
  showHidden,
  onClick,
  onHover,
}: {
  element: InteractiveElement
  gridType: GridType
  cellSize: number
  showHidden: boolean
  onClick?: () => void
  onHover?: (hover: boolean) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const position = gridToWorld(element.x, element.y, gridType, cellSize)
  const isVisible = element.state === 'triggered' || element.state === 'disarmed' || !element.hidden || showHidden

  useFrame(({ clock }) => {
    if (meshRef.current && isVisible && element.state !== 'disarmed' && element.state !== 'triggered') {
      // Pulso de advertencia
      const intensity = 0.3 + Math.sin(clock.elapsedTime * 4) * 0.2
      ;(meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity
    }
  })

  if (!isVisible) return null

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.()
  }

  const color = element.state === 'disarmed' ? '#22c55e' : element.state === 'triggered' ? '#6b7280' : '#dc2626'

  return (
    <group position={position}>
      {/* Base de la trampa */}
      <mesh
        ref={meshRef}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); onHover?.(true) }}
        onPointerOut={() => { setHovered(false); onHover?.(false) }}
      >
        <circleGeometry args={[cellSize * 0.3, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.5}
          transparent={showHidden && element.hidden}
          opacity={showHidden && element.hidden ? 0.5 : 1}
        />
      </mesh>

      {/* Símbolo de trampa */}
      {element.state !== 'triggered' && (
        <Billboard position={[0, 0.3, 0]}>
          <Text
            fontSize={0.3}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            ⚠️
          </Text>
        </Billboard>
      )}

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-shadow/90 text-parchment px-2 py-1 rounded text-xs whitespace-nowrap">
            {element.state === 'disarmed' && '✅ Trampa desactivada'}
            {element.state === 'triggered' && '💥 Trampa activada'}
            {element.state !== 'disarmed' && element.state !== 'triggered' && (
              <>⚠️ Trampa {element.trapDamage && `(${element.trapDamage})`}</>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Componente de cofre 3D
 */
function Chest3D({
  element,
  gridType,
  cellSize,
  onClick,
  onHover,
}: {
  element: InteractiveElement
  gridType: GridType
  cellSize: number
  onClick?: () => void
  onHover?: (hover: boolean) => void
}) {
  const lidRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const position = gridToWorld(element.x, element.y, gridType, cellSize)
  const isOpen = element.state === 'open'
  const isLocked = element.state === 'locked'

  useFrame(() => {
    if (lidRef.current) {
      const targetRotation = isOpen ? -Math.PI / 3 : 0
      lidRef.current.rotation.x = THREE.MathUtils.lerp(
        lidRef.current.rotation.x,
        targetRotation,
        0.1
      )
    }
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group position={position}>
      {/* Base del cofre */}
      <mesh
        position={[0, 0.15, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); onHover?.(true) }}
        onPointerOut={() => { setHovered(false); onHover?.(false) }}
      >
        <boxGeometry args={[cellSize * 0.5, 0.3, cellSize * 0.35]} />
        <meshStandardMaterial
          color={hovered ? '#d4a017' : '#8b6914'}
          roughness={0.7}
        />
      </mesh>

      {/* Tapa del cofre */}
      <group position={[0, 0.3, -cellSize * 0.175]}>
        <mesh ref={lidRef} position={[0, 0, cellSize * 0.175]}>
          <boxGeometry args={[cellSize * 0.52, 0.08, cellSize * 0.37]} />
          <meshStandardMaterial
            color={hovered ? '#d4a017' : '#8b6914'}
            roughness={0.7}
          />
        </mesh>
      </group>

      {/* Adornos metálicos */}
      <mesh position={[0, 0.2, cellSize * 0.18]}>
        <boxGeometry args={[cellSize * 0.3, 0.15, 0.02]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Cerradura */}
      <mesh position={[0, 0.2, cellSize * 0.19]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
        <meshStandardMaterial color={isLocked ? '#fbbf24' : '#6b7280'} metalness={0.9} />
      </mesh>

      {/* Brillo del tesoro (si está abierto) */}
      {isOpen && (
        <pointLight position={[0, 0.4, 0]} color="#fbbf24" intensity={0.5} distance={1} />
      )}

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, 0.7, 0]} center>
          <div className="bg-shadow/90 text-parchment px-2 py-1 rounded text-xs whitespace-nowrap">
            {isOpen ? '📦 Cofre abierto' : isLocked ? '🔒 Cofre cerrado con llave' : '📦 Cofre cerrado'}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Componente de portal 3D
 */
function Portal3D({
  element,
  gridType,
  cellSize,
  onClick,
  onHover,
}: {
  element: InteractiveElement
  gridType: GridType
  cellSize: number
  onClick?: () => void
  onHover?: (hover: boolean) => void
}) {
  const ringRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const position = gridToWorld(element.x, element.y, gridType, cellSize)
  const isActive = element.state === 'open'

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 0.5
    }
    if (innerRef.current && isActive) {
      innerRef.current.rotation.z = -clock.elapsedTime * 2
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1
      innerRef.current.scale.setScalar(scale)
    }
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group position={position}>
      {/* Anillo exterior */}
      <mesh
        ref={ringRef}
        position={[0, 0.6, 0]}
        rotation={[0, 0, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); onHover?.(true) }}
        onPointerOut={() => { setHovered(false); onHover?.(false) }}
      >
        <torusGeometry args={[cellSize * 0.4, 0.05, 8, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#5b21b6"
          emissiveIntensity={isActive ? 0.8 : 0.2}
        />
      </mesh>

      {/* Centro del portal */}
      {isActive && (
        <mesh ref={innerRef} position={[0, 0.6, 0]}>
          <circleGeometry args={[cellSize * 0.35, 32]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Luz del portal */}
      {isActive && (
        <pointLight
          position={[0, 0.6, 0.2]}
          color="#8b5cf6"
          intensity={1}
          distance={2}
        />
      )}

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, 1.3, 0]} center>
          <div className="bg-shadow/90 text-parchment px-2 py-1 rounded text-xs whitespace-nowrap">
            {isActive ? '🌀 Portal activo' : '🌀 Portal inactivo'}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Componente de palanca 3D
 */
function Lever3D({
  element,
  gridType,
  cellSize,
  onClick,
  onHover,
}: {
  element: InteractiveElement
  gridType: GridType
  cellSize: number
  onClick?: () => void
  onHover?: (hover: boolean) => void
}) {
  const leverRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const position = gridToWorld(element.x, element.y, gridType, cellSize)
  const isActivated = element.state === 'open' || element.state === 'triggered'

  useFrame(() => {
    if (leverRef.current) {
      const targetRotation = isActivated ? Math.PI / 4 : -Math.PI / 4
      leverRef.current.rotation.x = THREE.MathUtils.lerp(
        leverRef.current.rotation.x,
        targetRotation,
        0.1
      )
    }
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group position={position}>
      {/* Base de la palanca */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#4b5563" roughness={0.8} />
      </mesh>

      {/* Palanca */}
      <group
        ref={leverRef}
        position={[0, 0.2, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); onHover?.(true) }}
        onPointerOut={() => { setHovered(false); onHover?.(false) }}
      >
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial
            color={hovered ? '#9ca3af' : '#6b7280'}
            metalness={0.6}
          />
        </mesh>

        {/* Bola de la palanca */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={isActivated ? '#22c55e' : '#ef4444'}
            emissive={isActivated ? '#22c55e' : '#ef4444'}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, 0.7, 0]} center>
          <div className="bg-shadow/90 text-parchment px-2 py-1 rounded text-xs whitespace-nowrap">
            🔧 Palanca {isActivated ? '(activada)' : '(desactivada)'}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Componente principal para todos los elementos interactivos
 */
export function TacticalInteractives3D({
  elements,
  gridType,
  cellSize,
  onElementClick,
  onElementHover,
  showHiddenElements = false,
}: TacticalInteractives3DProps) {
  return (
    <group>
      {elements.map(element => {
        // No mostrar elementos ocultos si no somos DM
        if (element.hidden && !showHiddenElements && element.state !== 'triggered') {
          return null
        }

        switch (element.type) {
          case 'door':
          case 'secret_door':
            return (
              <Door3D
                key={element.id}
                element={element}
                gridType={gridType}
                cellSize={cellSize}
                onClick={() => onElementClick?.(element.id)}
                onHover={(hover) => onElementHover?.(hover ? element.id : null)}
              />
            )
          case 'trap':
          case 'pressure_plate':
            return (
              <Trap3D
                key={element.id}
                element={element}
                gridType={gridType}
                cellSize={cellSize}
                showHidden={showHiddenElements}
                onClick={() => onElementClick?.(element.id)}
                onHover={(hover) => onElementHover?.(hover ? element.id : null)}
              />
            )
          case 'chest':
            return (
              <Chest3D
                key={element.id}
                element={element}
                gridType={gridType}
                cellSize={cellSize}
                onClick={() => onElementClick?.(element.id)}
                onHover={(hover) => onElementHover?.(hover ? element.id : null)}
              />
            )
          case 'portal':
            return (
              <Portal3D
                key={element.id}
                element={element}
                gridType={gridType}
                cellSize={cellSize}
                onClick={() => onElementClick?.(element.id)}
                onHover={(hover) => onElementHover?.(hover ? element.id : null)}
              />
            )
          case 'lever':
            return (
              <Lever3D
                key={element.id}
                element={element}
                gridType={gridType}
                cellSize={cellSize}
                onClick={() => onElementClick?.(element.id)}
                onHover={(hover) => onElementHover?.(hover ? element.id : null)}
              />
            )
          default:
            return null
        }
      })}
    </group>
  )
}

export default TacticalInteractives3D
