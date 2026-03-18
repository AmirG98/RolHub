'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

export type TypewriterVariant = 'narration' | 'dialogue' | 'system' | 'dramatic'

interface TypewriterTextProps {
  text: string
  speed?: number                    // ms por caracter (default: 30)
  onComplete?: () => void
  variant?: TypewriterVariant
  skipOnClick?: boolean             // Click para revelar todo
  className?: string
  startDelay?: number               // Delay antes de empezar (ms)
  pauseOnPunctuation?: boolean      // Pausa extra en puntuación
  cursorBlink?: boolean             // Mostrar cursor parpadeante
}

// Velocidades por variante
const VARIANT_SPEEDS: Record<TypewriterVariant, number> = {
  narration: 30,      // DM narrando - pausado, atmosférico
  dialogue: 25,       // NPC hablando - más natural
  system: 10,         // Mensajes del sistema - rápido
  dramatic: 50,       // Momentos dramáticos - muy lento
}

// Clases de estilo por variante
const VARIANT_CLASSES: Record<TypewriterVariant, string> = {
  narration: 'font-body text-lg italic text-parchment leading-relaxed',
  dialogue: 'font-ui text-base text-gold-bright',
  system: 'font-mono text-sm text-parchment/60',
  dramatic: 'font-heading text-xl text-gold tracking-wide',
}

// Pausas extra en puntuación (multiplica el speed)
const PUNCTUATION_DELAYS: Record<string, number> = {
  '.': 6,
  '!': 6,
  '?': 6,
  ',': 3,
  ';': 4,
  ':': 3,
  '—': 4,
  '...': 8,
  '\n': 5,
}

export function TypewriterText({
  text,
  speed,
  onComplete,
  variant = 'narration',
  skipOnClick = true,
  className = '',
  startDelay = 0,
  pauseOnPunctuation = true,
  cursorBlink = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const effectiveSpeed = speed ?? VARIANT_SPEEDS[variant]

  // Función para calcular delay del siguiente caracter
  const getNextDelay = useCallback((char: string, nextChars: string): number => {
    if (!pauseOnPunctuation) return effectiveSpeed

    // Detectar "..."
    if (char === '.' && nextChars.startsWith('..')) {
      return effectiveSpeed * PUNCTUATION_DELAYS['...']
    }

    const delay = PUNCTUATION_DELAYS[char]
    return delay ? effectiveSpeed * delay : effectiveSpeed
  }, [effectiveSpeed, pauseOnPunctuation])

  // Efecto de typewriter
  useEffect(() => {
    // Reset cuando cambia el texto
    indexRef.current = 0
    setDisplayedText('')
    setIsComplete(false)
    setIsStarted(false)

    // Start delay
    const startTimeout = setTimeout(() => {
      setIsStarted(true)
    }, startDelay)

    return () => {
      clearTimeout(startTimeout)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, startDelay])

  // Animación de typewriter
  useEffect(() => {
    if (!isStarted || isComplete) return

    const typeNextChar = () => {
      if (indexRef.current >= text.length) {
        setIsComplete(true)
        onComplete?.()
        return
      }

      const currentIndex = indexRef.current
      const char = text[currentIndex]
      const remainingText = text.slice(currentIndex + 1)

      setDisplayedText(text.slice(0, currentIndex + 1))
      indexRef.current += 1

      const delay = getNextDelay(char, remainingText)
      timeoutRef.current = setTimeout(typeNextChar, delay)
    }

    timeoutRef.current = setTimeout(typeNextChar, effectiveSpeed)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isStarted, isComplete, text, effectiveSpeed, onComplete, getNextDelay])

  // Skip animation on click
  const handleClick = useCallback(() => {
    if (skipOnClick && !isComplete) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
    }
  }, [skipOnClick, isComplete, text, onComplete])

  // Renderizar texto con formato
  const renderText = () => {
    // Procesar diálogos con comillas
    if (variant === 'dialogue') {
      return (
        <>
          <span className="text-parchment/60">"</span>
          {displayedText}
          <span className="text-parchment/60">"</span>
        </>
      )
    }
    return displayedText
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        VARIANT_CLASSES[variant],
        skipOnClick && !isComplete && 'cursor-pointer',
        className
      )}
    >
      {renderText()}
      {cursorBlink && !isComplete && (
        <span className="inline-block w-0.5 h-[1em] bg-current ml-0.5 animate-blink" />
      )}
    </span>
  )
}

// Componente para múltiples párrafos con typewriter secuencial
interface TypewriterParagraphsProps {
  paragraphs: Array<{
    text: string
    variant?: TypewriterVariant
    speaker?: string  // Nombre del NPC si es diálogo
  }>
  onAllComplete?: () => void
  className?: string
  paragraphDelay?: number  // Delay entre párrafos (ms)
}

export function TypewriterParagraphs({
  paragraphs,
  onAllComplete,
  className = '',
  paragraphDelay = 500,
}: TypewriterParagraphsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedParagraphs, setCompletedParagraphs] = useState<number[]>([])

  const handleParagraphComplete = useCallback((index: number) => {
    setCompletedParagraphs(prev => [...prev, index])

    if (index < paragraphs.length - 1) {
      setTimeout(() => {
        setCurrentIndex(index + 1)
      }, paragraphDelay)
    } else {
      onAllComplete?.()
    }
  }, [paragraphs.length, paragraphDelay, onAllComplete])

  return (
    <div className={cn('space-y-4', className)}>
      {paragraphs.map((para, index) => {
        const isActive = index <= currentIndex
        const isCompleted = completedParagraphs.includes(index)

        if (!isActive) return null

        return (
          <div key={index} className="typewriter-paragraph">
            {para.speaker && (
              <span className="block font-heading text-sm text-gold uppercase tracking-wider mb-1">
                {para.speaker}:
              </span>
            )}
            {isCompleted ? (
              // Párrafo completado - mostrar todo
              <span className={cn(VARIANT_CLASSES[para.variant || 'narration'])}>
                {para.variant === 'dialogue' ? `"${para.text}"` : para.text}
              </span>
            ) : (
              // Párrafo en progreso - usar typewriter
              <TypewriterText
                text={para.text}
                variant={para.variant || 'narration'}
                onComplete={() => handleParagraphComplete(index)}
                cursorBlink={index === currentIndex}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Hook para detectar si el texto es dramático
export function useTextVariant(text: string, lockReason?: string): TypewriterVariant {
  // Combate siempre es dramático
  if (lockReason === 'combat') return 'dramatic'

  // Detectar diálogo por comillas
  if (text.startsWith('"') || text.startsWith('«') || text.includes('dice:') || text.includes('says:')) {
    return 'dialogue'
  }

  // Detectar momentos dramáticos por keywords
  const dramaticKeywords = [
    'muerte', 'death', 'muere', 'dies',
    'traición', 'betrayal', 'revela', 'reveals',
    'destino', 'fate', 'profecía', 'prophecy',
    'final', 'última', 'last', 'end'
  ]

  const lowerText = text.toLowerCase()
  if (dramaticKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'dramatic'
  }

  return 'narration'
}

// Animación CSS necesaria (agregar a globals.css)
// @keyframes blink { 0%, 50% { opacity: 1 } 51%, 100% { opacity: 0 } }
// .animate-blink { animation: blink 1s step-end infinite; }
