'use client'

import { useState, useEffect } from 'react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Dices, Plus, Minus, Sparkles } from 'lucide-react'

// Componente de dado 3D animado
function AnimatedDie({
  value,
  diceType,
  isRolling,
  delay = 0
}: {
  value: number
  diceType: number
  isRolling: boolean
  delay?: number
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (isRolling) {
      setAnimating(true)
      // Animación de números aleatorios mientras gira
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * diceType) + 1)
      }, 50)

      // Detener después de la animación
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setDisplayValue(value)
        setTimeout(() => setAnimating(false), 100)
      }, 800 + delay)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    } else {
      setDisplayValue(value)
    }
  }, [isRolling, value, diceType, delay])

  const isCritical = value === diceType
  const isFail = value === 1

  return (
    <div
      className={`relative ${animating ? 'animate-dice-roll' : 'animate-dice-land'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow effect for criticals */}
      {isCritical && !animating && (
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-[-8px] bg-gold-bright/30 rounded-xl blur-xl" />
        </div>
      )}

      {/* Dado principal */}
      <div
        className={`
          relative w-16 h-16 md:w-20 md:h-20
          flex items-center justify-center
          rounded-xl shadow-2xl
          transform-gpu transition-all duration-300
          ${animating ? 'scale-110' : 'scale-100'}
          ${isCritical && !animating ? 'ring-4 ring-gold-bright shadow-gold-bright/50' : ''}
          ${isFail && !animating ? 'ring-4 ring-blood shadow-blood/50' : ''}
          ${!isCritical && !isFail ? 'ring-2 ring-gold-dim/50' : ''}
        `}
        style={{
          background: animating
            ? 'linear-gradient(135deg, #2C2416 0%, #1A1208 50%, #0D0A05 100%)'
            : isCritical
              ? 'linear-gradient(135deg, #C9A84C 0%, #8B6914 50%, #C9A84C 100%)'
              : isFail
                ? 'linear-gradient(135deg, #8B1A1A 0%, #5C1010 50%, #8B1A1A 100%)'
                : 'linear-gradient(135deg, #1A1208 0%, #0D0A05 50%, #1A1208 100%)',
          boxShadow: animating
            ? '0 10px 40px rgba(201, 168, 76, 0.3), inset 0 2px 10px rgba(255,255,255,0.1)'
            : isCritical
              ? '0 10px 40px rgba(201, 168, 76, 0.5), inset 0 2px 10px rgba(255,255,255,0.2)'
              : isFail
                ? '0 10px 40px rgba(139, 26, 26, 0.5), inset 0 2px 10px rgba(255,255,255,0.1)'
                : '0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.05)',
        }}
      >
        {/* Reflejo superior */}
        <div className="absolute top-1 left-1 right-1 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg" />

        {/* Número del dado */}
        <span
          className={`
            font-title text-2xl md:text-3xl
            ${animating ? 'text-gold animate-pulse' : ''}
            ${isCritical && !animating ? 'text-shadow-mid' : ''}
            ${isFail && !animating ? 'text-parchment' : ''}
            ${!isCritical && !isFail && !animating ? 'text-gold-bright' : ''}
          `}
        >
          {displayValue}
        </span>

        {/* Tipo de dado en la esquina */}
        <span className="absolute bottom-1 right-2 text-[10px] font-ui text-gold-dim/60">
          d{diceType}
        </span>
      </div>

      {/* Partículas para críticos */}
      {isCritical && !animating && (
        <>
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-gold-bright animate-pulse" />
          <Sparkles className="absolute -bottom-2 -left-2 h-3 w-3 text-gold animate-pulse" style={{ animationDelay: '0.3s' }} />
        </>
      )}
    </div>
  )
}

export default function DadosPage() {
  const [diceType, setDiceType] = useState<number>(20)
  const [diceCount, setDiceCount] = useState<number>(1)
  const [modifier, setModifier] = useState<number>(0)
  const [result, setResult] = useState<number | null>(null)
  const [rolls, setRolls] = useState<number[]>([])
  const [rolling, setRolling] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const diceTypes = [4, 6, 8, 10, 12, 20, 100]

  const rollDice = () => {
    setRolling(true)
    setShowResult(false)

    // Generar resultados inmediatamente pero mostrar animación
    const newRolls: number[] = []
    let total = 0

    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * diceType) + 1
      newRolls.push(roll)
      total += roll
    }

    setRolls(newRolls)
    setResult(total + modifier)

    // Mostrar resultado después de la animación
    setTimeout(() => {
      setRolling(false)
      setShowResult(true)
    }, 1000 + (diceCount * 100))
  }

  const hasCritical = rolls.some(r => r === diceType)
  const hasFail = rolls.some(r => r === 1)

  return (
    <div className="min-h-screen particle-bg">
      {/* CSS para animaciones de dados */}
      <style jsx global>{`
        @keyframes diceRoll {
          0% { transform: translateY(-100px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.5); opacity: 0; }
          20% { transform: translateY(0) rotateX(360deg) rotateY(180deg) rotateZ(90deg) scale(1.2); opacity: 1; }
          40% { transform: translateY(-30px) rotateX(540deg) rotateY(360deg) rotateZ(180deg) scale(1.1); }
          60% { transform: translateY(0) rotateX(720deg) rotateY(540deg) rotateZ(270deg) scale(1); }
          80% { transform: translateY(-10px) rotateX(800deg) rotateY(630deg) rotateZ(315deg) scale(1.05); }
          100% { transform: translateY(0) rotateX(720deg) rotateY(720deg) rotateZ(360deg) scale(1); }
        }

        @keyframes diceLand {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes diceShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-3px) rotate(-2deg); }
          75% { transform: translateX(3px) rotate(2deg); }
        }

        @keyframes resultPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes criticalGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(201, 168, 76, 0.5); }
          50% { box-shadow: 0 0 40px rgba(201, 168, 76, 0.8); }
        }

        .animate-dice-roll {
          animation: diceRoll 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-dice-land {
          animation: diceLand 0.3s ease-out;
        }

        .animate-result-pop {
          animation: resultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-critical-glow {
          animation: criticalGlow 1s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-4 md:p-8 content-wrapper">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-title text-3xl md:text-5xl text-gold-bright mb-2 glow-effect-on-hover">
            🎲 Dados Virtuales
          </h1>
          <p className="font-ui text-sm md:text-base text-parchment/80">
            Tirador de dados para tus sesiones de rol
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Panel de configuración */}
          <div className="glass-panel-dark rounded-lg p-4 md:p-6">
            <h2 className="font-heading text-xl md:text-2xl text-gold mb-4 md:mb-6">Configuración</h2>

            {/* Tipo de dado */}
            <div className="mb-4 md:mb-6">
              <label className="font-ui text-parchment text-sm mb-2 md:mb-3 block">
                Tipo de Dado
              </label>
              <div className="grid grid-cols-4 gap-2">
                {diceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setDiceType(type)}
                    className={`glass-panel p-2 md:p-3 rounded-lg font-heading text-base md:text-lg transition-all hover:scale-105 ${
                      diceType === type ? 'glow-effect ring-2 ring-gold-bright text-gold-bright' : 'text-parchment'
                    }`}
                  >
                    d{type}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad de dados */}
            <div className="mb-4 md:mb-6">
              <label className="font-ui text-parchment text-sm mb-2 md:mb-3 block">
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
                  <span className="font-heading text-3xl md:text-4xl text-gold-bright">
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
            <div className="mb-4 md:mb-6">
              <label className="font-ui text-parchment text-sm mb-2 md:mb-3 block">
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
                  <span className="font-heading text-3xl md:text-4xl text-parchment">
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
            <div className="glass-panel p-3 md:p-4 rounded-lg mb-4 md:mb-6">
              <p className="font-mono text-gold-bright text-lg md:text-xl text-center">
                {diceCount}d{diceType}{modifier !== 0 && (modifier > 0 ? '+' + modifier : modifier)}
              </p>
            </div>

            {/* Botón de tirar */}
            <RunicButton
              variant="primary"
              onClick={rollDice}
              disabled={rolling}
              className={`w-full py-3 md:py-4 text-base md:text-lg ${rolling ? 'animate-pulse' : ''}`}
            >
              <Dices className={`inline-block mr-2 h-5 w-5 ${rolling ? 'animate-spin' : ''}`} />
              {rolling ? 'Tirando...' : 'Tirar Dados'}
            </RunicButton>
          </div>

          {/* Panel de resultado */}
          <div className="glass-panel-dark rounded-lg p-4 md:p-6">
            <h2 className="font-heading text-xl md:text-2xl text-gold mb-4 md:mb-6">Resultado</h2>

            {result !== null ? (
              <div className="space-y-4 md:space-y-6">
                {/* Dados animados */}
                <div className="flex flex-wrap gap-3 justify-center min-h-[100px] items-center py-4">
                  {rolls.map((roll, index) => (
                    <AnimatedDie
                      key={`${roll}-${index}-${result}`}
                      value={roll}
                      diceType={diceType}
                      isRolling={rolling}
                      delay={index * 100}
                    />
                  ))}
                </div>

                {/* Resultado total */}
                {showResult && (
                  <div className="text-center animate-result-pop">
                    <p className="font-ui text-parchment/60 text-sm mb-2">Total</p>
                    <div
                      className={`
                        font-title text-6xl md:text-7xl text-gold-bright
                        ${hasCritical ? 'animate-critical-glow' : ''}
                      `}
                    >
                      {result}
                    </div>
                  </div>
                )}

                {/* Desglose */}
                {showResult && rolls.length > 1 && (
                  <div className="glass-panel p-3 rounded-lg animate-result-pop" style={{ animationDelay: '0.2s' }}>
                    <p className="font-ui text-parchment/80 text-sm text-center">
                      {rolls.join(' + ')}{modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`} = <span className="text-gold-bright font-bold">{result}</span>
                    </p>
                  </div>
                )}

                {/* Indicadores especiales */}
                {showResult && hasCritical && (
                  <div className="glass-panel p-3 rounded-lg border-2 border-gold-bright animate-result-pop animate-critical-glow" style={{ animationDelay: '0.3s' }}>
                    <p className="font-heading text-gold-bright text-center flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      ¡CRÍTICO! Sacaste {diceType}
                      <Sparkles className="h-5 w-5" />
                    </p>
                  </div>
                )}
                {showResult && hasFail && (
                  <div className="glass-panel p-3 rounded-lg border-2 border-blood animate-result-pop" style={{ animationDelay: '0.3s' }}>
                    <p className="font-heading text-blood text-sm text-center">
                      💀 ¡Pifia! Sacaste 1
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-[300px]">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Dices className="h-16 w-16 md:h-20 md:w-20 text-gold-dim/30 mx-auto mb-4" />
                  </div>
                  <p className="font-ui text-parchment/40 text-sm">
                    Configura tus dados y tira
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dados rápidos */}
        <div className="mt-6 md:mt-8 glass-panel-dark rounded-lg p-4 md:p-6">
          <h2 className="font-heading text-lg md:text-xl text-gold mb-3 md:mb-4">Tiradas Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { label: 'd20', dice: 20, count: 1, mod: 0, icon: '🎯' },
              { label: '2d6', dice: 6, count: 2, mod: 0, icon: '🎲' },
              { label: 'd20+5', dice: 20, count: 1, mod: 5, icon: '⚔️' },
              { label: '4d6', dice: 6, count: 4, mod: 0, icon: '✨' },
              { label: 'd100', dice: 100, count: 1, mod: 0, icon: '🌟' },
              { label: '2d10', dice: 10, count: 2, mod: 0, icon: '🔮' },
              { label: 'd12+3', dice: 12, count: 1, mod: 3, icon: '🗡️' },
              { label: '3d8', dice: 8, count: 3, mod: 0, icon: '🏹' },
            ].map((quick) => (
              <button
                key={quick.label}
                onClick={() => {
                  setDiceType(quick.dice)
                  setDiceCount(quick.count)
                  setModifier(quick.mod)
                  setTimeout(() => rollDice(), 100)
                }}
                disabled={rolling}
                className="glass-panel p-2 md:p-3 rounded-lg font-heading text-sm md:text-lg text-parchment hover:glow-effect transition-all hover:scale-105 disabled:opacity-50"
              >
                <span className="mr-1">{quick.icon}</span> {quick.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
