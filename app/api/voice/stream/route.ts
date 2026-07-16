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
import { getCachedAudio, cacheAudio } from '@/lib/cache/asset-cache'

/**
 * Voces REALES de Fish Audio para narración RPG en español
 * IDs obtenidos de https://fish.audio/voice-library/
 */
const FISH_AUDIO_VOICES: Record<string, string> = {
  // NARRADORES - Voz masculina profunda, dramática
  narrator_grave: '3f45a7fd7a614655a61eb7027b955783',
  narrator_deep: '3f45a7fd7a614655a61eb7027b955783',
  narrator_epic: '3f45a7fd7a614655a61eb7027b955783',
  narrator_wise: '3f45a7fd7a614655a61eb7027b955783',
  skald_epic: '3f45a7fd7a614655a61eb7027b955783',
  nordic_bard: '3f45a7fd7a614655a61eb7027b955783',
  whisper_dread: '3f45a7fd7a614655a61eb7027b955783',
  whisper_tense: '3f45a7fd7a614655a61eb7027b955783',
  whisper_survival: '3f45a7fd7a614655a61eb7027b955783',
  whisper_dark: '3f45a7fd7a614655a61eb7027b955783',
  tension_survival: '3f45a7fd7a614655a61eb7027b955783',
  synth_narrator: '3f45a7fd7a614655a61eb7027b955783',

  // Isekai/Anime - Voz masculina joven, conversacional
  anime_energetic: '44cc9923b0b443e8a1a7887fed528c17',
  anime_narrator: '44cc9923b0b443e8a1a7887fed528c17',

  // NPCs MASCULINOS
  npc_male_1: '3f45a7fd7a614655a61eb7027b955783',
  npc_male_2: '44cc9923b0b443e8a1a7887fed528c17',
  npc_male_3: '44cc9923b0b443e8a1a7887fed528c17',
  npc_male_deep: '3f45a7fd7a614655a61eb7027b955783',
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
  default_es: '3f45a7fd7a614655a61eb7027b955783',
  default_en: '3f45a7fd7a614655a61eb7027b955783',
}

/**
 * Voces de Fish Audio entrenadas en INGLÉS nativo (PENDING).
 *
 * Hoy todas están como `null`. Para activarlas: ir a https://fish.audio/voice-library/
 * filtrar por voces en inglés, copiar el reference_id de cada voz deseada, y pegar
 * aquí reemplazando el null. El código detecta automáticamente cuando un ID está
 * definido y empieza a usarlo para locale=EN sin cambios adicionales.
 *
 * Mientras tanto, locale=EN va directo a Deepgram Aura-2 con voces inglesas nativas.
 */
const FISH_AUDIO_VOICES_EN: Record<string, string | null> = {
  narrator_grave:   null, // TODO: deep male English narrator (épico)
  narrator_deep:    null,
  narrator_epic:    null,
  narrator_wise:    null, // TODO: older male English narrator (sabio/Olvar-like)
  skald_epic:       null,
  nordic_bard:      null,
  whisper_dread:    null, // TODO: whispery male English (Lovecraft)
  whisper_tense:    null,
  whisper_survival: null,
  whisper_dark:     null,
  tension_survival: null,
  synth_narrator:   null, // TODO: cyberpunk male English, futuristic
  anime_energetic:  null,
  anime_narrator:   null,
  npc_male_1:       null,
  npc_male_2:       null,
  npc_male_3:       null,
  npc_male_deep:    null,
  npc_male_young:   null,
  npc_female_1:     null, // TODO: warm female English
  npc_female_2:     null,
  npc_female_3:     null,
  npc_female_wise:  null,
  npc_female_young: null,
  npc_neutral_1:    null,
  default_es:       null,
  default_en:       null, // TODO: fallback English voice
}

/**
 * Voces de Deepgram Aura-2 en español (FALLBACK para locale ES)
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

/**
 * Voces de Deepgram Aura-2 entrenadas en INGLÉS nativo.
 * Se activa automáticamente cuando el locale es 'en'.
 *
 * Usamos un conjunto pequeño de voces Aura-2 EN para minimizar el riesgo
 * de referenciar un voice_id inexistente. Nombres conocidos y documentados
 * en la doc pública de Deepgram (aura-2 models):
 *  - aura-2-thalia-en:    female, warm/narrator
 *  - aura-2-andromeda-en: female, calm/serious
 *  - aura-2-helena-en:    female, professional
 *  - aura-2-orion-en:     male, deep/narrator
 *  - aura-2-atlas-en:     male, warm/conversational
 *  - aura-2-zeus-en:      male, epic/authoritative
 */
const DEEPGRAM_VOICES_EN: Record<string, string> = {
  // Narradores masculinos épicos — Zeus (autoritario) para lores épicos
  narrator_grave:   'aura-2-zeus-en',
  narrator_deep:    'aura-2-zeus-en',
  narrator_epic:    'aura-2-zeus-en',
  narrator_wise:    'aura-2-orion-en',
  skald_epic:       'aura-2-zeus-en',
  nordic_bard:      'aura-2-orion-en',

  // Whispery / tenso — Orion es más grave/whispery que Zeus
  whisper_dread:    'aura-2-orion-en',
  whisper_tense:    'aura-2-orion-en',
  whisper_survival: 'aura-2-orion-en',
  whisper_dark:     'aura-2-orion-en',
  tension_survival: 'aura-2-orion-en',

  // Cyberpunk — Atlas (conversational, moderno)
  synth_narrator:   'aura-2-atlas-en',

  // Isekai/anime — Atlas (young-ish male)
  anime_energetic:  'aura-2-atlas-en',
  anime_narrator:   'aura-2-atlas-en',

  // NPCs masculinos — variedad
  npc_male_1:       'aura-2-atlas-en',
  npc_male_2:       'aura-2-orion-en',
  npc_male_3:       'aura-2-atlas-en',
  npc_male_deep:    'aura-2-zeus-en',
  npc_male_young:   'aura-2-atlas-en',

  // NPCs femeninos
  npc_female_1:     'aura-2-thalia-en',
  npc_female_2:     'aura-2-helena-en',
  npc_female_3:     'aura-2-andromeda-en',
  npc_female_wise:  'aura-2-andromeda-en',
  npc_female_young: 'aura-2-thalia-en',

  npc_neutral_1:    'aura-2-atlas-en',
  default_es:       'aura-2-zeus-en', // (no se usa en EN, pero por si acaso)
  default_en:       'aura-2-zeus-en',
}

interface VoiceRequest {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  voice?: string
  speed?: number
}

/**
 * Returns the Fish Audio reference_id to use for a given voice key and locale.
 * For locale EN, prefers the FISH_AUDIO_VOICES_EN mapping if it has a real ID
 * configured; otherwise returns null to signal the caller should fall through
 * to Deepgram EN.
 */
function resolveFishAudioVoice(voiceKey: string, locale: 'es' | 'en'): string | null {
  if (locale === 'en') {
    const enId = FISH_AUDIO_VOICES_EN[voiceKey] ?? FISH_AUDIO_VOICES_EN.default_en
    return enId ?? null // null if not yet configured — caller must fall back
  }
  return FISH_AUDIO_VOICES[voiceKey] || FISH_AUDIO_VOICES.default_es
}

/**
 * Genera audio con Fish Audio S2-Pro (voces ultra naturales).
 * Retorna null si no hay una voz EN configurada para este voiceKey (el caller
 * debe caer a Deepgram EN en ese caso).
 */
async function generateWithFishAudio(
  text: string,
  voiceKey: string,
  locale: 'es' | 'en',
): Promise<Response | null> {
  const apiKey = process.env.FISH_AUDIO_API_KEY!
  const referenceId = resolveFishAudioVoice(voiceKey, locale)
  if (!referenceId) return null

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
 * Genera audio con Deepgram Aura-2.
 * Para locale EN usa voces inglesas nativas (aura-2-*-en), para ES usa las -es.
 */
async function generateWithDeepgram(
  text: string,
  voiceKey: string,
  locale: 'es' | 'en',
): Promise<Response> {
  const apiKey = process.env.DEEPGRAM_API_KEY!
  const voices = locale === 'en' ? DEEPGRAM_VOICES_EN : DEEPGRAM_VOICES
  const model = voices[voiceKey] || voices.default_en || voices.default_es

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

// Handle GET requests (browser prefetch, direct navigation) — redirect to home
export async function GET() {
  return Response.redirect(new URL('/', 'https://rol-hub.com'), 302)
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

    // Cache key incluye locale para que no sirvamos audio ES cuando piden EN ni viceversa.
    const cacheVoiceKey = `${voiceKey}__${locale}`

    // Check cache primero (ahorra tokens de Fish Audio / Deepgram)
    try {
      const cachedAudio = await getCachedAudio(text, cacheVoiceKey)
      if (cachedAudio) {
        console.log(`[Voice] Cache HIT for voice: ${cacheVoiceKey}, text: ${text.length} chars`)
        const base64Data = cachedAudio.replace(/^data:audio\/mp3;base64,/, '')
        const audioBuffer = Buffer.from(base64Data, 'base64')
        return new Response(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'X-Voice-Provider': 'cache',
            'X-Voice-Key': cacheVoiceKey,
          }
        })
      }
    } catch (cacheError) {
      console.log('[Voice] Cache miss, generating fresh audio')
    }

    let ttsResponse: Response = null as any
    let provider: string = 'unknown'

    // Rama EN: Deepgram primero (voces inglesas nativas), Fish Audio EN si hay IDs configurados.
    if (locale === 'en') {
      // 1. Intentar Fish Audio EN (solo funciona si hay IDs reales configurados — hoy son null)
      if (fishKey) {
        try {
          const fishRes = await generateWithFishAudio(text, voiceKey, 'en')
          if (fishRes && fishRes.ok) {
            ttsResponse = fishRes
            provider = 'fishaudio-en'
            console.log(`[Voice] Fish Audio EN success for voice: ${voiceKey}`)
          } else if (fishRes) {
            console.warn(`[Voice] Fish Audio EN returned non-ok: ${fishRes.status}`)
          }
          // Si fishRes es null, no hay voz EN configurada → fall through a Deepgram
        } catch (err) {
          console.warn('[Voice] Fish Audio EN error:', (err as Error).message)
        }
      }

      // 2. Deepgram EN como primary para inglés (voces inglesas nativas de Aura-2)
      if ((!ttsResponse || !ttsResponse.ok) && deepgramKey) {
        try {
          console.log(`[Voice] Deepgram EN, text: ${text.length} chars, voice: ${voiceKey}`)
          const ttsStart = Date.now()
          ttsResponse = await generateWithDeepgram(text, voiceKey, 'en')
          provider = 'deepgram-en'
          console.log(`[Voice] Deepgram EN took: ${Date.now() - ttsStart}ms`)
        } catch (err) {
          console.warn('[Voice] Deepgram EN error:', (err as Error).message)
        }
      }

      if (!ttsResponse || !ttsResponse.ok) {
        console.error('[Voice] All EN providers failed')
        return new Response(JSON.stringify({ error: 'Voice generation temporarily unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } else {
      // Rama ES: Fish Audio S2-Pro con reintentos (comportamiento original).
      const MAX_RETRIES = 2
      if (fishKey) {
        let lastError: string | null = null

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            if (attempt > 0) {
              console.log(`[Voice] Fish Audio retry ${attempt}/${MAX_RETRIES}...`)
              await new Promise(r => setTimeout(r, 500 * attempt))
            }

            console.log(`[Voice] Fish Audio S2-Pro (attempt ${attempt + 1}), text: ${text.length} chars, voice: ${voiceKey}`)
            const ttsStart = Date.now()
            const fishRes = await generateWithFishAudio(text, voiceKey, 'es')
            if (!fishRes) break // no debería pasar para ES, pero por seguridad
            ttsResponse = fishRes
            provider = 'fishaudio'
            console.log(`[Voice] Fish Audio took: ${Date.now() - ttsStart}ms`)

            if (ttsResponse.ok) break

            lastError = await ttsResponse.text()
            console.warn(`[Voice] Fish Audio failed (${ttsResponse.status}, attempt ${attempt + 1}): ${lastError}`)
          } catch (fishError) {
            lastError = (fishError as Error).message
            console.warn(`[Voice] Fish Audio error (attempt ${attempt + 1}):`, lastError)
          }
        }

        if (!ttsResponse || !ttsResponse.ok) {
          console.error(`[Voice] Fish Audio failed after ${MAX_RETRIES + 1} attempts: ${lastError}`)
          return new Response(JSON.stringify({ error: 'Voice generation temporarily unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      } else if (deepgramKey) {
        console.log(`[Voice] Using Deepgram ES (no Fish Audio key)`)
        const ttsStart = Date.now()
        ttsResponse = await generateWithDeepgram(text, voiceKey, 'es')
        provider = 'deepgram'
        console.log(`[Voice] Deepgram took: ${Date.now() - ttsStart}ms`)
      } else {
        return new Response(JSON.stringify({ error: 'No TTS provider available' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
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

    // Leer el audio completo para cachear y servir
    const audioBuffer = await ttsResponse.arrayBuffer()
    const audioBytes = Buffer.from(audioBuffer)

    // Cachear en background con cacheVoiceKey (incluye locale)
    const base64Url = `data:audio/mp3;base64,${audioBytes.toString('base64')}`
    cacheAudio(text, cacheVoiceKey, base64Url).catch(err =>
      console.warn('[Voice] Cache save failed:', err)
    )

    return new Response(audioBytes, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'X-Voice-Provider': provider,
        'X-Voice-Key': cacheVoiceKey,
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
