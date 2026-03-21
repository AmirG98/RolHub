'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type OrbState = 'idle' | 'speaking' | 'thinking' | 'combat'

interface DMOrbProps {
  state?: OrbState
  className?: string
  size?: number
}

// Colores por estado - más vibrantes y elegantes
const ORB_COLORS: Record<OrbState, {
  primary: string
  secondary: string
  glow: string
  accent: string
}> = {
  idle: {
    primary: '#F5C842',
    secondary: '#C9A84C',
    glow: '#F5C84260',
    accent: '#FFE4A0',
  },
  speaking: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: '#FFD70080',
    accent: '#FFFFFF',
  },
  thinking: {
    primary: '#A78BFA',
    secondary: '#7C3AED',
    glow: '#A78BFA60',
    accent: '#DDD6FE',
  },
  combat: {
    primary: '#EF4444',
    secondary: '#DC2626',
    glow: '#EF444480',
    accent: '#FCA5A5',
  },
}

// Componente principal del orbe - elegante CSS puro
export function DMOrb3D({ state = 'idle', className, size = 80 }: DMOrbProps) {
  const colors = ORB_COLORS[state]

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Glow exterior pulsante */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-500",
          state === 'speaking' && "animate-pulse",
          state === 'thinking' && "animate-[pulse_2s_ease-in-out_infinite]",
          state === 'combat' && "animate-[pulse_0.5s_ease-in-out_infinite]"
        )}
        style={{
          width: size * 1.4,
          height: size * 1.4,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Anillo exterior giratorio (solo en thinking) */}
      {state === 'thinking' && (
        <div
          className="absolute rounded-full border-2 border-dashed animate-spin"
          style={{
            width: size * 0.95,
            height: size * 0.95,
            borderColor: `${colors.primary}40`,
            animationDuration: '3s',
          }}
        />
      )}

      {/* Orbe principal */}
      <div
        className={cn(
          "relative rounded-full transition-all duration-300 overflow-hidden",
          state === 'speaking' && "scale-110",
          state === 'combat' && "scale-105"
        )}
        style={{
          width: size * 0.65,
          height: size * 0.65,
          background: `
            radial-gradient(circle at 35% 35%, ${colors.accent} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, ${colors.primary} 0%, ${colors.secondary} 100%)
          `,
          boxShadow: `
            0 0 ${size * 0.15}px ${colors.primary},
            0 0 ${size * 0.3}px ${colors.glow},
            inset 0 0 ${size * 0.1}px ${colors.accent}40
          `,
        }}
      >
        {/* Reflejo superior */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.25,
            height: size * 0.12,
            top: '15%',
            left: '20%',
            background: `linear-gradient(180deg, ${colors.accent}80 0%, transparent 100%)`,
            borderRadius: '50%',
          }}
        />

        {/* Efecto de energia interna */}
        {(state === 'speaking' || state === 'combat') && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: `radial-gradient(circle, ${colors.accent}30 0%, transparent 60%)`,
              animationDuration: state === 'combat' ? '0.8s' : '1.5s',
            }}
          />
        )}
      </div>

      {/* Partículas orbitantes */}
      {(state === 'speaking' || state === 'idle') && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size * 0.06,
                height: size * 0.06,
                backgroundColor: colors.accent,
                boxShadow: `0 0 ${size * 0.05}px ${colors.primary}`,
                animation: `orbit${i + 1} ${3 + i}s linear infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Chispas de combate */}
      {state === 'combat' && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-yellow-400 animate-ping"
              style={{
                top: `${25 + Math.sin(i * 1.5) * 25}%`,
                left: `${25 + Math.cos(i * 1.5) * 25}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </>
      )}

      {/* Estilos de animación de órbita */}
      <style jsx>{`
        @keyframes orbit1 {
          from { transform: rotate(0deg) translateX(${size * 0.4}px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(${size * 0.4}px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(120deg) translateX(${size * 0.35}px) rotate(-120deg); }
          to { transform: rotate(480deg) translateX(${size * 0.35}px) rotate(-480deg); }
        }
        @keyframes orbit3 {
          from { transform: rotate(240deg) translateX(${size * 0.45}px) rotate(-240deg); }
          to { transform: rotate(600deg) translateX(${size * 0.45}px) rotate(-600deg); }
        }
      `}</style>
    </div>
  )
}

// Versión compacta para espacios pequeños (sin partículas)
export function DMOrbSimple({ state = 'idle', className, size = 50 }: DMOrbProps) {
  const colors = ORB_COLORS[state]

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Glow */}
      <div
        className={cn(
          "absolute rounded-full",
          state === 'speaking' && "animate-pulse"
        )}
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Orbe */}
      <div
        className={cn(
          "relative rounded-full transition-all duration-300",
          state === 'thinking' && "animate-spin",
          state === 'speaking' && "scale-110"
        )}
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: `
            radial-gradient(circle at 35% 35%, ${colors.accent} 0%, transparent 40%),
            radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 100%)
          `,
          boxShadow: `0 0 ${size * 0.2}px ${colors.primary}`,
          animationDuration: state === 'thinking' ? '4s' : undefined,
        }}
      />
    </div>
  )
}

// Versión con icono para contextos muy pequeños
export function DMOrbIcon({ state = 'idle', className, size = 32 }: DMOrbProps) {
  const colors = ORB_COLORS[state]

  const icons: Record<OrbState, string> = {
    idle: '✨',
    speaking: '💬',
    thinking: '💭',
    combat: '⚔️',
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-300",
        state === 'speaking' && "animate-bounce",
        state === 'thinking' && "animate-pulse",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        boxShadow: `0 0 ${size * 0.3}px ${colors.glow}`,
        fontSize: size * 0.5,
      }}
    >
      {icons[state]}
    </div>
  )
}
