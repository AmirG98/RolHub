import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import Anthropic from '@anthropic-ai/sdk'

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface DiceRoll {
  formula: string
  result: number
  rolls: number[]
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, campaignId, action, diceRoll, characterId } = body as {
      sessionId: string
      campaignId: string
      action: string
      diceRoll?: DiceRoll
      characterId?: string  // For multiplayer - which character is acting
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
            participants: {
              include: {
                user: {
                  select: { id: true, username: true },
                },
                character: true,
              },
            },
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

    // Get the user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check access: user must be session owner OR a campaign participant
    const isOwner = session.userId === user.id
    const participant = session.campaign.participants.find(p => p.userId === user.id)

    if (!isOwner && !participant) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Determine which character is acting
    // For multiplayer: use the participant's character or the one specified
    // For single player: use the first character
    const isMultiplayer = session.campaign.isMultiplayer
    let actingCharacter = session.campaign.characters[0]
    let actingPlayer = user.username

    if (isMultiplayer && participant?.character) {
      actingCharacter = participant.character
      actingPlayer = participant.user?.username || user.username
    } else if (characterId) {
      const specifiedChar = session.campaign.characters.find(c => c.id === characterId)
      if (specifiedChar) actingCharacter = specifiedChar
    }

    // 1. Guardar el turno del jugador con info de multiplayer
    const playerTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: action,
        diceRolls: diceRoll ? JSON.parse(JSON.stringify(diceRoll)) : undefined,
        // Multiplayer fields
        participantId: participant?.id,
        characterId: actingCharacter?.id,
        characterName: actingCharacter?.name,
        playerName: actingPlayer,
      },
    })

    // 2. Preparar contexto para Claude
    const worldState = session.campaign.worldState as any
    const character = actingCharacter

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

    // Preparar info del dice roll si existe
    const diceRollInfo = diceRoll
      ? `\n\nTIRADA DE DADOS DEL JUGADOR: ${diceRoll.formula} = ${diceRoll.result} (dados: ${diceRoll.rolls.join(', ')})`
      : ''

    // Obtener el HP actual
    const currentHP = worldState.party?.[character.name]?.hp || `${(character.stats as any)?.hp || 20}/${(character.stats as any)?.maxHp || 20}`
    const [currentHPNum, maxHPNum] = currentHP.split('/').map(Number)

    // Obtener inventario
    const inventory = worldState.party?.[character.name]?.inventory || (character as any).inventory || []

    // Build party info for multiplayer
    const partyMembers = isMultiplayer
      ? session.campaign.participants
          .filter(p => p.character)
          .map(p => {
            const charStats = p.character!.stats as any
            const charHP = worldState.party?.[p.character!.name]?.hp || `${charStats?.hp || 20}/${charStats?.maxHp || 20}`
            const charInventory = worldState.party?.[p.character!.name]?.inventory || (p.character as any)?.inventory || []
            return {
              name: p.character!.name,
              archetype: p.character!.archetype,
              player: p.user?.username || 'Jugador',
              hp: charHP,
              stats: charStats,
              inventory: charInventory,
              isActing: p.character!.id === character.id,
            }
          })
      : []

    const partyInfo = isMultiplayer && partyMembers.length > 1
      ? `\n\nGRUPO DE AVENTUREROS (${partyMembers.length} jugadores):\n${partyMembers.map(m => {
          const [hp, maxHp] = m.hp.split('/').map(Number)
          const status = hp <= maxHp * 0.3 ? 'CRITICO' : hp <= maxHp * 0.6 ? 'herido' : 'saludable'
          return `- ${m.name} (${m.archetype}, jugado por ${m.player}): HP ${m.hp} [${status}], Inventario: ${m.inventory.length > 0 ? m.inventory.join(', ') : 'vacío'}${m.isActing ? ' ← ACTUANDO AHORA' : ''}`
        }).join('\n')}`
      : ''

    // 3. Llamar a Claude para obtener la respuesta del DM
    const systemPrompt = `Sos el Dungeon Master de una partida de rol narrativo${isMultiplayer ? ' MULTIJUGADOR' : ''}. Tu rol es crear una experiencia inmersiva y emocionante.

MUNDO Y AMBIENTACION:
- Lore: ${session.campaign.lore}
- Motor de reglas: ${session.campaign.engine}
- Modo: ${session.campaign.mode === 'ONE_SHOT' ? 'One-Shot (aventura corta)' : 'Campaña (historia larga)'}
${isMultiplayer ? `- Tipo: MULTIJUGADOR (${partyMembers.length} jugadores)` : '- Tipo: UN SOLO JUGADOR'}
- Acto actual: ${worldState.act}/5
- Escena actual: ${worldState.current_scene}
- Tiempo: ${worldState.time_in_world}
- Clima: ${worldState.weather}

PERSONAJE QUE ACTÚA AHORA:
- Nombre: ${character.name}
- Jugador: ${actingPlayer}
- Arquetipo: ${character.archetype}
- Nivel: ${character.level}
- HP: ${currentHP} (${currentHPNum <= maxHPNum * 0.3 ? 'CRITICO - casi muerto' : currentHPNum <= maxHPNum * 0.6 ? 'herido' : 'saludable'})
- Stats: Combate ${(character.stats as any)?.combat}/5, Exploración ${(character.stats as any)?.exploration}/5, Social ${(character.stats as any)?.social}/5, Lore ${(character.stats as any)?.lore}/5
- Inventario: ${inventory.length > 0 ? inventory.join(', ') : 'vacío'}
${partyInfo}

MISIONES ACTIVAS: ${(worldState.active_quests || []).join(', ') || 'ninguna'}
${diceRollInfo}

INSTRUCCIONES DE RESPUESTA:
Debes responder SIEMPRE en formato JSON con esta estructura exacta:
{
  "narration": "Tu narración aquí (2-3 párrafos, español, cinematográfico y emocionante)",
  "character_name": "${character.name}",
  "hp_change": 0,
  "hp_reason": null,
  "new_item": null,
  "remove_item": null,
  "quest_completed": null,
  "new_quest": null,
  "scene_change": null,
  "suggested_actions": ["acción 1", "acción 2", "acción 3"]${isMultiplayer ? `,
  "other_party_effects": []` : ''}
}
${isMultiplayer ? `
Para efectos en OTROS miembros del grupo (no el que actúa), usa other_party_effects:
[{"character_name": "Nombre", "hp_change": -2, "reason": "razón"}, ...]
` : ''}

REGLAS DE MECANICAS:
1. Si hay combate y el jugador falla (tirada baja o mala decisión), usa hp_change negativo (-1 a -5 según gravedad)
2. Si el jugador hace algo heroico o tiene buena tirada en combate, puede ganar un item
3. Si el jugador resuelve un objetivo, marca quest_completed
4. Cuando cambie la ubicación significativamente, usa scene_change
5. suggested_actions debe tener 3 opciones que tengan sentido con la situación
${isMultiplayer ? `6. En MULTIJUGADOR: responde a la acción de ${character.name} pero menciona a los otros personajes si es relevante
7. Los cambios de HP/items del personaje que actúa van en hp_change/new_item
8. Los cambios de HP de OTROS personajes van en other_party_effects` : ''}

TONO NARRATIVO:
${session.campaign.lore === 'LOTR' ? 'Épico y mítico, como Tolkien. Lenguaje elevado y poético.' :
  session.campaign.lore === 'ZOMBIES' ? 'Tenso y survival horror. Recursos escasos, peligro constante, atmósfera opresiva.' :
  session.campaign.lore === 'ISEKAI' ? 'Anime y aventurero. Energético, con humor pero también momentos épicos.' :
  session.campaign.lore === 'VIKINGOS' ? 'Brutal y honorable. Sangre, gloria, destino y los dioses.' :
  session.campaign.lore === 'STAR_WARS' ? 'Espacial épico. La Fuerza, el bien vs el mal, aventura intergaláctica.' :
  session.campaign.lore === 'CYBERPUNK' ? 'Oscuro y neo-noir. Tecnología, corporaciones, supervivencia urbana.' :
  session.campaign.lore === 'LOVECRAFT_HORROR' ? 'Horror cósmico. Lo desconocido, cordura frágil, horrores indescriptibles.' :
  'Atmosférico y envolvente'}

IMPORTANTE:
- Responde SOLO con el JSON, sin texto adicional
- La narración debe ser en español
- Si el HP llega a 0, el personaje queda inconsciente (no muere inmediatamente)
- Mantén coherencia con eventos anteriores
- ${diceRoll ? `Interpreta el resultado de la tirada (${diceRoll.result}): 1-5 fracaso, 6-10 éxito parcial, 11-15 éxito, 16-20 éxito crítico` : 'Sin tirada de dados, evalúa narrativamente basándote en los stats del personaje'}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: conversationHistory as any,
    })

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response from DM
    let dmResponse: {
      narration: string
      character_name?: string
      hp_change?: number
      hp_reason?: string | null
      new_item?: string | null
      remove_item?: string | null
      quest_completed?: string | null
      new_quest?: string | null
      scene_change?: string | null
      suggested_actions?: string[]
      other_party_effects?: Array<{
        character_name: string
        hp_change: number
        reason?: string
      }>
    }

    try {
      // Try to parse as JSON, fallback to raw text
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        dmResponse = JSON.parse(jsonMatch[0])
      } else {
        dmResponse = { narration: rawResponse }
      }
    } catch {
      dmResponse = { narration: rawResponse }
    }

    // Calculate world state updates
    const worldStateUpdates: Record<string, any> = {}

    // Update HP if changed
    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const newHP = Math.max(0, Math.min(maxHPNum, currentHPNum + dmResponse.hp_change))
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      worldStateUpdates.party[character.name].hp = `${newHP}/${maxHPNum}`
    }

    // Update inventory
    if (dmResponse.new_item) {
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      const currentInventory = worldStateUpdates.party[character.name].inventory || inventory
      worldStateUpdates.party[character.name].inventory = [...currentInventory, dmResponse.new_item]
    }

    if (dmResponse.remove_item) {
      if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
      if (!worldStateUpdates.party[character.name]) {
        worldStateUpdates.party[character.name] = { ...worldState.party?.[character.name] }
      }
      const currentInventory = worldStateUpdates.party[character.name].inventory || inventory
      worldStateUpdates.party[character.name].inventory = currentInventory.filter((i: string) => i !== dmResponse.remove_item)
    }

    // Update quests
    if (dmResponse.quest_completed) {
      worldStateUpdates.active_quests = (worldState.active_quests || []).filter(
        (q: string) => q !== dmResponse.quest_completed
      )
      worldStateUpdates.completed_quests = [
        ...(worldState.completed_quests || []),
        dmResponse.quest_completed
      ]
    }

    if (dmResponse.new_quest) {
      worldStateUpdates.active_quests = [
        ...(worldState.active_quests || []),
        dmResponse.new_quest
      ]
    }

    // Update scene
    if (dmResponse.scene_change) {
      worldStateUpdates.current_scene = dmResponse.scene_change
    }

    // Handle other party effects in multiplayer
    if (isMultiplayer && dmResponse.other_party_effects && dmResponse.other_party_effects.length > 0) {
      for (const effect of dmResponse.other_party_effects) {
        const targetChar = partyMembers.find(m => m.name === effect.character_name)
        if (targetChar && effect.hp_change) {
          const [currentHP, maxHP] = targetChar.hp.split('/').map(Number)
          const newHP = Math.max(0, Math.min(maxHP, currentHP + effect.hp_change))

          if (!worldStateUpdates.party) worldStateUpdates.party = { ...worldState.party }
          if (!worldStateUpdates.party[effect.character_name]) {
            worldStateUpdates.party[effect.character_name] = { ...worldState.party?.[effect.character_name] }
          }
          worldStateUpdates.party[effect.character_name].hp = `${newHP}/${maxHP}`
        }
      }
    }

    // Update campaign world state if there are updates
    if (Object.keys(worldStateUpdates).length > 0) {
      const newWorldState = {
        ...worldState,
        ...worldStateUpdates,
        party: {
          ...worldState.party,
          ...worldStateUpdates.party,
        },
      }

      await prisma.campaign.update({
        where: { id: session.campaignId },
        data: { worldState: newWorldState },
      })
    }

    // Build the full narration with HP change notification
    let fullNarration = dmResponse.narration
    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const changeText = dmResponse.hp_change > 0
        ? `+${dmResponse.hp_change} HP`
        : `${dmResponse.hp_change} HP`
      const reason = dmResponse.hp_reason ? ` (${dmResponse.hp_reason})` : ''
      fullNarration += `\n\n[${changeText}${reason}]`
    }

    // 4. Guardar el turno del DM
    await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'DM',
        content: fullNarration,
        worldStatePatch: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
      },
    })

    // 5. Retornar exito con world state updates
    return NextResponse.json({
      success: true,
      narration: fullNarration,
      worldStateUpdates: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
      suggestedActions: dmResponse.suggested_actions,
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
