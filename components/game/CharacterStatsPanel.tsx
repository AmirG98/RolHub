'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Heart, Sword, Map, MessageSquare, BookOpen, Shield, Zap, Brain, Eye, Smile } from 'lucide-react'
import { type GameEngine } from '@/lib/types/lore'

interface CharacterStats {
  // Common stats
  hp?: number
  maxHp?: number
  level?: number
  experience?: number

  // Story Mode stats
  combat?: number
  exploration?: number
  social?: number
  knowledge?: number

  // D&D 5e stats
  ac?: number
  STR?: number
  DEX?: number
  CON?: number
  INT?: number
  WIS?: number
  CHA?: number
  proficiencyBonus?: number
  speed?: number
  className?: string
  raceName?: string
}

interface CharacterStatsPanelProps {
  name: string
  archetype: string
  avatarUrl?: string
  engine: GameEngine
  stats: CharacterStats
  conditions?: string[]
  className?: string
}

// Calcula el modificador de D&D (10-11 = +0)
function getModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// Barra de HP visual
function HPBar({ current, max, className }: { current: number, max: number, className?: string }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  const isLow = percentage <= 25
  const isMedium = percentage > 25 && percentage <= 50

  return (
    <div className={cn("relative h-3 bg-shadow-mid rounded-full overflow-hidden border border-gold-dim/30", className)}>
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-300",
          isLow ? "bg-blood" : isMedium ? "bg-yellow-600" : "bg-emerald"
        )}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-ui text-parchment font-semibold drop-shadow-md">
          {current}/{max}
        </span>
      </div>
    </div>
  )
}

// Stats para Story Mode
function StoryModeStats({ stats, conditions }: { stats: CharacterStats, conditions?: string[] }) {
  const statItems = [
    { label: 'Combate', value: stats.combat || 0, icon: Sword, color: 'text-blood' },
    { label: 'Explorar', value: stats.exploration || 0, icon: Map, color: 'text-emerald' },
    { label: 'Social', value: stats.social || 0, icon: MessageSquare, color: 'text-gold' },
    { label: 'Saber', value: stats.knowledge || 0, icon: BookOpen, color: 'text-blue-400' },
  ]

  return (
    <div className="space-y-3">
      {/* HP Bar */}
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-blood flex-shrink-0" />
        <HPBar current={stats.hp || 0} max={stats.maxHp || 20} className="flex-1" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {statItems.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={cn("flex items-center justify-center mb-1", stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-lg font-heading text-parchment">{stat.value}</div>
            <div className="text-[10px] font-ui text-parchment/60">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Conditions */}
      {conditions && conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="px-2 py-0.5 text-[10px] font-ui bg-blood/30 text-blood rounded-full border border-blood/50"
            >
              {condition}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Stats para D&D 5e
function DnD5eStats({ stats, conditions }: { stats: CharacterStats, conditions?: string[] }) {
  const abilityScores = [
    { label: 'FUE', value: stats.STR || 10, icon: Sword },
    { label: 'DES', value: stats.DEX || 10, icon: Zap },
    { label: 'CON', value: stats.CON || 10, icon: Shield },
    { label: 'INT', value: stats.INT || 10, icon: Brain },
    { label: 'SAB', value: stats.WIS || 10, icon: Eye },
    { label: 'CAR', value: stats.CHA || 10, icon: Smile },
  ]

  return (
    <div className="space-y-3">
      {/* HP and AC Row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Heart className="w-4 h-4 text-blood flex-shrink-0" />
          <HPBar current={stats.hp || 0} max={stats.maxHp || 10} className="flex-1" />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-shadow-mid rounded border border-gold-dim/30">
          <Shield className="w-3 h-3 text-gold" />
          <span className="text-sm font-heading text-parchment">{stats.ac || 10}</span>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="grid grid-cols-6 gap-1">
        {abilityScores.map((ability) => (
          <div key={ability.label} className="text-center bg-shadow-mid/50 rounded p-1">
            <div className="text-[10px] font-ui text-gold-dim">{ability.label}</div>
            <div className="text-sm font-heading text-parchment">{ability.value}</div>
            <div className="text-[10px] font-ui text-emerald">
              {getModifier(ability.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Extra Info Row */}
      <div className="flex items-center justify-between text-xs font-ui text-parchment/70">
        <span>Competencia: +{stats.proficiencyBonus || 2}</span>
        <span>Velocidad: {stats.speed || 30} ft</span>
      </div>

      {/* Conditions */}
      {conditions && conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="px-2 py-0.5 text-[10px] font-ui bg-blood/30 text-blood rounded-full border border-blood/50"
            >
              {condition}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function CharacterStatsPanel({
  name,
  archetype,
  avatarUrl,
  engine,
  stats,
  conditions,
  className,
}: CharacterStatsPanelProps) {
  const isDnD5e = engine === 'DND_5E'

  return (
    <div
      className={cn(
        "glass-panel-dark rounded-lg p-3 border border-gold-dim/30",
        className
      )}
    >
      {/* Header with Avatar */}
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gold-dim/20">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold flex-shrink-0 bg-shadow-mid">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold text-xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name and Archetype */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base text-parchment truncate">{name}</h3>
          <p className="text-xs text-gold-dim truncate">
            {isDnD5e && stats.raceName && stats.className
              ? `${stats.raceName} ${stats.className}`
              : archetype}
            {' '}
            <span className="text-parchment/50">Nivel {stats.level || 1}</span>
          </p>
        </div>
      </div>

      {/* Stats based on engine */}
      {isDnD5e ? (
        <DnD5eStats stats={stats} conditions={conditions} />
      ) : (
        <StoryModeStats stats={stats} conditions={conditions} />
      )}
    </div>
  )
}

// Version compacta para mobile o sidebar
export function CharacterStatsMini({
  name,
  avatarUrl,
  hp,
  maxHp,
  level,
  className,
}: {
  name: string
  avatarUrl?: string
  hp: number
  maxHp: number
  level: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 bg-shadow-mid/50 rounded-lg border border-gold-dim/20",
        className
      )}
    >
      {/* Mini Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden border border-gold flex-shrink-0 bg-shadow">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-heading text-parchment truncate">{name}</span>
          <span className="text-[10px] text-gold-dim">Nv.{level}</span>
        </div>
        <HPBar current={hp} max={maxHp} className="h-2" />
      </div>
    </div>
  )
}
