'use client'

import { useState } from 'react'
import { EnginePanelProps, DiceRoll, PbtAMove } from '@/lib/engines/types'
import { pbtaMoves } from '@/lib/engines/pbta'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Dices, Swords, Eye, MessageCircle, HelpingHand, Sparkles, Target } from 'lucide-react'

interface PbtAPanelProps extends EnginePanelProps {
  // PbtA props
}

// Iconos para movimientos
const moveIcons: Record<string, React.ReactNode> = {
  act_under_pressure: <Target className="h-4 w-4" />,
  engage_in_combat: <Swords className="h-4 w-4" />,
  read_situation: <Eye className="h-4 w-4" />,
  manipulate: <MessageCircle className="h-4 w-4" />,
  help_or_hinder: <HelpingHand className="h-4 w-4" />,
  use_weird: <Sparkles className="h-4 w-4" />
}

// Colores para stats
const statColors: Record<string, string> = {
  strength: 'text-blood',
  cunning: 'text-neon-blue',
  heart: 'text-neon-purple',
  weird: 'text-emerald'
}

export function PbtAPanel({
  character,
  locale,
  onDiceRoll,
  disabled = false
}: PbtAPanelProps) {
  const isEnglish = locale === 'en'
  const [selectedMove, setSelectedMove] = useState<PbtAMove | null>(null)
  const [lastResult, setLastResult] = useState<{ total: number; interpretation: string } | null>(null)

  const labels = isEnglish ? {
    title: 'Powered by the Apocalypse',
    subtitle: 'Fiction-first RPG',
    stats: 'Stats',
    moves: 'Basic Moves',
    roll: 'Roll 2d6',
    selectMove: 'Select a move to roll',
    result: 'Result',
    success: 'Full Success!',
    partial: 'Partial Success',
    failure: 'Failure',
    tip: 'Click a move, then roll. 10+ = success, 7-9 = success with cost, 6- = the MC makes a move.'
  } : {
    title: 'Powered by the Apocalypse',
    subtitle: 'Rol narrativo',
    stats: 'Stats',
    moves: 'Movimientos Básicos',
    roll: 'Tirar 2d6',
    selectMove: 'Seleccioná un movimiento para tirar',
    result: 'Resultado',
    success: '¡Éxito Total!',
    partial: 'Éxito Parcial',
    failure: 'Fallo',
    tip: 'Clickeá un movimiento, después tirá. 10+ = éxito, 7-9 = éxito con costo, 6- = el MC hace un movimiento.'
  }

  // Stats del personaje (PbtA usa modificadores de -1 a +3 típicamente)
  const stats = character.stats || {}
  const strength = stats.strength ?? stats.Strength ?? stats.combat ?? 0
  const cunning = stats.cunning ?? stats.Cunning ?? stats.exploration ?? 0
  const heart = stats.heart ?? stats.Heart ?? stats.social ?? 0
  const weird = stats.weird ?? stats.Weird ?? 0

  const statValues: Record<string, number> = { strength, cunning, heart, weird }

  // Función para tirar 2d6 + stat
  const handleRoll = () => {
    if (!selectedMove) return

    const statValue = statValues[selectedMove.stat] || 0
    const die1 = Math.floor(Math.random() * 6) + 1
    const die2 = Math.floor(Math.random() * 6) + 1
    const total = die1 + die2 + statValue

    // Interpretar resultado
    let interpretation: string
    if (total >= 10) {
      interpretation = labels.success
    } else if (total >= 7) {
      interpretation = labels.partial
    } else {
      interpretation = labels.failure
    }

    setLastResult({ total, interpretation })

    const roll: DiceRoll = {
      formula: `2d6+${statValue}`,
      results: [die1, die2],
      total: die1 + die2,
      modifier: statValue,
      stat: selectedMove.stat
    }
    onDiceRoll(roll)
  }

  const formatStat = (value: number): string => {
    return value >= 0 ? `+${value}` : `${value}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-3 border-b border-gold-dim/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Dices className="h-5 w-5 text-gold" />
          <h3 className="font-heading text-lg text-gold">{labels.title}</h3>
        </div>
        <p className="font-ui text-xs text-parchment/60">{labels.subtitle}</p>
      </div>

      {/* Stats Display */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.stats}</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statValues).map(([stat, value]) => (
            <div key={stat} className="glass-panel rounded-lg p-2 text-center">
              <div className={`font-mono text-lg ${statColors[stat] || 'text-gold'}`}>
                {formatStat(value)}
              </div>
              <div className="font-ui text-xs text-parchment/60 capitalize">
                {isEnglish ? stat : {
                  strength: 'Fuerza',
                  cunning: 'Astucia',
                  heart: 'Corazón',
                  weird: 'Extraño'
                }[stat] || stat}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Moves List */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.moves}</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {pbtaMoves.map((move) => {
            const moveName = isEnglish ? move.name.en : move.name.es
            const moveDesc = isEnglish ? move.description.en : move.description.es
            const isSelected = selectedMove?.id === move.id

            return (
              <button
                key={move.id}
                onClick={() => setSelectedMove(move)}
                disabled={disabled}
                className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'glass-panel-dark ring-1 ring-gold'
                    : 'glass-panel hover:bg-gold/10'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={statColors[move.stat] || 'text-gold'}>
                    {moveIcons[move.id] || <Dices className="h-4 w-4" />}
                  </span>
                  <span className="font-heading text-sm text-parchment">{moveName}</span>
                  <span className={`text-xs font-mono ml-auto ${statColors[move.stat]}`}>
                    {formatStat(statValues[move.stat] || 0)}
                  </span>
                </div>
                {isSelected && (
                  <p className="font-body text-xs text-parchment/70 mt-1 pl-6">
                    {moveDesc}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Roll Button */}
      <div className="glass-panel-dark rounded-lg p-3 space-y-2">
        {selectedMove ? (
          <>
            <div className="text-center">
              <span className="font-ui text-xs text-parchment/60">
                {isEnglish ? selectedMove.name.en : selectedMove.name.es}
              </span>
              <span className={`ml-2 font-mono text-sm ${statColors[selectedMove.stat]}`}>
                (2d6{formatStat(statValues[selectedMove.stat] || 0)})
              </span>
            </div>
            <RunicButton
              variant="primary"
              onClick={handleRoll}
              disabled={disabled}
              className="w-full"
            >
              🎲 {labels.roll}
            </RunicButton>
          </>
        ) : (
          <p className="font-ui text-xs text-parchment/50 text-center py-2">
            {labels.selectMove}
          </p>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className={`text-center p-2 rounded-lg mt-2 ${
            lastResult.total >= 10 ? 'bg-emerald/20 border border-emerald/50' :
            lastResult.total >= 7 ? 'bg-gold/20 border border-gold/50' :
            'bg-blood/20 border border-blood/50'
          }`}>
            <div className="font-mono text-2xl text-parchment">{lastResult.total}</div>
            <div className={`font-ui text-xs ${
              lastResult.total >= 10 ? 'text-emerald' :
              lastResult.total >= 7 ? 'text-gold' :
              'text-blood'
            }`}>
              {lastResult.interpretation}
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-gold/10 rounded-lg p-3 border border-gold-dim/30">
        <p className="font-ui text-xs text-gold/80 italic">
          💡 {labels.tip}
        </p>
      </div>
    </div>
  )
}
