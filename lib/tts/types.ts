/**
 * Sistema de Text-to-Speech (TTS) para el narrador DM
 * Soporta múltiples providers: Replicate (Qwen3-TTS), ElevenLabs, Mock
 */

import { Lore } from '@prisma/client'

/**
 * Interfaz base para todos los providers TTS
 */
export interface TTSProvider {
  name: string
  generateSpeech(text: string, options: TTSOptions): Promise<TTSResult>
  getVoices(): Promise<Voice[]>
  isAvailable(): boolean
}

/**
 * Opciones para generar audio
 */
export interface TTSOptions {
  voice: string           // ID de voz o preset
  language: 'es' | 'en'
  speed?: number          // 0.5 - 2.0, default 1.0
  emotion?: string        // Para providers que soporten control emocional
  referenceAudio?: string // URL de audio de referencia para voice cloning
}

/**
 * Resultado de la generación de audio
 */
export interface TTSResult {
  audioUrl: string
  duration: number        // Duración estimada en segundos
  cached: boolean         // Si vino de cache
  provider: string        // Nombre del provider usado
}

/**
 * Información de una voz disponible
 */
export interface Voice {
  id: string
  name: string
  language: string
  gender?: 'male' | 'female' | 'neutral'
  preview?: string        // URL de audio de preview
  description?: string
}

/**
 * Configuración de voz para un lore específico
 */
export interface VoiceConfig {
  voice: string
  speed: number
  emotion?: string
  referenceAudio?: string
}

/**
 * Configuración completa por lore e idioma
 */
export interface LoreVoiceConfig {
  es: VoiceConfig
  en: VoiceConfig
}

/**
 * Tipo para el mapeo de voces por lore
 */
export type LoreVoicesMap = Record<Lore, LoreVoiceConfig>

/**
 * Error específico de TTS
 */
export class TTSError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code: 'PROVIDER_UNAVAILABLE' | 'GENERATION_FAILED' | 'INVALID_OPTIONS' | 'RATE_LIMITED'
  ) {
    super(message)
    this.name = 'TTSError'
  }
}

/**
 * Estima la duración del audio basado en el texto
 * Aproximadamente 150 palabras por minuto
 */
export function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length
  const wordsPerSecond = 150 / 60 // 2.5 palabras por segundo
  return Math.ceil(words / wordsPerSecond)
}
