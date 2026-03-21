'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Heart, Shield, Scroll } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateModifier, formatModifier } from '@/lib/engines/dnd-5e'

type AbilityId = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

interface StatsBarSummaryProps {
  name: string
  archetype: string
  avatarUrl?: string
  level: number
  hp: number
  maxHp: number
  ac?: number
  proficiencyBonus?: number
  abilities?: {
    STR: number
    DEX: number
    CON: number
    INT: number
    WIS: number
    CHA: number
  }
  isExpanded: boolean
  onToggleExpand: () => void
  isDnD5e: boolean
  className?: string
}

function HPBarMini({ current, max }: { current: number; max: number }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  const isLow = percentage <= 25
  const isMedium = percentage > 25 && percentage <= 50

  return (
    <div className="relative h-3 w-20 sm:w-28 bg-shadow rounded-full overflow-hidden border border-gold-dim/30">
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-500",
          isLow ? "bg-red-500" : isMedium ? "bg-yellow-500" : "bg-emerald-500"
        )}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-ui text-white font-bold drop-shadow-md">
          {current}/{max}
        </span>
      </div>
    </div>
  )
}

export function StatsBarSummary({
  name,
  archetype,
  avatarUrl,
  level,
  hp,
  maxHp,
  ac = 10,
  proficiencyBonus = 2,
  abilities,
  isExpanded,
  onToggleExpand,
  isDnD5e,
  className,
}: StatsBarSummaryProps) {
  return (
    <div
      className={cn(
        "bg-shadow-mid/80 border border-gold-dim/40 rounded-lg overflow-hidden",
        "transition-all duration-300",
        className
      )}
    >
      {/* Main Content Row */}
      <div className="flex items-center gap-3 p-3">
        {/* Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-gold flex-shrink-0 bg-shadow shadow-lg shadow-gold/20">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold text-xl font-heading bg-gradient-to-br from-shadow to-shadow-mid">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          {/* Name & Archetype */}
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-lg text-gold-bright truncate">{name}</h3>
            <span className="text-xs text-gold-dim font-ui">Nv.{level}</span>
          </div>
          <p className="text-xs text-parchment/60 truncate">{archetype}</p>

          {/* HP Row */}
          <div className="flex items-center gap-2 mt-1">
            <Heart className="w-3 h-3 text-red-400 flex-shrink-0" />
            <HPBarMini current={hp} max={maxHp} />

            {isDnD5e && (
              <>
                <div className="flex items-center gap-1 ml-2">
                  <Shield className="w-3 h-3 text-gold" />
                  <span className="text-sm font-heading text-parchment">{ac}</span>
                </div>
                <span className="text-xs text-parchment/50 hidden sm:inline">
                  Prof +{proficiencyBonus}
                </span>
              </>
            )}
          </div>
        </div>

        {/* D&D 5e Abilities Mini Grid */}
        {isDnD5e && abilities && (
          <div className="hidden md:grid grid-cols-6 gap-1">
            {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityId[]).map((ability) => {
              const score = abilities[ability]
              const mod = calculateModifier(score)
              return (
                <div key={ability} className="text-center">
                  <span className="text-[10px] font-ui text-gold-dim block">{ability}</span>
                  <span className="text-sm font-heading text-parchment block">{score}</span>
                  <span className={cn(
                    "text-[10px] font-mono",
                    mod >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {formatModifier(mod)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={onToggleExpand}
          className={cn(
            "flex items-center gap-1 px-3 py-2 rounded-lg",
            "bg-gold/10 hover:bg-gold/20 border border-gold-dim/30",
            "text-gold text-sm font-ui transition-all",
            "focus:outline-none focus:ring-2 focus:ring-gold/30"
          )}
        >
          <Scroll className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isExpanded ? 'Ocultar' : 'Ver Hoja'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Abilities (shown when collapsed on mobile) */}
      {isDnD5e && abilities && !isExpanded && (
        <div className="md:hidden px-3 pb-3">
          <div className="grid grid-cols-6 gap-1 bg-shadow/30 rounded-lg p-2 border border-gold-dim/20">
            {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityId[]).map((ability) => {
              const score = abilities[ability]
              const mod = calculateModifier(score)
              return (
                <div key={ability} className="text-center">
                  <span className="text-[9px] font-ui text-gold-dim block">{ability}</span>
                  <span className="text-xs font-heading text-parchment block">{score}</span>
                  <span className={cn(
                    "text-[9px] font-mono",
                    mod >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {formatModifier(mod)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Version for Story Mode (simpler stats)
interface StoryModeStatsBarProps {
  name: string
  archetype: string
  avatarUrl?: string
  level: number
  hp: number
  maxHp: number
  combat?: number
  exploration?: number
  social?: number
  knowledge?: number
  isExpanded: boolean
  onToggleExpand: () => void
  className?: string
}

export function StoryModeStatsBar({
  name,
  archetype,
  avatarUrl,
  level,
  hp,
  maxHp,
  combat = 0,
  exploration = 0,
  social = 0,
  knowledge = 0,
  isExpanded,
  onToggleExpand,
  className,
}: StoryModeStatsBarProps) {
  const stats = [
    { label: 'COM', value: combat, color: 'text-red-400' },
    { label: 'EXP', value: exploration, color: 'text-emerald-400' },
    { label: 'SOC', value: social, color: 'text-gold' },
    { label: 'SAB', value: knowledge, color: 'text-blue-400' },
  ]

  return (
    <div
      className={cn(
        "bg-shadow-mid/80 border border-gold-dim/40 rounded-lg overflow-hidden",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-gold flex-shrink-0 bg-shadow shadow-lg shadow-gold/20">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold text-xl font-heading bg-gradient-to-br from-shadow to-shadow-mid">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-lg text-gold-bright truncate">{name}</h3>
            <span className="text-xs text-gold-dim font-ui">Nv.{level}</span>
          </div>
          <p className="text-xs text-parchment/60 truncate">{archetype}</p>

          {/* HP Row */}
          <div className="flex items-center gap-2 mt-1">
            <Heart className="w-3 h-3 text-red-400 flex-shrink-0" />
            <HPBarMini current={hp} max={maxHp} />
          </div>
        </div>

        {/* Stats Mini */}
        <div className="hidden sm:grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-[10px] font-ui text-gold-dim block">{stat.label}</span>
              <span className={cn("text-lg font-heading", stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggleExpand}
          className={cn(
            "flex items-center gap-1 px-3 py-2 rounded-lg",
            "bg-gold/10 hover:bg-gold/20 border border-gold-dim/30",
            "text-gold text-sm font-ui transition-all",
            "focus:outline-none focus:ring-2 focus:ring-gold/30"
          )}
        >
          <Scroll className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isExpanded ? 'Ocultar' : 'Ver Stats'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Stats (when collapsed) */}
      {!isExpanded && (
        <div className="sm:hidden px-3 pb-3">
          <div className="grid grid-cols-4 gap-2 bg-shadow/30 rounded-lg p-2 border border-gold-dim/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-[9px] font-ui text-gold-dim block">{stat.label}</span>
                <span className={cn("text-base font-heading", stat.color)}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
