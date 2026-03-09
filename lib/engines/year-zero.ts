import { EngineConfig, EngineContext, DiceRoll, DiceInterpretation, Locale, YearZeroResource } from './types'

// Recursos del sistema Year Zero
export const yearZeroResources: YearZeroResource[] = [
  {
    id: 'hunger',
    name: { es: 'Hambre', en: 'Hunger' },
    icon: '🍖',
    max: 6,
    criticalEffect: {
      es: 'Estás muerto de hambre. -2 a todas las tiradas físicas hasta que comas.',
      en: 'You are starving. -2 to all physical rolls until you eat.'
    }
  },
  {
    id: 'thirst',
    name: { es: 'Sed', en: 'Thirst' },
    icon: '💧',
    max: 6,
    criticalEffect: {
      es: 'Estás deshidratado. -2 a todas las tiradas mentales hasta que bebas.',
      en: 'You are dehydrated. -2 to all mental rolls until you drink.'
    }
  },
  {
    id: 'cold',
    name: { es: 'Frío', en: 'Cold' },
    icon: '❄️',
    max: 6,
    criticalEffect: {
      es: 'Hipotermia. Colapso inminente si no encontrás calor.',
      en: 'Hypothermia. Imminent collapse if you don\'t find warmth.'
    }
  },
  {
    id: 'stress',
    name: { es: 'Estrés', en: 'Stress' },
    icon: '😰',
    max: 6,
    criticalEffect: {
      es: 'Crisis nerviosa. Debés realizar una acción irracional o quedarte paralizado.',
      en: 'Nervous breakdown. You must take an irrational action or remain paralyzed.'
    }
  },
  {
    id: 'fatigue',
    name: { es: 'Fatiga', en: 'Fatigue' },
    icon: '😴',
    max: 6,
    criticalEffect: {
      es: 'Agotamiento total. Caés dormido inmediatamente.',
      en: 'Total exhaustion. You fall asleep immediately.'
    }
  },
  {
    id: 'radiation',
    name: { es: 'Radiación', en: 'Radiation' },
    icon: '☢️',
    max: 6,
    criticalEffect: {
      es: 'Envenenamiento por radiación. Empezás a perder HP cada hora.',
      en: 'Radiation poisoning. You start losing HP every hour.'
    }
  }
]

export const yearZeroConfig: EngineConfig = {
  id: 'YEAR_ZERO',
  name: {
    es: 'Year Zero Engine',
    en: 'Year Zero Engine'
  },
  description: {
    es: 'Pool de d6. Contás los 6s. Podés "empujar" la tirada pero sufrís consecuencias.',
    en: 'd6 pool. Count the 6s. You can "push" the roll but suffer consequences.'
  },
  diceType: 'pool-d6',
  defaultDice: '3d6',
  requiresDice: true,
  statNames: {
    es: ['Fuerza', 'Agilidad', 'Ingenio', 'Empatía'],
    en: ['Strength', 'Agility', 'Wits', 'Empathy']
  },

  buildPrompt: (context: EngineContext): string => {
    const { character, worldState, locale, loreName, loreDescription } = context
    const isEnglish = locale === 'en'

    const labels = isEnglish ? {
      role: 'You are the GM for a Year Zero Engine survival RPG session.',
      engine: 'GAME ENGINE: Year Zero Engine',
      engineDesc: 'This system emphasizes survival, resource management, and the harsh realities of a hostile world. Players roll pools of d6 and count 6s for successes. They can "push" failed rolls but suffer resource damage.',
      worldTitle: 'WORLD',
      characterTitle: 'PLAYER CHARACTER',
      level: 'Level',
      stats: 'Attributes',
      inventory: 'Inventory',
      conditions: 'Conditions',
      resources: 'Resources',
      worldStateTitle: 'CURRENT WORLD STATE',
      mechanicsTitle: 'YEAR ZERO MECHANICS',
      mechanics: [
        'Roll a pool of d6 equal to Attribute + Skill (usually 2-5 dice)',
        'Each 6 is a SUCCESS. You need at least 1 success to succeed',
        'No 6s = failure. Offer the player to PUSH the roll',
        'PUSHING: Re-roll all non-6 dice, but each 1 rolled increases a resource (stress, hunger, etc.)',
        'Resources at max (6) trigger critical effects',
        'Gear can add bonus dice but can be damaged on pushed rolls'
      ],
      rulesTitle: 'GM PRINCIPLES',
      rules: [
        'The world is hostile and unforgiving',
        'Resources are always scarce - track them carefully',
        'Every success has a cost, every failure has consequences',
        'NPCs have their own agendas and survival needs',
        'Hope exists but must be earned through sacrifice',
        'Describe the environment\'s harshness - cold, hunger, danger',
        'Make pushed rolls feel desperate and dramatic'
      ],
      responseFormat: 'RESPONSE FORMAT',
      formatRules: [
        'State clearly how many dice the player should roll',
        'After rolls, describe successes vividly or failures dramatically',
        'When players push, narrate the physical/mental toll',
        'Track resource changes in your narration',
        'Environment is always a threat - include weather, terrain, hazards',
        'End with a survival choice or imminent danger'
      ]
    } : {
      role: 'Sos el GM para una sesión de supervivencia Year Zero Engine.',
      engine: 'MOTOR DE JUEGO: Year Zero Engine',
      engineDesc: 'Este sistema enfatiza la supervivencia, gestión de recursos y las duras realidades de un mundo hostil. Los jugadores tiran pools de d6 y cuentan los 6s para éxitos. Pueden "empujar" tiradas fallidas pero sufren daño a recursos.',
      worldTitle: 'MUNDO',
      characterTitle: 'PERSONAJE DEL JUGADOR',
      level: 'Nivel',
      stats: 'Atributos',
      inventory: 'Inventario',
      conditions: 'Condiciones',
      resources: 'Recursos',
      worldStateTitle: 'ESTADO ACTUAL DEL MUNDO',
      mechanicsTitle: 'MECÁNICAS DE YEAR ZERO',
      mechanics: [
        'Tirá un pool de d6 igual a Atributo + Habilidad (usualmente 2-5 dados)',
        'Cada 6 es un ÉXITO. Necesitás al menos 1 éxito para tener éxito',
        'Sin 6s = fallo. Ofrecé al jugador EMPUJAR la tirada',
        'EMPUJAR: Re-tirá todos los dados que no sean 6, pero cada 1 aumenta un recurso (estrés, hambre, etc.)',
        'Recursos al máximo (6) disparan efectos críticos',
        'El equipo puede agregar dados bonus pero puede dañarse en tiradas empujadas'
      ],
      rulesTitle: 'PRINCIPIOS DEL GM',
      rules: [
        'El mundo es hostil e implacable',
        'Los recursos son siempre escasos - rastreálos cuidadosamente',
        'Cada éxito tiene un costo, cada fallo tiene consecuencias',
        'Los NPCs tienen sus propias agendas y necesidades de supervivencia',
        'La esperanza existe pero debe ganarse a través del sacrificio',
        'Describí la dureza del ambiente - frío, hambre, peligro',
        'Hacé que las tiradas empujadas se sientan desesperadas y dramáticas'
      ],
      responseFormat: 'FORMATO DE RESPUESTA',
      formatRules: [
        'Indicá claramente cuántos dados debe tirar el jugador',
        'Después de las tiradas, describí éxitos vívidamente o fallos dramáticamente',
        'Cuando los jugadores empujen, narrá el costo físico/mental',
        'Rastreá cambios de recursos en tu narración',
        'El ambiente es siempre una amenaza - incluí clima, terreno, peligros',
        'Terminá con una elección de supervivencia o peligro inminente'
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

    const resourcesDisplay = yearZeroResources.map(r => {
      const name = isEnglish ? r.name.en : r.name.es
      return `- ${r.icon} ${name}: 0/${r.max}`
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

### ${labels.resources}
${resourcesDisplay}

## ${labels.worldStateTitle}
${JSON.stringify(worldState, null, 2)}

## ${labels.mechanicsTitle}
${labels.mechanics.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## ${labels.rulesTitle}
${labels.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## ${labels.responseFormat}
${labels.formatRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${isEnglish ? 'Respond ONLY in English.' : 'Respondé SOLO en español.'}
`
  },

  interpretDice: (roll: DiceRoll, locale: Locale): DiceInterpretation => {
    const isEnglish = locale === 'en'
    const successes = roll.results.filter(r => r === 6).length
    const ones = roll.results.filter(r => r === 1).length

    if (successes >= 3) {
      return {
        success: 'critical',
        description: isEnglish
          ? `Critical Success! (${successes} sixes)`
          : `¡Éxito Crítico! (${successes} seises)`,
        narrativeHint: isEnglish
          ? 'Exceptional success. They achieve their goal and gain an unexpected advantage or find extra resources.'
          : 'Éxito excepcional. Logran su objetivo y ganan una ventaja inesperada o encuentran recursos extra.'
      }
    } else if (successes >= 1) {
      return {
        success: 'success',
        description: isEnglish
          ? `Success (${successes} six${successes > 1 ? 'es' : ''})`
          : `Éxito (${successes} seis${successes > 1 ? 'es' : ''})`,
        narrativeHint: isEnglish
          ? 'They succeed, but the world remains harsh. Describe their success while hinting at future challenges.'
          : 'Tienen éxito, pero el mundo sigue siendo duro. Describí su éxito mientras insinuás desafíos futuros.'
      }
    } else if (roll.results.length > 0) {
      return {
        success: 'failure',
        description: isEnglish
          ? `Failure (no sixes). Can push! (${ones} ones)`
          : `Fallo (sin seises). ¡Puede empujar! (${ones} unos)`,
        narrativeHint: isEnglish
          ? `No success. Offer to push the roll. If they push and roll ${ones} ones, those become resource damage.`
          : `Sin éxito. Ofrecé empujar la tirada. Si empujan y sacan unos, esos se vuelven daño a recursos.`
      }
    } else {
      return {
        success: 'fumble',
        description: isEnglish ? 'No dice to roll!' : '¡Sin dados para tirar!',
        narrativeHint: isEnglish
          ? 'The character is too weakened to attempt this. They need to rest or recover first.'
          : 'El personaje está muy debilitado para intentar esto. Necesita descansar o recuperarse primero.'
      }
    }
  }
}

// Función para calcular daño de empujar
export function calculatePushDamage(pushedRoll: DiceRoll): {
  successes: number
  resourceDamage: number
  damageType: string
} {
  const successes = pushedRoll.results.filter(r => r === 6).length
  const ones = pushedRoll.results.filter(r => r === 1).length

  // El tipo de daño depende del contexto, pero por defecto es estrés
  return {
    successes,
    resourceDamage: ones,
    damageType: 'stress'
  }
}

// Función para obtener recursos localizados
export function getLocalizedResources(locale: Locale): Array<{
  id: string
  name: string
  icon: string
  max: number
  criticalEffect: string
}> {
  return yearZeroResources.map(r => ({
    id: r.id,
    name: locale === 'en' ? r.name.en : r.name.es,
    icon: r.icon,
    max: r.max,
    criticalEffect: locale === 'en' ? r.criticalEffect.en : r.criticalEffect.es
  }))
}
