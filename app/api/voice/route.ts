/**
 * API Route: /api/voice
 * Genera audio TTS para las narraciones del DM
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Lore } from '@prisma/client'
import { getTTSProvider, getVoiceConfig, isVoiceEnabled, TTSError } from '@/lib/tts'

// Validar el request body
interface VoiceRequest {
  text: string
  lore: Lore
  locale: 'es' | 'en'
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar si la feature está habilitada
    if (!isVoiceEnabled()) {
      return NextResponse.json(
        { error: 'Voice feature is disabled' },
        { status: 503 }
      )
    }

    // Parsear body
    const body = await request.json() as VoiceRequest
    const { text, lore, locale } = body

    // Validaciones
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!lore || !['LOTR', 'ZOMBIES', 'ISEKAI', 'VIKINGOS', 'CUSTOM'].includes(lore)) {
      return NextResponse.json(
        { error: 'Valid lore is required' },
        { status: 400 }
      )
    }

    if (!locale || !['es', 'en'].includes(locale)) {
      return NextResponse.json(
        { error: 'Valid locale (es/en) is required' },
        { status: 400 }
      )
    }

    // Limitar longitud del texto (evitar abusos)
    const maxLength = 2000 // ~4 minutos de audio
    if (text.length > maxLength) {
      return NextResponse.json(
        { error: `Text too long. Maximum ${maxLength} characters.` },
        { status: 400 }
      )
    }

    // Obtener provider y configuración de voz
    const provider = getTTSProvider()
    const voiceConfig = getVoiceConfig(lore, locale)

    // Generar audio
    const result = await provider.generateSpeech(text, {
      voice: voiceConfig.voice,
      language: locale,
      speed: voiceConfig.speed,
      emotion: voiceConfig.emotion
    })

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      duration: result.duration,
      provider: result.provider,
      cached: result.cached
    })

  } catch (error) {
    console.error('[Voice API] Error:', error)

    // Manejo de errores específicos de TTS
    if (error instanceof TTSError) {
      const status = error.code === 'RATE_LIMITED' ? 429 :
                    error.code === 'PROVIDER_UNAVAILABLE' ? 503 : 500

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          provider: error.provider
        },
        { status }
      )
    }

    // Error genérico
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    )
  }
}

// Health check para el sistema de voz
export async function GET() {
  const provider = getTTSProvider()

  return NextResponse.json({
    enabled: isVoiceEnabled(),
    provider: provider.name,
    available: provider.isAvailable()
  })
}
