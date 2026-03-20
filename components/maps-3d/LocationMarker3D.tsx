'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { type Lore } from '@/lib/maps/map-config'
import { getLoreEnvironment } from '@/lib/maps-3d/lore-environments'

interface Location {
  id: string
  name: string
  x: number
  y: number
  z?: number
  type?: 'city' | 'dungeon' | 'wilderness' | 'poi' | 'quest'
  icon?: string
}

interface LocationMarker3DProps {
  location: Location
  lore: Lore
  isCurrentLocation: boolean
  isVisited: boolean
  isDiscovered: boolean
  onClick: () => void
}

/**
 * Marcador 3D para una ubicación en el mapa
 * Incluye geometría, label y efectos de hover/selección
 */
export function LocationMarker3D({
  location,
  lore,
  isCurrentLocation,
  isVisited,
  isDiscovered,
  onClick
}: LocationMarker3DProps) {
  const env = getLoreEnvironment(lore)
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Determinar color según estado
  const getColor = () => {
    if (isCurrentLocation) return env.markers.currentColor
    if (isVisited) return env.markers.visitedColor
    if (!isDiscovered) return '#333333'
    return env.markers.defaultColor
  }

  // Determinar tamaño según tipo
  const getSize = () => {
    switch (location.type) {
      case 'city': return 4
      case 'dungeon': return 3
      case 'quest': return 2.5
      case 'poi': return 2
      default: return 2
    }
  }

  const color = getColor()
  const size = getSize()
  const height = location.z || 5 // Altura sobre el terreno

  // Animaciones
  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return

    const t = clock.getElapsedTime()

    // Flotar suavemente
    groupRef.current.position.y = height + Math.sin(t * 2 + location.x) * 0.3

    // Rotar el marcador
    meshRef.current.rotation.y = t * 0.5

    // Escala por hover/current
    const targetScale = hovered ? 1.3 : isCurrentLocation ? 1.2 : 1
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    )

    // Glow pulse para ubicación actual
    if (glowRef.current && isCurrentLocation) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.2)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 + Math.sin(t * 3) * 0.1
    }
  })

  // No mostrar si no está descubierto (fog of war)
  if (!isDiscovered) {
    return null
  }

  // Obtener geometría según tipo
  const MarkerGeometry = () => {
    switch (location.type) {
      case 'city':
        return (
          <group>
            {/* Torre central */}
            <mesh position={[0, size * 0.5, 0]}>
              <cylinderGeometry args={[size * 0.3, size * 0.4, size, 6]} />
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
            </mesh>
            {/* Techo */}
            <mesh position={[0, size * 1.1, 0]}>
              <coneGeometry args={[size * 0.5, size * 0.5, 6]} />
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
            </mesh>
          </group>
        )

      case 'dungeon':
        return (
          <mesh>
            <octahedronGeometry args={[size * 0.5, 0]} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
          </mesh>
        )

      case 'quest':
        return (
          <mesh>
            <torusGeometry args={[size * 0.4, size * 0.15, 8, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        )

      default:
        return (
          <mesh>
            <sphereGeometry args={[size * 0.4, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
          </mesh>
        )
    }
  }

  return (
    <group
      ref={groupRef}
      position={[location.x, height, location.y]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Marcador principal */}
      <group ref={meshRef}>
        <MarkerGeometry />
      </group>

      {/* Glow effect para ubicación actual */}
      {isCurrentLocation && (
        <mesh ref={glowRef} position={[0, 0, 0]}>
          <sphereGeometry args={[size * 1.2, 16, 16]} />
          <meshBasicMaterial
            color={env.markers.glowColor}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Poste/base */}
      <mesh position={[0, -height / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, height, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} opacity={0.5} transparent />
      </mesh>

      {/* Label con nombre */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={[0, size * 1.5 + 2, 0]}
      >
        <Text
          fontSize={hovered ? 2.5 : 2}
          color={hovered ? '#ffffff' : color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {location.name}
        </Text>

        {/* Indicador de quest/misión */}
        {location.type === 'quest' && (
          <Text
            fontSize={1.5}
            color="#ffcc00"
            anchorX="center"
            anchorY="middle"
            position={[0, -2.5, 0]}
          >
            ⚔️ Misión
          </Text>
        )}
      </Billboard>

      {/* Partículas para ubicación actual */}
      {isCurrentLocation && (
        <CurrentLocationParticles color={env.markers.glowColor} />
      )}
    </group>
  )
}

/**
 * Partículas que orbitan la ubicación actual
 */
function CurrentLocationParticles({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime()
    }
  })

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 3,
            Math.sin(i * 0.5) * 0.5,
            Math.sin((i / 4) * Math.PI * 2) * 3
          ]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}
