/**
 * Fish Audio TTS Provider
 * - Voces ultra naturales con S2-Pro
 * - Streaming HTTP con baja latencia (~150ms)
 * - Soporte nativo para español
 * - Emotion tags para control de prosodia
 *
 * Documentación: https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech
 */

import { TTSProvider, TTSOptions, TTSResult, Voice, TTSError, estimateDuration } from '../types'

/**
 * IDs de voces REALES de Fish Audio para narración RPG en español
 * Obtenidos de https://fish.audio/voice-library/
 */
const FISH_AUDIO_VOICES: Record<string, string> = {
  // ============================================
  // NARRADORES - Voces profundas y dramáticas
  // ============================================

  // Narrador principal - "Locutor K": voz profunda, autoritaria, dramática, nativa español
  // https://fish.audio/m/3f45a7fd7a614655a61eb7027b955783/
  narrator_grave: '3f45a7fd7a614655a61eb7027b955783',
  narrator_deep: '3f45a7fd7a614655a61eb7027b955783',
  narrator_epic: '3f45a7fd7a614655a61eb7027b955783',
  narrator_wise: '3f45a7fd7a614655a61eb7027b955783',

  // Vikingos/Lovecraft
  skald_epic: '3f45a7fd7a614655a61eb7027b955783',
  nordic_bard: '3f45a7fd7a614655a61eb7027b955783',
  whisper_dread: '3f45a7fd7a614655a61eb7027b955783',

  // Zombies/Horror
  whisper_tense: '3f45a7fd7a614655a61eb7027b955783',
  whisper_survival: '3f45a7fd7a614655a61eb7027b955783',
  whisper_dark: '3f45a7fd7a614655a61eb7027b955783',
  tension_survival: '3f45a7fd7a614655a61eb7027b955783',

  // Cyberpunk
  synth_narrator: '3f45a7fd7a614655a61eb7027b955783',

  // Isekai/Anime - voz masculina joven, conversacional
  // https://fish.audio/m/44cc9923b0b443e8a1a7887fed528c17/
  anime_energetic: '44cc9923b0b443e8a1a7887fed528c17',
  anime_narrator: '44cc9923b0b443e8a1a7887fed528c17',

  // ============================================
  // NPCs MASCULINOS
  // ============================================
  npc_male_1: '3f45a7fd7a614655a61eb7027b955783',   // Profundo, sabio
  npc_male_2: '44cc9923b0b443e8a1a7887fed528c17',   // Joven, conversacional
  npc_male_3: '44cc9923b0b443e8a1a7887fed528c17',   // Joven, energético
  npc_male_deep: '3f45a7fd7a614655a61eb7027b955783',
  npc_male_young: '44cc9923b0b443e8a1a7887fed528c17',

  // ============================================
  // NPCs FEMENINOS
  // ============================================
  // Isabella - voz femenina cálida, profesional, narrativa
  // https://fish.audio/m/d3638485d6ca468ea93e03ba5e43c50e/
  npc_female_1: 'd3638485d6ca468ea93e03ba5e43c50e',
  npc_female_2: 'd3638485d6ca468ea93e03ba5e43c50e',
  npc_female_wise: 'd3638485d6ca468ea93e03ba5e43c50e',

  // Chica española - voz femenina joven, energética, brillante
  // https://fish.audio/m/70faac8dfb43436eb1193d6cce3b0a54/
  npc_female_3: '70faac8dfb43436eb1193d6cce3b0a54',
  npc_female_young: '70faac8dfb43436eb1193d6cce3b0a54',

  // ============================================
  // NEUTRAL
  // ============================================
  npc_neutral_1: '44cc9923b0b443e8a1a7887fed528c17',

  // ============================================
  // DEFAULTS
  // ============================================
  default_es: '3f45a7fd7a614655a61eb7027b955783',
  default_en: '3f45a7fd7a614655a61eb7027b955783',
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
      const voiceKey = options.voice as keyof typeof FISH_AUDIO_VOICES
      const referenceId = FISH_AUDIO_VOICES[voiceKey] || FISH_AUDIO_VOICES.default_es

      console.log('[FishAudio] Generating speech, voice:', options.voice, '-> ref:', referenceId, ', text:', text.length, 'chars')

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'model': 's2-pro',
        },
        body: JSON.stringify({
          text,
          reference_id: referenceId,
          format: 'mp3',
          mp3_bitrate: 128,
          latency: 'balanced',
          normalize: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[FishAudio] API Error:', response.status, errorText)

        if (response.status === 401) {
          throw new TTSError('Invalid Fish Audio API key', this.name, 'PROVIDER_UNAVAILABLE')
        }
        if (response.status === 402) {
          throw new TTSError('Fish Audio payment required', this.name, 'PROVIDER_UNAVAILABLE')
        }
        throw new TTSError(`Fish Audio API error: ${response.status}`, this.name, 'GENERATION_FAILED')
      }

      const audioBuffer = await response.arrayBuffer()
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`

      console.log('[FishAudio] Audio generated, size:', audioBuffer.byteLength)

      return {
        audioUrl,
        duration: estimateDuration(text),
        cached: false,
        provider: this.name,
      }
    } catch (error) {
      if (error instanceof TTSError) throw error

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[FishAudio] Error:', errorMessage)

      throw new TTSError(
        `Failed to generate speech: ${errorMessage}`,
        this.name,
        'GENERATION_FAILED'
      )
    }
  }

  /**
   * Stream de audio para latencia ultra-baja
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
    const referenceId = FISH_AUDIO_VOICES[voiceKey] || FISH_AUDIO_VOICES.default_es

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'model': 's2-pro',
      },
      body: JSON.stringify({
        text,
        reference_id: referenceId,
        format: 'mp3',
        mp3_bitrate: 128,
        latency: 'low',
        normalize: true,
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
      { id: 'narrator_grave', name: 'Narrador Épico', language: 'es', gender: 'male', description: 'Voz profunda y dramática para narración' },
      { id: 'anime_energetic', name: 'Narrador Joven', language: 'es', gender: 'male', description: 'Voz joven conversacional' },
      { id: 'npc_female_1', name: 'Isabella', language: 'es', gender: 'female', description: 'Voz femenina cálida y profesional' },
      { id: 'npc_female_young', name: 'Chica Española', language: 'es', gender: 'female', description: 'Voz femenina joven y energética' },
    ]
  }
}

/**
 * Exportar mapeo de voces para uso en voice-config
 */
export const FISH_AUDIO_VOICE_MODELS = FISH_AUDIO_VOICES
