'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Swords,
  Shield,
  Footprints,
  Zap,
  Heart,
  X,
  ChevronRight,
  RotateCcw,
  Flag,
  Scroll,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { TacticalCombatScene } from '@/components/tactical/TacticalCombatScene'
import {
  CombatState,
  CombatLogEntry,
  CombatActionType,
  InitiativeEntry,
  CombatActionRequest,
  CombatActionResponse,
} from '@/lib/types/combat-state'
import { GridCoord, TacticalToken } from '@/lib/tactical/types'
import { advanceToNextTurn, checkCombatEnd, endCombat } from '@/lib/tactical/combat-init'
import { CharacterContext } from '@/lib/engines/types'
import { CombatActionAPIResponse } from '@/app/api/combat/action/route'

interface TacticalCombatPanelProps {
  combatState: CombatState
  playerCharacters: CharacterContext[]
  sessionId: string
  onCombatUpdate: (state: CombatState) => void
  onCombatEnd: (state: CombatState) => void
  onCombatAction?: (request: CombatActionRequest) => Promise<CombatActionResponse>
  className?: string
}

/**
 * Panel principal de combate táctico
 * Wrapper que integra TacticalCombatScene con lógica de juego
 */
export function TacticalCombatPanel({
  combatState,
  playerCharacters,
  sessionId,
  onCombatUpdate,
  onCombatEnd,
  onCombatAction,
  className = '',
}: TacticalCombatPanelProps) {
  const [selectedAction, setSelectedAction] = useState<CombatActionType | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCombatLog, setShowCombatLog] = useState(true)
  const [showInitiative, setShowInitiative] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showEndCombatConfirm, setShowEndCombatConfirm] = useState(false)
  const [enemyNarration, setEnemyNarration] = useState<string | null>(null)

  // Ref para evitar doble ejecución de turno de enemigo
  const enemyTurnProcessedRef = useRef<string | null>(null)

  // Ref para handleExecuteAction (evita problemas de closure)
  const handleExecuteActionRef = useRef<(targetTokenId?: string) => Promise<void>>(async () => {})

  // IDs de tokens de jugadores
  const playerTokenIds = useMemo(() => {
    return combatState.tacticalMap?.tokens
      .filter(t => t.type === 'player' || t.type === 'ally')
      .map(t => t.id) || []
  }, [combatState.tacticalMap])

  // Token del turno actual
  const currentTurnToken = useMemo(() => {
    if (!combatState.tacticalMap) return null
    return combatState.tacticalMap.tokens.find(
      t => t.id === combatState.currentTurnTokenId
    ) || null
  }, [combatState.tacticalMap, combatState.currentTurnTokenId])

  // ¿Es el turno de un jugador?
  const isPlayerTurn = useMemo(() => {
    return currentTurnToken?.type === 'player' || currentTurnToken?.type === 'ally'
  }, [currentTurnToken])

  // Lista de iniciativa
  const initiativeList: InitiativeEntry[] = useMemo(() => {
    if (!combatState.tacticalMap) return []

    return combatState.initiativeOrder.map(tokenId => {
      const token = combatState.tacticalMap!.tokens.find(t => t.id === tokenId)
      return {
        tokenId,
        name: token?.name || 'Unknown',
        initiative: token?.initiative || 0,
        dexModifier: token?.dexMod || 0,
        isPlayer: token?.type === 'player' || token?.type === 'ally',
        hasActedThisRound: token?.hasTakenAction || false,
        imageUrl: token?.imageUrl,
        currentHp: token?.hp,
        maxHp: token?.maxHp,
      }
    })
  }, [combatState.tacticalMap, combatState.initiativeOrder])

  // ================================================================
  // AUTO-ADVANCE: Ejecutar turno de enemigo automáticamente
  // ================================================================
  useEffect(() => {
    // Solo procesar si es turno de enemigo y no estamos ya procesando
    if (!currentTurnToken || isPlayerTurn || isProcessing) {
      return
    }

    // Evitar doble ejecución para el mismo token
    if (enemyTurnProcessedRef.current === currentTurnToken.id) {
      return
    }

    // Marcar como procesado
    enemyTurnProcessedRef.current = currentTurnToken.id

    const executeEnemyTurn = async () => {
      setIsProcessing(true)
      setEnemyNarration(null)

      try {
        // Llamar API para que Claude decida la acción del enemigo
        const response = await fetch('/api/combat/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            combatState,
            isEnemyTurn: true,
            enemyTokenId: currentTurnToken.id,
            locale: 'es',
          }),
        })

        if (!response.ok) {
          throw new Error('Error en API de combate')
        }

        const result: CombatActionAPIResponse = await response.json()

        // Mostrar narración del enemigo
        setEnemyNarration(result.narration)

        // Aplicar actualizaciones de tokens
        let updatedState = { ...combatState }

        if (result.tokenUpdates && result.tokenUpdates.length > 0 && combatState.tacticalMap) {
          const updatedTokens = combatState.tacticalMap.tokens.map(token => {
            const update = result.tokenUpdates.find(u => u.id === token.id)
            if (update) {
              return {
                ...token,
                hp: update.hp ?? token.hp,
                x: update.x ?? token.x,
                y: update.y ?? token.y,
                conditions: update.conditions ?? token.conditions,
              }
            }
            return token
          })

          updatedState = {
            ...updatedState,
            tacticalMap: {
              ...combatState.tacticalMap,
              tokens: updatedTokens,
            },
          }
        }

        // Agregar al log de combate
        if (result.combatLog) {
          updatedState = {
            ...updatedState,
            combatLog: [...updatedState.combatLog, result.combatLog],
          }
        }

        // Verificar fin de combate
        if (result.combatEnded) {
          const finalState = {
            ...updatedState,
            result: result.combatResult === 'victory' ? 'victory' as const :
                    result.combatResult === 'defeat' ? 'defeat' as const : 'ongoing' as const,
            inCombat: false,
          }
          onCombatUpdate(finalState)

          // Esperar un momento para mostrar la narración final
          setTimeout(() => {
            onCombatEnd(finalState)
          }, 2000)
          return
        }

        // Actualizar estado
        onCombatUpdate(updatedState)

        // Esperar un momento para que se vea la narración, luego avanzar turno
        setTimeout(() => {
          const newState = advanceToNextTurn(updatedState)
          onCombatUpdate(newState)
          setEnemyNarration(null)
          setIsProcessing(false)
          enemyTurnProcessedRef.current = null
        }, 2000)

      } catch (error) {
        console.error('Error ejecutando turno de enemigo:', error)
        // En caso de error, avanzar al siguiente turno después de un delay
        setEnemyNarration('El enemigo vacila...')
        setTimeout(() => {
          const newState = advanceToNextTurn(combatState)
          onCombatUpdate(newState)
          setEnemyNarration(null)
          setIsProcessing(false)
          enemyTurnProcessedRef.current = null
        }, 1500)
      }
    }

    // Pequeño delay antes de ejecutar para UX
    const timer = setTimeout(executeEnemyTurn, 500)

    return () => clearTimeout(timer)
  }, [currentTurnToken?.id, isPlayerTurn, isProcessing, sessionId, combatState, onCombatUpdate, onCombatEnd])

  // Reset del ref cuando cambia el turno a un jugador
  useEffect(() => {
    if (isPlayerTurn) {
      enemyTurnProcessedRef.current = null
    }
  }, [isPlayerTurn])

  // Acciones disponibles para el turno actual
  const availableActions = useMemo(() => {
    if (!currentTurnToken || !isPlayerTurn) return []

    const actions: { type: CombatActionType; label: string; icon: React.ReactNode; available: boolean; description: string }[] = [
      {
        type: 'attack',
        label: 'Atacar',
        icon: <Swords className="w-4 h-4" />,
        available: !currentTurnToken.hasTakenAction,
        description: 'Realizar un ataque cuerpo a cuerpo o a distancia',
      },
      {
        type: 'spell',
        label: 'Hechizo',
        icon: <Sparkles className="w-4 h-4" />,
        available: !currentTurnToken.hasTakenAction,
        description: 'Lanzar un hechizo o habilidad mágica',
      },
      {
        type: 'move',
        label: 'Mover',
        icon: <Footprints className="w-4 h-4" />,
        available: currentTurnToken.movementRemaining > 0,
        description: `${currentTurnToken.movementRemaining}ft disponibles`,
      },
      {
        type: 'dash',
        label: 'Carrera',
        icon: <Zap className="w-4 h-4" />,
        available: !currentTurnToken.hasTakenAction,
        description: 'Usar tu acción para movimiento extra',
      },
      {
        type: 'dodge',
        label: 'Esquivar',
        icon: <Shield className="w-4 h-4" />,
        available: !currentTurnToken.hasTakenAction,
        description: 'Ventaja en tiradas de salvación de DEX',
      },
      {
        type: 'use_item',
        label: 'Usar Item',
        icon: <Heart className="w-4 h-4" />,
        available: !currentTurnToken.hasTakenAction,
        description: 'Usar una poción u otro objeto',
      },
    ]

    return actions
  }, [currentTurnToken, isPlayerTurn])

  // Handler para click en token (usa ref para evitar problemas de closure)
  const handleTokenClick = useCallback((tokenId: string) => {
    // Si hay una acción seleccionada y es un ataque, este es el objetivo
    if (selectedAction === 'attack' || selectedAction === 'spell') {
      // Ejecutar acción contra el objetivo usando el ref
      handleExecuteActionRef.current(tokenId)
    }
  }, [selectedAction])

  // Handler para click en celda
  const handleCellClick = useCallback((coord: GridCoord) => {
    if (selectedAction === 'move' && currentTurnToken) {
      // Mover token a la celda
      handleMoveToken(currentTurnToken.id, coord)
    }
  }, [selectedAction, currentTurnToken])

  // Handler para mover token
  const handleMoveToken = useCallback(async (tokenId: string, to: GridCoord) => {
    if (!combatState.tacticalMap || isProcessing) return

    setIsProcessing(true)

    try {
      // Encontrar el token
      const token = combatState.tacticalMap.tokens.find(t => t.id === tokenId)
      if (!token) return

      // Calcular distancia (simplificado)
      const distance = Math.sqrt(
        Math.pow(to.x - token.x, 2) + Math.pow(to.y - token.y, 2)
      ) * 5 // 5 ft por celda

      if (distance > token.movementRemaining) return

      // Actualizar posición
      const updatedTokens = combatState.tacticalMap.tokens.map(t =>
        t.id === tokenId
          ? { ...t, x: to.x, y: to.y, movementRemaining: t.movementRemaining - distance }
          : t
      )

      // Log entry
      const logEntry: CombatLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        round: combatState.roundNumber,
        tokenId,
        tokenName: token.name,
        actionType: 'move',
        description: `${token.name} se mueve ${Math.round(distance)}ft`,
        success: true,
      }

      const newState: CombatState = {
        ...combatState,
        tacticalMap: {
          ...combatState.tacticalMap,
          tokens: updatedTokens,
        },
        combatLog: [...combatState.combatLog, logEntry],
      }

      onCombatUpdate(newState)
      setSelectedAction(null)
    } finally {
      setIsProcessing(false)
    }
  }, [combatState, isProcessing, onCombatUpdate])

  // Handler para ejecutar acción
  const handleExecuteAction = useCallback(async (targetTokenId?: string) => {
    if (!selectedAction || !currentTurnToken || isProcessing) return

    setIsProcessing(true)

    try {
      const request: CombatActionRequest = {
        sessionId,
        tokenId: currentTurnToken.id,
        action: selectedAction,
        targetTokenId,
      }

      // Si hay callback de acción, usarlo
      if (onCombatAction) {
        const response = await onCombatAction(request)

        // Aplicar actualizaciones del mapa
        let updatedState = {
          ...combatState,
          combatLog: [...combatState.combatLog, response.combatLog],
        }

        if (response.mapUpdates?.tokenUpdates && combatState.tacticalMap) {
          const updatedTokens = combatState.tacticalMap.tokens.map(token => {
            const update = response.mapUpdates!.tokenUpdates!.find(u => u.id === token.id)
            return update ? { ...token, ...update } : token
          })

          updatedState = {
            ...updatedState,
            tacticalMap: {
              ...combatState.tacticalMap,
              tokens: updatedTokens,
            },
          }
        }

        // Verificar fin de combate
        updatedState = checkCombatEnd(updatedState)

        if (updatedState.result !== 'ongoing') {
          onCombatEnd(updatedState)
        } else {
          onCombatUpdate(updatedState)
        }
      } else {
        // Modo demo: crear log entry local
        const logEntry: CombatLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          round: combatState.roundNumber,
          tokenId: currentTurnToken.id,
          tokenName: currentTurnToken.name,
          actionType: selectedAction,
          targetId: targetTokenId,
          targetName: combatState.tacticalMap?.tokens.find(t => t.id === targetTokenId)?.name,
          description: `${currentTurnToken.name} usa ${selectedAction}`,
          success: true,
        }

        // Marcar que usó su acción
        const updatedTokens = combatState.tacticalMap?.tokens.map(t =>
          t.id === currentTurnToken.id
            ? { ...t, hasTakenAction: true }
            : t
        ) || []

        const newState: CombatState = {
          ...combatState,
          tacticalMap: combatState.tacticalMap ? {
            ...combatState.tacticalMap,
            tokens: updatedTokens,
          } : null,
          combatLog: [...combatState.combatLog, logEntry],
        }

        onCombatUpdate(newState)
      }

      setSelectedAction(null)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedAction, currentTurnToken, sessionId, combatState, isProcessing, onCombatAction, onCombatUpdate, onCombatEnd])

  // Mantener el ref actualizado con handleExecuteAction
  useEffect(() => {
    handleExecuteActionRef.current = handleExecuteAction
  }, [handleExecuteAction])

  // Handler para terminar turno
  const handleEndTurn = useCallback(() => {
    const newState = advanceToNextTurn(combatState)
    onCombatUpdate(newState)
    setSelectedAction(null)
  }, [combatState, onCombatUpdate])

  // Handler para terminar combate
  const handleEndCombat = useCallback((result: 'fled' | 'truce') => {
    const newState = endCombat(combatState, result)
    onCombatEnd(newState)
    setShowEndCombatConfirm(false)
  }, [combatState, onCombatEnd])

  if (!combatState.tacticalMap) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-gold text-center">
          <Swords className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="font-heading">Preparando combate...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Header de combate */}
      <div className="flex items-center justify-between px-4 py-2 glass-panel-dark border-b border-gold/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-blood" />
            <span className="font-heading text-gold">COMBATE</span>
          </div>
          <div className="text-sm text-parchment/70">
            Ronda <span className="text-gold font-semibold">{combatState.roundNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle sonido */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded hover:bg-gold/10 text-parchment/60 hover:text-gold transition-colors"
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Toggle log */}
          <button
            onClick={() => setShowCombatLog(!showCombatLog)}
            className={`p-1.5 rounded transition-colors ${
              showCombatLog ? 'bg-gold/10 text-gold' : 'text-parchment/60 hover:text-gold hover:bg-gold/10'
            }`}
            title="Log de combate"
          >
            <Scroll className="w-4 h-4" />
          </button>

          {/* Huir / Rendirse */}
          <button
            onClick={() => setShowEndCombatConfirm(true)}
            className="px-2 py-1 text-xs rounded bg-blood/20 text-blood hover:bg-blood/30 transition-colors flex items-center gap-1"
          >
            <Flag className="w-3 h-3" />
            Huir
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel de iniciativa (izquierda) */}
        <AnimatePresence>
          {showInitiative && (
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              className="w-48 glass-panel-dark border-r border-gold/20 overflow-y-auto"
            >
              <div className="p-2 border-b border-gold/20">
                <h3 className="text-xs font-heading text-gold">INICIATIVA</h3>
              </div>
              <div className="p-2 space-y-1">
                {initiativeList.map((entry, idx) => {
                  const isCurrent = entry.tokenId === combatState.currentTurnTokenId
                  const isDead = (entry.currentHp || 0) <= 0

                  return (
                    <div
                      key={entry.tokenId}
                      className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                        isCurrent
                          ? 'bg-gold/20 border border-gold/40'
                          : isDead
                          ? 'opacity-40'
                          : 'hover:bg-shadow/50'
                      }`}
                    >
                      {/* Número de orden */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent ? 'bg-gold text-shadow' : 'bg-shadow-mid text-parchment/60'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Info del token */}
                      <div className="flex-1 min-w-0">
                        <div className={`truncate font-semibold ${
                          entry.isPlayer ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          {entry.name}
                        </div>
                        {entry.currentHp !== undefined && entry.maxHp !== undefined && (
                          <div className="flex items-center gap-1 text-xs text-parchment/50">
                            <Heart className="w-3 h-3" />
                            {entry.currentHp}/{entry.maxHp}
                          </div>
                        )}
                      </div>

                      {/* Iniciativa */}
                      <div className="text-xs text-gold">
                        {entry.initiative}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Escena táctica 3D (centro) */}
        <div className="flex-1 relative">
          <TacticalCombatScene
            mapState={combatState.tacticalMap}
            playerTokenIds={playerTokenIds}
            isDM={false}
            onTokenClick={handleTokenClick}
            onCellClick={handleCellClick}
            onMoveToken={handleMoveToken}
          />

          {/* Panel de acciones (sobre el mapa) */}
          {isPlayerTurn && currentTurnToken && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="glass-panel-dark rounded-lg p-3">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gold font-heading">Tu turno: {currentTurnToken.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {availableActions.map(action => (
                    <button
                      key={action.type}
                      onClick={() => action.available && setSelectedAction(
                        selectedAction === action.type ? null : action.type
                      )}
                      disabled={!action.available || isProcessing}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded transition-all ${
                        selectedAction === action.type
                          ? 'bg-gold text-shadow ring-2 ring-white'
                          : action.available
                          ? 'bg-shadow hover:bg-shadow-mid text-parchment hover:text-gold'
                          : 'bg-shadow/50 text-parchment/30 cursor-not-allowed'
                      }`}
                      title={action.description}
                    >
                      {action.icon}
                      <span className="text-xs">{action.label}</span>
                    </button>
                  ))}

                  <div className="w-px h-10 bg-gold/20 mx-2" />

                  {/* Terminar turno */}
                  <button
                    onClick={handleEndTurn}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-emerald text-white hover:bg-emerald/80 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-sm">Fin turno</span>
                  </button>
                </div>

                {/* Instrucciones según acción seleccionada */}
                {selectedAction && (
                  <div className="mt-2 pt-2 border-t border-gold/20 text-xs text-parchment/70">
                    {selectedAction === 'attack' && 'Haz clic en un enemigo para atacar'}
                    {selectedAction === 'spell' && 'Haz clic en un objetivo para el hechizo'}
                    {selectedAction === 'move' && 'Haz clic en una celda para moverte'}
                    {selectedAction === 'dash' && (
                      <button onClick={() => handleExecuteAction()} className="text-gold hover:underline">
                        Confirmar carrera
                      </button>
                    )}
                    {selectedAction === 'dodge' && (
                      <button onClick={() => handleExecuteAction()} className="text-gold hover:underline">
                        Confirmar esquiva
                      </button>
                    )}
                    {selectedAction === 'use_item' && 'Selecciona un item del inventario'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Turno de enemigo */}
          {!isPlayerTurn && currentTurnToken && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel-dark rounded-lg p-4 text-center"
              >
                <div className="text-sm text-blood font-heading mb-2">
                  Turno de {currentTurnToken.name}
                </div>
                {enemyNarration ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-parchment text-sm leading-relaxed"
                  >
                    {enemyNarration}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-parchment/60 text-xs">
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    El DM está decidiendo...
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>

        {/* Log de combate (derecha) */}
        <AnimatePresence>
          {showCombatLog && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              className="w-64 glass-panel-dark border-l border-gold/20 overflow-hidden flex flex-col"
            >
              <div className="p-2 border-b border-gold/20 flex items-center justify-between">
                <h3 className="text-xs font-heading text-gold">LOG DE COMBATE</h3>
                <button
                  onClick={() => setShowCombatLog(false)}
                  className="p-1 rounded hover:bg-gold/10 text-parchment/60 hover:text-gold"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {combatState.combatLog.length === 0 ? (
                  <div className="text-center text-parchment/40 text-xs py-4">
                    El combate acaba de comenzar...
                  </div>
                ) : (
                  combatState.combatLog.slice().reverse().map(entry => (
                    <div
                      key={entry.id}
                      className="text-xs p-2 rounded bg-shadow/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gold">{entry.tokenName}</span>
                        <span className="text-parchment/40">R{entry.round}</span>
                      </div>
                      <div className="text-parchment/80">{entry.description}</div>
                      {entry.diceRoll && (
                        <div className="mt-1 text-parchment/60">
                          🎲 {entry.diceRoll.formula} = {entry.diceRoll.result}
                          {entry.diceRoll.isCritical && <span className="text-gold ml-1">¡CRÍTICO!</span>}
                          {entry.diceRoll.isFumble && <span className="text-blood ml-1">¡Pifia!</span>}
                        </div>
                      )}
                      {entry.damage && (
                        <div className="text-blood">
                          💥 {entry.damage.amount} daño {entry.damage.type}
                        </div>
                      )}
                      {entry.healing && (
                        <div className="text-green-400">
                          💚 {entry.healing} curación
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de confirmación de huir */}
      <AnimatePresence>
        {showEndCombatConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-shadow/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel-dark rounded-lg p-6 max-w-sm mx-4"
            >
              <h3 className="font-heading text-gold text-lg mb-4">¿Terminar combate?</h3>
              <p className="text-parchment/80 text-sm mb-6">
                Puedes intentar huir o negociar una tregua. El DM determinará las consecuencias.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndCombatConfirm(false)}
                  className="flex-1 px-4 py-2 rounded bg-shadow hover:bg-shadow-mid text-parchment transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleEndCombat('fled')}
                  className="flex-1 px-4 py-2 rounded bg-blood hover:bg-blood/80 text-white transition-colors"
                >
                  Huir
                </button>
                <button
                  onClick={() => handleEndCombat('truce')}
                  className="flex-1 px-4 py-2 rounded bg-gold hover:bg-gold/80 text-shadow transition-colors"
                >
                  Tregua
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TacticalCombatPanel
