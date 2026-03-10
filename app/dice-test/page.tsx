'use client'

import { useDiceRoller } from '@/components/game/DiceRoller3D'
import { RunicButton } from '@/components/medieval/RunicButton'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'

export default function DiceTestPage() {
  const { roll, DiceOverlayComponent, result } = useDiceRoller({
    theme: 'gold',
    onResult: (result) => {
      console.log('Dice result:', result)
    }
  })

  const commonRolls = [
    { label: 'd20', formula: '1d20', description: 'Tirada de habilidad' },
    { label: '2d6', formula: '2d6', description: 'PbtA / Powered by the Apocalypse' },
    { label: 'd20+5', formula: '1d20+5', description: 'Ataque con modificador' },
    { label: '4d6', formula: '4d6', description: 'Generación de stats' },
    { label: '2d10', formula: '2d10', description: 'Percentil' },
    { label: 'd12', formula: '1d12', description: 'Daño de hacha' },
    { label: '3d8', formula: '3d8', description: 'Bola de fuego' },
    { label: 'd4', formula: '1d4', description: 'Daño de daga' },
  ]

  return (
    <div className="min-h-screen bg-shadow p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-title text-4xl text-gold text-center mb-2">
          Dados 3D
        </h1>
        <p className="font-ui text-parchment/60 text-center mb-8">
          Sistema de dados con física real (WebGL + BabylonJS)
        </p>

        <ParchmentPanel className="p-6 mb-8">
          <h2 className="font-heading text-2xl text-ink mb-4">Tiradas Rápidas</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {commonRolls.map((dice) => (
              <button
                key={dice.formula}
                onClick={() => roll(dice.formula)}
                className="glass-panel-dark p-4 rounded-lg hover:glow-effect transition-all hover:scale-105 text-left"
              >
                <div className="font-heading text-2xl text-gold mb-1">
                  {dice.label}
                </div>
                <div className="font-ui text-xs text-parchment/60">
                  {dice.description}
                </div>
              </button>
            ))}
          </div>
        </ParchmentPanel>

        {result && (
          <ParchmentPanel className="p-6">
            <h2 className="font-heading text-xl text-ink mb-4">Último Resultado</h2>
            <div className="flex items-center gap-4">
              <div className="font-mono text-parchment/60">
                {result.formula}
              </div>
              <div className="font-heading text-3xl text-gold">
                = {result.total}
              </div>
              {result.isCritical && (
                <span className="px-2 py-1 bg-gold/20 text-gold rounded text-sm font-heading">
                  CRITICO!
                </span>
              )}
              {result.isFumble && (
                <span className="px-2 py-1 bg-blood/20 text-blood rounded text-sm font-heading">
                  PIFIA
                </span>
              )}
            </div>
            <div className="mt-2 font-ui text-sm text-parchment/40">
              Dados: [{result.rolls.map(r => r.value).join(', ')}]
              {result.modifier !== 0 && ` + ${result.modifier}`}
            </div>
          </ParchmentPanel>
        )}

        <div className="mt-8 text-center">
          <p className="font-ui text-sm text-parchment/40">
            Los dados usan física real con BabylonJS y AmmoJS.
            <br />
            Click en cualquier dado para lanzarlo.
          </p>
        </div>
      </div>

      {/* Overlay de dados 3D */}
      <DiceOverlayComponent />
    </div>
  )
}
