import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { handleSceneImageRequest } from '@/lib/fal/scene-image-gen'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { prompt, lore, mood, locationName, quality } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 })
    }

    const result = await handleSceneImageRequest({
      prompt,
      lore: lore || 'LOTR',
      mood,
      locationName,
      quality,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating scene image:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar imagen' },
      { status: 500 }
    )
  }
}
