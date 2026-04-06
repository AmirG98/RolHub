'use client'

import { useState } from 'react'
import { Star, Heart, Swords, Compass, MessageCircle, BookOpen, Shield } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface LevelUpModalProps {
  newLevel: number
  hpIncrease: number
  statOptions: string[]
  statBonus: number
  characterName: string
  campaignId: string
  onComplete: (chosenStat: string, statBonus: number) => void
  locale?: 'es' | 'en'
}

const STAT_CONFIG: Record<string, { icon: typeof Star; color: string; label: { es: string; en: string } }> = {
  combat:      { icon: Swords,      color: 'text-red-400 border-red-400/50',     label: { es: 'Combate', en: 'Combat' } },
  exploration: { icon: Compass,     color: 'text-emerald-400 border-emerald-400/50', label: { es: 'Exploración', en: 'Exploration' } },
  social:      { icon: MessageCircle, color: 'text-gold border-gold/50',          label: { es: 'Social', en: 'Social' } },
  lore:        { icon: BookOpen,    color: 'text-neon-blue border-neon-blue/50',  label: { es: 'Saber', en: 'Lore' } },
  STR:         { icon: Swords,      color: 'text-red-400 border-red-400/50',     label: { es: 'Fuerza', en: 'Strength' } },
  DEX:         { icon: Compass,     color: 'text-emerald-400 border-emerald-400/50', label: { es: 'Destreza', en: 'Dexterity' } },
  CON:         { icon: Shield,      color: 'text-gold border-gold/50',           label: { es: 'Constitución', en: 'Constitution' } },
  INT:         { icon: BookOpen,    color: 'text-neon-blue border-neon-blue/50',  label: { es: 'Inteligencia', en: 'Intelligence' } },
  WIS:         { icon: Star,        color: 'text-neon-purple border-neon-purple/50', label: { es: 'Sabiduría', en: 'Wisdom' } },
  CHA:         { icon: MessageCircle, color: 'text-gold-bright border-gold-bright/50', label: { es: 'Carisma', en: 'Charisma' } },
}

export function LevelUpModal({
  newLevel,
  hpIncrease,
  statOptions,
  statBonus,
  characterName,
  campaignId,
  onComplete,
  locale = 'es',
}: LevelUpModalProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const t = useTranslations()
  const isEN = locale === 'en'

  const handleConfirm = async () => {
    if (!selectedStat) return
    setIsApplying(true)

    try {
      const res = await fetch('/api/character/level-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, characterName, chosenStat: selectedStat }),
      })

      if (res.ok) {
        onComplete(selectedStat, statBonus)
      }
    } catch (err) {
      console.error('Level-up error:', err)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shadow/80">
      <div className="glass-panel-dark rounded-lg border border-gold/50 p-6 max-w-md w-full mx-4 shadow-[0_0_60px_rgba(201,168,76,0.3)]">
        {/* Header */}
        <div className="text-center mb-6">
          <Star className="w-10 h-10 text-gold-bright mx-auto mb-2 animate-pulse" />
          <h2 className="font-title text-2xl text-gold-bright">
            {isEN ? 'Level Up!' : '¡Subiste de Nivel!'}
          </h2>
          <p className="font-heading text-lg text-gold mt-1">
            {isEN ? `Level ${newLevel}` : `Nivel ${newLevel}`}
          </p>
        </div>

        {/* HP increase (automatic) */}
        <div className="flex items-center justify-center gap-2 mb-5 p-2 rounded bg-emerald/10 border border-emerald/30">
          <Heart className="w-4 h-4 text-emerald" />
          <span className="font-ui text-sm text-emerald">
            +{hpIncrease} HP {isEN ? '(automatic)' : '(automático)'}
          </span>
        </div>

        {/* Stat choice */}
        <p className="font-body text-sm text-parchment/70 text-center mb-3">
          {isEN
            ? `Choose a stat to increase by +${statBonus}:`
            : `Elegí un stat para aumentar en +${statBonus}:`}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-5">
          {statOptions.map(stat => {
            const config = STAT_CONFIG[stat] || { icon: Star, color: 'text-parchment border-parchment/50', label: { es: stat, en: stat } }
            const Icon = config.icon
            const isSelected = selectedStat === stat

            return (
              <button
                key={stat}
                onClick={() => setSelectedStat(stat)}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border transition-all
                  ${isSelected
                    ? `${config.color} bg-gold/10 shadow-[0_0_15px_rgba(201,168,76,0.2)]`
                    : 'border-gold-dim/20 text-parchment/60 hover:border-gold-dim/40 hover:text-parchment/80'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-heading text-sm">
                  {isEN ? config.label.en : config.label.es}
                </span>
                {isSelected && (
                  <span className="ml-auto font-mono text-xs text-gold-bright">+{statBonus}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!selectedStat || isApplying}
          className="w-full py-3 rounded-lg font-heading text-sm text-shadow bg-gold hover:bg-gold-bright transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isApplying
            ? (isEN ? 'Applying...' : 'Aplicando...')
            : (isEN ? 'Confirm' : 'Confirmar')}
        </button>
      </div>
    </div>
  )
}
