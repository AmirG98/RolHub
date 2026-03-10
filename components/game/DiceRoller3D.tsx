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

interface DiceRoller3DProps {
  onRollComplete?: (result: DiceRollResult) => void
  theme?: 'default' | 'gold' | 'blood' | 'shadow'
}

// Colores por tema medieval
const THEME_COLORS: Record<string, { primary: string; secondary: string }> = {
  default: { primary: '#C9A84C', secondary: '#1C1208' },  // gold/ink
  gold: { primary: '#F5C842', secondary: '#8B6914' },     // gold-bright/gold-dim
  blood: { primary: '#8B1A1A', secondary: '#2C0808' },    // blood/dark blood
  shadow: { primary: '#2C2416', secondary: '#0D0A05' },   // stone/shadow
}

/**
 * Componente que maneja la carga e inicialización de dice-box
 * Solo se carga en cliente (dynamic import)
 */
export function DiceRoller3D({ onRollComplete, theme = 'gold' }: DiceRoller3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null)

  // Inicializar dice-box
  useEffect(() => {
    let mounted = true

    const initDiceBox = async () => {
      if (typeof window === 'undefined') return

      try {
        // Dynamic import para evitar SSR issues
        const DiceBox = (await import('@3d-dice/dice-box')).default

        if (!mounted || !containerRef.current) return

        const colors = THEME_COLORS[theme]

        diceBoxRef.current = new DiceBox('#dice-canvas', {
          assetPath: '/assets/',
          theme: 'default',
          themeColor: colors.primary,
          scale: 6,
          gravity: 2,
          mass: 1,
          friction: 0.8,
          restitution: 0.5,
          linearDamping: 0.5,
          angularDamping: 0.4,
          spinForce: 6,
          throwForce: 5,
          startingHeight: 10,
          settleTimeout: 5000,
          offscreen: true,
          delay: 10,
        })

        await diceBoxRef.current.init()

        if (mounted) {
          setIsReady(true)
          console.log('[DiceRoller3D] Initialized successfully')
        }
      } catch (error) {
        console.error('[DiceRoller3D] Failed to initialize:', error)
      }
    }

    initDiceBox()

    return () => {
      mounted = false
      if (diceBoxRef.current?.clear) {
        diceBoxRef.current.clear()
      }
    }
  }, [theme])

  // Función para tirar dados
  const roll = useCallback(async (notation: string) => {
    if (!diceBoxRef.current || !isReady || isRolling) return

    setIsRolling(true)
    setLastResult(null)

    try {
      const results = await diceBoxRef.current.roll(notation)

      // Procesar resultados
      const rolls: { value: number; sides: number }[] = []
      let total = 0

      results.forEach((die: any) => {
        rolls.push({ value: die.value, sides: die.sides })
        total += die.value
      })

      // Parsear modificador de la notación
      const modMatch = notation.match(/([+-]\d+)$/)
      const modifier = modMatch ? parseInt(modMatch[1]) : 0
      total += modifier

      // Detectar críticos (natural 20 en d20) y pifia (natural 1)
      const d20Roll = rolls.find(r => r.sides === 20)
      const isCritical = d20Roll?.value === 20
      const isFumble = d20Roll?.value === 1

      const result: DiceRollResult = {
        total,
        rolls,
        formula: notation,
        modifier,
        isCritical,
        isFumble,
      }

      setLastResult(result)
      onRollComplete?.(result)

      // Limpiar dados después de mostrar resultado
      setTimeout(() => {
        diceBoxRef.current?.clear()
      }, 3000)

    } catch (error) {
      console.error('[DiceRoller3D] Roll failed:', error)
    } finally {
      setIsRolling(false)
    }
  }, [isReady, isRolling, onRollComplete])

  // Limpiar dados manualmente
  const clear = useCallback(() => {
    diceBoxRef.current?.clear()
    setLastResult(null)
  }, [])

  return {
    roll,
    clear,
    isReady,
    isRolling,
    lastResult,
    containerRef,
  }
}

/**
 * Overlay que muestra los dados 3D sobre toda la pantalla
 * Se activa cuando hay una tirada pendiente
 */
interface DiceOverlayProps {
  isVisible: boolean
  onClose: () => void
  result: DiceRollResult | null
  isRolling: boolean
}

export function DiceOverlay({ isVisible, onClose, result, isRolling }: DiceOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isVisible) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={!isRolling ? onClose : undefined}
    >
      {/* Backdrop semi-transparente */}
      <div className="absolute inset-0 bg-shadow/80 backdrop-blur-sm" />

      {/* Canvas de dados 3D */}
      <div
        id="dice-canvas"
        className="absolute inset-0 pointer-events-auto"
        style={{ zIndex: 51 }}
      />

      {/* Resultado */}
      {result && !isRolling && (
        <div className="relative z-[52] text-center animate-in fade-in zoom-in duration-300">
          <div className="glass-panel-dark rounded-xl p-8 border-2 border-gold/50">
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
      {isRolling && (
        <div className="relative z-[52] text-center">
          <div className="font-heading text-2xl text-gold animate-pulse">
            Tirando dados...
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
  const [pendingRoll, setPendingRoll] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<DiceRollResult | null>(null)

  // Inicializar dice-box cuando se muestra el overlay
  useEffect(() => {
    if (!showOverlay || isReady) return

    let mounted = true

    const initDiceBox = async () => {
      if (typeof window === 'undefined') return

      // Esperar a que el DOM tenga el canvas
      await new Promise(resolve => setTimeout(resolve, 100))

      try {
        const DiceBox = (await import('@3d-dice/dice-box')).default

        if (!mounted) return

        const colors = THEME_COLORS[options?.theme || 'gold']

        diceBoxRef.current = new DiceBox('#dice-canvas', {
          assetPath: '/assets/',
          theme: 'default',
          themeColor: colors.primary,
          scale: 6,
          gravity: 2,
          mass: 1,
          friction: 0.8,
          restitution: 0.5,
          linearDamping: 0.5,
          angularDamping: 0.4,
          spinForce: 6,
          throwForce: 5,
          startingHeight: 10,
          settleTimeout: 5000,
          offscreen: true,
          delay: 10,
        })

        await diceBoxRef.current.init()

        if (mounted) {
          setIsReady(true)

          // Si hay un roll pendiente, ejecutarlo
          if (pendingRoll) {
            executeRoll(pendingRoll)
            setPendingRoll(null)
          }
        }
      } catch (error) {
        console.error('[useDiceRoller] Failed to initialize:', error)
      }
    }

    initDiceBox()

    return () => {
      mounted = false
    }
  }, [showOverlay])

  const executeRoll = async (notation: string) => {
    if (!diceBoxRef.current) return

    setIsRolling(true)
    setResult(null)

    try {
      const results = await diceBoxRef.current.roll(notation)

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

      const rollResult: DiceRollResult = {
        total,
        rolls,
        formula: notation,
        modifier,
        isCritical,
        isFumble,
      }

      setResult(rollResult)
      options?.onResult?.(rollResult)

    } catch (error) {
      console.error('[useDiceRoller] Roll failed:', error)
    } finally {
      setIsRolling(false)
    }
  }

  const roll = useCallback((notation: string) => {
    setShowOverlay(true)
    setResult(null)

    if (isReady && diceBoxRef.current) {
      executeRoll(notation)
    } else {
      setPendingRoll(notation)
    }
  }, [isReady])

  const close = useCallback(() => {
    diceBoxRef.current?.clear()
    setShowOverlay(false)
    setResult(null)
    setIsReady(false)
    diceBoxRef.current = null
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
      />
    ),
  }
}
