import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { Lore } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ characters: [] })
    }

    // Get optional lore filter from query params
    const { searchParams } = new URL(req.url)
    const loreFilter = searchParams.get('lore') as Lore | null

    const whereClause: any = { userId: user.id }
    if (loreFilter) {
      whereClause.lore = loreFilter
    }

    const characters = await prisma.character.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: { name: true, lore: true, status: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ characters })

  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}
