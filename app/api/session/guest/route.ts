import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getEngineConfig, GameEngine, Locale, EngineContext, DiceRoll as EngineDiceRoll } from '@/lib/engines'

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface DiceRoll {
  formula: string
  result: number
  rolls: number[]
}

interface GuestCharacter {
  name: string
  archetype: string
  level: number
  stats: Record<string, number>
  inventory: string[]
}

interface GuestTurn {
  id: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  diceRoll?: DiceRoll
  createdAt: string
}

interface GuestWorldState {
  current_scene?: string
  time_in_world?: string
  weather?: string
  act?: number
  active_quests?: string[]
  completed_quests?: string[]
  party?: Record<string, any>
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      diceRoll,
      lore,
      engine,
      character,
      worldState,
      previousTurns,
      locale = 'es'
    } = body as {
      action: string
      diceRoll?: DiceRoll
      lore: string
      engine: string
      character: GuestCharacter
      worldState: GuestWorldState
      previousTurns: GuestTurn[]
      locale?: 'es' | 'en'
    }

    const isEnglish = locale === 'en'

    if (!action || !character) {
      return NextResponse.json(
        { error: isEnglish ? 'Missing required fields' : 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Build conversation history from previous turns
    const conversationHistory = (previousTurns || []).map(turn => ({
      role: turn.role === 'USER' ? 'user' : 'assistant',
      content: turn.content,
    }))

    // Add current action
    conversationHistory.push({
      role: 'user',
      content: action,
    })

    // Calculate HP
    const currentHP = character.stats?.hp || 20
    const maxHP = character.stats?.maxHp || 20
    const inventory = character.inventory || []

    // Language-specific labels
    const labels = isEnglish ? {
      dmRole: 'You are the Dungeon Master of a narrative RPG session for a GUEST player. Keep responses engaging but concise.',
      worldAndSetting: 'WORLD AND SETTING',
      lore: 'Lore',
      rulesEngine: 'Rules Engine',
      mode: 'Mode',
      oneShot: 'One-Shot (short adventure)',
      currentAct: 'Current Act',
      currentScene: 'Current Scene',
      time: 'Time',
      weather: 'Weather',
      character: 'PLAYER CHARACTER',
      name: 'Name',
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
      loreStat: 'Lore',
      inventory: 'Inventory',
      empty: 'empty',
      activeQuests: 'ACTIVE QUESTS',
      none: 'none',
      diceRoll: 'PLAYER DICE ROLL',
      dice: 'dice',
      responseInstructions: 'RESPONSE INSTRUCTIONS',
      narrationInstructions: 'Your narration here (2-3 paragraphs, English, cinematic and exciting)',
      mechanicRules: 'MECHANIC RULES',
      rule1: 'If there is combat and the player fails, describe the consequence narratively',
      rule2: 'If the player does something heroic, reward them appropriately',
      rule3: 'Keep the action moving - this is a demo session',
      rule4: 'suggested_actions must have 3 options that make sense with the situation',
      narrativeTone: 'NARRATIVE TONE',
      important: 'IMPORTANT',
      jsonOnly: 'Respond ONLY with JSON, no additional text',
      narrationLanguage: 'The narration must be in English',
      coherence: 'Maintain coherence with previous events',
      diceInterpret: 'Interpret the roll result',
      failure: 'failure',
      partialSuccess: 'partial success',
      success: 'success',
      criticalSuccess: 'critical success',
      noDice: 'No dice roll, evaluate narratively based on the character stats',
    } : {
      dmRole: 'Sos el Dungeon Master de una partida de rol narrativo para un jugador INVITADO. Mantené las respuestas atrapantes pero concisas.',
      worldAndSetting: 'MUNDO Y AMBIENTACION',
      lore: 'Lore',
      rulesEngine: 'Motor de reglas',
      mode: 'Modo',
      oneShot: 'One-Shot (aventura corta)',
      currentAct: 'Acto actual',
      currentScene: 'Escena actual',
      time: 'Tiempo',
      weather: 'Clima',
      character: 'PERSONAJE DEL JUGADOR',
      name: 'Nombre',
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
      loreStat: 'Lore',
      inventory: 'Inventario',
      empty: 'vacío',
      activeQuests: 'MISIONES ACTIVAS',
      none: 'ninguna',
      diceRoll: 'TIRADA DE DADOS DEL JUGADOR',
      dice: 'dados',
      responseInstructions: 'INSTRUCCIONES DE RESPUESTA',
      narrationInstructions: 'Tu narración aquí (2-3 párrafos, español, cinematográfico y emocionante)',
      mechanicRules: 'REGLAS DE MECANICAS',
      rule1: 'Si hay combate y el jugador falla, describí la consecuencia narrativamente',
      rule2: 'Si el jugador hace algo heroico, recompensalo apropiadamente',
      rule3: 'Mantené la acción en movimiento - esta es una sesión demo',
      rule4: 'suggested_actions debe tener 3 opciones que tengan sentido con la situación',
      narrativeTone: 'TONO NARRATIVO',
      important: 'IMPORTANTE',
      jsonOnly: 'Responde SOLO con el JSON, sin texto adicional',
      narrationLanguage: 'La narración debe ser en español',
      coherence: 'Mantén coherencia con eventos anteriores',
      diceInterpret: 'Interpreta el resultado de la tirada',
      failure: 'fracaso',
      partialSuccess: 'éxito parcial',
      success: 'éxito',
      criticalSuccess: 'éxito crítico',
      noDice: 'Sin tirada de dados, evalúa narrativamente basándote en los stats del personaje',
    }

    // Build dice roll info
    const diceRollInfo = diceRoll
      ? `\n\n${labels.diceRoll}: ${diceRoll.formula} = ${diceRoll.result} (${labels.dice}: ${diceRoll.rolls.join(', ')})`
      : ''

    // Narrative tone based on lore
    const narrativeTone = isEnglish ? (
      lore === 'LOTR' ? 'Epic and mythical, like Tolkien. Elevated and poetic language.' :
      lore === 'ZOMBIES' ? 'Tense and survival horror. Scarce resources, constant danger.' :
      lore === 'ISEKAI' ? 'Anime and adventurous. Energetic with humor and epic moments.' :
      lore === 'VIKINGOS' ? 'Brutal and honorable. Blood, glory, destiny and the gods.' :
      'Atmospheric and immersive'
    ) : (
      lore === 'LOTR' ? 'Épico y mítico, como Tolkien. Lenguaje elevado y poético.' :
      lore === 'ZOMBIES' ? 'Tenso y survival horror. Recursos escasos, peligro constante.' :
      lore === 'ISEKAI' ? 'Anime y aventurero. Energético con humor y momentos épicos.' :
      lore === 'VIKINGOS' ? 'Brutal y honorable. Sangre, gloria, destino y los dioses.' :
      'Atmosférico y envolvente'
    )

    // Get engine configuration if available
    let enginePromptSection = ''
    let diceInterpretation = ''
    try {
      const engineConfig = getEngineConfig(engine as GameEngine)

      const engineContext: EngineContext = {
        character: {
          name: character.name,
          archetype: character.archetype,
          level: character.level,
          stats: character.stats,
          inventory: inventory,
          conditions: [],
          hp: currentHP,
          maxHp: maxHP
        },
        worldState: {
          currentScene: worldState.current_scene || (isEnglish ? 'The adventure begins' : 'La aventura comienza'),
          activeQuests: worldState.active_quests || [],
          weather: worldState.weather || (isEnglish ? 'Clear' : 'Despejado'),
          timeOfDay: worldState.time_in_world || (isEnglish ? 'Morning' : 'Mañana')
        },
        locale: locale as Locale,
        lore: lore as any,
        loreName: lore,
        loreDescription: narrativeTone
      }

      enginePromptSection = engineConfig.buildPrompt(engineContext)

      if (diceRoll) {
        const engineDiceRoll: EngineDiceRoll = {
          formula: diceRoll.formula,
          results: diceRoll.rolls,
          total: diceRoll.result
        }
        const interpretation = engineConfig.interpretDice(engineDiceRoll, locale as Locale)
        diceInterpretation = `
${isEnglish ? 'DICE INTERPRETATION' : 'INTERPRETACIÓN DE DADOS'} (${engineConfig.name[locale as Locale]}):
- ${isEnglish ? 'Result' : 'Resultado'}: ${interpretation.description}
- ${isEnglish ? 'Narrative guidance' : 'Guía narrativa'}: ${interpretation.narrativeHint}
`
      }
    } catch {
      // Engine not found, use simplified rules
      enginePromptSection = isEnglish
        ? 'Use narrative-based mechanics. Success is determined by player stats and dice rolls.'
        : 'Usá mecánicas narrativas. El éxito se determina por stats del jugador y tiradas de dados.'
    }

    const systemPrompt = `${labels.dmRole}

${enginePromptSection ? `=== ${isEnglish ? 'GAME RULES' : 'REGLAS DEL JUEGO'} ===
${enginePromptSection}
${diceInterpretation}
===` : ''}

${labels.worldAndSetting}:
- ${labels.lore}: ${lore}
- ${labels.rulesEngine}: ${engine || 'STORY_MODE'}
- ${labels.mode}: ${labels.oneShot}
- ${labels.currentAct}: ${worldState.act || 1}/5
- ${labels.currentScene}: ${worldState.current_scene || (isEnglish ? 'Beginning of the adventure' : 'Inicio de la aventura')}
- ${labels.time}: ${worldState.time_in_world || (isEnglish ? 'Dawn' : 'Amanecer')}
- ${labels.weather}: ${worldState.weather || (isEnglish ? 'Clear' : 'Despejado')}

${labels.character}:
- ${labels.name}: ${character.name}
- ${labels.archetype}: ${character.archetype}
- ${labels.level}: ${character.level}
- ${labels.hp}: ${currentHP}/${maxHP} (${currentHP <= maxHP * 0.3 ? labels.critical : currentHP <= maxHP * 0.6 ? labels.wounded : labels.healthy})
- ${labels.stats}: ${labels.combat} ${character.stats?.combat || 3}/5, ${labels.exploration} ${character.stats?.exploration || 3}/5, ${labels.social} ${character.stats?.social || 3}/5, ${labels.loreStat} ${character.stats?.lore || 2}/5
- ${labels.inventory}: ${inventory.length > 0 ? inventory.join(', ') : labels.empty}

${labels.activeQuests}: ${(worldState.active_quests || []).join(', ') || labels.none}
${diceRollInfo}

${labels.responseInstructions}:
${isEnglish ? 'Respond in JSON format with this structure' : 'Respondé en formato JSON con esta estructura'}:
{
  "narration": "${labels.narrationInstructions}",
  "hp_change": 0,
  "new_item": null,
  "scene_change": null,
  "new_quest": null,
  "suggested_actions": ["${isEnglish ? 'action 1' : 'acción 1'}", "${isEnglish ? 'action 2' : 'acción 2'}", "${isEnglish ? 'action 3' : 'acción 3'}"]
}

${labels.mechanicRules}:
1. ${labels.rule1}
2. ${labels.rule2}
3. ${labels.rule3}
4. ${labels.rule4}

${labels.narrativeTone}:
${narrativeTone}

${labels.important}:
- ${labels.jsonOnly}
- ${labels.narrationLanguage}
- ${labels.coherence}
- ${diceRoll ? `${labels.diceInterpret} (${diceRoll.result}): 1-5 ${labels.failure}, 6-10 ${labels.partialSuccess}, 11-15 ${labels.success}, 16-20 ${labels.criticalSuccess}` : labels.noDice}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: conversationHistory as any,
    })

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response
    let dmResponse: {
      narration: string
      hp_change?: number
      new_item?: string | null
      scene_change?: string | null
      new_quest?: string | null
      suggested_actions?: string[]
    }

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        dmResponse = JSON.parse(jsonMatch[0])
      } else {
        dmResponse = { narration: rawResponse }
      }
    } catch {
      dmResponse = { narration: rawResponse }
    }

    // Calculate world state updates for guest (returned to client, not persisted)
    const worldStateUpdates: Record<string, any> = {}

    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const newHP = Math.max(0, Math.min(maxHP, currentHP + dmResponse.hp_change))
      worldStateUpdates.party = {
        [character.name]: {
          hp: newHP,
          maxHp: maxHP
        }
      }
    }

    if (dmResponse.scene_change) {
      worldStateUpdates.current_scene = dmResponse.scene_change
    }

    if (dmResponse.new_quest) {
      worldStateUpdates.active_quests = [
        ...(worldState.active_quests || []),
        dmResponse.new_quest
      ]
    }

    // Build full narration with HP notification if needed
    let fullNarration = dmResponse.narration
    if (dmResponse.hp_change && dmResponse.hp_change !== 0) {
      const changeText = dmResponse.hp_change > 0
        ? `+${dmResponse.hp_change} HP`
        : `${dmResponse.hp_change} HP`
      fullNarration += `\n\n[${changeText}]`
    }

    return NextResponse.json({
      success: true,
      narration: fullNarration,
      worldStateUpdates: Object.keys(worldStateUpdates).length > 0 ? worldStateUpdates : undefined,
      suggestedActions: dmResponse.suggested_actions,
    })
  } catch (error) {
    console.error('Error processing guest turn:', error)
    return NextResponse.json(
      {
        error: 'Error al procesar el turno',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
