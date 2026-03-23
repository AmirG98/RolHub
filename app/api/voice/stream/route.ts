/**
 * API Route: /api/voice/stream
 * Streaming TTS con Fish Audio S2-Pro (primary) + Deepgram Aura-2 (fallback)
 *
 * Fish Audio: voces ultra naturales en español, modelo S2-Pro
 * Deepgram: fallback rápido si Fish Audio falla
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Lore } from '@prisma/client'
import { getVoiceConfig } from '@/lib/tts'

/**
 * Voces REALES de Fish Audio para narración RPG en español
 * IDs obtenidos de https://fish.audio/voice-library/
 */
const FISH_AUDIO_VOICES: Record<string, string> = {
  // NARRADORES - Voz masculina profunda, dramática
  narrator_grave: '79c16ea0ead2460c9934a4af53cd07ab',
  narrator_deep: '79c16ea0ead2460c9934a4af53cd07ab',
  narrator_epic: '79c16ea0ead2460c9934a4af53cd07ab',
  narrator_wise: '79c16ea0ead2460c9934a4af53cd07ab',
  skald_epic: '79c16ea0ead2460c9934a4af53cd07ab',
  nordic_bard: '79c16ea0ead2460c9934a4af53cd07ab',
  whisper_dread: '79c16ea0ead2460c9934a4af53cd07ab',
  whisper_tense: '79c16ea0ead2460c9934a4af53cd07ab',
  whisper_survival: '79c16ea0ead2460c9934a4af53cd07ab',
  whisper_dark: '79c16ea0ead2460c9934a4af53cd07ab',
  tension_survival: '79c16ea0ead2460c9934a4af53cd07ab',
  synth_narrator: '79c16ea0ead2460c9934a4af53cd07ab',

  // Isekai/Anime - Voz masculina joven, conversacional
  anime_energetic: '44cc9923b0b443e8a1a7887fed528c17',
  anime_narrator: '44cc9923b0b443e8a1a7887fed528c17',

  // NPCs MASCULINOS
  npc_male_1: '79c16ea0ead2460c9934a4af53cd07ab',
  npc_male_2: '44cc9923b0b443e8a1a7887fed528c17',
  npc_male_3: '44cc9923b0b443e8a1a7887fed528c17',
  npc_male_deep: '79c16ea0ead2460c9934a4af53cd07ab',
  npc_male_young: '44cc9923b0b443e8a1a7887fed528c17',

  // NPCs FEMENINOS - Isabella (cálida, profesional)
  npc_female_1: 'd3638485d6ca468ea93e03ba5e43c50e',
  npc_female_2: 'd3638485d6ca468ea93e03ba5e43c50e',
  npc_female_wise: 'd3638485d6ca468ea93e03ba5e43c50e',

  // NPCs FEMENINOS - Chica española (joven, energética)
  npc_female_3: '70faac8dfb43436eb1193d6cce3b0a54',
  npc_female_young: '70faac8dfb43436eb1193d6cce3b0a54',

  // NEUTRAL
  npc_neutral_1: '44cc9923b0b443e8a1a7887fed528c17',

  // DEFAULTS
  default_es: '79c16ea0ead2460c9934a4af53cd07ab',
  default_en: '79c16ea0ead2460c9934a4af53cd07ab',
}

/**
 * Voces de Deepgram Aura-2 en español (FALLBACK)
 */
const DEEPGRAM_VOICES: Record<string, string> = {
  narrator_grave: 'aura-2-valerio-es',
  narrator_deep: 'aura-2-valerio-es',
  narrator_epic: 'aura-2-valerio-es',
  narrator_wise: 'aura-2-valerio-es',
  skald_epic: 'aura-2-sirio-es',
  nordic_bard: 'aura-2-sirio-es',
  whisper_dread: 'aura-2-sirio-es',
  whisper_tense: 'aura-2-celeste-es',
  whisper_survival: 'aura-2-celeste-es',
  whisper_dark: 'aura-2-sirio-es',
  tension_survival: 'aura-2-celeste-es',
  synth_narrator: 'aura-2-aquila-es',
  anime_energetic: 'aura-2-luciano-es',
  anime_narrator: 'aura-2-luciano-es',
  npc_male_1: 'aura-2-nestor-es',
  npc_male_2: 'aura-2-alvaro-es',
  npc_male_3: 'aura-2-luciano-es',
  npc_male_deep: 'aura-2-javier-es',
  npc_male_young: 'aura-2-aquila-es',
  npc_female_1: 'aura-2-diana-es',
  npc_female_2: 'aura-2-selena-es',
  npc_female_3: 'aura-2-gloria-es',
  npc_female_wise: 'aura-2-silvia-es',
  npc_female_young: 'aura-2-carina-es',
  npc_neutral_1: 'aura-2-aquila-es',
  default_es: 'aura-2-valerio-es',
  default_en: 'aura-2-valerio-es',
}

interface VoiceRequest {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  voice?: string
  speed?: number
}

/**
 * Genera audio con Fish Audio S2-Pro (voces ultra naturales)
 */
async function generateWithFishAudio(
  text: string,
  voiceKey: string,
  _locale: string,
): Promise<Response> {
  const apiKey = process.env.FISH_AUDIO_API_KEY!
  const referenceId = FISH_AUDIO_VOICES[voiceKey] || FISH_AUDIO_VOICES.default_es

  const response = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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

  return response
}

/**
 * Genera audio con Deepgram Aura-2 (fallback rápido, ~90ms)
 */
async function generateWithDeepgram(
  text: string,
  voiceKey: string,
  _locale: string
): Promise<Response> {
  const apiKey = process.env.DEEPGRAM_API_KEY!
  const model = DEEPGRAM_VOICES[voiceKey] || DEEPGRAM_VOICES.default_es

  const params = new URLSearchParams({
    model,
    encoding: 'mp3',
  })

  const response = await fetch(`https://api.deepgram.com/v1/speak?${params}`, {
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
  const startTime = Date.now()

  try {
    const authStart = Date.now()
    const { userId } = await auth()
    console.log(`[Voice] Auth took: ${Date.now() - authStart}ms`)

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const fishKey = process.env.FISH_AUDIO_API_KEY
    const deepgramKey = process.env.DEEPGRAM_API_KEY

    if (!fishKey && !deepgramKey) {
      return new Response(JSON.stringify({ error: 'No TTS provider configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json() as VoiceRequest
    const { text, lore, locale, voice } = body

    if (!text || typeof text !== 'string' || text.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid text (max 5000 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let voiceKey: string
    if (voice) {
      voiceKey = voice
    } else {
      const voiceConfig = getVoiceConfig(lore, locale)
      voiceKey = voiceConfig.voice
    }

    let ttsResponse: Response
    let provider: string

    // Primary: Fish Audio S2-Pro (voces ultra naturales)
    if (fishKey) {
      console.log(`[Voice] Trying Fish Audio S2-Pro, text: ${text.length} chars, voice: ${voiceKey}`)
      const ttsStart = Date.now()

      try {
        ttsResponse = await generateWithFishAudio(text, voiceKey, locale)
        provider = 'fishaudio'
        console.log(`[Voice] Fish Audio took: ${Date.now() - ttsStart}ms`)

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text()
          console.warn(`[Voice] Fish Audio failed (${ttsResponse.status}): ${errorText}`)

          // Fallback a Deepgram si Fish Audio falla
          if (deepgramKey) {
            console.log('[Voice] Falling back to Deepgram')
            ttsResponse = await generateWithDeepgram(text, voiceKey, locale)
            provider = 'deepgram'
          } else {
            return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
              status: ttsResponse.status,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        }
      } catch (fishError) {
        console.warn('[Voice] Fish Audio error:', fishError)

        // Fallback a Deepgram
        if (deepgramKey) {
          console.log('[Voice] Falling back to Deepgram after Fish Audio error')
          ttsResponse = await generateWithDeepgram(text, voiceKey, locale)
          provider = 'deepgram'
        } else {
          throw fishError
        }
      }
    }
    // Fallback: Deepgram Aura-2 directamente
    else if (deepgramKey) {
      console.log(`[Voice] Using Deepgram (no Fish Audio key), text: ${text.length} chars, voice: ${voiceKey}`)
      const ttsStart = Date.now()
      ttsResponse = await generateWithDeepgram(text, voiceKey, locale)
      provider = 'deepgram'
      console.log(`[Voice] Deepgram took: ${Date.now() - ttsStart}ms`)
    } else {
      return new Response(JSON.stringify({ error: 'No TTS provider available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      console.error(`[Voice] ${provider} error:`, ttsResponse.status, errorText)
      return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
        status: ttsResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`[Voice] Total time: ${Date.now() - startTime}ms, provider: ${provider}`)

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
