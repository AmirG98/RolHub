import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
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

    const characters = await prisma.character.findMany({
      where: { userId: user.id },
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
