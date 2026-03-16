'use client'

import React, { useRef, useEffect } from 'react'
import { Group, Circle, Star, Ring } from 'react-konva'
import Konva from 'konva'
import { type Lore } from '@/lib/maps/map-config'
import { SUBMAP_THEMES } from '@/lib/maps/submap-types'

interface PlayerTokenProps {
  x: number
  y: number
  lore: Lore
  size?: number
}

// Colores del token según el lore
const PLAYER_COLORS: Record<Lore, { primary: string; secondary: string; glow: string }> = {
  LOTR: { primary: '#FFD700', secondary: '#8B6914', glow: '#F5C842' },
  ZOMBIES: { primary: '#32CD32', secondary: '#228B22', glow: '#00FF00' },
  ISEKAI: { primary: '#FF69B4', secondary: '#FF1493', glow: '#FFB6C1' },
  VIKINGOS: { primary: '#F39C12', secondary: '#E67E22', glow: '#F1C40F' },
  STAR_WARS: { primary: '#4FC3F7', secondary: '#03A9F4', glow: '#81D4FA' },
  CYBERPUNK: { primary: '#00FFFF', secondary: '#FF00FF', glow: '#00FFFF' },
  LOVECRAFT: { primary: '#6B4C8C', secondary: '#4A0080', glow: '#9B59B6' },
}

export function PlayerToken({ x, y, lore, size = 24 }: PlayerTokenProps) {
  const groupRef = useRef<Konva.Group>(null)
  const glowRef = useRef<Konva.Ring>(null)
  const colors = PLAYER_COLORS[lore]

  // Animación de pulso
  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const anim = new Konva.Animation((frame) => {
      if (!frame) return
      const scale = 1 + Math.sin(frame.time / 500) * 0.15
      glow.scale({ x: scale, y: scale })
      glow.opacity(0.3 + Math.sin(frame.time / 500) * 0.2)
    }, glow.getLayer())

    anim.start()

    return () => {
      anim.stop()
    }
  }, [])

  // Animación de movimiento suave
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    group.to({
      x,
      y,
      duration: 0.3,
      easing: Konva.Easings.EaseInOut,
    })
  }, [x, y])

  return (
    <Group ref={groupRef} x={x} y={y}>
      {/* Glow exterior pulsante */}
      <Ring
        ref={glowRef}
        innerRadius={size * 0.8}
        outerRadius={size * 1.2}
        fill={colors.glow}
        opacity={0.4}
      />

      {/* Sombra */}
      <Circle
        x={2}
        y={2}
        radius={size / 2}
        fill="rgba(0,0,0,0.5)"
      />

      {/* Círculo base */}
      <Circle
        radius={size / 2}
        fill={colors.primary}
        stroke={colors.secondary}
        strokeWidth={3}
        shadowColor={colors.glow}
        shadowBlur={15}
        shadowOpacity={0.6}
      />

      {/* Estrella interior */}
      <Star
        numPoints={4}
        innerRadius={size / 6}
        outerRadius={size / 3}
        fill="#FFFFFF"
        rotation={45}
        opacity={0.9}
      />

      {/* Punto central */}
      <Circle
        radius={3}
        fill={colors.secondary}
      />
    </Group>
  )
}
