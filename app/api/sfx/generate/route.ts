import { NextRequest, NextResponse } from 'next/server'
import { getCachedAsset, setCachedAsset } from '@/lib/cache/asset-cache'
import { getAmbientPrompt } from '@/lib/audio/ambient-prompts'

/**
 * Genera sonidos ambientales usando Fal.ai CassetteAI
 * Los sonidos se cachean en DB por combinación lore × mood
 * Segunda generación del mismo combo es instantánea (cache hit)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lore, mood } = body as { lore: string; mood: string }

    if (!lore || !mood) {
      return NextResponse.json({ error: 'Missing lore or mood' }, { status: 400 })
    }

    const FAL_KEY = process.env.FAL_KEY
    if (!FAL_KEY) {
      return NextResponse.json({ error: 'SFX generation not configured' }, { status: 503 })
    }

    // Clave de cache: sfx:LORE:mood
    const cacheKey = `sfx:${lore}:${mood}`

    // Buscar en cache primero
    try {
      const cached = await getCachedAsset('AUDIO', cacheKey)
      if (cached?.url) {
        console.log(`[SFX] Cache HIT: ${cacheKey}`)
        return NextResponse.json({ url: cached.url, fromCache: true })
      }
    } catch {
      // Cache miss, continuar con generación
    }

    console.log(`[SFX] Cache MISS: ${cacheKey}, generating...`)

    // Obtener prompt para esta combinación
    const prompt = getAmbientPrompt(lore, mood)

    // Generar con Fal.ai CassetteAI
    const startTime = Date.now()
    const response = await fetch('https://fal.run/cassetteai/sound-effects-generator', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration: 15, // 15 segundos — suficiente para loop
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[SFX] Fal.ai error (${response.status}):`, errorText)
      return NextResponse.json({ error: 'SFX generation failed' }, { status: 502 })
    }

    const result = await response.json()
    const audioUrl = result.audio?.url || result.audio_file?.url || result.url

    if (!audioUrl) {
      console.error('[SFX] No audio URL in response:', JSON.stringify(result).substring(0, 200))
      return NextResponse.json({ error: 'No audio in response' }, { status: 502 })
    }

    console.log(`[SFX] Generated in ${Date.now() - startTime}ms: ${audioUrl.substring(0, 60)}`)

    // Cachear en DB para reutilizar (no expira)
    try {
      await setCachedAsset('AUDIO', cacheKey, audioUrl, {
        prompt,
        metadata: { lore, mood } as any,
      })
      console.log(`[SFX] Cached: ${cacheKey}`)
    } catch (cacheErr) {
      console.warn('[SFX] Cache save failed:', cacheErr)
    }

    return NextResponse.json({ url: audioUrl, fromCache: false })
  } catch (error) {
    console.error('[SFX] Error:', error)
    return NextResponse.json(
      { error: 'SFX generation error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
