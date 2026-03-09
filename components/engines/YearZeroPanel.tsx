'use client'

import { useState } from 'react'
import { EnginePanelProps, DiceRoll } from '@/lib/engines/types'
import { yearZeroResources } from '@/lib/engines/year-zero'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Skull, Dices, AlertTriangle, RefreshCw } from 'lucide-react'

interface YearZeroPanelProps extends EnginePanelProps {
  resources?: Record<string, number>
}

export function YearZeroPanel({
  character,
  locale,
  onDiceRoll,
  disabled = false,
  resources: externalResources
}: YearZeroPanelProps) {
  const isEnglish = locale === 'en'
  const [dicePool, setDicePool] = useState(3)
  const [lastRoll, setLastRoll] = useState<{
    results: number[]
    successes: number
    canPush: boolean
  } | null>(null)
  const [resources, setResources] = useState<Record<string, number>>(
    externalResources || yearZeroResources.reduce((acc, r) => ({ ...acc, [r.id]: 0 }), {})
  )

  const labels = isEnglish ? {
    title: 'Year Zero Engine',
    subtitle: 'Survival horror',
    stats: 'Attributes',
    resources: 'Resources',
    dicePool: 'Dice Pool',
    roll: 'Roll',
    push: 'Push the Roll',
    pushWarning: 'Each 1 rolled increases a resource!',
    successes: 'Successes',
    noSuccesses: 'No successes',
    canPush: 'You can push!',
    critical: 'Critical!',
    tip: 'Roll d6s equal to your attribute. 6s are successes. No 6s? You can push, but suffer for each 1.',
    strength: 'Strength',
    agility: 'Agility',
    wits: 'Wits',
    empathy: 'Empathy'
  } : {
    title: 'Year Zero Engine',
    subtitle: 'Terror y supervivencia',
    stats: 'Atributos',
    resources: 'Recursos',
    dicePool: 'Pool de Dados',
    roll: 'Tirar',
    push: 'Empujar Tirada',
    pushWarning: '¡Cada 1 que salga sube un recurso!',
    successes: 'Éxitos',
    noSuccesses: 'Sin éxitos',
    canPush: '¡Podés empujar!',
    critical: '¡Crítico!',
    tip: 'Tirá d6s igual a tu atributo. Los 6s son éxitos. ¿Sin 6s? Podés empujar, pero sufrís por cada 1.',
    strength: 'Fuerza',
    agility: 'Agilidad',
    wits: 'Ingenio',
    empathy: 'Empatía'
  }

  // Stats del personaje
  const stats = character.stats || {}
  const strength = stats.strength ?? stats.Strength ?? stats.combat ?? 3
  const agility = stats.agility ?? stats.Agility ?? stats.exploration ?? 3
  const wits = stats.wits ?? stats.Wits ?? stats.social ?? 3
  const empathy = stats.empathy ?? stats.Empathy ?? 2

  const statValues = [
    { key: 'strength', value: strength, label: labels.strength },
    { key: 'agility', value: agility, label: labels.agility },
    { key: 'wits', value: wits, label: labels.wits },
    { key: 'empathy', value: empathy, label: labels.empathy }
  ]

  // Función para tirar dados
  const handleRoll = (isPush = false) => {
    const dicesToRoll = isPush && lastRoll
      ? lastRoll.results.filter(r => r !== 6).length
      : dicePool

    const results: number[] = []
    for (let i = 0; i < dicesToRoll; i++) {
      results.push(Math.floor(Math.random() * 6) + 1)
    }

    // Si es push, mantener los 6s anteriores
    const allResults = isPush && lastRoll
      ? [...lastRoll.results.filter(r => r === 6), ...results]
      : results

    const successes = allResults.filter(r => r === 6).length
    const ones = results.filter(r => r === 1).length

    // Si es push, aplicar daño de recursos
    if (isPush && ones > 0) {
      const newResources = { ...resources }
      // Por defecto, los 1s aumentan estrés
      newResources.stress = Math.min(6, (newResources.stress || 0) + ones)
      setResources(newResources)
    }

    setLastRoll({
      results: allResults,
      successes,
      canPush: successes === 0 && !isPush
    })

    const roll: DiceRoll = {
      formula: `${dicePool}d6`,
      results: allResults,
      total: successes
    }
    onDiceRoll(roll)
  }

  // Función para seleccionar atributo como pool
  const selectStat = (value: number) => {
    setDicePool(value)
    setLastRoll(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-3 border-b border-gold-dim/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Skull className="h-5 w-5 text-blood" />
          <h3 className="font-heading text-lg text-gold">{labels.title}</h3>
        </div>
        <p className="font-ui text-xs text-parchment/60">{labels.subtitle}</p>
      </div>

      {/* Stats - clickeables para seleccionar pool */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.stats}</h4>
        <div className="grid grid-cols-2 gap-2">
          {statValues.map(({ key, value, label }) => (
            <button
              key={key}
              onClick={() => selectStat(value)}
              disabled={disabled}
              className={`glass-panel rounded-lg p-2 text-center transition-all ${
                dicePool === value ? 'ring-1 ring-gold bg-gold/10' : ''
              } ${disabled ? 'opacity-50' : 'hover:bg-gold/5 cursor-pointer'}`}
            >
              <div className="font-mono text-xl text-gold-bright">{value}</div>
              <div className="font-ui text-xs text-parchment/60">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-2">
        <h4 className="font-heading text-sm text-gold">{labels.resources}</h4>
        <div className="grid grid-cols-3 gap-2">
          {yearZeroResources.slice(0, 6).map((resource) => {
            const value = resources[resource.id] || 0
            const name = isEnglish ? resource.name.en : resource.name.es
            const isCritical = value >= 6

            return (
              <div
                key={resource.id}
                className={`glass-panel rounded-lg p-2 text-center ${
                  isCritical ? 'ring-1 ring-blood bg-blood/20' : ''
                }`}
              >
                <div className="text-lg">{resource.icon}</div>
                <div className="flex justify-center gap-0.5 my-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < value ? 'bg-blood' : 'bg-shadow'
                      }`}
                    />
                  ))}
                </div>
                <div className="font-ui text-[10px] text-parchment/60">{name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dice Pool Selector */}
      <div className="glass-panel-dark rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm text-gold">{labels.dicePool}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDicePool(Math.max(1, dicePool - 1))}
              disabled={disabled || dicePool <= 1}
              className="w-6 h-6 rounded bg-shadow text-parchment disabled:opacity-30"
            >
              -
            </button>
            <span className="font-mono text-xl text-gold-bright w-8 text-center">{dicePool}</span>
            <button
              onClick={() => setDicePool(Math.min(10, dicePool + 1))}
              disabled={disabled || dicePool >= 10}
              className="w-6 h-6 rounded bg-shadow text-parchment disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        {/* Dice Display */}
        <div className="flex justify-center gap-1 flex-wrap min-h-[40px] items-center">
          {lastRoll ? (
            lastRoll.results.map((result, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded flex items-center justify-center font-mono text-lg ${
                  result === 6 ? 'bg-emerald text-white' :
                  result === 1 ? 'bg-blood text-white' :
                  'bg-shadow text-parchment'
                }`}
              >
                {result}
              </div>
            ))
          ) : (
            [...Array(dicePool)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded bg-shadow/50 border border-gold-dim/30 flex items-center justify-center"
              >
                <Dices className="h-4 w-4 text-gold-dim" />
              </div>
            ))
          )}
        </div>

        {/* Result Display */}
        {lastRoll && (
          <div className={`text-center p-2 rounded-lg ${
            lastRoll.successes >= 3 ? 'bg-emerald/20 border border-emerald/50' :
            lastRoll.successes >= 1 ? 'bg-gold/20 border border-gold/50' :
            'bg-blood/20 border border-blood/50'
          }`}>
            <div className="font-mono text-xl">
              {lastRoll.successes >= 3 ? labels.critical :
               lastRoll.successes > 0 ? `${lastRoll.successes} ${labels.successes}` :
               labels.noSuccesses}
            </div>
            {lastRoll.canPush && (
              <div className="text-xs text-gold mt-1">{labels.canPush}</div>
            )}
          </div>
        )}

        {/* Roll / Push Buttons */}
        <div className="space-y-2">
          <RunicButton
            variant="primary"
            onClick={() => handleRoll(false)}
            disabled={disabled}
            className="w-full"
          >
            🎲 {labels.roll} {dicePool}d6
          </RunicButton>

          {lastRoll?.canPush && (
            <div className="space-y-1">
              <RunicButton
                variant="danger"
                onClick={() => handleRoll(true)}
                disabled={disabled}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {labels.push}
              </RunicButton>
              <div className="flex items-center justify-center gap-1 text-xs text-blood">
                <AlertTriangle className="h-3 w-3" />
                {labels.pushWarning}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-gold/10 rounded-lg p-3 border border-gold-dim/30">
        <p className="font-ui text-xs text-gold/80 italic">
          💀 {labels.tip}
        </p>
      </div>
    </div>
  )
}
