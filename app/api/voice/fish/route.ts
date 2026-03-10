/**
 * API Route: /api/voice/fish
 * Streaming TTS con Fish Audio - voces ultra naturales
 * Latencia: ~100ms TTFB con modelo s1
 * Costo: $15 por millón de bytes UTF-8 (~12 horas de audio)
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Lore } from '@prisma/client'
import { getVoiceConfig } from '@/lib/tts'

/**
 * Mapeo de voces internas a reference_id de Fish Audio
 * IMPORTANTE: Necesitas obtener los IDs reales de https://fish.audio/voice-library/
 *
 * Voces recomendadas para cada lore:
 * - LOTR: Buscar "epic narrator", "fantasy", "wise old man"
 * - ZOMBIES: Buscar "dark", "tense", "survival"
 * - ISEKAI: Buscar "anime", "energetic", "japanese narrator"
 * - VIKINGOS: Buscar "nordic", "deep male", "bard"
 */
const FISH_AUDIO_VOICES: Record<string, string> = {
  // Narradores épicos - voces profundas y dramáticas
  narrator_grave: 'placeholder_epic_narrator_id',
  narrator_deep: 'placeholder_deep_narrator_id',
  narrator_wise: 'placeholder_wise_narrator_id',

  // Horror/Supervivencia
  whisper_tense: 'placeholder_tense_whisper_id',
  whisper_survival: 'placeholder_survival_id',
  whisper_dark: 'placeholder_dark_whisper_id',
  tension_survival: 'placeholder_tension_id',

  // Anime/Isekai
  anime_energetic: 'placeholder_anime_energetic_id',
  anime_narrator: 'placeholder_anime_narrator_id',

  // Vikingos
  skald_epic: 'placeholder_skald_id',
  nordic_bard: 'placeholder_nordic_id',

  // NPCs masculinos
  npc_male_1: 'placeholder_male_deep_id',
  npc_male_2: 'placeholder_male_medium_id',
  npc_male_3: 'placeholder_male_young_id',
  npc_male_deep: 'placeholder_male_deep_id',
  npc_male_young: 'placeholder_male_young_id',

  // NPCs femeninos
  npc_female_1: 'placeholder_female_wise_id',
  npc_female_2: 'placeholder_female_medium_id',
  npc_female_3: 'placeholder_female_young_id',
  npc_female_wise: 'placeholder_female_wise_id',
  npc_female_young: 'placeholder_female_young_id',

  // Neutral
  npc_neutral_1: 'placeholder_neutral_id',

  // Defaults
  default_es: 'placeholder_default_es_id',
  default_en: 'placeholder_default_en_id',
}

interface VoiceRequest {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  voice?: string  // Voz específica (para NPCs)
  speed?: number  // 0.5 - 2.0
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Fish Audio API key not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parsear body
    const body = await request.json() as VoiceRequest
    const { text, lore, locale, voice, speed } = body

    // Validaciones
    if (!text || typeof text !== 'string' || text.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid text (max 5000 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Determinar voz a usar
    let referenceId: string

    if (voice && FISH_AUDIO_VOICES[voice]) {
      // Usar voz específica (para NPCs)
      referenceId = FISH_AUDIO_VOICES[voice]
    } else {
      // Usar voz del narrador según lore
      const voiceConfig = getVoiceConfig(lore, locale)
      referenceId = FISH_AUDIO_VOICES[voiceConfig.voice] || FISH_AUDIO_VOICES.default_es
    }

    console.log('[Fish Voice] Generating speech')
    console.log('[Fish Voice] Reference ID:', referenceId)
    console.log('[Fish Voice] Text length:', text.length)
    console.log('[Fish Voice] Locale:', locale)

    // Configurar prosody para velocidad
    const prosody = speed && speed !== 1.0 ? { speed } : undefined

    // Llamar a Fish Audio con streaming
    const fishResponse = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'model': 's1', // Modelo más natural
      },
      body: JSON.stringify({
        text: text,
        reference_id: referenceId,
        format: 'mp3',
        mp3_bitrate: 128,
        latency: 'low', // Priorizar baja latencia
        temperature: 0.7, // Expresividad moderada
        top_p: 0.7,
        normalize: true,
        ...(prosody && { prosody }),
      }),
    })

    if (!fishResponse.ok) {
      const errorText = await fishResponse.text()
      console.error('[Fish Voice] Fish Audio error:', fishResponse.status, errorText)

      // Manejar errores específicos
      if (fishResponse.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid Fish Audio API key' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      if (fishResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Fish Audio payment required' }), {
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
        status: fishResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream la respuesta directamente al cliente
    return new Response(fishResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Voice-Provider': 'fish-audio',
        'X-Voice-Model': 's1',
      }
    })

  } catch (error) {
    console.error('[Fish Voice] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
