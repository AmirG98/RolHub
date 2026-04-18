'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Flame, Leaf, Eye, Sword, Moon, Shield, Heart, Zap, BedDouble } from 'lucide-react'
import type { AbilityRuntime, AbilityIcon } from '@/lib/types/ability'
import type { GameEngine } from '@/lib/types/lore'
import { canUseAbility, getAbilityStatus } from '@/lib/game/abilities'
import { getLocalized } from '@/lib/i18n/localize'
import { translations } from '@/lib/i18n/translations'

// ---------------------------------------------------------------------------
// Mapa de iconos
// ---------------------------------------------------------------------------

const ICON_COMPONENTS: Record<AbilityIcon, React.ReactNode> = {
  flame: <Flame className="w-3.5 h-3.5 text-blood" />,
  leaf: <Leaf className="w-3.5 h-3.5 text-emerald" />,
  eye: <Eye className="w-3.5 h-3.5 text-gold" />,
  sword: <Sword className="w-3.5 h-3.5 text-parchment/80" />,
  moon: <Moon className="w-3.5 h-3.5 text-gold-dim" />,
  sparkles: <Sparkles className="w-3.5 h-3.5 text-gold-bright" />,
  shield: <Shield className="w-3.5 h-3.5 text-stone" />,
  heart: <Heart className="w-3.5 h-3.5 text-blood" />,
  zap: <Zap className="w-3.5 h-3.5 text-gold-bright" />,
}

function getAbilityIcon(ab: AbilityRuntime): React.ReactNode {
  if (ab.icon && ICON_COMPONENTS[ab.icon]) return ICON_COMPONENTS[ab.icon]
  if (ab.kind === 'spell') return ICON_COMPONENTS.flame
  if (ab.kind === 'trick') return ICON_COMPONENTS.moon
  return ICON_COMPONENTS.sparkles
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AbilitiesPanelProps {
  abilities: AbilityRuntime[]
  engine: GameEngine
  locale: 'es' | 'en'
  onUseAbility: (ability: AbilityRuntime) => void
  onLongRest?: () => void
  className?: string
  inline?: boolean
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function AbilitiesPanel({
  abilities,
  engine,
  locale,
  onUseAbility,
  onLongRest,
  className = '',
  inline = false,
}: AbilitiesPanelProps) {
  const t = translations[locale].game
  const isDnD = engine === 'DND_5E'
  const prevAbilitiesRef = useRef<AbilityRuntime[]>([])
  const [justRecovered, setJustRecovered] = useState<Set<string>>(new Set())

  // Detectar abilities recién recuperadas (de cooldown > 0 a 0, o de usedToday > 0 a 0)
  useEffect(() => {
    const recovered = new Set<string>()
    for (const ab of abilities) {
      const prev = prevAbilitiesRef.current.find((p) => p.id === ab.id)
      if (!prev) continue
      const prevAvailable = canUseAbility(prev)
      const nowAvailable = canUseAbility(ab)
      if (!prevAvailable && nowAvailable) {
        recovered.add(ab.id)
      }
    }
    if (recovered.size > 0) {
      setJustRecovered(recovered)
      const timer = setTimeout(() => setJustRecovered(new Set()), 2500)
      prevAbilitiesRef.current = abilities.map((a) => ({ ...a }))
      return () => clearTimeout(timer)
    }
    prevAbilitiesRef.current = abilities.map((a) => ({ ...a }))
  }, [abilities])

  if (!Array.isArray(abilities) || abilities.length === 0) {
    return null
  }

  const anyExhausted = isDnD && abilities.some((ab) => !canUseAbility(ab))

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gold-dim/20">
        <Sparkles className="w-4 h-4 text-gold" />
        <span className="font-heading text-sm text-gold">
          {t.abilities}
        </span>
        <span className="text-[10px] text-parchment/50">({abilities.length})</span>
        {isDnD && anyExhausted && typeof onLongRest === 'function' && (
          <button
            type="button"
            onClick={onLongRest}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md border border-gold-dim/40 bg-shadow/60 hover:bg-gold/10 transition-colors"
            title={t.abilitiesRestConfirm}
          >
            <BedDouble className="w-3 h-3 text-gold-dim" />
            <span className="font-ui text-[10px] uppercase tracking-wide text-gold-dim">
              {t.abilitiesRest}
            </span>
          </button>
        )}
      </div>

      {/* Lista de abilities */}
      <div className="px-2 py-2 max-h-80 overflow-y-auto space-y-1.5">
        {abilities.map((ab) => {
          const available = canUseAbility(ab)
          const status = getAbilityStatus(ab)
          const recovered = justRecovered.has(ab.id)
          const name = getLocalized(ab.name, locale) || ab.id
          const desc = getLocalized(ab.description, locale) || ''

          return (
            <div
              key={ab.id}
              className={`rounded-md border px-2.5 py-2 transition-all duration-300 ${
                available
                  ? 'border-gold-dim/40 bg-shadow/40 hover:bg-gold/5'
                  : 'border-parchment/10 bg-shadow/20 opacity-60'
              } ${recovered ? 'ring-2 ring-emerald/60 animate-pulse' : ''}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">{getAbilityIcon(ab)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`font-heading text-xs ${available ? 'text-gold' : 'text-parchment/60'}`}>
                      {name}
                    </span>
                    {/* Tracker */}
                    {ab.resource === 'daily_uses' ? (
                      <span className="font-mono text-[10px] text-parchment/70 whitespace-nowrap">
                        {(ab.maxUses ?? 0) - ab.usedToday}/{ab.maxUses ?? 0} {t.abilitiesUses}
                      </span>
                    ) : (
                      <span
                        className={`font-mono text-[10px] whitespace-nowrap ${
                          status === 'cooldown' ? 'text-blood/80' : 'text-emerald'
                        }`}
                      >
                        {status === 'cooldown'
                          ? `${t.abilityCooldown}: ${ab.cooldownRemaining} ${t.abilityCooldownTurns}`
                          : t.abilityAvailable}
                      </span>
                    )}
                  </div>
                  <p className={`font-body text-[11px] leading-snug mt-0.5 ${available ? 'text-parchment/80' : 'text-parchment/40'}`}>
                    {desc}
                  </p>
                  {/* Acción */}
                  <div className="mt-1.5 flex items-center justify-between">
                    {/* Dots para daily_uses */}
                    {ab.resource === 'daily_uses' && typeof ab.maxUses === 'number' && ab.maxUses > 0 ? (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: ab.maxUses }).map((_, i) => (
                          <span
                            key={i}
                            className={`inline-block w-2 h-2 rounded-full ${
                              i < (ab.maxUses! - ab.usedToday) ? 'bg-gold' : 'bg-parchment/20'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => onUseAbility(ab)}
                      className={`px-2 py-0.5 rounded border font-ui text-[10px] uppercase tracking-wide transition-colors ${
                        available
                          ? 'border-gold/50 bg-gold/10 hover:bg-gold/20 text-gold cursor-pointer'
                          : 'border-parchment/10 bg-shadow/30 text-parchment/30 cursor-not-allowed'
                      }`}
                    >
                      {available
                        ? t.abilityUse
                        : ab.resource === 'daily_uses'
                          ? t.abilityExhausted
                          : t.abilityCooldown}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
