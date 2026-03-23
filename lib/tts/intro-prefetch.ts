/**
 * Pre-generación de audio para intros de sesión
 * Llama al endpoint /api/voice/stream internamente para generar y cachear el audio
 * del intro antes de que el jugador llegue a la pantalla de juego.
 */

import { Lore } from '@prisma/client'
import { getVoiceConfig } from '@/lib/tts/voice-config'
import { getCachedAudio } from '@/lib/cache/asset-cache'

/**
 * Obtiene la voice key del narrador para un lore y locale
 * Consistente con lo que VoicePlayerAuto y /api/voice/stream usarán
 */
export function getIntroVoiceKey(lore: Lore, locale: 'es' | 'en'): string {
  const voiceConfig = getVoiceConfig(lore, locale)
  return voiceConfig.voice
}

/**
 * Pre-genera y cachea el audio del intro
 * Hace un fetch interno a /api/voice/stream que se encarga de generar + cachear
 * No bloquea — diseñado para correr en background
 */
export async function prefetchIntroAudio(
  text: string,
  lore: Lore,
  locale: 'es' | 'en',
  baseUrl?: string
): Promise<void> {
  const voiceKey = getIntroVoiceKey(lore, locale)

  // Verificar si ya está cacheado
  const cached = await getCachedAudio(text, voiceKey)
  if (cached) {
    console.log(`[IntroAudio] Already cached for lore=${lore}, locale=${locale}`)
    return
  }

  // Generar via el endpoint interno
  const url = baseUrl
    ? `${baseUrl}/api/voice/stream`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/voice/stream`

  console.log(`[IntroAudio] Prefetching audio for lore=${lore}, locale=${locale}, text=${text.length} chars`)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      lore,
      locale,
      voice: 'narrator',
    }),
  })

  if (response.ok) {
    console.log(`[IntroAudio] Successfully prefetched for lore=${lore}`)
  } else {
    console.warn(`[IntroAudio] Prefetch failed (${response.status}) for lore=${lore}`)
  }
}
