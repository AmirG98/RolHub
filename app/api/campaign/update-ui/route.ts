import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

// Mini endpoint para persistir estado de UI en worldState (imagen de escena, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const { userId: authUserId } = await auth()
    if (!authUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { campaignId, lastSceneImage } = await req.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId requerido' }, { status: 400 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { worldState: true, userId: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    const worldState = campaign.worldState as Record<string, any>

    // Actualizar solo campos de UI
    if (lastSceneImage !== undefined) {
      worldState.last_scene_image = lastSceneImage
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { worldState },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating UI state:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
