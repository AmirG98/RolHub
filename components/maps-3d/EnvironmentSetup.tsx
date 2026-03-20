'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { type Lore } from '@/lib/maps/map-config'
import { getLoreEnvironment } from '@/lib/maps-3d/lore-environments'

interface EnvironmentSetupProps {
  lore: Lore
}

/**
 * Configura el ambiente 3D según el lore:
 * - Skybox/Environment
 * - Luces (ambient + directional)
 * - Niebla atmosférica
 */
export function EnvironmentSetup({ lore }: EnvironmentSetupProps) {
  const env = getLoreEnvironment(lore)
  const dirLightRef = useRef<THREE.DirectionalLight>(null)

  // Animación sutil de la luz direccional (simula nubes/tiempo)
  useFrame(({ clock }) => {
    if (dirLightRef.current) {
      const t = clock.getElapsedTime()
      dirLightRef.current.intensity = env.directionalLight.intensity * (0.9 + 0.1 * Math.sin(t * 0.2))
    }
  })

  return (
    <>
      {/* Fondo de color sólido como fallback */}
      <color attach="background" args={[env.backgroundColor]} />

      {/* Niebla atmosférica */}
      <fog attach="fog" args={[env.fog.color, env.fog.near, env.fog.far]} />

      {/* Luz ambiente */}
      <ambientLight
        intensity={env.ambientLight.intensity}
        color={env.ambientLight.color || '#ffffff'}
      />

      {/* Luz direccional principal (simula sol/luna) */}
      <directionalLight
        ref={dirLightRef}
        position={env.directionalLight.position}
        intensity={env.directionalLight.intensity}
        color={env.directionalLight.color || '#ffffff'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* Luz de relleno desde abajo (bounce light) */}
      <hemisphereLight
        intensity={env.ambientLight.intensity * 0.5}
        color={env.ambientLight.color || '#ffffff'}
        groundColor={env.terrain.color}
      />

      {/* Environment map para reflejos (si el lore lo soporta) */}
      <Environment
        preset={env.skybox}
        background={false}
        blur={0.5}
      />

      {/* Sky opcional para algunos lores */}
      {(lore === 'LOTR' || lore === 'VIKINGOS' || lore === 'ISEKAI') && (
        <Sky
          distance={450000}
          sunPosition={env.directionalLight.position}
          inclination={0.5}
          azimuth={0.25}
          rayleigh={lore === 'ISEKAI' ? 2 : 1}
        />
      )}
    </>
  )
}
