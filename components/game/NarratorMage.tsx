'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type MageState = 'idle' | 'speaking' | 'thinking' | 'combat'

interface NarratorMageProps {
  state?: MageState
  className?: string
  size?: number
}

// Colores por estado
const MAGE_COLORS: Record<MageState, {
  hood: string
  hoodDark: string
  eyes: string
  glow: string
  magic: string
}> = {
  idle: {
    hood: '#2A1F14',
    hoodDark: '#1A1208',
    eyes: '#F5C842',
    glow: '#F5C84240',
    magic: '#C9A84C',
  },
  speaking: {
    hood: '#2A1F14',
    hoodDark: '#1A1208',
    eyes: '#FFD700',
    glow: '#FFD70060',
    magic: '#FFA500',
  },
  thinking: {
    hood: '#1E1A2E',
    hoodDark: '#0F0D17',
    eyes: '#A78BFA',
    glow: '#A78BFA50',
    magic: '#7C3AED',
  },
  combat: {
    hood: '#2A1414',
    hoodDark: '#1A0808',
    eyes: '#EF4444',
    glow: '#EF444460',
    magic: '#DC2626',
  },
}

// Mago encapuchado principal
export function NarratorMage({ state = 'idle', className, size = 80 }: NarratorMageProps) {
  const colors = MAGE_COLORS[state]
  const eyeSize = size * 0.06
  const eyeSpacing = size * 0.12

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Aura mágica exterior */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-500",
          state === 'speaking' && "animate-pulse",
          state === 'thinking' && "animate-[pulse_2s_ease-in-out_infinite]",
          state === 'combat' && "animate-[pulse_0.5s_ease-in-out_infinite]"
        )}
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Partículas mágicas flotantes */}
      {(state === 'speaking' || state === 'thinking') && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size * 0.04,
                height: size * 0.04,
                backgroundColor: colors.magic,
                boxShadow: `0 0 ${size * 0.08}px ${colors.eyes}`,
                animation: `float${i} ${2 + i * 0.5}s ease-in-out infinite`,
                opacity: 0.8,
              }}
            />
          ))}
        </>
      )}

      {/* Capucha - forma principal */}
      <div
        className="relative transition-all duration-300"
        style={{
          width: size * 0.7,
          height: size * 0.85,
        }}
      >
        {/* Capucha exterior */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.hood} 0%, ${colors.hoodDark} 100%)
            `,
            clipPath: 'polygon(50% 0%, 100% 35%, 95% 100%, 5% 100%, 0% 35%)',
            boxShadow: `
              inset 0 ${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.5),
              0 0 ${size * 0.15}px ${colors.glow}
            `,
          }}
        />

        {/* Sombra interior de la capucha */}
        <div
          className="absolute"
          style={{
            top: '25%',
            left: '15%',
            width: '70%',
            height: '50%',
            background: `radial-gradient(ellipse at 50% 30%, ${colors.hoodDark} 0%, transparent 70%)`,
            borderRadius: '50% 50% 45% 45%',
          }}
        />

        {/* Rostro en sombra (muy oscuro, apenas visible) */}
        <div
          className="absolute"
          style={{
            top: '30%',
            left: '25%',
            width: '50%',
            height: '35%',
            background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.9) 0%, transparent 80%)`,
            borderRadius: '40%',
          }}
        />

        {/* Ojos brillantes */}
        <div
          className="absolute flex justify-center gap-1"
          style={{
            top: '38%',
            left: '50%',
            transform: 'translateX(-50%)',
            gap: eyeSpacing,
          }}
        >
          {/* Ojo izquierdo */}
          <div
            className={cn(
              "rounded-full transition-all duration-300",
              state === 'speaking' && "animate-pulse",
              state === 'combat' && "animate-[pulse_0.3s_ease-in-out_infinite]"
            )}
            style={{
              width: eyeSize,
              height: eyeSize * 0.6,
              backgroundColor: colors.eyes,
              boxShadow: `
                0 0 ${size * 0.1}px ${colors.eyes},
                0 0 ${size * 0.2}px ${colors.glow}
              `,
              borderRadius: '50%',
            }}
          />
          {/* Ojo derecho */}
          <div
            className={cn(
              "rounded-full transition-all duration-300",
              state === 'speaking' && "animate-pulse",
              state === 'combat' && "animate-[pulse_0.3s_ease-in-out_infinite]"
            )}
            style={{
              width: eyeSize,
              height: eyeSize * 0.6,
              backgroundColor: colors.eyes,
              boxShadow: `
                0 0 ${size * 0.1}px ${colors.eyes},
                0 0 ${size * 0.2}px ${colors.glow}
              `,
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Efecto de respiración mágica bajo los ojos */}
        {state === 'speaking' && (
          <div
            className="absolute animate-pulse"
            style={{
              top: '50%',
              left: '30%',
              width: '40%',
              height: '15%',
              background: `radial-gradient(ellipse, ${colors.glow} 0%, transparent 70%)`,
              borderRadius: '50%',
            }}
          />
        )}

        {/* Runas giratorias (thinking) */}
        {state === 'thinking' && (
          <div
            className="absolute animate-spin"
            style={{
              top: '20%',
              left: '10%',
              width: '80%',
              height: '80%',
              border: `1px dashed ${colors.magic}40`,
              borderRadius: '50%',
              animationDuration: '4s',
            }}
          />
        )}

        {/* Chispas de combate */}
        {state === 'combat' && (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute rounded-full animate-ping"
                style={{
                  width: size * 0.03,
                  height: size * 0.03,
                  backgroundColor: colors.magic,
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes float0 {
          0%, 100% { transform: translate(${-size * 0.3}px, ${-size * 0.2}px); opacity: 0.8; }
          50% { transform: translate(${-size * 0.35}px, ${-size * 0.35}px); opacity: 0.4; }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(${size * 0.3}px, ${-size * 0.15}px); opacity: 0.7; }
          50% { transform: translate(${size * 0.35}px, ${-size * 0.3}px); opacity: 0.3; }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(${-size * 0.25}px, ${size * 0.2}px); opacity: 0.6; }
          50% { transform: translate(${-size * 0.3}px, ${size * 0.1}px); opacity: 0.9; }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(${size * 0.25}px, ${size * 0.15}px); opacity: 0.5; }
          50% { transform: translate(${size * 0.3}px, ${size * 0.25}px); opacity: 0.8; }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0px, ${-size * 0.4}px); opacity: 0.7; }
          50% { transform: translate(0px, ${-size * 0.45}px); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

// Versión compacta para espacios pequeños
export function NarratorMageSimple({ state = 'idle', className, size = 50 }: NarratorMageProps) {
  const colors = MAGE_COLORS[state]
  const eyeSize = size * 0.08

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

      {/* Capucha simplificada */}
      <div
        className="relative"
        style={{
          width: size * 0.7,
          height: size * 0.8,
          background: `linear-gradient(180deg, ${colors.hood} 0%, ${colors.hoodDark} 100%)`,
          clipPath: 'polygon(50% 0%, 100% 40%, 90% 100%, 10% 100%, 0% 40%)',
          boxShadow: `0 0 ${size * 0.15}px ${colors.glow}`,
        }}
      >
        {/* Ojos */}
        <div
          className="absolute flex justify-center"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            gap: size * 0.12,
          }}
        >
          <div
            className={cn(
              "rounded-full",
              state === 'speaking' && "animate-pulse"
            )}
            style={{
              width: eyeSize,
              height: eyeSize * 0.5,
              backgroundColor: colors.eyes,
              boxShadow: `0 0 ${size * 0.1}px ${colors.eyes}`,
            }}
          />
          <div
            className={cn(
              "rounded-full",
              state === 'speaking' && "animate-pulse"
            )}
            style={{
              width: eyeSize,
              height: eyeSize * 0.5,
              backgroundColor: colors.eyes,
              boxShadow: `0 0 ${size * 0.1}px ${colors.eyes}`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Versión icono para contextos muy pequeños
export function NarratorMageIcon({ state = 'idle', className, size = 32 }: NarratorMageProps) {
  const colors = MAGE_COLORS[state]

  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        state === 'speaking' && "animate-pulse",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.7,
        filter: `drop-shadow(0 0 ${size * 0.2}px ${colors.glow})`,
      }}
    >
      🧙
    </div>
  )
}
