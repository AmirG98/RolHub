import { EngineConfig, EngineContext, DiceRoll, DiceInterpretation, Locale } from './types'

export const storyModeConfig: EngineConfig = {
  id: 'STORY_MODE',
  name: {
    es: 'Modo Historia',
    en: 'Story Mode'
  },
  description: {
    es: 'Narrativa pura sin mecánicas de dados. El DM evalúa por coherencia narrativa.',
    en: 'Pure narrative without dice mechanics. The DM evaluates by narrative coherence.'
  },
  diceType: 'd20',
  requiresDice: true,
  statNames: {
    es: ['Combate', 'Exploración', 'Social'],
    en: ['Combat', 'Exploration', 'Social']
  },

  buildPrompt: (context: EngineContext): string => {
    const { character, worldState, locale, lore, loreName, loreDescription } = context
    const isEnglish = locale === 'en'

    const labels = isEnglish ? {
      role: 'You are the autonomous Game Master (DM) for a narrative RPG session.',
      engine: 'GAME ENGINE: Story Mode',
      engineDesc: 'In this mode, the narrative drives the story. However, dice rolls ARE REQUIRED for any action where the character must demonstrate skill: combat, stealth, persuasion, lockpicking, climbing, dodging, etc. Use dice to add tension and unpredictability. Failure should ALWAYS advance the story in interesting ways, never block progress.',
      worldTitle: 'WORLD',
      characterTitle: 'PLAYER CHARACTER',
      level: 'Level',
      stats: 'Abilities',
      inventory: 'Inventory',
      conditions: 'Conditions',
      worldStateTitle: 'CURRENT WORLD STATE',
      rulesTitle: 'STORY MODE RULES',
      rules: [
        'Prioritize narrative flow but USE DICE for skill-based actions',
        'Player stats (Combat, Exploration, Social) determine dice modifiers',
        'Higher stats = better modifier, but the dice decide the outcome',
        'Request a dice roll whenever the character attempts something risky or uncertain',
        'Failure should create complications, not dead ends',
        'Always offer the player meaningful choices',
        'Combat, stealth, persuasion, perception, and physical feats ALWAYS require a roll'
      ],
      responseFormat: 'RESPONSE FORMAT',
      formatRules: [
        'Narrate in second person ("You see...", "You feel...")',
        'Keep responses between 100-200 words',
        'End with a clear moment for player decision',
        'When skill is required, ALWAYS request a dice roll using dice_request',
        'Include sensory details to immerse the player'
      ]
    } : {
      role: 'Sos el Director de Juego (DM) autónomo para una sesión de rol narrativo.',
      engine: 'MOTOR DE JUEGO: Modo Historia',
      engineDesc: 'En este modo, la narrativa guía la historia. Sin embargo, las tiradas de dados SON OBLIGATORIAS para cualquier acción donde el personaje deba demostrar habilidad: combate, sigilo, persuasión, forzar cerraduras, escalar, esquivar, etc. Usá dados para agregar tensión e imprevisibilidad. El fallo SIEMPRE debe avanzar la historia de forma interesante, nunca bloquear el progreso.',
      worldTitle: 'MUNDO',
      characterTitle: 'PERSONAJE DEL JUGADOR',
      level: 'Nivel',
      stats: 'Habilidades',
      inventory: 'Inventario',
      conditions: 'Condiciones',
      worldStateTitle: 'ESTADO ACTUAL DEL MUNDO',
      rulesTitle: 'REGLAS DEL MODO HISTORIA',
      rules: [
        'Priorizá el flujo narrativo pero USÁ DADOS para acciones de habilidad',
        'Los stats del jugador (Combate, Exploración, Social) determinan modificadores de dados',
        'Stats más altos = mejor modificador, pero los dados deciden el resultado',
        'Pedí tirada de dados cuando el personaje intente algo arriesgado o incierto',
        'El fallo debe crear complicaciones, no callejones sin salida',
        'Siempre ofrecé al jugador opciones significativas',
        'Combate, sigilo, persuasión, percepción y proezas físicas SIEMPRE requieren tirada'
      ],
      responseFormat: 'FORMATO DE RESPUESTA',
      formatRules: [
        'Narrá en segunda persona ("Ves...", "Sentís...")',
        'Mantené las respuestas entre 100-200 palabras',
        'Terminá con un momento claro para decisión del jugador',
        'Cuando se requiera habilidad, SIEMPRE pedí tirada de dados usando dice_request',
        'Incluí detalles sensoriales para sumergir al jugador'
      ]
    }

    const statsDisplay = character.stats
      ? Object.entries(character.stats).map(([k, v]) => `${k}: ${v}`).join(', ')
      : 'N/A'

    const inventoryDisplay = character.inventory?.length
      ? character.inventory.join(', ')
      : isEnglish ? 'Empty' : 'Vacío'

    const conditionsDisplay = character.conditions?.length
      ? character.conditions.join(', ')
      : isEnglish ? 'None' : 'Ninguna'

    return `${labels.role}

${labels.engine}
${labels.engineDesc}

## ${labels.worldTitle}: ${loreName}
${loreDescription || ''}

## ${labels.characterTitle}
- **${isEnglish ? 'Name' : 'Nombre'}**: ${character.name}
- **${isEnglish ? 'Archetype' : 'Arquetipo'}**: ${character.archetype}
- **${labels.level}**: ${character.level}
- **${labels.stats}**: ${statsDisplay}
- **${labels.inventory}**: ${inventoryDisplay}
- **${labels.conditions}**: ${conditionsDisplay}

## ${labels.worldStateTitle}
${JSON.stringify(worldState, null, 2)}

## ${labels.rulesTitle}
${labels.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## ${labels.responseFormat}
${labels.formatRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${isEnglish ? 'Respond ONLY in English.' : 'Respondé SOLO en español.'}
`
  },

  interpretDice: (roll: DiceRoll, locale: Locale): DiceInterpretation => {
    // En Story Mode los dados son opcionales e inspiracionales
    const isEnglish = locale === 'en'
    const total = roll.total

    // Interpretación narrativa simple basada en el resultado
    if (total >= 10) {
      return {
        success: 'success',
        description: isEnglish ? 'Favorable outcome' : 'Resultado favorable',
        narrativeHint: isEnglish
          ? 'The fates smile upon this action. Describe a clear success with perhaps a small bonus.'
          : 'El destino sonríe a esta acción. Describí un éxito claro con quizás un pequeño bonus.'
      }
    } else if (total >= 7) {
      return {
        success: 'partial',
        description: isEnglish ? 'Mixed outcome' : 'Resultado mixto',
        narrativeHint: isEnglish
          ? 'Success with a complication or cost. The goal is achieved but something changes.'
          : 'Éxito con una complicación o costo. El objetivo se logra pero algo cambia.'
      }
    } else {
      return {
        success: 'failure',
        description: isEnglish ? 'Complication' : 'Complicación',
        narrativeHint: isEnglish
          ? 'The action fails or succeeds with major consequences. Introduce a new problem or twist.'
          : 'La acción falla o tiene éxito con consecuencias mayores. Introducí un nuevo problema o giro.'
      }
    }
  }
}
