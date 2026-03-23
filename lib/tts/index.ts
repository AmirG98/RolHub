/**
 * Sistema TTS - Factory y exports principales
 * Uso:
 *   import { getTTSProvider } from '@/lib/tts'
 *   const provider = getTTSProvider()
 *   const result = await provider.generateSpeech(text, options)
 */

import { TTSProvider } from './types'
import { MockProvider } from './providers/mock'
import { ReplicateProvider } from './providers/replicate'
import { DeepgramProvider } from './providers/deepgram'
import { FishAudioProvider } from './providers/fishaudio'

// Re-exportar tipos y utilidades
export * from './types'
export * from './voice-config'
export { MockProvider } from './providers/mock'
export { ReplicateProvider } from './providers/replicate'
export { DeepgramProvider } from './providers/deepgram'
export { FishAudioProvider } from './providers/fishaudio'

/**
 * Factory que retorna el provider TTS apropiado según la configuración
 * Orden de prioridad:
 * 1. Fish Audio S2-Pro (voces ultra naturales en español)
 * 2. Deepgram Aura-2 (fallback rápido, 90ms latencia)
 * 3. Replicate (si los demás no están configurados)
 * 4. Mock (fallback para desarrollo)
 */
export function getTTSProvider(): TTSProvider {
  // Prioridad 1: Fish Audio (voces ultra naturales, S2-Pro)
  if (process.env.FISH_AUDIO_API_KEY) {
    const fishAudioProvider = new FishAudioProvider()
    if (fishAudioProvider.isAvailable()) {
      console.log('[TTS] Using Fish Audio S2-Pro provider')
      return fishAudioProvider
    }
  }

  // Prioridad 2: Deepgram (fallback rápido, 90ms latencia)
  if (process.env.DEEPGRAM_API_KEY) {
    const deepgramProvider = new DeepgramProvider()
    if (deepgramProvider.isAvailable()) {
      console.log('[TTS] Using Deepgram provider (fallback)')
      return deepgramProvider
    }
  }

  // Prioridad 3: Replicate
  if (process.env.REPLICATE_API_TOKEN) {
    const replicateProvider = new ReplicateProvider()
    if (replicateProvider.isAvailable()) {
      console.log('[TTS] Using Replicate provider')
      return replicateProvider
    }
  }

  // Fallback a mock
  console.warn('[TTS] Using mock provider - no API keys configured')
  return new MockProvider()
}

/**
 * Verifica si el sistema de voz está habilitado
 */
export function isVoiceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_VOICE === 'true'
}

/**
 * Obtiene información del provider actual
 */
export function getProviderInfo(): { name: string; available: boolean } {
  const provider = getTTSProvider()
  return {
    name: provider.name,
    available: provider.isAvailable()
  }
}
