'use client'

import { useState } from 'react'
import { RunicButton } from './RunicButton'

interface DiceRollerProps {
  onRoll?: (result: DiceRollResult) => void
}

interface DiceRollResult {
  total: number
  rolls: number[]
  formula: string
}

export function DiceRoller({ onRoll }: DiceRollerProps) {
  const [result, setResult] = useState<DiceRollResult | null>(null)
  const [rolling, setRolling] = useState(false)

  const rollDice = (formula: string) => {
    setRolling(true)

    setTimeout(() => {
      const result = parseDiceFormula(formula)
      setResult(result)
      setRolling(false)
      onRoll?.(result)
    }, 300)
  }

  const parseDiceFormula = (formula: string): DiceRollResult => {
    // Parseador simple: NdX+M
    const match = formula.match(/(\d+)d(\d+)(?:\+(\d+))?/)
    if (!match) return { total: 0, rolls: [], formula }

    const count = parseInt(match[1])
    const sides = parseInt(match[2])
    const modifier = match[3] ? parseInt(match[3]) : 0

    const rolls: number[] = []
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1)
    }

    const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier

    return { total, rolls, formula }
  }

  const commonRolls = [
    { label: 'd20', formula: '1d20' },
    { label: '2d6', formula: '2d6' },
    { label: 'd12', formula: '1d12' },
    { label: 'd10', formula: '1d10' },
    { label: 'd8', formula: '1d8' },
    { label: 'd6', formula: '1d6' },
    { label: 'd4', formula: '1d4' },
  ]

  return (
    <div className="glass-panel-dark rounded-lg p-6">
      <h3 className="font-heading text-xl text-gold mb-4">Tirar Dados</h3>

      {/* Quick Roll Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {commonRolls.map((dice) => (
          <button
            key={dice.formula}
            onClick={() => rollDice(dice.formula)}
            disabled={rolling}
            className="glass-panel px-3 py-2 rounded-lg hover:glow-effect transition-all hover:scale-105 disabled:opacity-50"
          >
            <div className="font-heading text-lg text-parchment">{dice.label}</div>
          </button>
        ))}
      </div>

      {/* Result Display */}
      {result && (
        <div className="glass-panel rounded-lg p-4 text-center">
          <div className="text-sm font-ui text-parchment/60 mb-2">{result.formula}</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {result.rolls.map((roll, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-lg bg-gold/20 border-2 border-gold flex items-center justify-center font-heading text-2xl text-gold glow-effect animate-pulse"
              >
                {roll}
              </div>
            ))}
          </div>
          <div className="font-title text-4xl text-gold-bright glow-effect">
            Total: {result.total}
          </div>
        </div>
      )}

      {rolling && (
        <div className="text-center py-4">
          <div className="font-heading text-gold animate-pulse">Tirando dados...</div>
        </div>
      )}
    </div>
  )
}
