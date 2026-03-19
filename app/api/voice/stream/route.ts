/**
 * API Route: /api/voice/stream
 * Streaming TTS con Deepgram Aura-2 - 90ms latencia, voces en español
 *
 * Prioridad:
 * 1. Deepgram (DEEPGRAM_API_KEY) - 90ms latencia, $200 crédito gratis, muy rápido
 * 2. Fish Audio (FISH_AUDIO_API_KEY) - fallback si Deepgram no está disponible
 *
 * El audio empieza a reproducirse mientras se genera (streaming)
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Lore } from '@prisma/client'
import { getVoiceConfig } from '@/lib/tts'

/**
 * Voces de Fish Audio (ultra naturales)
 * IMPORTANTE: Actualizar estos IDs con voces reales de https://fish.audio/voice-library/
 *
 * Recomendaciones por lore:
 * - LOTR: Buscar "epic narrator", "fantasy", "wise old man", "deep male"
 * - ZOMBIES: Buscar "dark", "tense", "survival", "horror"
 * - ISEKAI: Buscar "anime", "energetic", "japanese narrator"
 * - VIKINGOS: Buscar "nordic", "deep male", "bard", "epic"
 */
const FISH_AUDIO_VOICES: Record<string, string> = {
  // Narradores épicos - TODO: Reemplazar con IDs reales de Fish Audio
  narrator_grave: 'placeholder_epic_narrator_es',
  narrator_deep: 'placeholder_deep_narrator_es',
  narrator_wise: 'placeholder_wise_narrator_es',
  skald_epic: 'placeholder_skald_es',
  nordic_bard: 'placeholder_nordic_es',

  // Horror/Supervivencia
  whisper_tense: 'placeholder_tense_es',
  whisper_survival: 'placeholder_survival_es',
  whisper_dark: 'placeholder_dark_es',
  tension_survival: 'placeholder_tension_es',

  // Anime/Isekai
  anime_energetic: 'placeholder_anime_energetic_es',
  anime_narrator: 'placeholder_anime_narrator_es',

  // NPCs masculinos
  npc_male_1: 'placeholder_male_deep_es',
  npc_male_2: 'placeholder_male_medium_es',
  npc_male_3: 'placeholder_male_young_es',
  npc_male_deep: 'placeholder_male_deep_es',
  npc_male_young: 'placeholder_male_young_es',

  // NPCs femeninos
  npc_female_1: 'placeholder_female_wise_es',
  npc_female_2: 'placeholder_female_medium_es',
  npc_female_3: 'placeholder_female_young_es',
  npc_female_wise: 'placeholder_female_wise_es',
  npc_female_young: 'placeholder_female_young_es',

  // Neutral
  npc_neutral_1: 'placeholder_neutral_es',

  // Defaults
  default_es: 'placeholder_default_es',
  default_en: 'placeholder_default_en',
}

/**
 * Voces de Deepgram Aura-2 en ESPAÑOL
 * Voces nativas en español con pronunciación natural
 * Documentación: https://developers.deepgram.com/docs/tts-models
 *
 * Voces disponibles en español:
 * - aura-2-nestor-es: Masculina profunda, ideal para narradores épicos
 * - aura-2-aurora-es: Femenina expresiva, ideal para NPCs femeninos
 * - aura-2-dario-es: Masculina energética, ideal para narradores dinámicos
 */
const DEEPGRAM_VOICES: Record<string, string> = {
  // Voces de narrador - ESPAÑOL nativo
  narrator_grave: 'aura-2-nestor-es',     // Voz masculina profunda (LOTR)
  skald_epic: 'aura-2-nestor-es',         // Voz masculina épica (vikingos)
  narrator_deep: 'aura-2-nestor-es',      // Voz masculina profunda
  narrator_epic: 'aura-2-nestor-es',      // Voz épica (Star Wars)
  whisper_tense: 'aura-2-aurora-es',      // Voz femenina tensa (zombies)
  whisper_survival: 'aura-2-aurora-es',   // Voz femenina (supervivencia)
  whisper_dread: 'aura-2-aurora-es',      // Voz ominosa (Lovecraft)
  synth_narrator: 'aura-2-dario-es',      // Voz sintética (Cyberpunk)
  anime_energetic: 'aura-2-dario-es',     // Voz masculina energética (isekai)
  anime_narrator: 'aura-2-dario-es',      // Voz masculina expresiva
  nordic_bard: 'aura-2-nestor-es',        // Voz masculina épica

  // NPCs masculinos
  npc_male_1: 'aura-2-nestor-es',         // Profunda
  npc_male_2: 'aura-2-dario-es',          // Energética
  npc_male_3: 'aura-2-dario-es',          // Joven

  // NPCs femeninos
  npc_female_1: 'aura-2-aurora-es',       // Sabia
  npc_female_2: 'aura-2-aurora-es',       // Media
  npc_female_3: 'aura-2-aurora-es',       // Joven

  // Neutral
  npc_neutral_1: 'aura-2-dario-es',

  // Defaults - SIEMPRE español
  default_es: 'aura-2-nestor-es',
  default_en: 'aura-2-nestor-es',         // También español para consistencia
}

interface VoiceRequest {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  voice?: string  // Voz específica (para NPCs)
  speed?: number  // 0.5 - 2.0
}

/**
 * Genera audio con Fish Audio (voces ultra naturales)
 * Si no hay reference_id configurado, usa voz por defecto del modelo
 */
async function generateWithFishAudio(
  text: string,
  voiceKey: string,
  locale: string,
  speed?: number
): Promise<Response> {
  const apiKey = process.env.FISH_AUDIO_API_KEY!
  const referenceId = FISH_AUDIO_VOICES[voiceKey]

  const prosody = speed && speed !== 1.0 ? { speed } : undefined

  // Construir body - solo incluir reference_id si es un ID válido (no placeholder)
  const body: Record<string, unknown> = {
    text,
    format: 'mp3',
    mp3_bitrate: 128,
    latency: 'low',
    temperature: 0.7,
    top_p: 0.7,
    normalize: true,
  }

  // Solo agregar reference_id si no es un placeholder
  if (referenceId && !referenceId.startsWith('placeholder_')) {
    body.reference_id = referenceId
  }

  if (prosody) {
    body.prosody = prosody
  }

  const response = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'model': 's1', // Modelo más natural
    },
    body: JSON.stringify(body),
  })

  return response
}

/**
 * Genera audio con Deepgram Aura (~800ms latencia)
 * Usa voces multilingües que soportan español con acento natural
 */
async function generateWithDeepgram(
  text: string,
  voiceKey: string,
  _locale: string
): Promise<Response> {
  const apiKey = process.env.DEEPGRAM_API_KEY!
  const model = DEEPGRAM_VOICES[voiceKey] || DEEPGRAM_VOICES.default_es

  const response = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  return response
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

    // Verificar que al menos un provider está configurado
    const fishAudioKey = process.env.FISH_AUDIO_API_KEY
    const deepgramKey = process.env.DEEPGRAM_API_KEY

    if (!fishAudioKey && !deepgramKey) {
      return new Response(JSON.stringify({ error: 'No TTS provider configured' }), {
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
    let voiceKey: string
    if (voice) {
      voiceKey = voice
    } else {
      const voiceConfig = getVoiceConfig(lore, locale)
      voiceKey = voiceConfig.voice
    }

    let ttsResponse: Response
    let provider: string

    // Prioridad 1: Deepgram (más rápido, 90ms latencia)
    if (deepgramKey) {
      console.log('[Voice Stream] Using Deepgram, voice:', voiceKey)
      provider = 'deepgram'
      ttsResponse = await generateWithDeepgram(text, voiceKey, locale)

      // Si Deepgram falla y tenemos Fish Audio como fallback
      if (!ttsResponse.ok && fishAudioKey) {
        console.warn('[Voice Stream] Deepgram failed, falling back to Fish Audio')
        provider = 'fish-audio'
        ttsResponse = await generateWithFishAudio(text, voiceKey, locale, speed)
      }
    }
    // Fallback: Fish Audio
    else if (fishAudioKey) {
      console.log('[Voice Stream] Using Fish Audio, voice:', voiceKey)
      provider = 'fish-audio'
      ttsResponse = await generateWithFishAudio(text, voiceKey, locale, speed)
    }
    // No hay provider configurado
    else {
      return new Response(JSON.stringify({ error: 'No TTS provider configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      console.error(`[Voice Stream] ${provider} error:`, ttsResponse.status, errorText)
      return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
        status: ttsResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream la respuesta directamente al cliente
    return new Response(ttsResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Voice-Provider': provider,
        'X-Voice-Key': voiceKey,
      }
    })

  } catch (error) {
    console.error('[Voice Stream] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
