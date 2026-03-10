/**
 * Replicate TTS Provider usando Suno Bark
 * Modelo: suno-ai/bark - Multilingüe, incluye español (es_speaker_0-9)
 * Tiempo: ~1-3 minutos por generación, costo ~$0.036/run
 */

import { TTSProvider, TTSOptions, TTSResult, Voice, TTSError, estimateDuration } from '../types'

// Mapeo de voces por lore a speakers de Bark
const BARK_VOICES = {
  // Español
  narrator_grave: 'es_speaker_3',    // Voz masculina profunda
  whisper_tense: 'es_speaker_1',     // Voz femenina tensa
  anime_energetic: 'es_speaker_5',   // Voz enérgica
  skald_epic: 'es_speaker_7',        // Voz épica
  // Inglés
  narrator_deep: 'en_speaker_3',
  whisper_survival: 'en_speaker_1',
  anime_narrator: 'en_speaker_5',
  nordic_bard: 'en_speaker_7',
  // Default
  default: 'es_speaker_0'
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

      // Seleccionar voz según idioma y tipo
      const isSpanish = options.language === 'es'
      let historyPrompt = BARK_VOICES[options.voice as keyof typeof BARK_VOICES]

      // Si la voz configurada es para inglés pero el idioma es español, usar versión española
      if (isSpanish && historyPrompt?.startsWith('en_')) {
        historyPrompt = historyPrompt.replace('en_', 'es_')
      } else if (!isSpanish && historyPrompt?.startsWith('es_')) {
        historyPrompt = historyPrompt.replace('es_', 'en_')
      }

      historyPrompt = historyPrompt || (isSpanish ? 'es_speaker_0' : 'en_speaker_0')

      console.log('[ReplicateProvider] Generating speech with suno-ai/bark')
      console.log('[ReplicateProvider] Text length:', text.length)
      console.log('[ReplicateProvider] Language:', options.language)
      console.log('[ReplicateProvider] Voice/Speaker:', historyPrompt)

      // Usar Bark con version hash específico
      const output = await replicate.run(
        "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
        {
          input: {
            prompt: text,
            history_prompt: historyPrompt,
            text_temp: 0.7,
            waveform_temp: 0.7
          }
        }
      )

      console.log('[ReplicateProvider] Raw output type:', typeof output)
      console.log('[ReplicateProvider] Raw output:', JSON.stringify(output)?.substring(0, 500))

      // Bark devuelve { audio_out: "url" }
      let audioUrl = ''
      if (typeof output === 'string') {
        audioUrl = output
      } else if (output && typeof output === 'object') {
        const obj = output as Record<string, unknown>
        audioUrl = (obj.audio_out as string) || (obj.output as string) || (obj.audio as string) || ''
      }

      if (!audioUrl) {
        throw new TTSError(
          'No audio URL returned from Replicate',
          this.name,
          'GENERATION_FAILED'
        )
      }

      console.log('[ReplicateProvider] Audio URL:', audioUrl.substring(0, 100))

      return {
        audioUrl,
        duration: estimateDuration(text),
        cached: false,
        provider: this.name
      }
    } catch (error) {
      if (error instanceof TTSError) throw error

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[ReplicateProvider] Error:', errorMessage)

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
