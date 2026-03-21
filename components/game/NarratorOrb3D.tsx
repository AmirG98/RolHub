'use client'

import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Sparkles, Ring } from '@react-three/drei'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

type OrbState = 'idle' | 'speaking' | 'thinking' | 'combat'

interface NarratorOrb3DProps {
  state?: OrbState
  className?: string
  size?: number
}

// Colores por estado
const ORB_COLORS: Record<OrbState, {
  primary: string
  secondary: string
  emissive: string
  particles: string
}> = {
  idle: {
    primary: '#C9A84C',
    secondary: '#8B6914',
    emissive: '#F5C842',
    particles: '#FFE4A0',
  },
  speaking: {
    primary: '#FFD700',
    secondary: '#FFA500',
    emissive: '#FFFFFF',
    particles: '#FFFACD',
  },
  thinking: {
    primary: '#A78BFA',
    secondary: '#7C3AED',
    emissive: '#DDD6FE',
    particles: '#C4B5FD',
  },
  combat: {
    primary: '#EF4444',
    secondary: '#DC2626',
    emissive: '#FCA5A5',
    particles: '#F87171',
  },
}

// Orbe central con distorsión
function CoreOrb({ state, speed }: { state: OrbState, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const colors = ORB_COLORS[state]

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * speed * 0.5
      meshRef.current.rotation.x += delta * speed * 0.2
    }
  })

  const distortSpeed = state === 'speaking' ? 4 : state === 'thinking' ? 2 : state === 'combat' ? 6 : 1.5
  const distortAmount = state === 'speaking' ? 0.4 : state === 'combat' ? 0.5 : 0.3

  return (
    <Float
      speed={state === 'idle' ? 1.5 : state === 'speaking' ? 3 : 2}
      rotationIntensity={0.3}
      floatIntensity={0.5}
    >
      <Sphere ref={meshRef} args={[0.8, 64, 64]}>
        <MeshDistortMaterial
          color={colors.primary}
          emissive={colors.emissive}
          emissiveIntensity={state === 'speaking' ? 0.8 : state === 'combat' ? 0.6 : 0.4}
          roughness={0.2}
          metalness={0.8}
          distort={distortAmount}
          speed={distortSpeed}
          transparent
          opacity={0.9}
        />
      </Sphere>
    </Float>
  )
}

// Núcleo interno brillante
function InnerCore({ state }: { state: OrbState }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const colors = ORB_COLORS[state]

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= delta * 2
      const scale = 0.35 + Math.sin(Date.now() * 0.003) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Sphere ref={meshRef} args={[0.35, 32, 32]}>
      <meshBasicMaterial
        color={colors.emissive}
        transparent
        opacity={0.9}
      />
    </Sphere>
  )
}

// Anillos orbitales
function OrbitalRings({ state }: { state: OrbState }) {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const colors = ORB_COLORS[state]

  const rotationSpeed = state === 'speaking' ? 2 : state === 'combat' ? 3 : 1

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * rotationSpeed
      ring1Ref.current.rotation.z += delta * rotationSpeed * 0.5
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * rotationSpeed * 0.8
      ring2Ref.current.rotation.x += delta * rotationSpeed * 0.3
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * rotationSpeed * 0.6
      ring3Ref.current.rotation.y -= delta * rotationSpeed * 0.4
    }
  })

  return (
    <>
      <Ring
        ref={ring1Ref}
        args={[1.1, 1.15, 64]}
        rotation={[Math.PI / 3, 0, 0]}
      >
        <meshBasicMaterial
          color={colors.primary}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Ring>
      <Ring
        ref={ring2Ref}
        args={[1.25, 1.3, 64]}
        rotation={[Math.PI / 2, Math.PI / 4, 0]}
      >
        <meshBasicMaterial
          color={colors.secondary}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Ring>
      {state === 'thinking' && (
        <Ring
          ref={ring3Ref}
          args={[1.4, 1.45, 64]}
          rotation={[0, Math.PI / 3, Math.PI / 6]}
        >
          <meshBasicMaterial
            color={colors.emissive}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </>
  )
}

// Partículas energéticas
function EnergyParticles({ state }: { state: OrbState }) {
  const colors = ORB_COLORS[state]
  const particleCount = state === 'speaking' ? 80 : state === 'combat' ? 100 : 50
  const particleScale = state === 'speaking' ? 1.5 : state === 'combat' ? 2 : 1

  return (
    <Sparkles
      count={particleCount}
      scale={3}
      size={particleScale}
      speed={state === 'speaking' ? 2 : state === 'combat' ? 3 : 0.8}
      color={colors.particles}
      opacity={0.8}
    />
  )
}

// Aura de glow exterior
function GlowAura({ state }: { state: OrbState }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const colors = ORB_COLORS[state]

  useFrame(() => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.002) * (state === 'speaking' ? 0.15 : 0.08)
      meshRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <Sphere ref={meshRef} args={[1.6, 32, 32]}>
      <meshBasicMaterial
        color={colors.primary}
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  )
}

// Escena 3D completa
function OrbScene({ state }: { state: OrbState }) {
  const speed = state === 'speaking' ? 2 : state === 'combat' ? 2.5 : state === 'thinking' ? 1.5 : 1

  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#F5C842" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#7C3AED" />

      {/* Componentes del orbe */}
      <GlowAura state={state} />
      <OrbitalRings state={state} />
      <CoreOrb state={state} speed={speed} />
      <InnerCore state={state} />
      <EnergyParticles state={state} />
    </>
  )
}

// Fallback mientras carga
function LoadingFallback({ state }: { state: OrbState }) {
  const colors = ORB_COLORS[state]

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`,
      }}
    >
      <div
        className="w-12 h-12 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.emissive} 0%, ${colors.primary} 100%)`,
          boxShadow: `0 0 30px ${colors.primary}`,
        }}
      />
    </div>
  )
}

// Componente principal exportado
export function NarratorOrb3D({ state = 'idle', className, size = 100 }: NarratorOrb3DProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <Suspense fallback={<LoadingFallback state={state} />}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <OrbScene state={state} />
        </Canvas>
      </Suspense>
    </div>
  )
}

// Versión simple CSS para fallback o mobile
export function NarratorOrbSimple({ state = 'idle', className, size = 60 }: NarratorOrb3DProps) {
  const colors = ORB_COLORS[state]

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Glow exterior */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-500",
          state === 'speaking' && "animate-pulse"
        )}
        style={{
          width: size * 1.4,
          height: size * 1.4,
          background: `radial-gradient(circle, ${colors.primary}50 0%, transparent 70%)`,
        }}
      />

      {/* Anillo orbital */}
      <div
        className={cn(
          "absolute rounded-full border-2 border-dashed",
          state === 'thinking' && "animate-spin"
        )}
        style={{
          width: size * 0.95,
          height: size * 0.95,
          borderColor: `${colors.secondary}60`,
          animationDuration: '4s',
        }}
      />

      {/* Orbe principal */}
      <div
        className={cn(
          "relative rounded-full transition-all duration-300",
          state === 'speaking' && "scale-110 animate-pulse"
        )}
        style={{
          width: size * 0.65,
          height: size * 0.65,
          background: `
            radial-gradient(circle at 30% 30%, ${colors.emissive} 0%, transparent 40%),
            radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 100%)
          `,
          boxShadow: `
            0 0 ${size * 0.2}px ${colors.primary},
            0 0 ${size * 0.4}px ${colors.primary}60,
            inset 0 0 ${size * 0.15}px ${colors.emissive}40
          `,
        }}
      >
        {/* Núcleo interno */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: colors.emissive,
            boxShadow: `0 0 ${size * 0.15}px ${colors.emissive}`,
          }}
        />
      </div>
    </div>
  )
}
