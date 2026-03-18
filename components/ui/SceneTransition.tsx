'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type TransitionType = 'fade' | 'ink-spill' | 'cinematic-bars' | 'none'

interface SceneTransitionProps {
  isActive: boolean
  type?: TransitionType
  duration?: number         // ms
  onTransitionComplete?: () => void
  onMidpoint?: () => void   // Llamado cuando la pantalla está completamente cubierta
  children?: React.ReactNode
  className?: string
}

// Variantes de animación para fade
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

// Variantes para ink-spill (círculo que se expande desde el centro)
const inkSpillVariants = {
  hidden: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 1,
  },
  visible: {
    clipPath: 'circle(150% at 50% 50%)',
    opacity: 1,
  },
  exit: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 1,
  },
}

// Variantes para barras cinematográficas (como películas)
const cinematicTopVariants = {
  hidden: { y: '-100%' },
  visible: { y: 0 },
  exit: { y: '-100%' },
}

const cinematicBottomVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

export function SceneTransition({
  isActive,
  type = 'fade',
  duration = 800,
  onTransitionComplete,
  onMidpoint,
  className = '',
}: SceneTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'entering' | 'visible' | 'exiting'>('idle')

  // Manejo de fases de la transición
  useEffect(() => {
    if (isActive && phase === 'idle') {
      setPhase('entering')
    } else if (!isActive && phase === 'visible') {
      setPhase('exiting')
    }
  }, [isActive, phase])

  // Callback cuando la entrada completa (midpoint)
  const handleEnterComplete = useCallback(() => {
    setPhase('visible')
    onMidpoint?.()
  }, [onMidpoint])

  // Callback cuando la salida completa
  const handleExitComplete = useCallback(() => {
    setPhase('idle')
    onTransitionComplete?.()
  }, [onTransitionComplete])

  const durationSec = duration / 1000

  if (type === 'none') return null

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {(phase === 'entering' || phase === 'visible') && (
        <>
          {type === 'fade' && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeVariants}
              transition={{ duration: durationSec, ease: 'easeInOut' }}
              onAnimationComplete={(definition) => {
                if (definition === 'visible') handleEnterComplete()
              }}
              className={cn(
                'fixed inset-0 z-[100] bg-black pointer-events-none',
                className
              )}
            />
          )}

          {type === 'ink-spill' && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={inkSpillVariants}
              transition={{ duration: durationSec * 1.2, ease: [0.4, 0, 0.2, 1] }}
              onAnimationComplete={(definition) => {
                if (definition === 'visible') handleEnterComplete()
              }}
              className={cn(
                'fixed inset-0 z-[100] pointer-events-none',
                className
              )}
              style={{
                background: 'radial-gradient(circle at center, #0D0A05 0%, #000000 100%)',
              }}
            >
              {/* Efecto de tinta con partículas */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <defs>
                    <filter id="inkNoise">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="4"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="20"
                      />
                    </filter>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="#1C1208"
                    filter="url(#inkNoise)"
                  />
                </svg>
              </div>

              {/* Texto opcional durante transición */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: durationSec * 0.3, duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-gold-dim text-4xl font-title animate-pulse">
                  ⚔
                </div>
              </motion.div>
            </motion.div>
          )}

          {type === 'cinematic-bars' && (
            <>
              {/* Barra superior */}
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={cinematicTopVariants}
                transition={{ duration: durationSec * 0.6, ease: 'easeInOut' }}
                onAnimationComplete={(definition) => {
                  if (definition === 'visible') handleEnterComplete()
                }}
                className={cn(
                  'fixed top-0 left-0 right-0 h-[15%] z-[100] bg-black pointer-events-none',
                  className
                )}
              />
              {/* Barra inferior */}
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={cinematicBottomVariants}
                transition={{ duration: durationSec * 0.6, ease: 'easeInOut' }}
                className={cn(
                  'fixed bottom-0 left-0 right-0 h-[15%] z-[100] bg-black pointer-events-none',
                  className
                )}
              />
            </>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

// Hook para manejar transiciones de escena
interface UseSceneTransitionOptions {
  type?: TransitionType
  duration?: number
}

export function useSceneTransition(options: UseSceneTransitionOptions = {}) {
  const { type = 'fade', duration = 800 } = options
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null)

  const triggerTransition = useCallback((onMidpoint?: () => void) => {
    setIsTransitioning(true)
    setPendingCallback(() => onMidpoint || null)
  }, [])

  const handleMidpoint = useCallback(() => {
    if (pendingCallback) {
      pendingCallback()
    }
    // Comenzar a salir de la transición
    setTimeout(() => {
      setIsTransitioning(false)
    }, 100) // Pequeño delay antes de salir
  }, [pendingCallback])

  const handleComplete = useCallback(() => {
    setPendingCallback(null)
  }, [])

  return {
    isTransitioning,
    triggerTransition,
    transitionProps: {
      isActive: isTransitioning,
      type,
      duration,
      onMidpoint: handleMidpoint,
      onTransitionComplete: handleComplete,
    },
  }
}

// Componente de transición con mensaje de ubicación
interface LocationTransitionProps extends SceneTransitionProps {
  locationName?: string
  locationDescription?: string
}

export function LocationTransition({
  locationName,
  locationDescription,
  ...props
}: LocationTransitionProps) {
  return (
    <AnimatePresence>
      {props.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          <div className="text-center">
            {locationName && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-title text-gold mb-4"
              >
                {locationName}
              </motion.h2>
            )}
            {locationDescription && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-lg font-body text-parchment/70 max-w-md mx-auto italic"
              >
                {locationDescription}
              </motion.p>
            )}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-6 h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transición específica para combate
export function CombatTransition({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Flash rojo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4, times: [0, 0.5, 1] }}
            onAnimationComplete={onComplete}
            className="absolute inset-0 bg-blood"
          />

          {/* Texto de combate */}
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, times: [0, 0.4, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-6xl font-title text-blood-500 tracking-widest">
              COMBATE
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
