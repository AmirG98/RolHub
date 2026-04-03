import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { campaignId, characterName, chosenStat } = body as {
      campaignId: string
      characterName: string
      chosenStat: string
    }

    if (!campaignId || !characterName || !chosenStat) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Cargar campaña y validar
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { worldState: true, userId: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const worldState = campaign.worldState as any
    const pendingLevelUp = worldState?.pendingLevelUp

    if (!pendingLevelUp || pendingLevelUp.characterName !== characterName) {
      return NextResponse.json({ error: 'No pending level-up' }, { status: 400 })
    }

    // Validar que la stat elegida es una opción válida
    if (!pendingLevelUp.statOptions.includes(chosenStat)) {
      return NextResponse.json({ error: 'Invalid stat choice' }, { status: 400 })
    }

    // Aplicar el stat boost
    const party = { ...worldState.party }
    const charData = { ...party[characterName] }
    const statBonus = pendingLevelUp.statBonus || 1

    charData[chosenStat] = (charData[chosenStat] || 0) + statBonus

    // Para D&D 5e, recalcular el modifier
    if (pendingLevelUp.engine === 'DND_5E') {
      const modKey = chosenStat.toLowerCase() + 'Mod'
      charData[modKey] = Math.floor((charData[chosenStat] - 10) / 2)
    }

    party[characterName] = charData

    // Guardar worldState sin pendingLevelUp
    const newWorldState = {
      ...worldState,
      party,
      pendingLevelUp: undefined,
    }
    delete newWorldState.pendingLevelUp

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { worldState: newWorldState },
    })

    return NextResponse.json({
      success: true,
      chosenStat,
      statBonus,
      newValue: charData[chosenStat],
    })
  } catch (error) {
    console.error('Error applying level-up:', error)
    return NextResponse.json({ error: 'Error applying level-up' }, { status: 500 })
  }
}
