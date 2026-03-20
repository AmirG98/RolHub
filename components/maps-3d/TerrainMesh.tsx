'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { type Lore } from '@/lib/maps/map-config'
import { getLoreEnvironment } from '@/lib/maps-3d/lore-environments'

interface TerrainMeshProps {
  lore: Lore
  size?: number
  segments?: number
}

/**
 * Genera un terreno procedural basado en noise
 * El estilo visual cambia según el lore
 */
export function TerrainMesh({ lore, size = 400, segments = 128 }: TerrainMeshProps) {
  const env = getLoreEnvironment(lore)
  const meshRef = useRef<THREE.Mesh>(null)

  // Generar geometría con heightmap procedural
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    const positions = geo.attributes.position.array as Float32Array

    // Función de noise simple (Simplex-like)
    const noise = (x: number, y: number, scale: number) => {
      const nx = x * scale
      const ny = y * scale
      return (
        Math.sin(nx * 1.5) * Math.cos(ny * 1.5) * 0.5 +
        Math.sin(nx * 3 + 1.3) * Math.cos(ny * 2.7 + 0.8) * 0.25 +
        Math.sin(nx * 7 + 2.1) * Math.cos(ny * 5.3 + 1.5) * 0.125 +
        Math.sin(nx * 13 + 3.7) * Math.cos(ny * 11 + 2.9) * 0.0625
      )
    }

    // Aplicar heightmap
    const displacement = env.terrain.displacement || 10
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]

      // Diferentes patrones según lore
      let height = 0
      switch (lore) {
        case 'LOTR':
        case 'VIKINGOS':
          // Montañas y valles suaves
          height = noise(x, y, 0.02) * displacement
          height += noise(x, y, 0.05) * displacement * 0.5
          break

        case 'ZOMBIES':
          // Terreno urbano destruido - más plano con ruinas
          height = noise(x, y, 0.1) * displacement * 0.3
          // Añadir "edificios" aleatorios
          if (Math.abs(noise(x, y, 0.2)) > 0.7) {
            height += displacement * 0.5
          }
          break

        case 'CYBERPUNK':
          // Ciudad con edificios en grid
          const gridX = Math.floor(x / 30) * 30
          const gridY = Math.floor(y / 30) * 30
          const isBuilding = noise(gridX, gridY, 0.05) > 0
          height = isBuilding ? Math.abs(noise(gridX, gridY, 0.03)) * displacement * 2 : 0
          break

        case 'ISEKAI':
          // Terreno fantástico con colinas suaves
          height = noise(x, y, 0.015) * displacement
          height += Math.abs(noise(x, y, 0.04)) * displacement * 0.3
          break

        case 'STAR_WARS':
          // Desierto/rocoso con dunas
          height = Math.abs(noise(x, y, 0.025)) * displacement
          height += noise(x, y, 0.08) * displacement * 0.2
          break

        case 'LOVECRAFT_HORROR':
          // Terreno distorsionado, inquietante
          height = noise(x, y, 0.03) * displacement
          height += Math.sin(x * 0.1 + y * 0.1) * displacement * 0.2
          height *= 1 + Math.abs(noise(x, y, 0.1)) * 0.5
          break

        default:
          height = noise(x, y, 0.02) * displacement
      }

      positions[i + 2] = height
    }

    geo.computeVertexNormals()
    geo.rotateX(-Math.PI / 2)

    return geo
  }, [lore, size, segments, env.terrain.displacement])

  // Animación sutil del terreno (para lores específicos)
  useFrame(({ clock }) => {
    if (meshRef.current && (lore === 'LOVECRAFT_HORROR' || lore === 'CYBERPUNK')) {
      // Efecto de "respiración" del terreno para horror
      if (lore === 'LOVECRAFT_HORROR') {
        const scale = 1 + Math.sin(clock.getElapsedTime() * 0.2) * 0.002
        meshRef.current.scale.y = scale
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      receiveShadow
      position={[0, 0, 0]}
    >
      <meshStandardMaterial
        color={env.terrain.color}
        roughness={env.terrain.roughness}
        metalness={env.terrain.metalness}
        wireframe={env.terrain.wireframe}
        flatShading={lore === 'ZOMBIES' || lore === 'CYBERPUNK'}
      />
    </mesh>
  )
}
