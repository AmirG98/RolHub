/**
 * Deepgram Aura-2 TTS Provider
 * - 90ms latencia (muy rápido)
 * - $200 crédito gratis para empezar
 * - 17 voces en español de alta calidad
 * - Algunas voces soportan español e inglés
 * - Soporta HTTP streaming para menor TTFB
 */

import { TTSProvider, TTSOptions, TTSResult, Voice, TTSError, estimateDuration } from '../types'

// Voces en español de Deepgram Aura-2
// Voces bilingües (ES/EN): aquila, carina, diana, javier, selena
const DEEPGRAM_VOICES = {
  // Voces masculinas para narración épica
  narrator_grave: 'aura-2-nestor-es',      // Voz grave masculina
  skald_epic: 'aura-2-luciano-es',         // Voz épica
  narrator_deep: 'aura-2-javier-es',       // Bilingüe, profunda

  // Voces femeninas/neutras para tensión
  whisper_tense: 'aura-2-celeste-es',      // Tensa, susurrante
  whisper_survival: 'aura-2-diana-es',     // Bilingüe, supervivencia

  // Voces energéticas para anime/isekai
  anime_energetic: 'aura-2-carina-es',     // Bilingüe, energética
  anime_narrator: 'aura-2-aquila-es',      // Bilingüe

  // Voces adicionales
  nordic_bard: 'aura-2-alvaro-es',         // Para vikingos

  // Fallback
  default_es: 'aura-2-sirio-es',
  default_en: 'aura-2-javier-es',          // Bilingüe
}

// Modelo del voice - para seleccionar el mejor según caso de uso
export const DEEPGRAM_VOICE_MODELS = DEEPGRAM_VOICES

export class DeepgramProvider implements TTSProvider {
  name = 'deepgram'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || ''
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateSpeech(text: string, options: TTSOptions): Promise<TTSResult> {
    if (!this.isAvailable()) {
      throw new TTSError(
        'Deepgram API key not configured',
        this.name,
        'PROVIDER_UNAVAILABLE'
      )
    }

    try {
      // Seleccionar modelo de voz según configuración
      const voiceKey = options.voice as keyof typeof DEEPGRAM_VOICES
      let model = DEEPGRAM_VOICES[voiceKey] || DEEPGRAM_VOICES.default_es

      // Si el idioma es inglés y la voz actual es solo español, usar voz bilingüe
      if (options.language === 'en' && !model.includes('javier') && !model.includes('diana') &&
          !model.includes('aquila') && !model.includes('carina') && !model.includes('selena')) {
        model = DEEPGRAM_VOICES.default_en
      }

      console.log('[DeepgramProvider] Generating speech')
      console.log('[DeepgramProvider] Model:', model)
      console.log('[DeepgramProvider] Text length:', text.length)
      console.log('[DeepgramProvider] Language:', options.language)

      // Llamar a la API de Deepgram TTS
      const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[DeepgramProvider] API Error:', response.status, errorText)

        if (response.status === 401) {
          throw new TTSError('Invalid Deepgram API key', this.name, 'PROVIDER_UNAVAILABLE')
        }
        if (response.status === 429) {
          throw new TTSError('Rate limited by Deepgram', this.name, 'RATE_LIMITED')
        }
        throw new TTSError(`Deepgram API error: ${response.status}`, this.name, 'GENERATION_FAILED')
      }

      // Deepgram devuelve audio binario directamente
      const audioBuffer = await response.arrayBuffer()

      // Convertir a base64 data URL para reproducir en el navegador
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`

      console.log('[DeepgramProvider] Audio generated successfully, size:', audioBuffer.byteLength)

      return {
        audioUrl,
        duration: estimateDuration(text),
        cached: false,
        provider: this.name,
      }
    } catch (error) {
      if (error instanceof TTSError) throw error

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[DeepgramProvider] Error:', errorMessage)

      throw new TTSError(
        `Failed to generate speech: ${errorMessage}`,
        this.name,
        'GENERATION_FAILED'
      )
    }
  }

  async getVoices(): Promise<Voice[]> {
    return [
      // Español
      { id: 'narrator_grave', name: 'Néstor (Grave)', language: 'es', gender: 'male', description: 'Voz grave para fantasía épica' },
      { id: 'skald_epic', name: 'Luciano (Épico)', language: 'es', gender: 'male', description: 'Voz épica de skald' },
      { id: 'narrator_deep', name: 'Javier (Profundo)', language: 'es', gender: 'male', description: 'Voz profunda, bilingüe ES/EN' },
      { id: 'whisper_tense', name: 'Celeste (Tensa)', language: 'es', gender: 'female', description: 'Voz tensa para horror' },
      { id: 'whisper_survival', name: 'Diana (Supervivencia)', language: 'es', gender: 'female', description: 'Bilingüe ES/EN' },
      { id: 'anime_energetic', name: 'Carina (Energética)', language: 'es', gender: 'female', description: 'Estilo anime, bilingüe' },
      { id: 'anime_narrator', name: 'Aquila (Narrador)', language: 'es', gender: 'neutral', description: 'Narrador anime, bilingüe' },
      { id: 'nordic_bard', name: 'Álvaro (Bardo)', language: 'es', gender: 'male', description: 'Voz de bardo nórdico' },
      // Inglés (usando voces bilingües)
      { id: 'narrator_deep', name: 'Javier (Deep)', language: 'en', gender: 'male', description: 'Deep narrator voice' },
      { id: 'whisper_survival', name: 'Diana (Survival)', language: 'en', gender: 'female', description: 'Tense survival voice' },
      { id: 'anime_narrator', name: 'Aquila (Anime)', language: 'en', gender: 'neutral', description: 'Anime narrator style' },
    ]
  }
}
