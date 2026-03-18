'use client'

import React from 'react'
import { type QuestMarker as QuestMarkerType, getQuestMarkerIcon, getQuestMarkerColor } from '@/lib/types/quest'

interface QuestMarkerProps {
  marker: QuestMarkerType
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  showTooltip?: boolean
  className?: string
}

/**
 * Marcador visual de quest para overlay en locaciones del mapa
 * Tipos: main (!), side (?), completable (★), next (→)
 */
export function QuestMarker({
  marker,
  size = 'md',
  onClick,
  showTooltip = true,
  className = '',
}: QuestMarkerProps) {
  const icon = getQuestMarkerIcon(marker.type)
  const color = getQuestMarkerColor(marker.type)

  // Tamaños
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  }

  const offsetClasses = {
    sm: '-top-1 -right-1',
    md: '-top-1.5 -right-1.5',
    lg: '-top-2 -right-2',
  }

  return (
    <div
      className={`
        absolute ${offsetClasses[size]} z-10
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        font-bold font-heading
        cursor-pointer
        transition-all duration-200
        hover:scale-110
        ${marker.pulse ? 'animate-pulse-quest' : ''}
        ${className}
      `}
      style={{
        backgroundColor: color,
        color: marker.type === 'main' || marker.type === 'completable' ? '#1C1208' : '#FFFFFF',
        boxShadow: `0 0 8px ${color}80, 0 0 4px ${color}`,
      }}
      onClick={onClick}
      title={showTooltip ? marker.questTitle : undefined}
    >
      {icon}
    </div>
  )
}

/**
 * Marcador inline para usar en listas (QuestPanel)
 */
interface QuestMarkerInlineProps {
  type: QuestMarkerType['type']
  className?: string
}

export function QuestMarkerInline({ type, className = '' }: QuestMarkerInlineProps) {
  const icon = getQuestMarkerIcon(type)
  const color = getQuestMarkerColor(type)

  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-5 h-5 rounded-full
        font-bold text-xs
        ${className}
      `}
      style={{
        backgroundColor: color,
        color: type === 'main' || type === 'completable' ? '#1C1208' : '#FFFFFF',
      }}
    >
      {icon}
    </span>
  )
}

/**
 * Badge de tipo de quest para UI
 */
interface QuestTypeBadgeProps {
  type: QuestMarkerType['type']
  label?: string
  className?: string
}

export function QuestTypeBadge({ type, label, className = '' }: QuestTypeBadgeProps) {
  const color = getQuestMarkerColor(type)
  const icon = getQuestMarkerIcon(type)

  const typeLabels = {
    main: 'Principal',
    side: 'Secundaria',
    completable: 'Completable',
    next: 'Siguiente',
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2 py-0.5 rounded-full
        text-xs font-ui
        border
        ${className}
      `}
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}60`,
        color: color,
      }}
    >
      <span>{icon}</span>
      <span>{label || typeLabels[type]}</span>
    </div>
  )
}

/**
 * Animaciones CSS para quest markers
 * Incluir en globals.css o agregar via styled-jsx
 */
export const questMarkerStyles = `
  @keyframes pulse-quest {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.85;
    }
  }

  .animate-pulse-quest {
    animation: pulse-quest 2s ease-in-out infinite;
  }
`

/**
 * Leyenda de marcadores de quest
 */
export function QuestMarkerLegend({ className = '' }: { className?: string }) {
  const markers: Array<{ type: QuestMarkerType['type']; label: string }> = [
    { type: 'main', label: 'Quest Principal' },
    { type: 'side', label: 'Quest Secundaria' },
    { type: 'completable', label: 'Completable aquí' },
    { type: 'next', label: 'Siguiente paso' },
  ]

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {markers.map(({ type, label }) => (
        <div key={type} className="flex items-center gap-1.5">
          <QuestMarkerInline type={type} />
          <span className="text-xs text-parchment/70">{label}</span>
        </div>
      ))}
    </div>
  )
}
