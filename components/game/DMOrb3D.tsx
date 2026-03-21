'use client'

import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Float, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

type OrbState = 'idle' | 'speaking' | 'thinking' | 'combat'

interface DMOrb3DProps {
  state?: OrbState
  className?: string
  size?: number
}

// Colores por estado
const ORB_COLORS: Record<OrbState, { main: string; emissive: string; sparkles: string }> = {
  idle: {
    main: '#C9A84C',
    emissive: '#8B6914',
    sparkles: '#F5C842',
  },
  speaking: {
    main: '#F5C842',
    emissive: '#C9A84C',
    sparkles: '#FFFFFF',
  },
  thinking: {
    main: '#7c3aed',
    emissive: '#5b21b6',
    sparkles: '#a78bfa',
  },
  combat: {
    main: '#8B1A1A',
    emissive: '#5c0f0f',
    sparkles: '#ef4444',
  },
}

// Componente del orbe interior
function OrbCore({ state }: { state: OrbState }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const colors = ORB_COLORS[state]

  // Animacion segun estado
  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (state === 'speaking') {
      // Pulso rapido cuando habla
      meshRef.current.scale.x = 1 + Math.sin(Date.now() * 0.01) * 0.05
      meshRef.current.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.05
      meshRef.current.scale.z = 1 + Math.sin(Date.now() * 0.01) * 0.05
    } else if (state === 'thinking') {
      // Rotacion lenta cuando piensa
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x += delta * 0.2
    } else if (state === 'combat') {
      // Pulso intenso en combate
      const scale = 1 + Math.sin(Date.now() * 0.015) * 0.08
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.8, 64, 64]} />
      <MeshDistortMaterial
        color={colors.main}
        emissive={colors.emissive}
        emissiveIntensity={state === 'speaking' ? 0.8 : 0.4}
        roughness={0.2}
        metalness={0.3}
        distort={state === 'speaking' ? 0.3 : 0.15}
        speed={state === 'thinking' ? 3 : 1.5}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

// Capas de energia exterior
function EnergyLayers({ state }: { state: OrbState }) {
  const colors = ORB_COLORS[state]
  const layers = useMemo(() => [
    { radius: 1.0, opacity: 0.3 },
    { radius: 1.15, opacity: 0.15 },
    { radius: 1.3, opacity: 0.08 },
  ], [])

  return (
    <>
      {layers.map((layer, i) => (
        <mesh key={i} scale={layer.radius}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={colors.main}
            transparent
            opacity={layer.opacity}
            side={THREE.BackSide}
          />
        </mesh>
      ))}
    </>
  )
}

// Particulas flotantes
function OrbParticles({ state }: { state: OrbState }) {
  const colors = ORB_COLORS[state]
  const count = state === 'speaking' ? 100 : state === 'combat' ? 80 : 50
  const speed = state === 'speaking' ? 2 : state === 'thinking' ? 0.5 : 1

  return (
    <Sparkles
      count={count}
      scale={3}
      size={state === 'speaking' ? 3 : 2}
      speed={speed}
      color={colors.sparkles}
      opacity={0.8}
    />
  )
}

// Escena completa del orbe
function OrbScene({ state }: { state: OrbState }) {
  return (
    <>
      {/* Luz ambiental */}
      <ambientLight intensity={0.3} />

      {/* Luz puntual desde arriba */}
      <pointLight position={[0, 3, 0]} intensity={1} color="#F5C842" />

      {/* Luz desde abajo (sutil) */}
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#C9A84C" />

      {/* Orbe flotante */}
      <Float
        speed={state === 'speaking' ? 3 : 1.5}
        rotationIntensity={state === 'thinking' ? 0.3 : 0.1}
        floatIntensity={state === 'combat' ? 0.5 : 0.3}
      >
        <OrbCore state={state} />
        <EnergyLayers state={state} />
        <OrbParticles state={state} />
      </Float>

      {/* Post-processing para glow */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          intensity={state === 'speaking' ? 1.5 : 0.8}
        />
      </EffectComposer>
    </>
  )
}

// Fallback estatico cuando WebGL no esta disponible
function OrbFallback({ state, size }: { state: OrbState; size: number }) {
  const colors = ORB_COLORS[state]

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        "animate-pulse",
        state === 'speaking' && "animate-bounce",
        state === 'combat' && "animate-ping"
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${colors.main} 0%, ${colors.emissive} 70%, transparent 100%)`,
        boxShadow: `0 0 30px ${colors.main}40, 0 0 60px ${colors.emissive}20`,
      }}
    >
      <span className="text-4xl">
        {state === 'combat' ? '🔥' : state === 'thinking' ? '💭' : state === 'speaking' ? '💬' : '✨'}
      </span>
    </div>
  )
}

// Loading state
function OrbLoading({ size }: { size: number }) {
  return (
    <div
      className="flex items-center justify-center animate-pulse"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full bg-gradient-to-r from-gold-dim to-gold animate-spin"
        style={{ width: size * 0.8, height: size * 0.8 }}
      />
    </div>
  )
}

export function DMOrb3D({ state = 'idle', className, size = 120 }: DMOrb3DProps) {
  const [hasWebGL, setHasWebGL] = React.useState(true)

  // Detectar soporte de WebGL
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setHasWebGL(!!gl)
    } catch {
      setHasWebGL(false)
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ width: size, height: size }}>
        <OrbFallback state={state} size={size} />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <Suspense fallback={<OrbLoading size={size} />}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          style={{ width: size, height: size }}
          gl={{ antialias: true, alpha: true }}
        >
          <OrbScene state={state} />
        </Canvas>
      </Suspense>
    </div>
  )
}

// Componente simplificado para mobile (sin Three.js)
export function DMOrbSimple({ state = 'idle', className, size = 80 }: DMOrb3DProps) {
  const colors = ORB_COLORS[state]

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Capa exterior con glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          state === 'speaking' && "animate-pulse"
        )}
        style={{
          background: `radial-gradient(circle, ${colors.main}30 0%, transparent 70%)`,
          filter: `blur(${size * 0.15}px)`,
        }}
      />

      {/* Orbe principal */}
      <div
        className={cn(
          "relative rounded-full transition-all duration-300",
          state === 'speaking' && "scale-105",
          state === 'thinking' && "animate-spin-slow",
          state === 'combat' && "animate-pulse"
        )}
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background: `radial-gradient(circle at 30% 30%, ${colors.main}, ${colors.emissive})`,
          boxShadow: `
            0 0 ${size * 0.1}px ${colors.main},
            0 0 ${size * 0.2}px ${colors.emissive}80,
            inset 0 0 ${size * 0.1}px ${colors.main}80
          `,
        }}
      />

      {/* Particulas simuladas (puntos) */}
      {state === 'speaking' && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-ping"
              style={{
                backgroundColor: colors.sparkles,
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
