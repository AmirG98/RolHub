'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AreaEffect, GridType } from '@/lib/tactical/types'

interface TacticalEffects3DProps {
  effects: AreaEffect[]
  gridType: GridType
  cellSize: number
  cellSizeInFeet: number
}

// Colores por tipo de daño
const DAMAGE_TYPE_COLORS: Record<string, string> = {
  fire: '#ef4444',
  cold: '#3b82f6',
  lightning: '#fbbf24',
  poison: '#22c55e',
  acid: '#84cc16',
  radiant: '#fcd34d',
  necrotic: '#7c3aed',
  force: '#ec4899',
  thunder: '#6366f1',
  psychic: '#d946ef',
  default: '#94a3b8',
}

// Convertir coordenadas de grilla a mundo
function gridToWorld(x: number, y: number, gridType: GridType, cellSize: number): [number, number, number] {
  if (gridType === 'square') {
    return [x * cellSize + cellSize / 2, 0, y * cellSize + cellSize / 2]
  } else {
    const offsetX = y % 2 === 0 ? 0 : cellSize / 2
    return [x * cellSize + offsetX + cellSize / 2, 0, y * cellSize * 0.866 + cellSize / 2]
  }
}

/**
 * Efecto de área circular (Fireball, etc.)
 */
function CircleEffect({
  effect,
  position,
  cellSize,
  cellSizeInFeet,
}: {
  effect: AreaEffect
  position: [number, number, number]
  cellSize: number
  cellSizeInFeet: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const radius = ((effect.radius || 20) / cellSizeInFeet) * cellSize
  const color = effect.color || DAMAGE_TYPE_COLORS[effect.damagePerTurn?.type || 'default']

  // Partículas para efectos visuales
  const particles = useMemo(() => {
    if (!effect.particleEffect) return null

    const count = 100
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const particleColor = new THREE.Color(color)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * radius
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = Math.random() * (effect.height || radius) / cellSize
      positions[i * 3 + 2] = Math.sin(angle) * r

      colors[i * 3] = particleColor.r
      colors[i * 3 + 1] = particleColor.g
      colors[i * 3 + 2] = particleColor.b
    }

    return { positions, colors }
  }, [radius, color, effect.particleEffect, effect.height, cellSize])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Pulso del área
      const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.02
      meshRef.current.scale.setScalar(scale)

      // Rotación lenta
      meshRef.current.rotation.y = clock.elapsedTime * 0.2
    }

    if (particlesRef.current && particles) {
      // Animar partículas
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.01 // Subir
        if (positions[i + 1] > (effect.height || radius) / cellSize) {
          positions[i + 1] = 0 // Reset
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group position={position}>
      {/* Círculo base */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
      >
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={effect.opacity || 0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Borde del círculo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[radius * 0.95, radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Esfera 3D si es sphere */}
      {effect.shape === 'sphere' && (
        <mesh position={[0, radius / 2, 0]}>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      )}

      {/* Partículas */}
      {particles && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particles.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[particles.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  )
}

/**
 * Efecto de área cónica (Burning Hands, Cone of Cold, etc.)
 */
function ConeEffect({
  effect,
  position,
  cellSize,
  cellSizeInFeet,
}: {
  effect: AreaEffect
  position: [number, number, number]
  cellSize: number
  cellSizeInFeet: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const length = ((effect.length || 30) / cellSizeInFeet) * cellSize
  const angle = (effect.direction || 0) * (Math.PI / 180)
  const color = effect.color || DAMAGE_TYPE_COLORS[effect.damagePerTurn?.type || 'default']

  // Crear geometría del cono
  const coneGeometry = useMemo(() => {
    const points = []
    const segments = 16
    const halfAngle = Math.PI / 6 // 60 grados de apertura

    // Punto de origen
    points.push(new THREE.Vector2(0, 0))

    // Arco del cono
    for (let i = 0; i <= segments; i++) {
      const a = -halfAngle + (halfAngle * 2 * i) / segments
      points.push(new THREE.Vector2(
        Math.sin(a) * length,
        Math.cos(a) * length
      ))
    }

    const shape = new THREE.Shape()
    shape.moveTo(points[0].x, points[0].y)
    points.forEach((p, i) => {
      if (i > 0) shape.lineTo(p.x, p.y)
    })
    shape.closePath()

    return new THREE.ShapeGeometry(shape)
  }, [length])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.1
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, angle, 0]}
        position={[0, 0.05, 0]}
        geometry={coneGeometry}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={effect.opacity || 0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Borde del cono - usando ring como alternativa visual */}
      <mesh rotation={[-Math.PI / 2, angle, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[length * 0.95, length, 16, 1, -Math.PI / 6, Math.PI / 3]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/**
 * Efecto de área lineal (Lightning Bolt, etc.)
 */
function LineEffect({
  effect,
  position,
  cellSize,
  cellSizeInFeet,
}: {
  effect: AreaEffect
  position: [number, number, number]
  cellSize: number
  cellSizeInFeet: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const length = ((effect.length || 100) / cellSizeInFeet) * cellSize
  const width = ((effect.width || 5) / cellSizeInFeet) * cellSize
  const angle = (effect.direction || 0) * (Math.PI / 180)
  const color = effect.color || DAMAGE_TYPE_COLORS[effect.damagePerTurn?.type || 'default']

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Efecto de rayo
      const flash = Math.sin(clock.elapsedTime * 10) > 0.8 ? 1 : 0.4
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = flash
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, angle, 0]}
        position={[Math.sin(angle) * length / 2, 0.05, Math.cos(angle) * length / 2]}
      >
        <planeGeometry args={[width, length]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={effect.opacity || 0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Efecto de área cúbica (Wall of Fire, etc.)
 */
function CubeEffect({
  effect,
  position,
  cellSize,
  cellSizeInFeet,
}: {
  effect: AreaEffect
  position: [number, number, number]
  cellSize: number
  cellSizeInFeet: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const width = ((effect.width || 20) / cellSizeInFeet) * cellSize
  const height = ((effect.height || 20) / cellSizeInFeet) * cellSize
  const length = ((effect.length || 20) / cellSizeInFeet) * cellSize
  const color = effect.color || DAMAGE_TYPE_COLORS[effect.damagePerTurn?.type || 'default']

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const opacity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
      >
        <boxGeometry args={[width, height, length]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={effect.opacity || 0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Bordes del cubo */}
      <lineSegments position={[0, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, length)]} />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
    </group>
  )
}

/**
 * Efecto de área cilíndrica (Moonbeam, etc.)
 */
function CylinderEffect({
  effect,
  position,
  cellSize,
  cellSizeInFeet,
}: {
  effect: AreaEffect
  position: [number, number, number]
  cellSize: number
  cellSizeInFeet: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const radius = ((effect.radius || 5) / cellSizeInFeet) * cellSize
  const height = ((effect.height || 40) / cellSizeInFeet) * cellSize
  const color = effect.color || DAMAGE_TYPE_COLORS[effect.damagePerTurn?.type || 'default']

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Rotación lenta
      meshRef.current.rotation.y = clock.elapsedTime * 0.5

      const opacity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1
      ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
      >
        <cylinderGeometry args={[radius, radius, height, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={effect.opacity || 0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Base del cilindro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Componente principal para todos los efectos de área
 */
export function TacticalEffects3D({
  effects,
  gridType,
  cellSize,
  cellSizeInFeet,
}: TacticalEffects3DProps) {
  return (
    <group>
      {effects.map(effect => {
        const position = gridToWorld(effect.originX, effect.originY, gridType, cellSize)

        switch (effect.shape) {
          case 'circle':
          case 'sphere':
            return (
              <CircleEffect
                key={effect.id}
                effect={effect}
                position={position}
                cellSize={cellSize}
                cellSizeInFeet={cellSizeInFeet}
              />
            )
          case 'cone':
            return (
              <ConeEffect
                key={effect.id}
                effect={effect}
                position={position}
                cellSize={cellSize}
                cellSizeInFeet={cellSizeInFeet}
              />
            )
          case 'line':
            return (
              <LineEffect
                key={effect.id}
                effect={effect}
                position={position}
                cellSize={cellSize}
                cellSizeInFeet={cellSizeInFeet}
              />
            )
          case 'cube':
            return (
              <CubeEffect
                key={effect.id}
                effect={effect}
                position={position}
                cellSize={cellSize}
                cellSizeInFeet={cellSizeInFeet}
              />
            )
          case 'cylinder':
            return (
              <CylinderEffect
                key={effect.id}
                effect={effect}
                position={position}
                cellSize={cellSize}
                cellSizeInFeet={cellSizeInFeet}
              />
            )
          default:
            return null
        }
      })}
    </group>
  )
}

export default TacticalEffects3D
