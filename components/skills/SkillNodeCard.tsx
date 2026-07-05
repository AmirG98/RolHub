'use client'

import { Sparkles, Flame, Leaf, Eye, Sword, Moon, Shield, Heart, Zap, Lock, Check } from 'lucide-react'
import type { AbilityIcon } from '@/lib/types/ability'
import type { NodeStatus } from '@/lib/types/skill-tree'
import { getLocalized } from '@/lib/i18n/localize'

const ICONS: Record<AbilityIcon, React.ReactNode> = {
  flame: <Flame className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
  sword: <Sword className="w-5 h-5" />,
  moon: <Moon className="w-5 h-5" />,
  sparkles: <Sparkles className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
}

// Hint legible de la condición de desbloqueo aún no cumplida
function conditionHint(
  unlock: { type: string; count?: number; value?: string },
  locale: 'es' | 'en'
): string {
  const n = unlock.count ?? 1
  const es: Record<string, string> = {
    combats_won: `Ganá ${n} combate${n > 1 ? 's' : ''}`,
    quests_completed: `Completá ${n} misión${n > 1 ? 'es' : ''}`,
    act_reached: `Llegá al acto ${n}`,
    level_reached: `Alcanzá el nivel ${n}`,
    npc_bond: `Forjá ${n} vínculo${n > 1 ? 's' : ''} con NPCs`,
    deaths_survived: `Sobreviví a la muerte ${n} vez${n > 1 ? 'es' : ''}`,
    abilities_used: `Usá habilidades ${n} vez${n > 1 ? 'es' : ''}`,
    turns_played: `Jugá ${n} turnos`,
    narrative_anchor: `Alcanzá un hito de la historia`,
  }
  const en: Record<string, string> = {
    combats_won: `Win ${n} combat${n > 1 ? 's' : ''}`,
    quests_completed: `Complete ${n} quest${n > 1 ? 's' : ''}`,
    act_reached: `Reach act ${n}`,
    level_reached: `Reach level ${n}`,
    npc_bond: `Forge ${n} NPC bond${n > 1 ? 's' : ''}`,
    deaths_survived: `Survive death ${n} time${n > 1 ? 's' : ''}`,
    abilities_used: `Use abilities ${n} time${n > 1 ? 's' : ''}`,
    turns_played: `Play ${n} turns`,
    narrative_anchor: `Reach a story milestone`,
  }
  return (locale === 'en' ? en : es)[unlock.type] || ''
}

export interface SkillNodeCardData {
  id: string
  name: unknown
  description: unknown
  kind: string
  icon?: AbilityIcon
  tier: number
  resource: string
  maxUses?: number
  cooldownTurns?: number
  unlock: { type: string; count?: number; value?: string }
  status: NodeStatus
  conditionMet: boolean
  missingRequires: string[]
}

interface Props {
  node: SkillNodeCardData
  locale: 'es' | 'en'
  learning: boolean
  onLearn: (nodeId: string) => void
  teaser?: boolean
}

export function SkillNodeCard({ node, locale, learning, onLearn, teaser = false }: Props) {
  const icon = (node.icon && ICONS[node.icon]) || <Sparkles className="w-5 h-5" />
  const name = getLocalized(node.name as any, locale)
  const description = getLocalized(node.description as any, locale)

  const isLearned = node.status === 'learned'
  const isUnlockable = node.status === 'unlockable' && !teaser

  const stateStyles = isLearned
    ? 'border-emerald/60 bg-emerald/10'
    : isUnlockable
      ? 'border-gold-bright/70 bg-gold/10 glow-effect'
      : 'border-gold-dim/20 bg-shadow/40'

  const iconColor = isLearned
    ? 'text-emerald'
    : isUnlockable
      ? 'text-gold-bright'
      : 'text-parchment/30'

  return (
    <div
      className={`relative w-44 rounded-lg border p-3 transition-all ${stateStyles} ${
        teaser && !isLearned ? 'blur-[2px] select-none' : ''
      }`}
      data-node-id={node.id}
      data-status={node.status}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={iconColor}>{icon}</span>
        <span className={`font-heading text-sm flex-1 min-w-0 truncate ${isLearned ? 'text-emerald' : isUnlockable ? 'text-gold-bright' : 'text-parchment/60'}`}>
          {name}
        </span>
        {isLearned && <Check className="w-4 h-4 text-emerald shrink-0" />}
        {node.status === 'locked' && <Lock className="w-3.5 h-3.5 text-parchment/30 shrink-0" />}
      </div>

      <p className="font-body text-[11px] text-parchment/60 leading-snug line-clamp-3 mb-2">
        {description}
      </p>

      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] text-parchment/40 font-mono">
          {node.resource === 'daily_uses'
            ? `${node.maxUses}× ${locale === 'en' ? 'daily' : 'diario'}`
            : `CD ${node.cooldownTurns}`}
        </span>

        {isUnlockable && (
          <button
            onClick={() => onLearn(node.id)}
            disabled={learning}
            className="text-[10px] font-heading uppercase tracking-wide px-2 py-1 rounded bg-gold text-shadow hover:bg-gold-bright disabled:opacity-50 transition"
          >
            {learning ? '…' : locale === 'en' ? 'Learn' : 'Aprender'}
          </button>
        )}

        {node.status === 'locked' && !node.conditionMet && (
          <span className="text-[9px] text-parchment/40 text-right leading-tight">
            {conditionHint(node.unlock, locale)}
          </span>
        )}
        {node.status === 'locked' && node.conditionMet && node.missingRequires.length > 0 && (
          <span className="text-[9px] text-gold-dim text-right leading-tight">
            {locale === 'en' ? 'Needs prior skill' : 'Requiere previa'}
          </span>
        )}
      </div>
    </div>
  )
}
