/**
 * Fish Audio TTS Provider
 * - Voces ultra naturales con FishAudio-S1
 * - 70% más barato que ElevenLabs ($15/M UTF-8 bytes)
 * - Streaming HTTP con baja latencia
 * - Soporte para español e inglés
 * - 2M+ voces en la librería
 *
 * Documentación: https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech
 */

import { TTSProvider, TTSOptions, TTSResult, Voice, TTSError, estimateDuration } from '../types'

/**
 * IDs de voces de Fish Audio para cada tipo de narrador
 * Nota: Los reference_id se obtienen de la librería de Fish Audio
 * https://fish.audio/voice-library/
 *
 * Para obtener voces específicas de fantasía, buscar en:
 * - https://fish.audio/voice-library/fantasy/
 * - https://fish.audio/voice-library/gaming/
 * - https://fish.audio/voice-library/dark/
 */
const FISH_AUDIO_VOICES: Record<string, string> = {
  // Narradores épicos para fantasía (LOTR, Vikingos)
  // Wriothesley - "mature, authoritative male voice with a formal tone, deep and smooth"
  narrator_epic: '5a5d5e4b8f054c0395e0c7e8e1b1a1a1', // Placeholder - actualizar con ID real
  narrator_deep: '3c3d3e4b8f054c0395e0c7e8e1b1a2a2', // Placeholder
  narrator_wise: '2b2c2d4b8f054c0395e0c7e8e1b1a3a3', // Placeholder

  // Horror/Supervivencia (Zombies)
  whisper_dark: '4d4e4f4b8f054c0395e0c7e8e1b1a4a4', // Placeholder
  tension_survival: '5e5f5g4b8f054c0395e0c7e8e1b1a5a5', // Placeholder

  // Anime/Isekai
  anime_narrator: '6f6g6h4b8f054c0395e0c7e8e1b1a6a6', // Placeholder
  anime_energetic: '7g7h7i4b8f054c0395e0c7e8e1b1a7a7', // Placeholder

  // NPCs variados
  npc_male_deep: '8h8i8j4b8f054c0395e0c7e8e1b1a8a8',
  npc_male_young: '9i9j9k4b8f054c0395e0c7e8e1b1a9a9',
  npc_female_wise: 'ajakal4b8f054c0395e0c7e8e1b1aaaa',
  npc_female_young: 'bkblbm4b8f054c0395e0c7e8e1b1abab',

  // Fallbacks
  default_es: 'narrator_epic',
  default_en: 'narrator_deep',
}

export class FishAudioProvider implements TTSProvider {
  name = 'fishaudio'
  private apiKey: string
  private baseUrl = 'https://api.fish.audio/v1/tts'

  constructor() {
    this.apiKey = process.env.FISH_AUDIO_API_KEY || ''
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generateSpeech(text: string, options: TTSOptions): Promise<TTSResult> {
    if (!this.isAvailable()) {
      throw new TTSError(
        'Fish Audio API key not configured',
        this.name,
        'PROVIDER_UNAVAILABLE'
      )
    }

    try {
      // Seleccionar modelo de voz
      const voiceKey = options.voice as keyof typeof FISH_AUDIO_VOICES
      const referenceId = FISH_AUDIO_VOICES[voiceKey] || FISH_AUDIO_VOICES.narrator_epic

      console.log('[FishAudioProvider] Generating speech')
      console.log('[FishAudioProvider] Voice:', options.voice, '-> referenceId:', referenceId)
      console.log('[FishAudioProvider] Text length:', text.length)
      console.log('[FishAudioProvider] Language:', options.language)

      // Configurar prosody según velocidad solicitada
      const prosody = options.speed ? {
        speed: options.speed
      } : undefined

      // Llamar a Fish Audio API
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'model': 's1', // FishAudio-S1 para máxima naturalidad
        },
        body: JSON.stringify({
          text: text,
          reference_id: referenceId,
          format: 'mp3',
          mp3_bitrate: 128,
          latency: 'balanced', // Balance entre velocidad y calidad
          temperature: 0.7, // Expresividad moderada
          top_p: 0.7,
          normalize: true,
          ...(prosody && { prosody }),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[FishAudioProvider] API Error:', response.status, errorText)

        if (response.status === 401) {
          throw new TTSError('Invalid Fish Audio API key', this.name, 'PROVIDER_UNAVAILABLE')
        }
        if (response.status === 402) {
          throw new TTSError('Fish Audio payment required', this.name, 'PROVIDER_UNAVAILABLE')
        }
        if (response.status === 422) {
          throw new TTSError(`Fish Audio validation error: ${errorText}`, this.name, 'INVALID_OPTIONS')
        }
        throw new TTSError(`Fish Audio API error: ${response.status}`, this.name, 'GENERATION_FAILED')
      }

      // Fish Audio devuelve audio en chunks (streaming)
      const audioBuffer = await response.arrayBuffer()

      // Convertir a base64 data URL para reproducir en el navegador
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`

      console.log('[FishAudioProvider] Audio generated successfully, size:', audioBuffer.byteLength)

      return {
        audioUrl,
        duration: estimateDuration(text),
        cached: false,
        provider: this.name,
      }
    } catch (error) {
      if (error instanceof TTSError) throw error

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[FishAudioProvider] Error:', errorMessage)

      throw new TTSError(
        `Failed to generate speech: ${errorMessage}`,
        this.name,
        'GENERATION_FAILED'
      )
    }
  }

  /**
   * Stream de audio para latencia ultra-baja
   * Retorna un ReadableStream que puede ser consumido directamente
   */
  async generateSpeechStream(text: string, options: TTSOptions): Promise<Response> {
    if (!this.isAvailable()) {
      throw new TTSError(
        'Fish Audio API key not configured',
        this.name,
        'PROVIDER_UNAVAILABLE'
      )
    }

    const voiceKey = options.voice as keyof typeof FISH_AUDIO_VOICES
    const referenceId = FISH_AUDIO_VOICES[voiceKey] || FISH_AUDIO_VOICES.narrator_epic

    const prosody = options.speed ? { speed: options.speed } : undefined

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'model': 's1',
      },
      body: JSON.stringify({
        text,
        reference_id: referenceId,
        format: 'mp3',
        mp3_bitrate: 128,
        latency: 'low', // Priorizar baja latencia para streaming
        temperature: 0.7,
        normalize: true,
        ...(prosody && { prosody }),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new TTSError(`Fish Audio stream error: ${errorText}`, this.name, 'GENERATION_FAILED')
    }

    return response
  }

  async getVoices(): Promise<Voice[]> {
    return [
      // Narradores épicos
      { id: 'narrator_epic', name: 'Epic Narrator', language: 'es', gender: 'male', description: 'Voz épica para fantasía y aventura' },
      { id: 'narrator_deep', name: 'Deep Narrator', language: 'es', gender: 'male', description: 'Voz profunda y sabia' },
      { id: 'narrator_wise', name: 'Wise Narrator', language: 'es', gender: 'male', description: 'Voz de sabio anciano' },

      // Horror/Supervivencia
      { id: 'whisper_dark', name: 'Dark Whisper', language: 'es', gender: 'male', description: 'Susurro oscuro para horror' },
      { id: 'tension_survival', name: 'Survival Tension', language: 'es', gender: 'female', description: 'Voz tensa de supervivencia' },

      // Anime
      { id: 'anime_narrator', name: 'Anime Narrator', language: 'es', gender: 'neutral', description: 'Narrador estilo anime' },
      { id: 'anime_energetic', name: 'Energetic Anime', language: 'es', gender: 'female', description: 'Voz energética de anime' },

      // NPCs
      { id: 'npc_male_deep', name: 'Deep Male NPC', language: 'es', gender: 'male', description: 'NPC masculino grave' },
      { id: 'npc_male_young', name: 'Young Male NPC', language: 'es', gender: 'male', description: 'NPC masculino joven' },
      { id: 'npc_female_wise', name: 'Wise Female NPC', language: 'es', gender: 'female', description: 'NPC femenina sabia' },
      { id: 'npc_female_young', name: 'Young Female NPC', language: 'es', gender: 'female', description: 'NPC femenina joven' },
    ]
  }
}

/**
 * Exportar mapeo de voces para uso en voice-config
 */
export const FISH_AUDIO_VOICE_MODELS = FISH_AUDIO_VOICES
