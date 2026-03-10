'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

// Tipos para el resultado de dados
export interface DiceRollResult {
  total: number
  rolls: { value: number; sides: number }[]
  formula: string
  modifier: number
  isCritical?: boolean
  isFumble?: boolean
}

// Colores por tema medieval
const THEME_COLORS: Record<string, { primary: string; secondary: string }> = {
  default: { primary: '#C9A84C', secondary: '#1C1208' },
  gold: { primary: '#F5C842', secondary: '#8B6914' },
  blood: { primary: '#8B1A1A', secondary: '#2C0808' },
  shadow: { primary: '#2C2416', secondary: '#0D0A05' },
}

/**
 * Overlay que muestra los dados 3D sobre toda la pantalla
 */
interface DiceOverlayProps {
  isVisible: boolean
  onClose: () => void
  result: DiceRollResult | null
  isRolling: boolean
  theme?: string
  notation: string | null
  onRollComplete: (result: DiceRollResult) => void
}

export function DiceOverlay({
  isVisible,
  onClose,
  result,
  isRolling,
  theme = 'gold',
  notation,
  onRollComplete
}: DiceOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<any>(null)
  const [diceReady, setDiceReady] = useState(false)
  const [rolling, setRolling] = useState(false)
  const initializingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializar dice-box cuando el overlay es visible
  useEffect(() => {
    if (!isVisible || !mounted || diceReady || initializingRef.current) return

    initializingRef.current = true

    const initDiceBox = async () => {
      if (typeof window === 'undefined') return

      // Esperar a que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 200))

      const canvasElement = document.getElementById('dice-box-canvas')
      if (!canvasElement) {
        console.error('[DiceOverlay] Canvas element not found')
        initializingRef.current = false
        return
      }

      try {
        const DiceBox = (await import('@3d-dice/dice-box')).default
        const colors = THEME_COLORS[theme]

        console.log('[DiceOverlay] Initializing DiceBox...')

        diceBoxRef.current = new DiceBox('#dice-box-canvas', {
          assetPath: '/assets/',
          theme: 'default',
          themeColor: colors.primary,
          scale: 5,
          gravity: 1,
          mass: 1,
          friction: 0.8,
          restitution: 0.5,
          linearDamping: 0.5,
          angularDamping: 0.4,
          spinForce: 4,
          throwForce: 5,
          startingHeight: 8,
          settleTimeout: 5000,
          offscreen: false, // Usar canvas normal, no offscreen
          delay: 10,
        })

        await diceBoxRef.current.init()
        setDiceReady(true)
        console.log('[DiceOverlay] DiceBox initialized successfully')

      } catch (error) {
        console.error('[DiceOverlay] Failed to initialize DiceBox:', error)
        initializingRef.current = false
      }
    }

    initDiceBox()
  }, [isVisible, mounted, diceReady, theme])

  // Ejecutar tirada cuando dice-box está listo y hay notación
  useEffect(() => {
    if (!diceReady || !notation || rolling || !diceBoxRef.current) return

    const executeRoll = async () => {
      setRolling(true)
      console.log('[DiceOverlay] Rolling:', notation)

      try {
        const results = await diceBoxRef.current.roll(notation)
        console.log('[DiceOverlay] Roll results:', results)

        const rolls: { value: number; sides: number }[] = []
        let total = 0

        results.forEach((die: any) => {
          rolls.push({ value: die.value, sides: die.sides })
          total += die.value
        })

        const modMatch = notation.match(/([+-]\d+)$/)
        const modifier = modMatch ? parseInt(modMatch[1]) : 0
        total += modifier

        const d20Roll = rolls.find(r => r.sides === 20)
        const isCritical = d20Roll?.value === 20
        const isFumble = d20Roll?.value === 1

        onRollComplete({
          total,
          rolls,
          formula: notation,
          modifier,
          isCritical,
          isFumble,
        })

      } catch (error) {
        console.error('[DiceOverlay] Roll failed:', error)
      } finally {
        setRolling(false)
      }
    }

    executeRoll()
  }, [diceReady, notation, rolling, onRollComplete])

  // Cleanup cuando se cierra
  useEffect(() => {
    if (!isVisible && diceBoxRef.current) {
      diceBoxRef.current.clear()
      diceBoxRef.current = null
      setDiceReady(false)
      initializingRef.current = false
    }
  }, [isVisible])

  if (!mounted || !isVisible) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={!isRolling && !rolling && result ? onClose : undefined}
    >
      {/* Backdrop semi-transparente */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Canvas de dados 3D - posición fija con dimensiones explícitas */}
      <div
        id="dice-box-canvas"
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          zIndex: 51,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Resultado */}
      {result && !isRolling && !rolling && (
        <div className="relative z-[52] text-center animate-in fade-in zoom-in duration-300 pointer-events-none">
          <div className="glass-panel-dark rounded-xl p-8 border-2 border-gold/50 pointer-events-auto">
            {/* Fórmula */}
            <div className="font-ui text-sm text-parchment/60 mb-2">
              {result.formula}
            </div>

            {/* Dados individuales */}
            <div className="flex justify-center gap-3 mb-4">
              {result.rolls.map((roll, i) => (
                <div
                  key={i}
                  className={`
                    w-14 h-14 rounded-lg flex items-center justify-center
                    font-heading text-2xl border-2 transition-all
                    ${roll.value === roll.sides ? 'bg-gold/30 border-gold text-gold-bright glow-effect' : ''}
                    ${roll.value === 1 && roll.sides >= 20 ? 'bg-blood/30 border-blood text-blood' : ''}
                    ${roll.value !== roll.sides && !(roll.value === 1 && roll.sides >= 20) ? 'bg-shadow/50 border-gold/30 text-parchment' : ''}
                  `}
                >
                  {roll.value}
                </div>
              ))}
              {result.modifier !== 0 && (
                <div className="w-14 h-14 rounded-lg flex items-center justify-center font-heading text-2xl bg-shadow/50 border-2 border-gold/30 text-gold">
                  {result.modifier > 0 ? '+' : ''}{result.modifier}
                </div>
              )}
            </div>

            {/* Total */}
            <div className={`
              font-title text-5xl
              ${result.isCritical ? 'text-gold-bright glow-effect animate-pulse' : ''}
              ${result.isFumble ? 'text-blood' : ''}
              ${!result.isCritical && !result.isFumble ? 'text-gold' : ''}
            `}>
              {result.total}
            </div>

            {/* Mensaje crítico/pifia */}
            {result.isCritical && (
              <div className="font-heading text-lg text-gold-bright mt-2 animate-pulse">
                CRITICO!
              </div>
            )}
            {result.isFumble && (
              <div className="font-heading text-lg text-blood mt-2">
                Pifia...
              </div>
            )}

            {/* Instrucción para cerrar */}
            <div className="font-ui text-xs text-parchment/40 mt-4">
              Click para cerrar
            </div>
          </div>
        </div>
      )}

      {/* Indicador de tirada en progreso */}
      {(isRolling || rolling) && !result && (
        <div className="relative z-[52] text-center pointer-events-none">
          <div className="glass-panel-dark rounded-lg px-6 py-3">
            <div className="font-heading text-xl text-gold animate-pulse">
              Tirando dados...
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}

/**
 * Hook para usar el sistema de dados 3D de forma simple
 */
export function useDiceRoller(options?: { theme?: string; onResult?: (result: DiceRollResult) => void }) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [notation, setNotation] = useState<string | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<DiceRollResult | null>(null)

  const handleRollComplete = useCallback((rollResult: DiceRollResult) => {
    setResult(rollResult)
    setIsRolling(false)
    options?.onResult?.(rollResult)
  }, [options])

  const roll = useCallback((diceNotation: string) => {
    setShowOverlay(true)
    setNotation(diceNotation)
    setResult(null)
    setIsRolling(true)
  }, [])

  const close = useCallback(() => {
    setShowOverlay(false)
    setNotation(null)
    setResult(null)
    setIsRolling(false)
  }, [])

  return {
    roll,
    close,
    showOverlay,
    isRolling,
    result,
    DiceOverlayComponent: () => (
      <DiceOverlay
        isVisible={showOverlay}
        onClose={close}
        result={result}
        isRolling={isRolling}
        theme={options?.theme}
        notation={notation}
        onRollComplete={handleRollComplete}
      />
    ),
  }
}
