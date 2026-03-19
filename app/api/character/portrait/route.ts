import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { handleCharacterPortraitRequest } from '@/lib/fal/character-portrait-gen'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { name, archetype, lore, description, gender, quality } = body

    if (!name || !archetype || !lore) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, archetype, lore' },
        { status: 400 }
      )
    }

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
