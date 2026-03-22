'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Dices, Mic, MicOff, Swords, MessageCircle } from 'lucide-react'
import { ActionType, processAction } from '@/lib/types/action'
import { createSpeechRecognition, isSpeechRecognitionSupported, SpeechController } from '@/lib/voice/speech-recognition'
import { cn } from '@/lib/utils'

interface ActionInputWithVoiceProps {
  onSubmit: (action: string, actionType: 'do' | 'talk') => void
  isSubmitting: boolean
  suggestedActions: string[]
  lastDiceRoll?: { formula: string; result: number; rolls: number[] } | null
  onClearDiceRoll?: () => void
  error?: string | null
  locale?: 'es' | 'en'
}

export function ActionInputWithVoice({
  onSubmit,
  isSubmitting,
  suggestedActions,
  lastDiceRoll,
  onClearDiceRoll,
  error,
  locale = 'es'
}: ActionInputWithVoiceProps) {
  const [action, setAction] = useState('')
  const [mode, setMode] = useState<ActionType>('auto')
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const speechControllerRef = useRef<SpeechController | null>(null)

  // Check if speech recognition is supported
  const isSpeechSupported = typeof window !== 'undefined' && isSpeechRecognitionSupported()

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechControllerRef.current) {
        speechControllerRef.current.stop()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSpeechSupported || isListening) return

    setVoiceError(null)

    const controller = createSpeechRecognition(
      {
        onResult: (result) => {
          if (result.isFinal && result.transcript.trim()) {
            // Envío directo - procesar y enviar inmediatamente
            const processed = processAction(result.transcript, mode)
            onSubmit(processed.cleanText, processed.actionType)
          }
        },
        onStart: () => {
          setIsListening(true)
        },
        onEnd: () => {
          setIsListening(false)
          speechControllerRef.current = null
        },
        onError: (errorMsg) => {
          setVoiceError(errorMsg)
          setIsListening(false)
          speechControllerRef.current = null
        }
      },
      locale === 'en' ? 'en-US' : 'es-ES'
    )

    speechControllerRef.current = controller
    controller.start()
  }, [isSpeechSupported, isListening, mode, onSubmit, locale])

  const stopListening = useCallback(() => {
    if (speechControllerRef.current) {
      speechControllerRef.current.stop()
      speechControllerRef.current = null
    }
    setIsListening(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!action.trim() || isSubmitting) return

    const processed = processAction(action, mode)
    onSubmit(processed.cleanText, processed.actionType)
    setAction('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    const processed = processAction(suggestion, mode)
    onSubmit(processed.cleanText, processed.actionType)
  }

  // Placeholders según el modo
  const getPlaceholder = () => {
    if (mode === 'do') {
      return locale === 'en' ? 'Describe what you do...' : 'Describe qué haces...'
    }
    if (mode === 'talk') {
      return locale === 'en' ? 'What do you say...' : 'Qué dices...'
    }
    return locale === 'en' ? 'Describe your action... (*action* for physical, text for dialogue)' : 'Describe tu acción... (*acción* para físico, texto para diálogo)'
  }

  // Labels
  const labels = {
    whatDo: locale === 'en' ? 'What do you do?' : '¿Qué haces?',
    do: locale === 'en' ? 'Do' : 'Hacer',
    talk: locale === 'en' ? 'Talk' : 'Hablar',
    send: locale === 'en' ? 'Send' : 'Enviar',
    sending: locale === 'en' ? 'Sending...' : 'Enviando...',
    listening: locale === 'en' ? 'Listening...' : 'Escuchando...',
    discard: locale === 'en' ? 'Discard' : 'Descartar',
    micNotSupported: locale === 'en' ? 'Voice not available in this browser' : 'Voz no disponible en este navegador',
  }

  return (
    <ParchmentPanel variant="ornate">
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        {/* Row 1: Mode buttons */}
        <div className="flex flex-col gap-3">
          <label className="font-heading text-ink text-base md:text-lg">
            {labels.whatDo}
          </label>

          <div className="flex items-center gap-2">
            {/* Do button */}
            <button
              type="button"
              onClick={() => setMode(mode === 'do' ? 'auto' : 'do')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-sm transition-all border",
                mode === 'do'
                  ? "bg-gold/20 text-gold border-gold/50 shadow-[0_0_10px_rgba(201,168,76,0.3)]"
                  : "bg-transparent text-parchment/70 border-gold/20 hover:border-gold/40 hover:text-gold"
              )}
            >
              <Swords className="w-4 h-4" />
              {labels.do}
            </button>

            {/* Talk button */}
            <button
              type="button"
              onClick={() => setMode(mode === 'talk' ? 'auto' : 'talk')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-sm transition-all border",
                mode === 'talk'
                  ? "bg-gold/20 text-gold border-gold/50 shadow-[0_0_10px_rgba(201,168,76,0.3)]"
                  : "bg-transparent text-parchment/70 border-gold/20 hover:border-gold/40 hover:text-gold"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              {labels.talk}
            </button>

            {/* Hint for current mode */}
            <span className="text-xs text-parchment/50 ml-2">
              {mode === 'do' && (locale === 'en' ? 'Physical action' : 'Acción física')}
              {mode === 'talk' && (locale === 'en' ? 'Dialogue' : 'Diálogo')}
              {mode === 'auto' && (locale === 'en' ? 'Use *text* for actions' : 'Usa *texto* para acciones')}
            </span>
          </div>
        </div>

        {/* Row 2: Input + Voice button */}
        <div className="flex gap-2">
          <textarea
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            disabled={isSubmitting || isListening}
            placeholder={getPlaceholder()}
            className={cn(
              "flex-1 h-20 md:h-24 p-3 md:p-4 bg-parchment-dark/50 border-2 rounded-lg",
              "font-body text-sm md:text-base text-ink placeholder:text-stone/50",
              "focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20",
              "disabled:opacity-50 disabled:cursor-not-allowed resize-none",
              mode === 'do' ? "border-gold/40" : mode === 'talk' ? "border-emerald/40" : "border-gold-dim/30"
            )}
          />

          {/* Voice input button */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!isSpeechSupported || isSubmitting}
              title={!isSpeechSupported ? labels.micNotSupported : undefined}
              className={cn(
                "p-3 md:p-4 rounded-lg transition-all border",
                isListening
                  ? "bg-blood/80 border-blood text-parchment animate-pulse shadow-[0_0_20px_rgba(139,26,26,0.5)]"
                  : isSpeechSupported
                    ? "bg-gold-dim/20 border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50"
                    : "bg-stone/20 border-stone/30 text-stone/50 cursor-not-allowed"
              )}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>

            {isListening && (
              <span className="text-[10px] text-blood text-center animate-pulse">
                {labels.listening}
              </span>
            )}
          </div>
        </div>

        {/* Voice error */}
        {voiceError && (
          <div className="p-2 bg-blood/10 border border-blood/30 rounded-lg">
            <p className="font-ui text-blood text-xs">{voiceError}</p>
          </div>
        )}

        {/* Show current dice roll if any */}
        {lastDiceRoll && (
          <div className="flex items-center gap-2 p-2 bg-gold/10 rounded-lg border border-gold/30">
            <Dices className="w-4 h-4 text-gold" />
            <span className="font-mono text-sm text-gold-dim">{lastDiceRoll.formula}</span>
            <span className="font-heading text-lg text-gold-bright">→ {lastDiceRoll.result}</span>
            {onClearDiceRoll && (
              <button
                type="button"
                onClick={onClearDiceRoll}
                className="ml-auto text-xs text-blood hover:text-blood/80"
              >
                {labels.discard}
              </button>
            )}
          </div>
        )}

        {/* Suggested actions */}
        <div className="flex flex-wrap items-center gap-2">
          {suggestedActions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isSubmitting || isListening}
              className="px-2 md:px-3 py-1 text-xs md:text-sm font-ui text-gold-dim border border-gold-dim/30 rounded-full
                       hover:bg-gold/10 hover:border-gold transition-all disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-2 md:p-3 bg-blood/10 border border-blood/30 rounded-lg">
            <p className="font-ui text-blood text-xs md:text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <RunicButton
            type="submit"
            disabled={isSubmitting || isListening || !action.trim()}
            variant="primary"
            className="text-sm md:text-base px-4 md:px-6"
          >
            {isSubmitting ? labels.sending : `${labels.send} →`}
          </RunicButton>
        </div>
      </form>
    </ParchmentPanel>
  )
}
