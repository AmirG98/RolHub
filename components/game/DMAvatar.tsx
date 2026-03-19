'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { type UIMood } from '@/lib/game/ui-mood'

// Avatar configurations per lore
const LORE_AVATARS: Record<string, {
  name: string
  emoji: string
  baseColor: string
  accentColor: string
  description: string
}> = {
  LOTR: {
    name: 'El Sabio Gris',
    emoji: '🧙',
    baseColor: 'from-stone-700 to-stone-900',
    accentColor: 'text-amber-200',
    description: 'Un mago antiguo con barba plateada',
  },
  ZOMBIES: {
    name: 'El Operador',
    emoji: '📻',
    baseColor: 'from-zinc-800 to-zinc-950',
    accentColor: 'text-red-400',
    description: 'Una voz críptica a través de la radio',
  },
  ISEKAI: {
    name: 'La Narradora',
    emoji: '✨',
    baseColor: 'from-indigo-600 to-purple-900',
    accentColor: 'text-pink-300',
    description: 'Una entidad etérea que guía a los invocados',
  },
  VIKINGOS: {
    name: 'El Skald',
    emoji: '🪕',
    baseColor: 'from-amber-800 to-stone-900',
    accentColor: 'text-amber-400',
    description: 'Un bardo nórdico que canta las sagas',
  },
  STARWARS: {
    name: 'Holograma',
    emoji: '🔮',
    baseColor: 'from-cyan-700 to-blue-950',
    accentColor: 'text-cyan-300',
    description: 'Una proyección holográfica parpadeante',
  },
  CYBERPUNK: {
    name: 'AI_NARRATOR',
    emoji: '🤖',
    baseColor: 'from-fuchsia-800 to-zinc-950',
    accentColor: 'text-fuchsia-400',
    description: 'Una IA corporativa que observa todo',
  },
  LOVECRAFT: {
    name: 'El Cultista',
    emoji: '👁',
    baseColor: 'from-emerald-950 to-zinc-950',
    accentColor: 'text-emerald-400',
    description: 'Un ser que ha visto demasiado',
  },
}

// Mood expressions - matches UIMood type
const MOOD_EXPRESSIONS: Record<UIMood, { eyes: string; mouth: string; aura: string }> = {
  exploration: { eyes: '👁️', mouth: '😌', aura: 'ring-gold/30' },
  combat: { eyes: '😠', mouth: '😤', aura: 'ring-blood/50 animate-pulse' },
  dialogue: { eyes: '🗣️', mouth: '😊', aura: 'ring-emerald/30' },
  dramatic: { eyes: '🌟', mouth: '😮', aura: 'ring-gold-bright/50 animate-glow-pulse' },
}

interface DMAvatarProps {
  lore: string
  mood?: UIMood
  isSpeaking?: boolean
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function DMAvatar({
  lore,
  mood = 'exploration',
  isSpeaking = false,
  size = 'md',
  showName = true,
  className,
}: DMAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(false)

  // Get avatar config
  const avatar = LORE_AVATARS[lore] || LORE_AVATARS.LOTR
  const moodExpression = MOOD_EXPRESSIONS[mood]

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-20 h-20 text-4xl',
    lg: 'w-32 h-32 text-6xl',
  }

  const nameSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  }

  // Blinking animation
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }

    // Random blink interval between 2-5 seconds
    const scheduleNextBlink = () => {
      const delay = 2000 + Math.random() * 3000
      return setTimeout(() => {
        blink()
        scheduleNextBlink()
      }, delay)
    }

    const timeoutId = scheduleNextBlink()
    return () => clearTimeout(timeoutId)
  }, [])

  // Speaking animation - mouth opens and closes
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false)
      return
    }

    // Mouth moves every 100-200ms while speaking
    const interval = setInterval(() => {
      setMouthOpen(prev => !prev)
    }, 100 + Math.random() * 100)

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Avatar container */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br transition-all duration-300',
          'ring-4 ring-offset-2 ring-offset-transparent',
          avatar.baseColor,
          moodExpression.aura,
          sizeClasses[size],
          isSpeaking && 'scale-105',
        )}
      >
        {/* Main emoji/avatar */}
        <span
          className={cn(
            'transition-transform duration-150',
            isBlinking && 'scale-y-50',
            isSpeaking && 'animate-bounce-subtle',
          )}
        >
          {avatar.emoji}
        </span>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
        )}

        {/* Mood glow effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-30 blur-md -z-10',
            mood === 'combat' && 'bg-blood',
            mood === 'dramatic' && 'bg-gold-bright',
            mood === 'dialogue' && 'bg-emerald',
            mood === 'exploration' && 'bg-gold-dim',
          )}
        />
      </div>

      {/* Name */}
      {showName && (
        <div className="text-center">
          <p className={cn('font-heading', avatar.accentColor, nameSizeClasses[size])}>
            {avatar.name}
          </p>
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
export function DMAvatarInline({
  lore,
  isSpeaking = false,
  className,
}: {
  lore: string
  isSpeaking?: boolean
  className?: string
}) {
  const avatar = LORE_AVATARS[lore] || LORE_AVATARS.LOTR

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
        'bg-gradient-to-r text-sm',
        avatar.baseColor,
        className,
      )}
    >
      <span className={cn(isSpeaking && 'animate-bounce-subtle')}>
        {avatar.emoji}
      </span>
      <span className={cn('font-ui', avatar.accentColor)}>
        {avatar.name}
      </span>
      {isSpeaking && (
        <span className="flex gap-0.5 ml-1">
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        </span>
      )}
    </span>
  )
}
