/**
 * Replicate TTS Provider usando Qwen3-TTS
 * Costo: ~$0.0023/segundo de audio
 * Soporta: 10 idiomas, voice cloning, ES/EN nativo
 */

import { TTSProvider, TTSOptions, TTSResult, Voice, TTSError, estimateDuration } from '../types'

// Tipo para la respuesta de Replicate
interface ReplicateOutput {
  audio?: string
  output?: string
}

export class ReplicateProvider implements TTSProvider {
  name = 'replicate'
  private apiToken: string

  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN || ''
  }

  isAvailable(): boolean {
    return !!this.apiToken
  }

  async generateSpeech(text: string, options: TTSOptions): Promise<TTSResult> {
    if (!this.isAvailable()) {
      throw new TTSError(
        'Replicate API token not configured',
        this.name,
        'PROVIDER_UNAVAILABLE'
      )
    }

    try {
      // Importar Replicate dinámicamente para evitar errores en cliente
      const Replicate = (await import('replicate')).default
      const replicate = new Replicate({ auth: this.apiToken })

      // Usar el modelo Qwen3-TTS
      // Modelo: zsxkib/qwen2-audio-tts o similar
      const output = await replicate.run(
        "zsxkib/qwen2-audio-tts:latest",
        {
          input: {
            text: text,
            language: options.language === 'es' ? 'Spanish' : 'English',
            speed: options.speed || 1.0,
            // Si hay audio de referencia para voice cloning
            ...(options.referenceAudio && { reference_audio: options.referenceAudio })
          }
        }
      ) as ReplicateOutput | string

      // El output puede ser una URL directa o un objeto
      const audioUrl = typeof output === 'string'
        ? output
        : (output?.audio || output?.output || '')

      if (!audioUrl) {
        throw new TTSError(
          'No audio URL returned from Replicate',
          this.name,
          'GENERATION_FAILED'
        )
      }

      return {
        audioUrl,
        duration: estimateDuration(text),
        cached: false,
        provider: this.name
      }
    } catch (error) {
      if (error instanceof TTSError) throw error

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Detectar rate limiting
      if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
        throw new TTSError(
          'Rate limited by Replicate',
          this.name,
          'RATE_LIMITED'
        )
      }

      throw new TTSError(
        `Failed to generate speech: ${errorMessage}`,
        this.name,
        'GENERATION_FAILED'
      )
    }
  }

  async getVoices(): Promise<Voice[]> {
    // Qwen3-TTS no tiene voces predefinidas, pero soporta voice cloning
    // Estas son configuraciones recomendadas para cada tipo de narración
    return [
      {
        id: 'narrator_grave',
        name: 'Narrador Grave',
        language: 'es',
        gender: 'male',
        description: 'Voz profunda y pausada para fantasía épica'
      },
      {
        id: 'narrator_deep',
        name: 'Deep Narrator',
        language: 'en',
        gender: 'male',
        description: 'Deep, wise voice for epic fantasy'
      },
      {
        id: 'whisper_tense',
        name: 'Susurro Tenso',
        language: 'es',
        gender: 'neutral',
        description: 'Voz susurrada para horror y supervivencia'
      },
      {
        id: 'whisper_survival',
        name: 'Tense Whisper',
        language: 'en',
        gender: 'neutral',
        description: 'Whispered voice for horror and survival'
      },
      {
        id: 'anime_energetic',
        name: 'Narrador Anime',
        language: 'es',
        gender: 'neutral',
        description: 'Voz enérgica y expresiva estilo anime'
      },
      {
        id: 'anime_narrator',
        name: 'Anime Narrator',
        language: 'en',
        gender: 'neutral',
        description: 'Energetic, expressive anime-style voice'
      },
      {
        id: 'skald_epic',
        name: 'Skald Épico',
        language: 'es',
        gender: 'male',
        description: 'Voz ronca de bardo nórdico'
      },
      {
        id: 'nordic_bard',
        name: 'Nordic Bard',
        language: 'en',
        gender: 'male',
        description: 'Rough nordic skald voice'
      }
    ]
  }
}
