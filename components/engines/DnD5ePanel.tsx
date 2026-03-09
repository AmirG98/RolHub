'use client'

import { useState } from 'react'
import { EnginePanelProps, DiceRoll } from '@/lib/engines/types'
import { dnd5eAbilityScores, calculateModifier, formatModifier, getProficiencyBonus } from '@/lib/engines/dnd-5e'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Shield, Swords, Heart, Brain, Eye, Sparkles, ChevronUp, ChevronDown, Minus } from 'lucide-react'

interface DnD5ePanelProps extends EnginePanelProps {
  // D&D 5e props
}

// Iconos para atributos
const abilityIcons: Record<string, React.ReactNode> = {
  strength: <Swords className="h-4 w-4" />,
  dexterity: <Sparkles className="h-4 w-4" />,
  constitution: <Shield className="h-4 w-4" />,
  intelligence: <Brain className="h-4 w-4" />,
  wisdom: <Eye className="h-4 w-4" />,
  charisma: <Heart className="h-4 w-4" />
}

// Colores para atributos
const abilityColors: Record<string, string> = {
  strength: 'text-blood',
  dexterity: 'text-emerald',
  constitution: 'text-gold',
  intelligence: 'text-neon-blue',
  wisdom: 'text-neon-purple',
  charisma: 'text-neon-pink'
}

type RollMode = 'normal' | 'advantage' | 'disadvantage'

export function DnD5ePanel({
  character,
  locale,
  onDiceRoll,
  disabled = false
}: DnD5ePanelProps) {
  const isEnglish = locale === 'en'
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null)
  const [rollMode, setRollMode] = useState<RollMode>('normal')
  const [lastRoll, setLastRoll] = useState<{
    rolls: number[]
    result: number
    modifier: number
    total: number
    isCrit: boolean
    isFumble: boolean
  } | null>(null)

  const labels = isEnglish ? {
    title: 'D&D 5e Simplified',
    subtitle: 'Heroic fantasy',
    abilityScores: 'Ability Scores',
    rollMode: 'Roll Mode',
    normal: 'Normal',
    advantage: 'Advantage',
    disadvantage: 'Disadvantage',
    roll: 'Roll d20',
    selectAbility: 'Select an ability to roll',
    result: 'Result',
    criticalHit: 'Critical Hit!',
    fumble: 'Fumble!',
    proficiency: 'Proficiency',
    tip: 'Click an ability score, then roll d20 + modifier. Natural 20 = critical, Natural 1 = fumble.',
    hp: 'HP',
    level: 'Level'
  } : {
    title: 'D&D 5e Simplificado',
    subtitle: 'Fantasía heroica',
    abilityScores: 'Puntuaciones de Habilidad',
    rollMode: 'Modo de Tirada',
    normal: 'Normal',
    advantage: 'Ventaja',
    disadvantage: 'Desventaja',
    roll: 'Tirar d20',
    selectAbility: 'Seleccioná una habilidad para tirar',
    result: 'Resultado',
    criticalHit: '¡Golpe Crítico!',
    fumble: '¡Pifia!',
    proficiency: 'Competencia',
    tip: 'Clickeá una puntuación, después tirá d20 + modificador. 20 natural = crítico, 1 natural = pifia.',
    hp: 'PG',
    level: 'Nivel'
  }

  // Stats del personaje
  const stats = character.stats || {}

  // Mapear stats del personaje a los 6 atributos de D&D
  const getAbilityScore = (abilityId: string): number => {
    const directValue = stats[abilityId] ?? stats[abilityId.charAt(0).toUpperCase() + abilityId.slice(1)]
    if (directValue !== undefined) return directValue

    // Mapeo desde stats genéricos
    const mapping: Record<string, string[]> = {
      strength: ['combat', 'Combat', 'str', 'STR'],
      dexterity: ['exploration', 'Exploration', 'dex', 'DEX'],
      constitution: ['con', 'CON'],
      intelligence: ['int', 'INT'],
      wisdom: ['social', 'Social', 'wis', 'WIS'],
      charisma: ['cha', 'CHA']
    }

    for (const key of mapping[abilityId] || []) {
      if (stats[key] !== undefined) return stats[key]
    }

    return 10 // Default
  }

  const proficiencyBonus = getProficiencyBonus(character.level)

  // Función para tirar d20
  const handleRoll = () => {
    if (!selectedAbility) return

    const abilityScore = getAbilityScore(selectedAbility)
    const modifier = calculateModifier(abilityScore)

    let rolls: number[]
    let result: number

    if (rollMode === 'advantage') {
      const d1 = Math.floor(Math.random() * 20) + 1
      const d2 = Math.floor(Math.random() * 20) + 1
      rolls = [d1, d2]
      result = Math.max(d1, d2)
    } else if (rollMode === 'disadvantage') {
      const d1 = Math.floor(Math.random() * 20) + 1
      const d2 = Math.floor(Math.random() * 20) + 1
      rolls = [d1, d2]
      result = Math.min(d1, d2)
    } else {
      result = Math.floor(Math.random() * 20) + 1
      rolls = [result]
    }

    const total = result + modifier
    const isCrit = result === 20
    const isFumble = result === 1

    setLastRoll({
      rolls,
      result,
      modifier,
      total,
      isCrit,
      isFumble
    })

    const roll: DiceRoll = {
      formula: rollMode === 'normal' ? '1d20' : '2d20',
      results: rolls,
      total: result,
      modifier,
      stat: selectedAbility
    }
    onDiceRoll(roll)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-3 border-b border-gold-dim/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-gold" />
          <h3 className="font-heading text-lg text-gold">{labels.title}</h3>
        </div>
        <p className="font-ui text-xs text-parchment/60">{labels.subtitle}</p>
      </div>

      {/* Character Info */}
      <div className="flex justify-between items-center glass-panel rounded-lg p-2">
        <div className="text-center flex-1">
          <div className="font-mono text-lg text-blood">
            {character.hp ?? '?'}/{character.maxHp ?? '?'}
          </div>
          <div className="font-ui text-xs text-parchment/60">{labels.hp}</div>
        </div>
        <div className="h-8 w-px bg-gold-dim/30" />
        <div className="text-center flex-1">
          <div className="font-mono text-lg text-gold-bright">{character.level}</div>
          <div className="font-ui text-xs text-parchment/60">{labels.level}</div>
        </div>
        <div className="h-8 w-px bg-gold-dim/30" />
        <div className="text-center flex-1">
          <div className="font-mono text-lg text-emerald">+{proficiencyBonus}</div>
          <div className="font-ui text-xs text-parchment/60">{labels.proficiency}</div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.abilityScores}</h4>
        <div className="grid grid-cols-3 gap-2">
          {dnd5eAbilityScores.map((ability) => {
            const score = getAbilityScore(ability.id)
            const mod = calculateModifier(score)
            const isSelected = selectedAbility === ability.id
            const name = isEnglish ? ability.name.en : ability.name.es

            return (
              <button
                key={ability.id}
                onClick={() => setSelectedAbility(ability.id)}
                disabled={disabled}
                className={`glass-panel rounded-lg p-2 text-center transition-all ${
                  isSelected ? 'ring-1 ring-gold bg-gold/10' : ''
                } ${disabled ? 'opacity-50' : 'hover:bg-gold/5 cursor-pointer'}`}
              >
                <div className={`flex justify-center mb-1 ${abilityColors[ability.id]}`}>
                  {abilityIcons[ability.id]}
                </div>
                <div className="font-mono text-lg text-gold-bright">
                  {formatModifier(mod)}
                </div>
                <div className="font-ui text-[10px] text-parchment/60">{ability.abbr}</div>
                <div className="font-mono text-xs text-parchment/40">({score})</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Roll Mode */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.rollMode}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setRollMode('advantage')}
            disabled={disabled}
            className={`flex-1 p-2 rounded-lg glass-panel flex items-center justify-center gap-1 ${
              rollMode === 'advantage' ? 'ring-1 ring-emerald bg-emerald/20' : ''
            } ${disabled ? 'opacity-50' : 'hover:bg-gold/5'}`}
          >
            <ChevronUp className="h-4 w-4 text-emerald" />
            <span className="font-ui text-xs">{labels.advantage}</span>
          </button>
          <button
            onClick={() => setRollMode('normal')}
            disabled={disabled}
            className={`flex-1 p-2 rounded-lg glass-panel flex items-center justify-center gap-1 ${
              rollMode === 'normal' ? 'ring-1 ring-gold bg-gold/20' : ''
            } ${disabled ? 'opacity-50' : 'hover:bg-gold/5'}`}
          >
            <Minus className="h-4 w-4 text-gold" />
            <span className="font-ui text-xs">{labels.normal}</span>
          </button>
          <button
            onClick={() => setRollMode('disadvantage')}
            disabled={disabled}
            className={`flex-1 p-2 rounded-lg glass-panel flex items-center justify-center gap-1 ${
              rollMode === 'disadvantage' ? 'ring-1 ring-blood bg-blood/20' : ''
            } ${disabled ? 'opacity-50' : 'hover:bg-gold/5'}`}
          >
            <ChevronDown className="h-4 w-4 text-blood" />
            <span className="font-ui text-xs">{labels.disadvantage}</span>
          </button>
        </div>
      </div>

      {/* Roll Button & Result */}
      <div className="glass-panel-dark rounded-lg p-3 space-y-3">
        {selectedAbility ? (
          <>
            <div className="text-center">
              <span className="font-ui text-xs text-parchment/60">
                {isEnglish
                  ? dnd5eAbilityScores.find(a => a.id === selectedAbility)?.name.en
                  : dnd5eAbilityScores.find(a => a.id === selectedAbility)?.name.es
                }
              </span>
              <span className={`ml-2 font-mono text-sm ${abilityColors[selectedAbility]}`}>
                (d20{formatModifier(calculateModifier(getAbilityScore(selectedAbility)))})
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
            {labels.selectAbility}
          </p>
        )}

        {/* Result Display */}
        {lastRoll && (
          <div className={`text-center p-3 rounded-lg ${
            lastRoll.isCrit ? 'bg-emerald/20 border border-emerald/50' :
            lastRoll.isFumble ? 'bg-blood/20 border border-blood/50' :
            'bg-gold/10 border border-gold/30'
          }`}>
            {/* Dice rolled */}
            <div className="flex justify-center gap-2 mb-2">
              {lastRoll.rolls.map((r, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xl ${
                    r === lastRoll.result
                      ? r === 20 ? 'bg-emerald text-white' :
                        r === 1 ? 'bg-blood text-white' :
                        'bg-gold text-shadow'
                      : 'bg-shadow/50 text-parchment/50'
                  }`}
                >
                  {r}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="font-mono text-3xl text-parchment">
              {lastRoll.total}
            </div>
            <div className="font-ui text-xs text-parchment/60">
              {lastRoll.result} {formatModifier(lastRoll.modifier)}
            </div>

            {/* Special results */}
            {lastRoll.isCrit && (
              <div className="mt-2 font-heading text-emerald text-sm animate-pulse">
                {labels.criticalHit}
              </div>
            )}
            {lastRoll.isFumble && (
              <div className="mt-2 font-heading text-blood text-sm">
                {labels.fumble}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-gold/10 rounded-lg p-3 border border-gold-dim/30">
        <p className="font-ui text-xs text-gold/80 italic">
          ⚔️ {labels.tip}
        </p>
      </div>
    </div>
  )
}
