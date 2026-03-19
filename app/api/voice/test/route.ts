/**
 * Test endpoint para verificar que la voz funciona
 * GET /api/voice/test
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const deepgramKey = process.env.DEEPGRAM_API_KEY

  if (!deepgramKey) {
    return NextResponse.json({
      success: false,
      error: 'DEEPGRAM_API_KEY not configured',
      hint: 'Add DEEPGRAM_API_KEY to Vercel environment variables'
    }, { status: 500 })
  }

  try {
    const startTime = Date.now()

    const response = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-2-nestor-es&encoding=mp3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Prueba de audio.' }),
      }
    )

    const elapsed = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `Deepgram API error: ${response.status}`,
        details: errorText,
        elapsed_ms: elapsed
      }, { status: response.status })
    }

    // Get audio size
    const audioBuffer = await response.arrayBuffer()

    return NextResponse.json({
      success: true,
      message: 'Voice API is working!',
      elapsed_ms: elapsed,
      audio_size_bytes: audioBuffer.byteLength,
      deepgram_key_prefix: deepgramKey.substring(0, 8) + '...'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
