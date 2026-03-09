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
    const { sessionId, campaignId, action, diceRoll, characterId, locale = 'es' } = body as {
      sessionId: string
      campaignId: string
      action: string
      diceRoll?: DiceRoll
      characterId?: string  // For multiplayer - which character is acting
      locale?: 'es' | 'en'  // Language preference for narration
    }

    // Language-specific text
    const isEnglish = locale === 'en'

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

    // 3. Llamar a Claude para obtener la respuesta del DM
    // Language-specific labels
    const labels = isEnglish ? {
      dmRole: 'You are the Dungeon Master of a narrative RPG session',
      multiplayer: 'MULTIPLAYER',
      singlePlayer: 'SINGLE PLAYER',
      worldAndSetting: 'WORLD AND SETTING',
      lore: 'Lore',
      rulesEngine: 'Rules Engine',
      mode: 'Mode',
      oneShot: 'One-Shot (short adventure)',
      campaign: 'Campaign (long story)',
      type: 'Type',
      players: 'players',
      currentAct: 'Current Act',
      currentScene: 'Current Scene',
      time: 'Time',
      weather: 'Weather',
      actingCharacter: 'CHARACTER ACTING NOW',
      name: 'Name',
      player: 'Player',
      archetype: 'Archetype',
      level: 'Level',
      hp: 'HP',
      critical: 'CRITICAL - near death',
      wounded: 'wounded',
      healthy: 'healthy',
      stats: 'Stats',
      combat: 'Combat',
      exploration: 'Exploration',
      social: 'Social',
      inventory: 'Inventory',
      empty: 'empty',
      party: 'PARTY OF ADVENTURERS',
      activeQuests: 'ACTIVE QUESTS',
      none: 'none',
      diceRoll: 'PLAYER DICE ROLL',
      dice: 'dice',
      responseInstructions: 'RESPONSE INSTRUCTIONS',
      narrationInstructions: 'Your narration here (2-3 paragraphs, English, cinematic and exciting)',
      partyEffects: 'For effects on OTHER party members (not the one acting), use other_party_effects',
      mechanicRules: 'MECHANIC RULES',
      rule1: 'If there is combat and the player fails (low roll or bad decision), use negative hp_change (-1 to -5 depending on severity)',
      rule2: 'If the player does something heroic or has a good combat roll, they can gain an item',
      rule3: 'If the player completes an objective, mark quest_completed',
      rule4: 'When the location changes significantly, use scene_change',
      rule5: 'suggested_actions must have 3 options that make sense with the situation',
      rule6: 'In MULTIPLAYER: respond to the action but mention other characters if relevant',
      rule7: 'HP/item changes for the acting character go in hp_change/new_item',
      rule8: 'HP changes for OTHER characters go in other_party_effects',
      narrativeTone: 'NARRATIVE TONE',
      important: 'IMPORTANT',
      jsonOnly: 'Respond ONLY with JSON, no additional text',
      narrationLanguage: 'The narration must be in English',
      unconscious: 'If HP reaches 0, the character becomes unconscious (does not die immediately)',
      coherence: 'Maintain coherence with previous events',
      diceInterpret: 'Interpret the roll result',
      failure: 'failure',
      partialSuccess: 'partial success',
      success: 'success',
      criticalSuccess: 'critical success',
      noDice: 'No dice roll, evaluate narratively based on the character stats',
      actingNow: 'ACTING NOW',
    } : {
      dmRole: 'Sos el Dungeon Master de una partida de rol narrativo',
      multiplayer: 'MULTIJUGADOR',
      singlePlayer: 'UN SOLO JUGADOR',
      worldAndSetting: 'MUNDO Y AMBIENTACION',
      lore: 'Lore',
      rulesEngine: 'Motor de reglas',
      mode: 'Modo',
      oneShot: 'One-Shot (aventura corta)',
      campaign: 'Campaña (historia larga)',
      type: 'Tipo',
      players: 'jugadores',
      currentAct: 'Acto actual',
      currentScene: 'Escena actual',
      time: 'Tiempo',
      weather: 'Clima',
      actingCharacter: 'PERSONAJE QUE ACTÚA AHORA',
      name: 'Nombre',
      player: 'Jugador',
      archetype: 'Arquetipo',
      level: 'Nivel',
      hp: 'HP',
      critical: 'CRITICO - casi muerto',
      wounded: 'herido',
      healthy: 'saludable',
      stats: 'Stats',
      combat: 'Combate',
      exploration: 'Exploración',
      social: 'Social',
      inventory: 'Inventario',
      empty: 'vacío',
      party: 'GRUPO DE AVENTUREROS',
      activeQuests: 'MISIONES ACTIVAS',
      none: 'ninguna',
      diceRoll: 'TIRADA DE DADOS DEL JUGADOR',
      dice: 'dados',
      responseInstructions: 'INSTRUCCIONES DE RESPUESTA',
      narrationInstructions: 'Tu narración aquí (2-3 párrafos, español, cinematográfico y emocionante)',
      partyEffects: 'Para efectos en OTROS miembros del grupo (no el que actúa), usa other_party_effects',
      mechanicRules: 'REGLAS DE MECANICAS',
      rule1: 'Si hay combate y el jugador falla (tirada baja o mala decisión), usa hp_change negativo (-1 a -5 según gravedad)',
      rule2: 'Si el jugador hace algo heroico o tiene buena tirada en combate, puede ganar un item',
      rule3: 'Si el jugador resuelve un objetivo, marca quest_completed',
      rule4: 'Cuando cambie la ubicación significativamente, usa scene_change',
      rule5: 'suggested_actions debe tener 3 opciones que tengan sentido con la situación',
      rule6: 'En MULTIJUGADOR: responde a la acción pero menciona a los otros personajes si es relevante',
      rule7: 'Los cambios de HP/items del personaje que actúa van en hp_change/new_item',
      rule8: 'Los cambios de HP de OTROS personajes van en other_party_effects',
      narrativeTone: 'TONO NARRATIVO',
      important: 'IMPORTANTE',
      jsonOnly: 'Responde SOLO con el JSON, sin texto adicional',
      narrationLanguage: 'La narración debe ser en español',
      unconscious: 'Si el HP llega a 0, el personaje queda inconsciente (no muere inmediatamente)',
      coherence: 'Mantén coherencia con eventos anteriores',
      diceInterpret: 'Interpreta el resultado de la tirada',
      failure: 'fracaso',
      partialSuccess: 'éxito parcial',
      success: 'éxito',
      criticalSuccess: 'éxito crítico',
      noDice: 'Sin tirada de dados, evalúa narrativamente basándote en los stats del personaje',
      actingNow: 'ACTUANDO AHORA',
    }

    // Build dice roll info with correct language
    const diceRollInfoLocalized = diceRoll
      ? `\n\n${labels.diceRoll}: ${diceRoll.formula} = ${diceRoll.result} (${labels.dice}: ${diceRoll.rolls.join(', ')})`
      : ''

    // Build party info with correct language
    const partyInfoLocalized = isMultiplayer && partyMembers.length > 1
      ? `\n\n${labels.party} (${partyMembers.length} ${labels.players}):\n${partyMembers.map(m => {
          const [hp, maxHp] = m.hp.split('/').map(Number)
          const status = hp <= maxHp * 0.3 ? labels.critical : hp <= maxHp * 0.6 ? labels.wounded : labels.healthy
          return `- ${m.name} (${m.archetype}, ${isEnglish ? 'played by' : 'jugado por'} ${m.player}): HP ${m.hp} [${status}], ${labels.inventory}: ${m.inventory.length > 0 ? m.inventory.join(', ') : labels.empty}${m.isActing ? ` ← ${labels.actingNow}` : ''}`
        }).join('\n')}`
      : ''

    // Narrative tone based on lore
    const narrativeTone = isEnglish ? (
      session.campaign.lore === 'LOTR' ? 'Epic and mythical, like Tolkien. Elevated and poetic language.' :
      session.campaign.lore === 'ZOMBIES' ? 'Tense and survival horror. Scarce resources, constant danger, oppressive atmosphere.' :
      session.campaign.lore === 'ISEKAI' ? 'Anime and adventurous. Energetic, with humor but also epic moments.' :
      session.campaign.lore === 'VIKINGOS' ? 'Brutal and honorable. Blood, glory, destiny and the gods.' :
      session.campaign.lore === 'STAR_WARS' ? 'Epic space opera. The Force, good vs evil, intergalactic adventure.' :
      session.campaign.lore === 'CYBERPUNK' ? 'Dark and neo-noir. Technology, corporations, urban survival.' :
      session.campaign.lore === 'LOVECRAFT_HORROR' ? 'Cosmic horror. The unknown, fragile sanity, indescribable horrors.' :
      'Atmospheric and immersive'
    ) : (
      session.campaign.lore === 'LOTR' ? 'Épico y mítico, como Tolkien. Lenguaje elevado y poético.' :
      session.campaign.lore === 'ZOMBIES' ? 'Tenso y survival horror. Recursos escasos, peligro constante, atmósfera opresiva.' :
      session.campaign.lore === 'ISEKAI' ? 'Anime y aventurero. Energético, con humor pero también momentos épicos.' :
      session.campaign.lore === 'VIKINGOS' ? 'Brutal y honorable. Sangre, gloria, destino y los dioses.' :
      session.campaign.lore === 'STAR_WARS' ? 'Espacial épico. La Fuerza, el bien vs el mal, aventura intergaláctica.' :
      session.campaign.lore === 'CYBERPUNK' ? 'Oscuro y neo-noir. Tecnología, corporaciones, supervivencia urbana.' :
      session.campaign.lore === 'LOVECRAFT_HORROR' ? 'Horror cósmico. Lo desconocido, cordura frágil, horrores indescriptibles.' :
      'Atmosférico y envolvente'
    )

    const systemPrompt = `${labels.dmRole}${isMultiplayer ? ` ${labels.multiplayer}` : ''}. ${isEnglish ? 'Your role is to create an immersive and exciting experience.' : 'Tu rol es crear una experiencia inmersiva y emocionante.'}

${labels.worldAndSetting}:
- ${labels.lore}: ${session.campaign.lore}
- ${labels.rulesEngine}: ${session.campaign.engine}
- ${labels.mode}: ${session.campaign.mode === 'ONE_SHOT' ? labels.oneShot : labels.campaign}
${isMultiplayer ? `- ${labels.type}: ${labels.multiplayer} (${partyMembers.length} ${labels.players})` : `- ${labels.type}: ${labels.singlePlayer}`}
- ${labels.currentAct}: ${worldState.act}/5
- ${labels.currentScene}: ${worldState.current_scene}
- ${labels.time}: ${worldState.time_in_world}
- ${labels.weather}: ${worldState.weather}

${labels.actingCharacter}:
- ${labels.name}: ${character.name}
- ${labels.player}: ${actingPlayer}
- ${labels.archetype}: ${character.archetype}
- ${labels.level}: ${character.level}
- ${labels.hp}: ${currentHP} (${currentHPNum <= maxHPNum * 0.3 ? labels.critical : currentHPNum <= maxHPNum * 0.6 ? labels.wounded : labels.healthy})
- ${labels.stats}: ${labels.combat} ${(character.stats as any)?.combat}/5, ${labels.exploration} ${(character.stats as any)?.exploration}/5, ${labels.social} ${(character.stats as any)?.social}/5, Lore ${(character.stats as any)?.lore}/5
- ${labels.inventory}: ${inventory.length > 0 ? inventory.join(', ') : labels.empty}
${partyInfoLocalized}

${labels.activeQuests}: ${(worldState.active_quests || []).join(', ') || labels.none}
${diceRollInfoLocalized}

${labels.responseInstructions}:
${isEnglish ? 'You must ALWAYS respond in JSON format with this exact structure' : 'Debes responder SIEMPRE en formato JSON con esta estructura exacta'}:
{
  "narration": "${labels.narrationInstructions}",
  "character_name": "${character.name}",
  "hp_change": 0,
  "hp_reason": null,
  "new_item": null,
  "remove_item": null,
  "quest_completed": null,
  "new_quest": null,
  "scene_change": null,
  "suggested_actions": ["${isEnglish ? 'action 1' : 'acción 1'}", "${isEnglish ? 'action 2' : 'acción 2'}", "${isEnglish ? 'action 3' : 'acción 3'}"]${isMultiplayer ? `,
  "other_party_effects": []` : ''}
}
${isMultiplayer ? `
${labels.partyEffects}:
[{"character_name": "${isEnglish ? 'Name' : 'Nombre'}", "hp_change": -2, "reason": "${isEnglish ? 'reason' : 'razón'}"}, ...]
` : ''}

${labels.mechanicRules}:
1. ${labels.rule1}
2. ${labels.rule2}
3. ${labels.rule3}
4. ${labels.rule4}
5. ${labels.rule5}
${isMultiplayer ? `6. ${labels.rule6} ${character.name}
7. ${labels.rule7}
8. ${labels.rule8}` : ''}

${labels.narrativeTone}:
${narrativeTone}

${labels.important}:
- ${labels.jsonOnly}
- ${labels.narrationLanguage}
- ${labels.unconscious}
- ${labels.coherence}
- ${diceRoll ? `${labels.diceInterpret} (${diceRoll.result}): 1-5 ${labels.failure}, 6-10 ${labels.partialSuccess}, 11-15 ${labels.success}, 16-20 ${labels.criticalSuccess}` : labels.noDice}`

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
