import { NextRequest, NextResponse } from 'next/server'

// Import all lore files
import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'

const LORE_DATA: Record<string, any> = {
  lotr: lotrData,
  zombies: zombiesData,
  isekai: isekaiData,
  vikingos: vikingosData,
  star_wars: starwarsData,
  starwars: starwarsData,
  cyberpunk: cyberpunkData,
  lovecraft_horror: lovecraftData,
  lovecraft: lovecraftData,
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ loreId: string }> }
) {
  try {
    const { loreId } = await params
    const loreKey = loreId.toLowerCase()

    const loreData = LORE_DATA[loreKey]

    if (!loreData) {
      return NextResponse.json(
        { error: 'Lore no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      archetypes: loreData.archetypes || [],
      loreName: loreData.name,
    })
  } catch (error) {
    console.error('Error fetching archetypes:', error)
    return NextResponse.json(
      { error: 'Error al obtener arquetipos' },
      { status: 500 }
    )
  }
}
