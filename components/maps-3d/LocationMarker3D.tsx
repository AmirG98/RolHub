'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { type Lore } from '@/lib/maps/map-config'
import { getLoreEnvironment, type LoreEnvironment } from '@/lib/maps-3d/lore-environments'

// Tipo de nivel de conocimiento
type LocationKnowledgeLevel = 'unknown' | 'rumored' | 'discovered' | 'visited' | 'explored' | 'mastered'

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
  knowledgeLevel: LocationKnowledgeLevel
  onClick: () => void
}

// Apariencia visual por nivel de conocimiento
interface MarkerAppearance {
  color: string
  opacity: number
  scale: number
  showLabel: boolean
  labelSuffix?: string
  fogIntensity: number
  glowEffect: boolean
  goldenBorder: boolean
  emissiveIntensity: number
}

// Obtener apariencia según nivel de conocimiento
function getMarkerAppearance(
  level: LocationKnowledgeLevel,
  env: LoreEnvironment,
  isCurrentLocation: boolean
): MarkerAppearance {
  // Si es ubicación actual, siempre mostrar completo
  if (isCurrentLocation) {
    return {
      color: env.markers.currentColor,
      opacity: 1.0,
      scale: 1.2,
      showLabel: true,
      fogIntensity: 0,
      glowEffect: true,
      goldenBorder: false,
      emissiveIntensity: 0.4,
    }
  }

  switch (level) {
    case 'unknown':
      return {
        color: '#1a1a1a',
        opacity: 0.15,
        scale: 0.5,
        showLabel: false,
        fogIntensity: 0.8,
        glowEffect: false,
        goldenBorder: false,
        emissiveIntensity: 0,
      }
    case 'rumored':
      return {
        color: '#3a3a4a',
        opacity: 0.35,
        scale: 0.65,
        showLabel: true,
        labelSuffix: ' ?',
        fogIntensity: 0.5,
        glowEffect: false,
        goldenBorder: false,
        emissiveIntensity: 0.05,
      }
    case 'discovered':
      return {
        color: env.markers.defaultColor,
        opacity: 0.7,
        scale: 0.85,
        showLabel: true,
        fogIntensity: 0.2,
        glowEffect: false,
        goldenBorder: false,
        emissiveIntensity: 0.1,
      }
    case 'visited':
      return {
        color: env.markers.visitedColor,
        opacity: 1.0,
        scale: 1.0,
        showLabel: true,
        fogIntensity: 0,
        glowEffect: false,
        goldenBorder: false,
        emissiveIntensity: 0.2,
      }
    case 'explored':
      return {
        color: env.markers.visitedColor,
        opacity: 1.0,
        scale: 1.0,
        showLabel: true,
        fogIntensity: 0,
        glowEffect: true,
        goldenBorder: false,
        emissiveIntensity: 0.35,
      }
    case 'mastered':
      return {
        color: '#ffd700',
        opacity: 1.0,
        scale: 1.1,
        showLabel: true,
        fogIntensity: 0,
        glowEffect: true,
        goldenBorder: true,
        emissiveIntensity: 0.5,
      }
    default:
      return {
        color: env.markers.defaultColor,
        opacity: 0.5,
        scale: 0.8,
        showLabel: true,
        fogIntensity: 0.3,
        glowEffect: false,
        goldenBorder: false,
        emissiveIntensity: 0.1,
      }
  }
}

/**
 * Marcador 3D para una ubicación en el mapa
 * Muestra todas las ubicaciones con efectos visuales según nivel de conocimiento
 */
export function LocationMarker3D({
  location,
  lore,
  isCurrentLocation,
  knowledgeLevel,
  onClick
}: LocationMarker3DProps) {
  const env = getLoreEnvironment(lore)
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const fogRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Obtener apariencia según nivel
  const appearance = getMarkerAppearance(knowledgeLevel, env, isCurrentLocation)

  // Determinar tamaño según tipo
  const getBaseSize = () => {
    switch (location.type) {
      case 'city': return 4
      case 'dungeon': return 3
      case 'quest': return 2.5
      case 'poi': return 2
      default: return 2
    }
  }

  const baseSize = getBaseSize()
  const size = baseSize * appearance.scale
  const height = location.z || 5

  // Solo permitir interacción si no es unknown
  const isInteractive = knowledgeLevel !== 'unknown'

  // Animaciones
  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return

    const t = clock.getElapsedTime()

    // Flotar suavemente (menos para unknown)
    const floatAmount = knowledgeLevel === 'unknown' ? 0.1 : 0.3
    groupRef.current.position.y = height + Math.sin(t * 2 + location.x) * floatAmount

    // Rotar el marcador (más lento para unknown/rumored)
    const rotationSpeed = knowledgeLevel === 'unknown' ? 0.1 :
                          knowledgeLevel === 'rumored' ? 0.25 : 0.5
    meshRef.current.rotation.y = t * rotationSpeed

    // Escala por hover (solo si es interactivo)
    if (isInteractive) {
      const targetScale = hovered ? 1.15 : 1
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }

    // Glow pulse para ubicaciones con glow
    if (glowRef.current && appearance.glowEffect) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.2)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.25 + Math.sin(t * 3) * 0.1
    }

    // Fog pulse para ubicaciones con fog
    if (fogRef.current && appearance.fogIntensity > 0) {
      const mat = fogRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = appearance.fogIntensity * (0.15 + Math.sin(t * 0.5) * 0.05)
    }
  })

  // Obtener geometría según tipo
  const MarkerGeometry = () => {
    const materialProps = {
      color: appearance.color,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: appearance.opacity,
      emissive: appearance.color,
      emissiveIntensity: appearance.emissiveIntensity,
    }

    switch (location.type) {
      case 'city':
        return (
          <group>
            {/* Torre central */}
            <mesh position={[0, size * 0.5, 0]}>
              <cylinderGeometry args={[size * 0.3, size * 0.4, size, 6]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Techo */}
            <mesh position={[0, size * 1.1, 0]}>
              <coneGeometry args={[size * 0.5, size * 0.5, 6]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )

      case 'dungeon':
        return (
          <mesh>
            <octahedronGeometry args={[size * 0.5, 0]} />
            <meshStandardMaterial {...materialProps} roughness={0.7} metalness={0.2} />
          </mesh>
        )

      case 'quest':
        return (
          <mesh>
            <torusGeometry args={[size * 0.4, size * 0.15, 8, 16]} />
            <meshStandardMaterial {...materialProps} roughness={0.3} metalness={0.5} />
          </mesh>
        )

      default:
        return (
          <mesh>
            <sphereGeometry args={[size * 0.4, knowledgeLevel === 'unknown' ? 8 : 16, knowledgeLevel === 'unknown' ? 8 : 16]} />
            <meshStandardMaterial {...materialProps} roughness={0.6} metalness={0.2} />
          </mesh>
        )
    }
  }

  return (
    <group
      ref={groupRef}
      position={[location.x, height, location.y]}
      onClick={(e) => {
        if (!isInteractive) return
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        if (!isInteractive) return
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Esfera de niebla para ubicaciones no conocidas */}
      {appearance.fogIntensity > 0 && (
        <mesh ref={fogRef}>
          <sphereGeometry args={[size * 2.5, 12, 12]} />
          <meshBasicMaterial
            color={env.fog.color}
            transparent
            opacity={appearance.fogIntensity * 0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Marcador principal */}
      <group ref={meshRef}>
        <MarkerGeometry />
      </group>

      {/* Glow effect para ubicaciones exploradas/mastered o current */}
      {appearance.glowEffect && (
        <mesh ref={glowRef} position={[0, 0, 0]}>
          <sphereGeometry args={[size * 1.3, 16, 16]} />
          <meshBasicMaterial
            color={appearance.goldenBorder ? '#ffd700' : env.markers.glowColor}
            transparent
            opacity={0.25}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Anillo dorado para mastered */}
      {appearance.goldenBorder && (
        <GoldenRing size={size} />
      )}

      {/* Poste/base */}
      <mesh position={[0, -height / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, height, 6]} />
        <meshStandardMaterial
          color={appearance.color}
          roughness={0.8}
          metalness={0.1}
          opacity={appearance.opacity * 0.5}
          transparent
        />
      </mesh>

      {/* Label con nombre */}
      {appearance.showLabel && (
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, size * 1.5 + 2, 0]}
        >
          <Text
            fontSize={hovered ? 2.2 : 1.8}
            color={hovered ? '#ffffff' : appearance.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.08}
            outlineColor="#000000"
            fillOpacity={appearance.opacity}
          >
            {location.name}{appearance.labelSuffix || ''}
          </Text>

          {/* Indicador de quest/misión (solo si visited o superior) */}
          {location.type === 'quest' && ['visited', 'explored', 'mastered'].includes(knowledgeLevel) && (
            <Text
              fontSize={1.3}
              color="#ffcc00"
              anchorX="center"
              anchorY="middle"
              position={[0, -2.2, 0]}
            >
              ⚔️ Misión
            </Text>
          )}
        </Billboard>
      )}

      {/* Partículas para ubicación actual */}
      {isCurrentLocation && (
        <CurrentLocationParticles color={env.markers.glowColor} />
      )}
    </group>
  )
}

/**
 * Anillo dorado para ubicaciones "mastered"
 */
function GoldenRing({ size }: { size: number }) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <mesh ref={ringRef} position={[0, 0.5, 0]}>
      <torusGeometry args={[size * 1.5, 0.15, 8, 32]} />
      <meshBasicMaterial color="#ffd700" transparent opacity={0.6} />
    </mesh>
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

// Re-export del tipo para uso externo
export type { LocationKnowledgeLevel }
