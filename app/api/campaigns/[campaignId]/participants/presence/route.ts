import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

interface RouteParams {
  params: Promise<{
    campaignId: string
  }>
}

// This endpoint is designed for sendBeacon API (fire-and-forget)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse(null, { status: 204 })
    }

    const { campaignId } = await params
    const body = await req.json()
    const { isOnline } = body as { isOnline: boolean }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new NextResponse(null, { status: 204 })
    }

    await prisma.campaignParticipant.update({
      where: {
        campaignId_userId: {
          campaignId,
          userId: user.id,
        },
      },
      data: {
        isOnline,
        lastSeenAt: new Date(),
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    // Silently fail for beacon requests
    return new NextResponse(null, { status: 204 })
  }
}
