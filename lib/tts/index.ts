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

// Re-exportar tipos y utilidades
export * from './types'
export * from './voice-config'
export { MockProvider } from './providers/mock'
export { ReplicateProvider } from './providers/replicate'

/**
 * Factory que retorna el provider TTS apropiado según la configuración
 * Orden de prioridad:
 * 1. Replicate (si REPLICATE_API_TOKEN está configurado)
 * 2. Mock (fallback para desarrollo)
 */
export function getTTSProvider(): TTSProvider {
  // Verificar si Replicate está disponible
  if (process.env.REPLICATE_API_TOKEN) {
    const replicateProvider = new ReplicateProvider()
    if (replicateProvider.isAvailable()) {
      return replicateProvider
    }
  }

  // Fallback a mock
  console.warn('[TTS] Using mock provider - no REPLICATE_API_TOKEN configured')
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
