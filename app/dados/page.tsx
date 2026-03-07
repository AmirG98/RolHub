'use client'

import { useState } from 'react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Dices, Plus, Minus } from 'lucide-react'

export default function DadosPage() {
  const [diceType, setDiceType] = useState<number>(20)
  const [diceCount, setDiceCount] = useState<number>(1)
  const [modifier, setModifier] = useState<number>(0)
  const [result, setResult] = useState<number | null>(null)
  const [rolls, setRolls] = useState<number[]>([])
  const [rolling, setRolling] = useState(false)

  const diceTypes = [4, 6, 8, 10, 12, 20, 100]

  const rollDice = () => {
    setRolling(true)

    // Simulación de tirada con delay para animación
    setTimeout(() => {
      const newRolls: number[] = []
      let total = 0

      for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * diceType) + 1
        newRolls.push(roll)
        total += roll
      }

      setRolls(newRolls)
      setResult(total + modifier)
      setRolling(false)
    }, 500)
  }

  return (
    <div className="min-h-screen particle-bg">
      <div className="max-w-4xl mx-auto p-8 content-wrapper">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl text-gold-bright mb-2 glow-effect-on-hover">
            🎲 Dados Virtuales
          </h1>
          <p className="font-ui text-parchment/80">
            Tirador de dados para tus sesiones de rol
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Panel de configuración */}
          <div className="glass-panel-dark rounded-lg p-6">
            <h2 className="font-heading text-2xl text-gold mb-6">Configuración</h2>

            {/* Tipo de dado */}
            <div className="mb-6">
              <label className="font-ui text-parchment text-sm mb-3 block">
                Tipo de Dado
              </label>
              <div className="grid grid-cols-4 gap-2">
                {diceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setDiceType(type)}
                    className={`glass-panel p-3 rounded-lg font-heading text-lg transition-all hover:scale-105 ${
                      diceType === type ? 'glow-effect ring-2 ring-gold-bright text-gold-bright' : 'text-parchment'
                    }`}
                  >
                    d{type}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad de dados */}
            <div className="mb-6">
              <label className="font-ui text-parchment text-sm mb-3 block">
                Cantidad de Dados
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                  className="glass-panel p-2 rounded-lg hover:glow-effect transition-all"
                  disabled={diceCount <= 1}
                >
                  <Minus className="h-5 w-5 text-gold" />
                </button>
                <div className="flex-1 text-center">
                  <span className="font-heading text-4xl text-gold-bright">
                    {diceCount}
                  </span>
                </div>
                <button
                  onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
                  className="glass-panel p-2 rounded-lg hover:glow-effect transition-all"
                  disabled={diceCount >= 10}
                >
                  <Plus className="h-5 w-5 text-gold" />
                </button>
              </div>
            </div>

            {/* Modificador */}
            <div className="mb-6">
              <label className="font-ui text-parchment text-sm mb-3 block">
                Modificador
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setModifier(modifier - 1)}
                  className="glass-panel p-2 rounded-lg hover:glow-effect transition-all"
                >
                  <Minus className="h-5 w-5 text-gold" />
                </button>
                <div className="flex-1 text-center">
                  <span className="font-heading text-4xl text-parchment">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
                <button
                  onClick={() => setModifier(modifier + 1)}
                  className="glass-panel p-2 rounded-lg hover:glow-effect transition-all"
                >
                  <Plus className="h-5 w-5 text-gold" />
                </button>
              </div>
            </div>

            {/* Fórmula */}
            <div className="glass-panel p-4 rounded-lg mb-6">
              <p className="font-mono text-gold-bright text-xl text-center">
                {diceCount}d{diceType}{modifier !== 0 && (modifier > 0 ? '+' + modifier : modifier)}
              </p>
            </div>

            {/* Botón de tirar */}
            <RunicButton
              variant="primary"
              onClick={rollDice}
              disabled={rolling}
              className="w-full py-4 text-lg"
            >
              <Dices className="inline-block mr-2 h-5 w-5" />
              {rolling ? 'Tirando...' : 'Tirar Dados'}
            </RunicButton>
          </div>

          {/* Panel de resultado */}
          <div className="glass-panel-dark rounded-lg p-6">
            <h2 className="font-heading text-2xl text-gold mb-6">Resultado</h2>

            {result !== null ? (
              <div className="space-y-6">
                {/* Resultado total */}
                <div className="text-center">
                  <p className="font-ui text-parchment/60 text-sm mb-2">Total</p>
                  <div className={`font-title text-7xl ${rolling ? 'candlelight' : 'ink-reveal'}`}>
                    <span className="text-gold-bright glow-effect">{result}</span>
                  </div>
                </div>

                {/* Tiradas individuales */}
                {rolls.length > 1 && (
                  <div>
                    <p className="font-ui text-parchment/60 text-sm mb-3 text-center">
                      Tiradas Individuales
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {rolls.map((roll, index) => (
                        <div
                          key={index}
                          className={`glass-panel px-4 py-2 rounded-lg ink-reveal ${
                            roll === diceType ? 'ring-2 ring-gold-bright' :
                            roll === 1 ? 'ring-2 ring-blood' : ''
                          }`}
                        >
                          <span className={`font-heading text-2xl ${
                            roll === diceType ? 'text-gold-bright' :
                            roll === 1 ? 'text-blood' :
                            'text-parchment'
                          }`}>
                            {roll}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modificador aplicado */}
                {modifier !== 0 && (
                  <div className="glass-panel p-3 rounded-lg">
                    <p className="font-ui text-parchment/80 text-sm text-center">
                      Suma de tiradas: {rolls.reduce((a, b) => a + b, 0)} {modifier >= 0 ? '+' : ''}{modifier} = {result}
                    </p>
                  </div>
                )}

                {/* Indicadores especiales */}
                {rolls.some(r => r === diceType) && (
                  <div className="glass-panel p-3 rounded-lg border-2 border-gold-bright">
                    <p className="font-ui text-gold-bright text-sm text-center">
                      ⭐ ¡Crítico! Sacaste {diceType}
                    </p>
                  </div>
                )}
                {rolls.some(r => r === 1) && (
                  <div className="glass-panel p-3 rounded-lg border-2 border-blood">
                    <p className="font-ui text-blood text-sm text-center">
                      💀 ¡Pifia! Sacaste 1
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <Dices className="h-20 w-20 text-gold-dim/30 mx-auto mb-4" />
                  <p className="font-ui text-parchment/40">
                    Configura tus dados y tira
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dados rápidos */}
        <div className="mt-8 glass-panel-dark rounded-lg p-6">
          <h2 className="font-heading text-xl text-gold mb-4">Tiradas Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'd20', dice: 20, count: 1, mod: 0 },
              { label: '2d6', dice: 6, count: 2, mod: 0 },
              { label: 'd20+5', dice: 20, count: 1, mod: 5 },
              { label: '4d6', dice: 6, count: 4, mod: 0 },
            ].map((quick) => (
              <button
                key={quick.label}
                onClick={() => {
                  setDiceType(quick.dice)
                  setDiceCount(quick.count)
                  setModifier(quick.mod)
                  setTimeout(() => rollDice(), 100)
                }}
                className="glass-panel p-3 rounded-lg font-heading text-lg text-parchment hover:glow-effect transition-all hover:scale-105"
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
