'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortraitSplashProps {
  avatarUrl: string
  characterName: string
  archetype: string  // "Humano Guerrero" o "Explorador"
  level?: number
  onComplete: () => void
  className?: string
}

export function PortraitSplash({
  avatarUrl,
  characterName,
  archetype,
  level = 1,
  onComplete,
  className,
}: PortraitSplashProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Auto-dismiss después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onComplete, 500) // Esperar a que termine la animación de salida
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-shadow/95 backdrop-blur-sm",
            className
          )}
          onClick={handleDismiss}
        >
          {/* Partículas de fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-gold/40"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                  opacity: 0,
                }}
                animate={{
                  y: -10,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Contenido central */}
          <div className="relative flex flex-col items-center text-center px-4">
            {/* Marco dorado decorativo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-2xl bg-gold/30 rounded-full scale-150" />

              {/* Borde decorativo exterior */}
              <div className="relative p-2 rounded-lg bg-gradient-to-b from-gold/40 to-gold-dim/40">
                {/* Borde interior */}
                <div className="p-1 rounded-lg bg-gradient-to-b from-gold-dim/60 to-shadow">
                  {/* Portrait */}
                  <div className="relative w-64 h-80 sm:w-80 sm:h-96 rounded-lg overflow-hidden border-2 border-gold shadow-2xl shadow-gold/30">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={characterName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-shadow to-shadow-mid">
                        <span className="text-8xl font-title text-gold">
                          {characterName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Overlay gradient en la parte inferior */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-shadow/80 to-transparent" />
                  </div>
                </div>
              </div>

              {/* Sparkles decorativas */}
              <motion.div
                className="absolute -top-4 -right-4 text-gold"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 text-gold-bright"
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </motion.div>

            {/* Nombre del personaje */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8"
            >
              {/* Línea decorativa */}
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
                <Sparkles className="w-4 h-4 text-gold-bright" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
              </div>

              <h1 className="font-title text-3xl sm:text-4xl text-gold-bright tracking-wide drop-shadow-lg">
                {characterName.toUpperCase()}
              </h1>

              {/* Línea decorativa */}
              <div className="flex items-center gap-4 mt-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-dim" />
                <span className="font-heading text-gold-dim text-sm tracking-widest">
                  {archetype}
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-dim" />
              </div>

              {/* Nivel */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-2 text-parchment/60 font-ui text-sm"
              >
                Nivel {level}
              </motion.p>
            </motion.div>

            {/* Botón de continuar */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onClick={handleDismiss}
              className={cn(
                "mt-10 px-8 py-3 rounded-lg",
                "bg-gradient-to-r from-gold-dim via-gold to-gold-dim",
                "text-shadow font-heading text-lg tracking-wide",
                "border border-gold-bright/50",
                "shadow-lg shadow-gold/20",
                "hover:shadow-xl hover:shadow-gold/30 hover:scale-105",
                "transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-gold-bright/50"
              )}
            >
              Comenzar Aventura
            </motion.button>

            {/* Hint de click */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-4 text-parchment/40 text-xs font-ui"
            >
              Click en cualquier lugar para continuar
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
