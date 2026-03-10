/**
 * API Route: /api/voice/stream
 * Streaming TTS - el audio empieza a reproducirse mientras se genera
 * Latencia: ~90ms TTFB (vs ~200ms del endpoint normal)
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Lore } from '@prisma/client'
import { getVoiceConfig } from '@/lib/tts'

// Voces de Deepgram Aura-2
// Documentación: https://developers.deepgram.com/docs/aura-2
const DEEPGRAM_VOICES: Record<string, string> = {
  // Voces de narrador
  narrator_grave: 'aura-2-nestor-es',      // Masculina grave, sabio
  skald_epic: 'aura-2-luciano-es',         // Masculina épica
  narrator_deep: 'aura-2-javier-es',       // Masculina profunda
  whisper_tense: 'aura-2-celeste-es',      // Femenina tensa
  whisper_survival: 'aura-2-diana-es',     // Femenina superviviente
  anime_energetic: 'aura-2-carina-es',     // Femenina energética
  anime_narrator: 'aura-2-aquila-es',      // Neutral anime
  nordic_bard: 'aura-2-alvaro-es',         // Masculina nórdica

  // Voces para NPCs masculinos
  npc_male_1: 'aura-2-luciano-es',         // Grave, autoritario
  npc_male_2: 'aura-2-alvaro-es',          // Media, amigable
  npc_male_3: 'aura-2-sirio-es',           // Joven, enérgico

  // Voces para NPCs femeninos
  npc_female_1: 'aura-2-diana-es',         // Grave, sabia
  npc_female_2: 'aura-2-celeste-es',       // Media, neutral
  npc_female_3: 'aura-2-carina-es',        // Joven, expresiva

  // Voz neutral (criaturas, etc)
  npc_neutral_1: 'aura-2-aquila-es',

  // Defaults
  default_es: 'aura-2-sirio-es',
  default_en: 'aura-2-javier-es',
}

interface VoiceRequest {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  voice?: string  // Voz específica (para NPCs)
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

    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Deepgram API key not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parsear body
    const body = await request.json() as VoiceRequest
    const { text, lore, locale, voice } = body

    // Validaciones
    if (!text || typeof text !== 'string' || text.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Determinar voz a usar
    let model: string

    if (voice && DEEPGRAM_VOICES[voice]) {
      // Usar voz específica (para NPCs)
      model = DEEPGRAM_VOICES[voice]
    } else {
      // Usar voz del narrador según lore
      const voiceConfig = getVoiceConfig(lore, locale)
      model = DEEPGRAM_VOICES[voiceConfig.voice] || DEEPGRAM_VOICES.default_es
    }

    // Si el idioma es inglés y la voz actual es solo español, usar voz bilingüe
    if (locale === 'en' && !model.includes('javier') && !model.includes('diana') &&
        !model.includes('aquila') && !model.includes('carina')) {
      model = DEEPGRAM_VOICES.default_en
    }

    console.log('[Voice Stream] Generating speech, model:', model, 'text length:', text.length)

    // Llamar a Deepgram con streaming
    const deepgramResponse = await fetch(`https://api.deepgram.com/v1/speak?model=${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text()
      console.error('[Voice Stream] Deepgram error:', deepgramResponse.status, errorText)
      return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
        status: deepgramResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream la respuesta directamente al cliente
    // El navegador puede empezar a reproducir mientras recibe chunks
    return new Response(deepgramResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Voice-Model': model,
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
