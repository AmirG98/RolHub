import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import Anthropic from '@anthropic-ai/sdk'

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, campaignId, action } = body as {
      sessionId: string
      campaignId: string
      action: string
    }

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener la sesion con todos los datos necesarios
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        campaign: {
          include: {
            characters: true,
          },
        },
        turns: {
          orderBy: { createdAt: 'asc' },
          take: 10, // Ultimos 10 turnos para contexto
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Sesion no encontrada' }, { status: 404 })
    }

    // Verificar que el usuario es dueno de la sesion
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user || session.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // 1. Guardar el turno del jugador
    const playerTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: action,
      },
    })

    // 2. Preparar contexto para Claude
    const worldState = session.campaign.worldState as any
    const character = session.campaign.characters[0]

    // Construir historial de conversacion
    const conversationHistory = session.turns.slice(-6).map((turn) => ({
      role: turn.role === 'USER' ? 'user' : 'assistant',
      content: turn.content,
    }))

    // Agregar el turno actual del jugador
    conversationHistory.push({
      role: 'user',
      content: action,
    })

    // 3. Llamar a Claude para obtener la respuesta del DM
    const systemPrompt = `Sos el Dungeon Master de una partida de rol. Estas narrando una aventura en el mundo de ${session.campaign.lore}.

INFORMACION DEL MUNDO:
- Lore: ${session.campaign.lore}
- Motor de reglas: ${session.campaign.engine}
- Acto actual: ${worldState.act}/5
- Escena actual: ${worldState.current_scene}
- Tiempo: ${worldState.time_in_world}
- Clima: ${worldState.weather}

PERSONAJE DEL JUGADOR:
- Nombre: ${character.name}
- Arquetipo: ${character.archetype}
- HP: ${worldState.party?.[character.name]?.hp || (character.stats as any)?.hp + '/' + (character.stats as any)?.maxHp}
- Stats: Combate ${(character.stats as any)?.combat}, Exploracion ${(character.stats as any)?.exploration}, Social ${(character.stats as any)?.social}, Lore ${(character.stats as any)?.lore}

INSTRUCCIONES:
1. Narra la consecuencia de la accion del jugador de forma cinematografica y emocionante
2. Manten la coherencia con el lore de ${session.campaign.lore}
3. Si el motor es STORY_MODE, no uses dados - evalua narrativamente
4. Termina con una pregunta o situacion que invite a la siguiente accion
5. Usa un tono ${session.campaign.lore === 'LOTR' ? 'epico y mitico' : session.campaign.lore === 'ZOMBIES' ? 'tenso y survival horror' : session.campaign.lore === 'ISEKAI' ? 'anime y aventurero' : session.campaign.lore === 'VIKINGOS' ? 'brutal y honorable' : 'atmosferico'}
6. Escribe en espanol, 2-3 parrafos maximo

Narra lo que sucede a continuacion:`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory as any,
    })

    const dmNarration = response.content[0].type === 'text' ? response.content[0].text : ''

    // 4. Guardar el turno del DM
    await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'DM',
        content: dmNarration,
      },
    })

    // 5. Retornar exito
    return NextResponse.json({
      success: true,
      narration: dmNarration,
    })
  } catch (error) {
    console.error('Error processing turn:', error)
    return NextResponse.json(
      {
        error: 'Error al procesar el turno',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
