// Contenido de ayuda para D&D 5e y Story Mode
// Dos niveles: novice (jugadores nuevos) y experienced (jugadores con experiencia)
// Bilingüe: cada string tiene versión en español (es) e inglés (en)

export type HelpLevel = 'novice' | 'experienced'
export type Locale = 'es' | 'en'

type LocalizedHelp = { es: string; en: string }

interface HelpEntry {
  novice: LocalizedHelp
  experienced: LocalizedHelp
}

// ============================================
// ATRIBUTOS D&D 5e
// ============================================

export const ABILITY_HELP: Record<string, HelpEntry> = {
  STR: {
    novice: {
      es: "Fuerza: Qué tan fuerte eres. Afecta ataques cuerpo a cuerpo y cuánto puedes cargar.",
      en: "Strength: How strong you are. Affects melee attacks and how much you can carry."
    },
    experienced: {
      es: "Fuerza (STR): Modificador para ataques melee y daño, checks de Atletismo, salvaciones de Fuerza, y capacidad de carga (STR × 15 lbs).",
      en: "Strength (STR): Modifier for melee attack and damage rolls, Athletics checks, Strength saving throws, and carrying capacity (STR × 15 lbs)."
    }
  },
  DEX: {
    novice: {
      es: "Destreza: Qué tan ágil y rápido eres. Afecta tu puntería, esquivar ataques y sigilo.",
      en: "Dexterity: How agile and quick you are. Affects your aim, dodging attacks, and stealth."
    },
    experienced: {
      es: "Destreza (DEX): Modificador para ataques a distancia, AC (si no llevas armadura pesada), iniciativa, y habilidades como Sigilo, Acrobacias y Juego de Manos.",
      en: "Dexterity (DEX): Modifier for ranged attacks, Armor Class (unless wearing heavy armor), initiative, and skills like Stealth, Acrobatics, and Sleight of Hand."
    }
  },
  CON: {
    novice: {
      es: "Constitución: Tu resistencia física. Determina cuántos puntos de vida tienes.",
      en: "Constitution: Your physical endurance. Determines how many hit points you have."
    },
    experienced: {
      es: "Constitución (CON): Modificador añadido a HP por nivel, checks de concentración de hechizos, y resistencia a venenos y enfermedades.",
      en: "Constitution (CON): Modifier added to hit points per level, spell concentration checks, and resistance to poison and disease."
    }
  },
  INT: {
    novice: {
      es: "Inteligencia: Qué tan listo eres. Afecta tu conocimiento y capacidad de investigar.",
      en: "Intelligence: How smart you are. Affects your knowledge and ability to investigate."
    },
    experienced: {
      es: "Inteligencia (INT): Habilidad de conjuración para Magos. Afecta Arcanos, Historia, Investigación, Naturaleza y Religión.",
      en: "Intelligence (INT): Spellcasting ability for Wizards. Affects Arcana, History, Investigation, Nature, and Religion."
    }
  },
  WIS: {
    novice: {
      es: "Sabiduría: Tu intuición y percepción. Te ayuda a notar cosas y resistir manipulación mental.",
      en: "Wisdom: Your intuition and perception. Helps you notice things and resist mental manipulation."
    },
    experienced: {
      es: "Sabiduría (WIS): Habilidad de conjuración para Clérigos, Druidas y Rangers. Afecta Percepción, Perspicacia, Supervivencia, Medicina y Trato con Animales.",
      en: "Wisdom (WIS): Spellcasting ability for Clerics, Druids, and Rangers. Affects Perception, Insight, Survival, Medicine, and Animal Handling."
    }
  },
  CHA: {
    novice: {
      es: "Carisma: Tu personalidad y presencia. Afecta cómo convences o intimidas a otros.",
      en: "Charisma: Your personality and presence. Affects how you persuade or intimidate others."
    },
    experienced: {
      es: "Carisma (CHA): Habilidad de conjuración para Brujos, Hechiceros, Paladines y Bardos. Afecta Persuasión, Engaño, Intimidación y Actuación.",
      en: "Charisma (CHA): Spellcasting ability for Warlocks, Sorcerers, Paladins, and Bards. Affects Persuasion, Deception, Intimidation, and Performance."
    }
  },
}

// ============================================
// STATS DE COMBATE
// ============================================

export const COMBAT_HELP: Record<string, HelpEntry> = {
  hp: {
    novice: {
      es: "Puntos de Vida: Tu salud. Cuando llegan a 0, caes inconsciente. Si bajas más, puedes morir.",
      en: "Hit Points: Your health. When they reach 0, you fall unconscious. Drop lower and you can die."
    },
    experienced: {
      es: "Hit Points (HP): Determinados por dado de golpe de clase + CON mod por nivel. A 0 HP, haces tiradas de salvación de muerte. 3 éxitos = estable, 3 fallos = muerte.",
      en: "Hit Points (HP): Determined by your class's Hit Die + CON modifier per level. At 0 HP, you make death saving throws. 3 successes = stable, 3 failures = death."
    }
  },
  ac: {
    novice: {
      es: "Clase de Armadura: Qué tan difícil es golpearte. Un número más alto significa mejor protección.",
      en: "Armor Class: How hard you are to hit. A higher number means better protection."
    },
    experienced: {
      es: "Armor Class (AC): Los ataques deben igualar o superar este número. Base 10 + DEX mod, modificado por tipo de armadura y escudo (+2). Armadura pesada ignora DEX.",
      en: "Armor Class (AC): Attacks must meet or exceed this number to hit. Base 10 + DEX modifier, adjusted by armor type and shield (+2). Heavy armor ignores DEX."
    }
  },
  initiative: {
    novice: {
      es: "Iniciativa: Determina quién actúa primero en combate. Basada en tu Destreza.",
      en: "Initiative: Determines who acts first in combat. Based on your Dexterity."
    },
    experienced: {
      es: "Iniciativa: d20 + DEX mod al inicio del combate. Determina el orden de turnos. Algunas clases/rasgos dan bonificadores adicionales.",
      en: "Initiative: d20 + DEX modifier at the start of combat. Determines turn order. Some classes and traits grant additional bonuses."
    }
  },
  proficiency: {
    novice: {
      es: "Bono de Competencia: Un bonus que añades a ciertas tiradas cuando eres experto en algo.",
      en: "Proficiency Bonus: A bonus you add to certain rolls when you're trained in something."
    },
    experienced: {
      es: "Proficiency Bonus: +2 a nivel 1, aumenta cada 4 niveles (+3 a Nv.5, +4 a Nv.9, etc.). Se suma a ataques con armas competentes, habilidades competentes, y salvaciones competentes.",
      en: "Proficiency Bonus: +2 at level 1, increasing every 4 levels (+3 at Lv.5, +4 at Lv.9, etc.). Added to attacks with weapons you're proficient in, proficient skills, and proficient saving throws."
    }
  },
  speed: {
    novice: {
      es: "Velocidad: Cuántos pies puedes moverte en tu turno. La mayoría tiene 30 pies.",
      en: "Speed: How many feet you can move on your turn. Most characters have 30 feet."
    },
    experienced: {
      es: "Speed: Distancia de movimiento por turno. Enanos = 25 pies, Humanos/Elfos = 30 pies. Dash = doble movimiento. Terreno difícil = movimiento ×2.",
      en: "Speed: Movement distance per turn. Dwarves = 25 ft, Humans/Elves = 30 ft. Dash = double your movement. Difficult terrain costs ×2 movement."
    }
  },
  hitDice: {
    novice: {
      es: "Dados de Golpe: Los usas para curarte durante descansos cortos. Tienes tantos como tu nivel.",
      en: "Hit Dice: You spend these to heal during short rests. You have as many as your level."
    },
    experienced: {
      es: "Hit Dice: Tienes [nivel] dados de golpe del tipo de tu clase (d6-d12). En descanso corto, gasta dados para recuperar HP (dado + CON mod). Se recuperan la mitad en descanso largo.",
      en: "Hit Dice: You have [level] Hit Dice of your class's type (d6-d12). On a short rest, spend dice to regain HP (die + CON modifier). You recover half of them on a long rest."
    }
  },
}

// ============================================
// TIRADAS DE SALVACIÓN
// ============================================

export const SAVING_THROW_HELP: Record<string, HelpEntry> = {
  general: {
    novice: {
      es: "Tirada de Salvación: Un chequeo para evitar o resistir efectos como hechizos, venenos o trampas.",
      en: "Saving Throw: A check to avoid or resist effects like spells, poisons, or traps."
    },
    experienced: {
      es: "Saving Throw: d20 + ability mod + proficiency (si eres competente). Cada clase tiene 2 salvaciones competentes. La CD la establece el efecto o hechizador.",
      en: "Saving Throw: d20 + ability modifier + proficiency bonus (if proficient). Each class is proficient in 2 saving throws. The DC is set by the effect or caster."
    }
  },
  STR_save: {
    novice: {
      es: "Salvación de Fuerza: Para resistir ser empujado, agarrado, o efectos físicos que te mueven.",
      en: "Strength Save: To resist being pushed, grappled, or physical effects that move you."
    },
    experienced: {
      es: "STR Save: Resiste efectos de empuje, agarre, y algunos efectos de terreno. Raramente usado, pero importante contra enemigos grandes.",
      en: "STR Save: Resists shove, grapple, and some terrain effects. Rarely used, but important against large enemies."
    }
  },
  DEX_save: {
    novice: {
      es: "Salvación de Destreza: Para esquivar explosiones, rayos, y otros efectos que puedes evadir.",
      en: "Dexterity Save: To dodge explosions, lightning, and other effects you can evade."
    },
    experienced: {
      es: "DEX Save: Extremadamente común. Bolas de fuego, alientos de dragón, trampas. Éxito = mitad de daño típicamente. Rogues con Evasion pueden evitar todo daño.",
      en: "DEX Save: Extremely common. Fireballs, dragon breath, traps. Success typically means half damage. Rogues with Evasion can avoid all damage."
    }
  },
  CON_save: {
    novice: {
      es: "Salvación de Constitución: Para resistir venenos, enfermedades, y mantener concentración en hechizos.",
      en: "Constitution Save: To resist poisons, diseases, and maintain concentration on spells."
    },
    experienced: {
      es: "CON Save: Venenos, enfermedades, efectos de agotamiento, y concentración de hechizos (CD = 10 o mitad del daño, lo que sea mayor).",
      en: "CON Save: Poisons, diseases, exhaustion effects, and spell concentration (DC = 10 or half the damage taken, whichever is higher)."
    }
  },
  INT_save: {
    novice: {
      es: "Salvación de Inteligencia: Para resistir efectos que atacan tu mente y memoria.",
      en: "Intelligence Save: To resist effects that attack your mind and memory."
    },
    experienced: {
      es: "INT Save: Poco común. Usado contra ilusiones, detección de mentiras mágicas, y efectos psíquicos de algunas criaturas.",
      en: "INT Save: Uncommon. Used against illusions, magical lie detection, and the psychic effects of certain creatures."
    }
  },
  WIS_save: {
    novice: {
      es: "Salvación de Sabiduría: Para resistir control mental, miedo, y efectos que manipulan tu voluntad.",
      en: "Wisdom Save: To resist mind control, fear, and effects that manipulate your will."
    },
    experienced: {
      es: "WIS Save: Muy común. Charm, fear, dominación, y muchos efectos de control mental. Una de las salvaciones más importantes.",
      en: "WIS Save: Very common. Charm, fear, domination, and many mind-control effects. One of the most important saving throws."
    }
  },
  CHA_save: {
    novice: {
      es: "Salvación de Carisma: Para resistir efectos que intentan desplazarte a otros planos o poseer tu cuerpo.",
      en: "Charisma Save: To resist effects that try to banish you to other planes or possess your body."
    },
    experienced: {
      es: "CHA Save: Menos común pero crítica. Resistir destierro, posesión, y efectos de transporte planar. Importante contra fiends.",
      en: "CHA Save: Less common but critical. Resists banishment, possession, and planar transport effects. Important against fiends."
    }
  },
}

// ============================================
// HABILIDADES (SKILLS)
// ============================================

export const SKILLS_HELP: Record<string, HelpEntry> = {
  acrobatics: {
    novice: {
      es: "Acrobacias (DES): Mantener equilibrio, hacer piruetas, escapar de agarres.",
      en: "Acrobatics (DEX): Keeping your balance, performing flips, escaping grapples."
    },
    experienced: {
      es: "Acrobatics (DEX): Equilibrio en terreno difícil, piruetas, caídas controladas. Puede usarse para escapar de grapples como alternativa a Atletismo.",
      en: "Acrobatics (DEX): Balancing on difficult terrain, tumbling, controlled falls. Can be used to escape grapples as an alternative to Athletics."
    }
  },
  animal_handling: {
    novice: {
      es: "Trato con Animales (SAB): Calmar animales, entrenarlos, o intuir sus intenciones.",
      en: "Animal Handling (WIS): Calming animals, training them, or sensing their intentions."
    },
    experienced: {
      es: "Animal Handling (WIS): Calmar bestias hostiles, montar criaturas difíciles, entrenar animales. No funciona con bestias mágicas inteligentes.",
      en: "Animal Handling (WIS): Calming hostile beasts, riding difficult mounts, training animals. Does not work on intelligent magical beasts."
    }
  },
  arcana: {
    novice: {
      es: "Arcanos (INT): Conocimiento sobre magia, hechizos, objetos mágicos y criaturas mágicas.",
      en: "Arcana (INT): Knowledge of magic, spells, magic items, and magical creatures."
    },
    experienced: {
      es: "Arcana (INT): Identificar hechizos siendo lanzados, conocer propiedades de objetos mágicos, recordar información sobre lo arcano. No es lo mismo que Religión.",
      en: "Arcana (INT): Identifying spells as they're cast, knowing the properties of magic items, recalling arcane lore. Not the same as Religion."
    }
  },
  athletics: {
    novice: {
      es: "Atletismo (FUE): Escalar, nadar, saltar, y forcejear con otros.",
      en: "Athletics (STR): Climbing, swimming, jumping, and grappling with others."
    },
    experienced: {
      es: "Athletics (STR): Escalar superficies, nadar en corrientes, saltos largos/altos, iniciar/mantener grapples, empujar enemigos (shove).",
      en: "Athletics (STR): Climbing surfaces, swimming against currents, long/high jumps, initiating and maintaining grapples, shoving enemies."
    }
  },
  deception: {
    novice: {
      es: "Engaño (CAR): Mentir de forma convincente, disfrazarte, o crear distracciones.",
      en: "Deception (CHA): Lying convincingly, disguising yourself, or creating distractions."
    },
    experienced: {
      es: "Deception (CHA): Mentir verbalmente, crear falsas impresiones, gambits en combate social. Contestado por Perspicacia del objetivo.",
      en: "Deception (CHA): Verbal lies, creating false impressions, gambits in social combat. Contested by the target's Insight."
    }
  },
  history: {
    novice: {
      es: "Historia (INT): Recordar eventos históricos, leyendas, y conocimiento del pasado.",
      en: "History (INT): Recalling historical events, legends, and knowledge of the past."
    },
    experienced: {
      es: "History (INT): Conocimiento sobre eventos, personalidades, guerras, reinos. Puede revelar debilidades de enemigos basadas en tradición.",
      en: "History (INT): Knowledge of events, notable figures, wars, and kingdoms. Can reveal enemy weaknesses rooted in lore."
    }
  },
  insight: {
    novice: {
      es: "Perspicacia (SAB): Detectar mentiras, leer intenciones ocultas, y entender motivaciones.",
      en: "Insight (WIS): Detecting lies, reading hidden intentions, and understanding motives."
    },
    experienced: {
      es: "Insight (WIS): Contesta Engaño. Detectar mentiras, entender estados emocionales, intuir motivaciones ocultas. Clave en interacciones sociales.",
      en: "Insight (WIS): Contests Deception. Detecting lies, reading emotional states, sensing hidden motives. Key in social interactions."
    }
  },
  intimidation: {
    novice: {
      es: "Intimidación (CAR): Asustar o amenazar a otros para que hagan lo que quieres.",
      en: "Intimidation (CHA): Frightening or threatening others into doing what you want."
    },
    experienced: {
      es: "Intimidation (CHA): Coerción mediante amenazas. Puede usarse en combate para asustar. Algunas mesas permiten usar STR en su lugar para intimidación física.",
      en: "Intimidation (CHA): Coercion through threats. Can be used in combat to frighten. Some tables allow using STR instead for physical intimidation."
    }
  },
  investigation: {
    novice: {
      es: "Investigación (INT): Buscar pistas, deducir información, y resolver puzzles.",
      en: "Investigation (INT): Searching for clues, deducing information, and solving puzzles."
    },
    experienced: {
      es: "Investigation (INT): Búsqueda activa y deductiva. Encontrar trampas ocultas, pistas en escenas del crimen, información en libros. Diferente de Percepción.",
      en: "Investigation (INT): Active, deductive searching. Finding hidden traps, clues at crime scenes, information in books. Different from Perception."
    }
  },
  medicine: {
    novice: {
      es: "Medicina (SAB): Estabilizar heridos, diagnosticar enfermedades, y cuidado básico.",
      en: "Medicine (WIS): Stabilizing the wounded, diagnosing illnesses, and basic care."
    },
    experienced: {
      es: "Medicine (WIS): Estabilizar aliados a 0 HP (CD 10), diagnosticar enfermedades/venenos, determinar causa de muerte. No cura HP sin magia.",
      en: "Medicine (WIS): Stabilizing allies at 0 HP (DC 10), diagnosing diseases/poisons, determining cause of death. Does not restore HP without magic."
    }
  },
  nature: {
    novice: {
      es: "Naturaleza (INT): Conocimiento sobre plantas, animales, clima, y el mundo natural.",
      en: "Nature (INT): Knowledge of plants, animals, weather, and the natural world."
    },
    experienced: {
      es: "Nature (INT): Identificar plantas/animales, conocer ciclos naturales, predecir clima. Diferente de Supervivencia que es práctica.",
      en: "Nature (INT): Identifying plants and animals, knowing natural cycles, predicting weather. Different from Survival, which is practical."
    }
  },
  perception: {
    novice: {
      es: "Percepción (SAB): Notar cosas con tus sentidos - ver, oír, oler amenazas u objetos.",
      en: "Perception (WIS): Noticing things with your senses - seeing, hearing, or smelling threats or objects."
    },
    experienced: {
      es: "Perception (WIS): Detección pasiva y activa. Percepción Pasiva = 10 + mod, usada por DM para detección automática. Crítica para emboscadas y trampas.",
      en: "Perception (WIS): Passive and active detection. Passive Perception = 10 + modifier, used by the DM for automatic detection. Critical against ambushes and traps."
    }
  },
  performance: {
    novice: {
      es: "Actuación (CAR): Entretener a otros con música, actuación, o narración.",
      en: "Performance (CHA): Entertaining others with music, acting, or storytelling."
    },
    experienced: {
      es: "Performance (CHA): Entretenimiento artístico. Importante para Bardos que quieren ganar dinero o influenciar multitudes. Puede crear distracciones.",
      en: "Performance (CHA): Artistic entertainment. Important for Bards earning coin or swaying crowds. Can create distractions."
    }
  },
  persuasion: {
    novice: {
      es: "Persuasión (CAR): Convencer a otros con diplomacia, lógica, o encanto.",
      en: "Persuasion (CHA): Convincing others through diplomacy, logic, or charm."
    },
    experienced: {
      es: "Persuasion (CHA): Influencia positiva - hacer amigos, negociar, convencer. Diferente de Engaño (verdad vs mentira) e Intimidación (positivo vs negativo).",
      en: "Persuasion (CHA): Positive influence - making friends, negotiating, convincing. Different from Deception (truth vs lie) and Intimidation (goodwill vs fear)."
    }
  },
  religion: {
    novice: {
      es: "Religión (INT): Conocimiento sobre dioses, ritos, oraciones, y organizaciones religiosas.",
      en: "Religion (INT): Knowledge of gods, rites, prayers, and religious organizations."
    },
    experienced: {
      es: "Religion (INT): Conocer panteones, ritos, símbolos sagrados, jerarquías eclesiásticas. Puede identificar undead y fiends, y sus debilidades.",
      en: "Religion (INT): Knowing pantheons, rites, holy symbols, and religious hierarchies. Can identify undead and fiends, and their weaknesses."
    }
  },
  sleight_of_hand: {
    novice: {
      es: "Juego de Manos (DES): Robar bolsillos, trucos de manos, y esconder objetos en tu persona.",
      en: "Sleight of Hand (DEX): Picking pockets, hand tricks, and concealing objects on your person."
    },
    experienced: {
      es: "Sleight of Hand (DEX): Pickpocketing, plantar objetos, trucos de manos. Contestado por Percepción del objetivo. Clave para Rogues.",
      en: "Sleight of Hand (DEX): Pickpocketing, planting objects, hand tricks. Contested by the target's Perception. Key for Rogues."
    }
  },
  stealth: {
    novice: {
      es: "Sigilo (DES): Moverte sin ser visto ni oído. Esencial para emboscadas.",
      en: "Stealth (DEX): Moving without being seen or heard. Essential for ambushes."
    },
    experienced: {
      es: "Stealth (DEX): Ocultarse, moverse silenciosamente, evitar detección. Contestado por Percepción Pasiva de enemigos. Desventaja con armadura pesada.",
      en: "Stealth (DEX): Hiding, moving silently, avoiding detection. Contested by enemies' Passive Perception. Disadvantage while wearing heavy armor."
    }
  },
  survival: {
    novice: {
      es: "Supervivencia (SAB): Rastrear criaturas, encontrar comida y agua, navegar en la naturaleza.",
      en: "Survival (WIS): Tracking creatures, finding food and water, navigating the wilderness."
    },
    experienced: {
      es: "Survival (WIS): Rastreo (CD varía por terreno), forrajeo (1d6+WIS mod lbs/día), navegación, predecir clima, identificar peligros naturales.",
      en: "Survival (WIS): Tracking (DC varies by terrain), foraging (1d6 + WIS modifier lbs/day), navigation, predicting weather, identifying natural hazards."
    }
  },
}

// ============================================
// STATS STORY MODE
// ============================================

export const STORY_MODE_HELP: Record<string, HelpEntry> = {
  combat: {
    novice: {
      es: "Combate: Tu habilidad para pelear. Afecta ataques, defensa, y tácticas de batalla.",
      en: "Combat: Your fighting ability. Affects attacks, defense, and battle tactics."
    },
    experienced: {
      es: "Combate: Determina éxito en conflictos físicos. El DM considera este valor junto con la narración para resolver enfrentamientos.",
      en: "Combat: Determines success in physical conflicts. The DM weighs this value alongside the narrative to resolve confrontations."
    }
  },
  exploration: {
    novice: {
      es: "Exploración: Tu capacidad para encontrar cosas, navegar, y sobrevivir en ambientes hostiles.",
      en: "Exploration: Your ability to find things, navigate, and survive in hostile environments."
    },
    experienced: {
      es: "Exploración: Afecta búsqueda de objetos, navegación, supervivencia, y descubrimiento de secretos en el entorno.",
      en: "Exploration: Affects searching for objects, navigation, survival, and uncovering secrets in the environment."
    }
  },
  social: {
    novice: {
      es: "Social: Tu habilidad para hablar con otros, convencer, y hacer aliados.",
      en: "Social: Your ability to talk to others, persuade, and make allies."
    },
    experienced: {
      es: "Social: Determina éxito en interacciones con NPCs, negociaciones, y situaciones donde la diplomacia es clave.",
      en: "Social: Determines success in interactions with NPCs, negotiations, and situations where diplomacy is key."
    }
  },
  knowledge: {
    novice: {
      es: "Saber: Tu conocimiento del mundo, historia, y habilidad para recordar información útil.",
      en: "Knowledge: Your understanding of the world, history, and ability to recall useful information."
    },
    experienced: {
      es: "Saber: Afecta reconocimiento de criaturas, objetos, lugares, y la capacidad de recordar información relevante del lore.",
      en: "Knowledge: Affects recognizing creatures, objects, and places, and the ability to recall relevant lore."
    }
  },
}

// ============================================
// HELPER FUNCTION
// ============================================

export function getHelpContent(
  category: 'ability' | 'combat' | 'saving_throw' | 'skill' | 'story_mode',
  term: string,
  level: HelpLevel = 'novice',
  locale: Locale = 'en'
): string {
  let helpMap: Record<string, HelpEntry>

  switch (category) {
    case 'ability':
      helpMap = ABILITY_HELP
      break
    case 'combat':
      helpMap = COMBAT_HELP
      break
    case 'saving_throw':
      helpMap = SAVING_THROW_HELP
      break
    case 'skill':
      helpMap = SKILLS_HELP
      break
    case 'story_mode':
      helpMap = STORY_MODE_HELP
      break
    default:
      return locale === 'es' ? 'Información no disponible.' : 'Information not available.'
  }

  const entry = helpMap[term]
  if (!entry) {
    return locale === 'es'
      ? 'Información no disponible para este término.'
      : 'Information not available for this term.'
  }

  return entry[level][locale]
}

// ============================================
// ALL SKILLS LIST (for iteration)
// ============================================

export const ALL_SKILLS = [
  { id: 'acrobatics', name: { es: 'Acrobacias', en: 'Acrobatics' }, ability: 'DEX' },
  { id: 'animal_handling', name: { es: 'Trato con Animales', en: 'Animal Handling' }, ability: 'WIS' },
  { id: 'arcana', name: { es: 'Arcanos', en: 'Arcana' }, ability: 'INT' },
  { id: 'athletics', name: { es: 'Atletismo', en: 'Athletics' }, ability: 'STR' },
  { id: 'deception', name: { es: 'Engaño', en: 'Deception' }, ability: 'CHA' },
  { id: 'history', name: { es: 'Historia', en: 'History' }, ability: 'INT' },
  { id: 'insight', name: { es: 'Perspicacia', en: 'Insight' }, ability: 'WIS' },
  { id: 'intimidation', name: { es: 'Intimidación', en: 'Intimidation' }, ability: 'CHA' },
  { id: 'investigation', name: { es: 'Investigación', en: 'Investigation' }, ability: 'INT' },
  { id: 'medicine', name: { es: 'Medicina', en: 'Medicine' }, ability: 'WIS' },
  { id: 'nature', name: { es: 'Naturaleza', en: 'Nature' }, ability: 'INT' },
  { id: 'perception', name: { es: 'Percepción', en: 'Perception' }, ability: 'WIS' },
  { id: 'performance', name: { es: 'Actuación', en: 'Performance' }, ability: 'CHA' },
  { id: 'persuasion', name: { es: 'Persuasión', en: 'Persuasion' }, ability: 'CHA' },
  { id: 'religion', name: { es: 'Religión', en: 'Religion' }, ability: 'INT' },
  { id: 'sleight_of_hand', name: { es: 'Juego de Manos', en: 'Sleight of Hand' }, ability: 'DEX' },
  { id: 'stealth', name: { es: 'Sigilo', en: 'Stealth' }, ability: 'DEX' },
  { id: 'survival', name: { es: 'Supervivencia', en: 'Survival' }, ability: 'WIS' },
] as const

export type SkillId = typeof ALL_SKILLS[number]['id']
export type AbilityId = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
