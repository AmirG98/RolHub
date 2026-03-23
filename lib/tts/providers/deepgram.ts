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
// Voz más profunda: aura-2-valerio-es (Deep, Knowledgeable)
// Voz barítono: aura-2-sirio-es (Calm, Baritone)
const DEEPGRAM_VOICES = {
  // ============================================
  // NARRADORES - Voces profundas y épicas
  // ============================================
  narrator_grave: 'aura-2-valerio-es',    // Deep, Knowledgeable (principal)
  narrator_deep: 'aura-2-valerio-es',     // Voz profunda
  narrator_epic: 'aura-2-valerio-es',     // Voz épica

  // Vikingos y Lovecraft - Barítono
  skald_epic: 'aura-2-sirio-es',          // Baritone (vikingos)
  nordic_bard: 'aura-2-sirio-es',         // Bardo nórdico
  whisper_dread: 'aura-2-sirio-es',       // Ominoso (Lovecraft)

  // Zombies - Tensa
  whisper_tense: 'aura-2-celeste-es',     // Tensa (zombies)
  whisper_survival: 'aura-2-celeste-es',  // Supervivencia

  // Cyberpunk - Expresivo
  synth_narrator: 'aura-2-aquila-es',     // Cyberpunk

  // Isekai - Energético
  anime_energetic: 'aura-2-luciano-es',   // Energético
  anime_narrator: 'aura-2-luciano-es',    // Anime

  // ============================================
  // NPCs - Variedad de voces
  // ============================================
  npc_male_1: 'aura-2-nestor-es',         // Sabio
  npc_male_2: 'aura-2-alvaro-es',         // Comerciante
  npc_male_3: 'aura-2-luciano-es',        // Joven
  npc_female_1: 'aura-2-diana-es',        // Líder
  npc_female_2: 'aura-2-selena-es',       // Amigable
  npc_female_3: 'aura-2-gloria-es',       // Joven
  npc_neutral_1: 'aura-2-aquila-es',      // Neutral

  // Fallback - Voz profunda
  default_es: 'aura-2-valerio-es',
  default_en: 'aura-2-javier-es',         // Bilingüe
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
      // Español - Narradores
      { id: 'narrator_grave', name: 'Valerio (Profundo)', language: 'es', gender: 'male', description: 'Voz profunda y sabia - narrador principal' },
      { id: 'narrator_deep', name: 'Valerio (Épico)', language: 'es', gender: 'male', description: 'Voz profunda para fantasía épica' },
      { id: 'skald_epic', name: 'Sirio (Barítono)', language: 'es', gender: 'male', description: 'Voz barítono para vikingos' },
      { id: 'nordic_bard', name: 'Sirio (Bardo)', language: 'es', gender: 'male', description: 'Bardo nórdico, ominoso' },
      { id: 'whisper_dread', name: 'Sirio (Horror)', language: 'es', gender: 'male', description: 'Voz ominosa para Lovecraft' },
      { id: 'whisper_tense', name: 'Celeste (Tensa)', language: 'es', gender: 'female', description: 'Voz tensa para zombies' },
      { id: 'synth_narrator', name: 'Aquila (Cyberpunk)', language: 'es', gender: 'neutral', description: 'Voz expresiva para cyberpunk' },
      { id: 'anime_energetic', name: 'Luciano (Anime)', language: 'es', gender: 'male', description: 'Voz energética para isekai' },
      // Español - NPCs
      { id: 'npc_male_1', name: 'Néstor (Sabio)', language: 'es', gender: 'male', description: 'NPC masculino - mentor, sabio' },
      { id: 'npc_male_2', name: 'Álvaro (Comerciante)', language: 'es', gender: 'male', description: 'NPC masculino - comerciante' },
      { id: 'npc_male_3', name: 'Luciano (Joven)', language: 'es', gender: 'male', description: 'NPC masculino - joven aventurero' },
      { id: 'npc_female_1', name: 'Diana (Líder)', language: 'es', gender: 'female', description: 'NPC femenino - líder, confiada' },
      { id: 'npc_female_2', name: 'Selena (Amigable)', language: 'es', gender: 'female', description: 'NPC femenino - amigable, casual' },
      { id: 'npc_female_3', name: 'Gloria (Expresiva)', language: 'es', gender: 'female', description: 'NPC femenino - joven, natural' },
      // Inglés (usando voces bilingües)
      { id: 'narrator_deep', name: 'Javier (Deep)', language: 'en', gender: 'male', description: 'Deep narrator voice' },
      { id: 'npc_female_1', name: 'Diana (Leader)', language: 'en', gender: 'female', description: 'Confident female NPC' },
      { id: 'synth_narrator', name: 'Aquila (Narrator)', language: 'en', gender: 'neutral', description: 'Expressive narrator' },
    ]
  }
}
