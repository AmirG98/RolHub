import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

interface RouteParams {
  params: Promise<{
    inviteCode: string
  }>
}

// GET campaign info by invite code (public - no auth required)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { inviteCode } = await params

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Código de invitación requerido' },
        { status: 400 }
      )
    }

    // Find the campaign by invite code
    const campaign = await prisma.campaign.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      include: {
        participants: {
          where: {
            role: { in: ['OWNER', 'PLAYER'] },
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Código de invitación inválido o expirado' },
        { status: 404 }
      )
    }

    if (!campaign.isMultiplayer) {
      return NextResponse.json(
        { error: 'Esta campaña no acepta jugadores adicionales' },
        { status: 400 }
      )
    }

    // Return public campaign info (no sensitive data)
    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        lore: campaign.lore,
        playerCount: campaign.participants.length,
        maxPlayers: campaign.maxPlayers,
        createdBy: campaign.user.username,
        status: campaign.status,
      },
    })
  } catch (error) {
    console.error('Error fetching campaign by invite code:', error)
    return NextResponse.json(
      { error: 'Error al obtener información de la campaña' },
      { status: 500 }
    )
  }
}
