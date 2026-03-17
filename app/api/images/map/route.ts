import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  generateMapImageWithFallback,
  generateLocationImageWithFallback,
  type MapImageOptions,
  type LocationImageOptions,
} from '@/lib/fal/map-image-gen'
import { type Lore } from '@/lib/maps/map-config'

// Generar imagen de mapa mundial
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { type, lore, locationName, locationType, description, width, height } = body as {
      type: 'world_map' | 'location'
      lore: Lore
      locationName?: string
      locationType?: string
      description?: string
      width?: number
      height?: number
    }

    if (!type || !lore) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: type, lore' },
        { status: 400 }
      )
    }

    if (type === 'world_map') {
      // Generar imagen del mapa mundial
      const options: MapImageOptions = {
        lore,
        width: width || 1024,
        height: height || 768,
      }

      const result = await generateMapImageWithFallback(options)

      return NextResponse.json({
        success: true,
        imageUrl: result.url,
        isGenerated: result.isGenerated,
        type: 'world_map',
      })
    }

    if (type === 'location') {
      // Validar campos requeridos para ubicación
      if (!locationName || !locationType) {
        return NextResponse.json(
          { error: 'Para type=location, se requiere locationName y locationType' },
          { status: 400 }
        )
      }

      const options: LocationImageOptions = {
        lore,
        locationName,
        locationType,
        description,
        width: width || 1024,
        height: height || 576,
      }

      const result = await generateLocationImageWithFallback(options)

      if (!result.url) {
        return NextResponse.json({
          success: false,
          error: 'No se pudo generar la imagen',
          isGenerated: false,
        })
      }

      return NextResponse.json({
        success: true,
        imageUrl: result.url,
        isGenerated: result.isGenerated,
        type: 'location',
      })
    }

    return NextResponse.json(
      { error: 'Tipo no válido. Usa "world_map" o "location"' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error generando imagen de mapa:', error)

    // Devolver error con mensaje descriptivo medieval
    return NextResponse.json(
      {
        success: false,
        error: 'Las runas de creación fallaron momentáneamente...',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Obtener estado del servicio de imágenes
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si FAL_KEY está configurada
    const isConfigured = !!process.env.FAL_KEY

    return NextResponse.json({
      service: 'fal-ai',
      model: 'flux-pro',
      configured: isConfigured,
      features: {
        worldMap: true,
        locationImages: true,
        stylesByLore: [
          'LOTR',
          'ZOMBIES',
          'ISEKAI',
          'VIKINGOS',
          'STAR_WARS',
          'CYBERPUNK',
          'LOVECRAFT_HORROR',
        ],
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno', details: error.message },
      { status: 500 }
    )
  }
}
