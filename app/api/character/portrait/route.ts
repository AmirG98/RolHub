import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  handleCharacterPortraitRequest,
  handleCachedCharacterPortraitRequest,
} from '@/lib/fal/character-portrait-gen'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { characterId, name, archetype, lore, description, gender, quality, forceRegenerate } = body

    if (!name || !archetype || !lore) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, archetype, lore' },
        { status: 400 }
      )
    }

    // Si hay characterId, usar versión con caché
    if (characterId) {
      const result = await handleCachedCharacterPortraitRequest({
        characterId,
        name,
        archetype,
        lore,
        description,
        gender,
        quality,
        forceRegenerate,
      })
      return NextResponse.json(result)
    }

    // Sin characterId, usar versión sin caché
    const result = await handleCharacterPortraitRequest({
      name,
      archetype,
      lore,
      description,
      gender,
      quality,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating character portrait:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar retrato' },
      { status: 500 }
    )
  }
}
