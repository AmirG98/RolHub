import { EngineConfig, EngineContext, DiceRoll, DiceInterpretation, Locale, PbtAMove } from './types'

// Movimientos básicos de PbtA
export const pbtaMoves: PbtAMove[] = [
  {
    id: 'act_under_pressure',
    name: { es: 'Actuar Bajo Presión', en: 'Act Under Pressure' },
    stat: 'cunning',
    description: {
      es: 'Cuando actúas a pesar del peligro o la presión.',
      en: 'When you act despite danger or pressure.'
    },
    onSuccess: {
      es: 'Lo lográs sin problemas.',
      en: 'You do it without issues.'
    },
    onPartial: {
      es: 'Lo lográs pero con un costo, una complicación o una decisión difícil.',
      en: 'You do it but with a cost, a complication, or a hard choice.'
    },
    onFailure: {
      es: 'Fallás y las cosas empeoran significativamente.',
      en: 'You fail and things get significantly worse.'
    }
  },
  {
    id: 'engage_in_combat',
    name: { es: 'Combatir', en: 'Engage in Combat' },
    stat: 'strength',
    description: {
      es: 'Cuando atacás a un enemigo en combate cuerpo a cuerpo o a distancia.',
      en: 'When you attack an enemy in melee or ranged combat.'
    },
    onSuccess: {
      es: 'Causás daño extra y evitás la represalia.',
      en: 'You deal extra damage and avoid retaliation.'
    },
    onPartial: {
      es: 'Intercambiás golpes - causás daño pero también lo recibís.',
      en: 'You trade blows - you deal damage but also take some.'
    },
    onFailure: {
      es: 'Tu ataque falla y quedás expuesto al contraataque.',
      en: 'Your attack fails and you are exposed to counterattack.'
    }
  },
  {
    id: 'read_situation',
    name: { es: 'Leer la Situación', en: 'Read the Situation' },
    stat: 'cunning',
    description: {
      es: 'Cuando examinás una situación buscando información útil.',
      en: 'When you examine a situation looking for useful information.'
    },
    onSuccess: {
      es: 'Hacé 3 preguntas de la lista. El DM responde honestamente.',
      en: 'Ask 3 questions from the list. The DM answers honestly.'
    },
    onPartial: {
      es: 'Hacé 1 pregunta de la lista.',
      en: 'Ask 1 question from the list.'
    },
    onFailure: {
      es: 'Tu investigación revela algo peligroso o te pone en evidencia.',
      en: 'Your investigation reveals something dangerous or exposes you.'
    }
  },
  {
    id: 'manipulate',
    name: { es: 'Manipular', en: 'Manipulate' },
    stat: 'heart',
    description: {
      es: 'Cuando intentás convencer, seducir, intimidar o engañar a alguien.',
      en: 'When you try to convince, seduce, intimidate, or deceive someone.'
    },
    onSuccess: {
      es: 'Hacen lo que querés si les das una razón o incentivo.',
      en: 'They do what you want if you give them a reason or incentive.'
    },
    onPartial: {
      es: 'Hacen lo que querés pero piden algo a cambio o con condiciones.',
      en: 'They do what you want but ask for something in return or with conditions.'
    },
    onFailure: {
      es: 'Se ofenden, desconfían o te descubren. La relación empeora.',
      en: 'They are offended, distrust you, or see through you. The relationship worsens.'
    }
  },
  {
    id: 'help_or_hinder',
    name: { es: 'Ayudar/Interferir', en: 'Help or Hinder' },
    stat: 'heart',
    description: {
      es: 'Cuando ayudás o interferís con otro personaje.',
      en: 'When you help or interfere with another character.'
    },
    onSuccess: {
      es: 'Tu intervención da +2 o -2 a su tirada.',
      en: 'Your intervention gives +2 or -2 to their roll.'
    },
    onPartial: {
      es: 'Tu intervención da +1 o -1 a su tirada, pero te exponés.',
      en: 'Your intervention gives +1 or -1 to their roll, but you expose yourself.'
    },
    onFailure: {
      es: 'Tu intervención falla y complicás la situación.',
      en: 'Your intervention fails and you complicate the situation.'
    }
  },
  {
    id: 'use_weird',
    name: { es: 'Usar lo Extraño', en: 'Use the Weird' },
    stat: 'weird',
    description: {
      es: 'Cuando usás magia, poderes sobrenaturales o conocimiento oculto.',
      en: 'When you use magic, supernatural powers, or occult knowledge.'
    },
    onSuccess: {
      es: 'El poder funciona como esperabas.',
      en: 'The power works as you expected.'
    },
    onPartial: {
      es: 'El poder funciona pero con un efecto secundario o costo.',
      en: 'The power works but with a side effect or cost.'
    },
    onFailure: {
      es: 'El poder se descontrola o atrae atención no deseada.',
      en: 'The power goes out of control or attracts unwanted attention.'
    }
  }
]

export const pbtaConfig: EngineConfig = {
  id: 'PBTA',
  name: {
    es: 'Powered by the Apocalypse',
    en: 'Powered by the Apocalypse'
  },
  description: {
    es: '2d6 + stat. 10+ éxito total, 7-9 éxito parcial, 6- fallo dramático.',
    en: '2d6 + stat. 10+ full success, 7-9 partial success, 6- dramatic failure.'
  },
  diceType: '2d6',
  defaultDice: '2d6',
  requiresDice: true,
  statNames: {
    es: ['Fuerza', 'Astucia', 'Corazón', 'Extraño'],
    en: ['Strength', 'Cunning', 'Heart', 'Weird']
  },

  buildPrompt: (context: EngineContext): string => {
    const { character, worldState, locale, loreName, loreDescription } = context
    const isEnglish = locale === 'en'

    const labels = isEnglish ? {
      role: 'You are the MC (Master of Ceremonies) for a Powered by the Apocalypse RPG session.',
      engine: 'GAME ENGINE: Powered by the Apocalypse (PbtA)',
      engineDesc: 'This system uses 2d6 + stat for all moves. The player will roll and you interpret the results. Always play to find out what happens.',
      worldTitle: 'WORLD',
      characterTitle: 'PLAYER CHARACTER',
      level: 'Level',
      stats: 'Stats',
      inventory: 'Inventory',
      conditions: 'Conditions',
      worldStateTitle: 'CURRENT WORLD STATE',
      movesTitle: 'BASIC MOVES AVAILABLE',
      rulesTitle: 'PBTA PRINCIPLES',
      rules: [
        'Be a fan of the player character',
        'Make the world feel real and reactive',
        'Address the character, not the player',
        'On a 10+: give them what they want',
        'On a 7-9: give them what they want with a cost, complication, or hard choice',
        'On a 6-: make a hard move - something bad happens that changes the situation',
        'Never say "nothing happens" - the story always moves forward',
        'Ask questions and build on the answers'
      ],
      responseFormat: 'RESPONSE FORMAT',
      formatRules: [
        'When dice are needed, clearly state which Move applies',
        'Narrate the fiction first, then mechanical effects',
        'On failures, make moves that create problems, not punishment',
        'Keep tension through fictional positioning, not arbitrary difficulty',
        'End with the player having a clear choice or moment of action'
      ],
      rollResult: 'If the player just rolled'
    } : {
      role: 'Sos el MC (Maestro de Ceremonias) para una sesión de rol Powered by the Apocalypse.',
      engine: 'MOTOR DE JUEGO: Powered by the Apocalypse (PbtA)',
      engineDesc: 'Este sistema usa 2d6 + stat para todos los movimientos. El jugador tira y vos interpretás los resultados. Siempre jugá para descubrir qué pasa.',
      worldTitle: 'MUNDO',
      characterTitle: 'PERSONAJE DEL JUGADOR',
      level: 'Nivel',
      stats: 'Stats',
      inventory: 'Inventario',
      conditions: 'Condiciones',
      worldStateTitle: 'ESTADO ACTUAL DEL MUNDO',
      movesTitle: 'MOVIMIENTOS BÁSICOS DISPONIBLES',
      rulesTitle: 'PRINCIPIOS DE PBTA',
      rules: [
        'Sé fan del personaje jugador',
        'Hacé que el mundo se sienta real y reactivo',
        'Dirigite al personaje, no al jugador',
        'En 10+: dales lo que quieren',
        'En 7-9: dales lo que quieren con un costo, complicación o decisión difícil',
        'En 6-: hacé un movimiento duro - algo malo pasa que cambia la situación',
        'Nunca digas "no pasa nada" - la historia siempre avanza',
        'Hacé preguntas y construí sobre las respuestas'
      ],
      responseFormat: 'FORMATO DE RESPUESTA',
      formatRules: [
        'Cuando se necesiten dados, indicá claramente qué Movimiento aplica',
        'Narrá la ficción primero, después los efectos mecánicos',
        'En fallos, hacé movimientos que creen problemas, no castigos',
        'Mantené la tensión a través del posicionamiento ficticio, no dificultad arbitraria',
        'Terminá con el jugador teniendo una elección clara o momento de acción'
      ],
      rollResult: 'Si el jugador acaba de tirar'
    }

    const statsDisplay = character.stats
      ? Object.entries(character.stats).map(([k, v]) => {
          const sign = v >= 0 ? '+' : ''
          return `${k}: ${sign}${v}`
        }).join(', ')
      : 'N/A'

    const inventoryDisplay = character.inventory?.length
      ? character.inventory.join(', ')
      : isEnglish ? 'Empty' : 'Vacío'

    const conditionsDisplay = character.conditions?.length
      ? character.conditions.join(', ')
      : isEnglish ? 'None' : 'Ninguna'

    const movesDisplay = pbtaMoves.map(m => {
      const name = isEnglish ? m.name.en : m.name.es
      const desc = isEnglish ? m.description.en : m.description.es
      return `- **${name}** (${m.stat}): ${desc}`
    }).join('\n')

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

## ${labels.movesTitle}
${movesDisplay}

## ${labels.rulesTitle}
${labels.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## ${labels.responseFormat}
${labels.formatRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${isEnglish ? 'Respond ONLY in English.' : 'Respondé SOLO en español.'}
`
  },

  interpretDice: (roll: DiceRoll, locale: Locale): DiceInterpretation => {
    const isEnglish = locale === 'en'
    const total = roll.total + (roll.modifier || 0)

    if (total >= 12) {
      return {
        success: 'critical',
        description: isEnglish ? 'Critical Success!' : '¡Éxito Crítico!',
        narrativeHint: isEnglish
          ? 'Exceptional success. Give them everything they wanted and more. The stars align perfectly.'
          : 'Éxito excepcional. Dales todo lo que querían y más. Las estrellas se alinean perfectamente.'
      }
    } else if (total >= 10) {
      return {
        success: 'success',
        description: isEnglish ? 'Full Success (10+)' : 'Éxito Total (10+)',
        narrativeHint: isEnglish
          ? 'They get what they want. Describe their success clearly and let them enjoy it.'
          : 'Consiguen lo que quieren. Describí su éxito claramente y dejá que lo disfruten.'
      }
    } else if (total >= 7) {
      return {
        success: 'partial',
        description: isEnglish ? 'Partial Success (7-9)' : 'Éxito Parcial (7-9)',
        narrativeHint: isEnglish
          ? 'Success with a cost. Offer a hard choice, a worse outcome, or an ugly price to pay.'
          : 'Éxito con un costo. Ofrecé una elección difícil, un resultado peor o un precio feo que pagar.'
      }
    } else if (total >= 2) {
      return {
        success: 'failure',
        description: isEnglish ? 'Failure (6-)' : 'Fallo (6-)',
        narrativeHint: isEnglish
          ? 'Make a hard MC move. Something bad happens that changes the situation. Not punishment, but consequence.'
          : 'Hacé un movimiento duro del MC. Algo malo pasa que cambia la situación. No castigo, sino consecuencia.'
      }
    } else {
      return {
        success: 'fumble',
        description: isEnglish ? 'Snake Eyes!' : '¡Ojos de Serpiente!',
        narrativeHint: isEnglish
          ? 'Catastrophic failure. Make the hardest move you can think of. The world strikes back.'
          : 'Fallo catastrófico. Hacé el movimiento más duro que puedas pensar. El mundo contraataca.'
      }
    }
  }
}

// Función helper para obtener movimiento por ID
export function getPbtAMove(moveId: string): PbtAMove | undefined {
  return pbtaMoves.find(m => m.id === moveId)
}

// Función helper para obtener todos los movimientos localizados
export function getLocalizedMoves(locale: Locale): Array<{ id: string; name: string; stat: string; description: string }> {
  return pbtaMoves.map(m => ({
    id: m.id,
    name: locale === 'en' ? m.name.en : m.name.es,
    stat: m.stat,
    description: locale === 'en' ? m.description.en : m.description.es
  }))
}
