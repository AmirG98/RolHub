/**
 * Configuración de voces por Lore
 * Define qué voz y configuración usar para cada mundo
 */

import { Lore } from '@prisma/client'
import { LoreVoicesMap } from './types'

/**
 * Mapeo de voces por Lore e idioma
 * Basado en las voces definidas en CLAUDE.md:
 * - LOTR: grave_pausado (profunda, sabio)
 * - ZOMBIES: tenso_urgente (susurrada, superviviente)
 * - ISEKAI: energetico (expresiva, anime)
 * - VIKINGOS: ronco_epico (ronca, skald nórdico)
 */
export const LORE_VOICES: LoreVoicesMap = {
  LOTR: {
    es: {
      voice: 'narrator_grave',
      speed: 0.9,
      emotion: 'wise'
    },
    en: {
      voice: 'narrator_deep',
      speed: 0.9,
      emotion: 'wise'
    }
  },
  ZOMBIES: {
    es: {
      voice: 'whisper_tense',
      speed: 1.1,
      emotion: 'tense'
    },
    en: {
      voice: 'whisper_survival',
      speed: 1.1,
      emotion: 'tense'
    }
  },
  ISEKAI: {
    es: {
      voice: 'anime_energetic',
      speed: 1.2,
      emotion: 'excited'
    },
    en: {
      voice: 'anime_narrator',
      speed: 1.2,
      emotion: 'excited'
    }
  },
  VIKINGOS: {
    es: {
      voice: 'skald_epic',
      speed: 0.85,
      emotion: 'epic'
    },
    en: {
      voice: 'nordic_bard',
      speed: 0.85,
      emotion: 'epic'
    }
  },
  STAR_WARS: {
    es: {
      voice: 'narrator_epic',
      speed: 0.95,
      emotion: 'dramatic'
    },
    en: {
      voice: 'narrator_epic',
      speed: 0.95,
      emotion: 'dramatic'
    }
  },
  CYBERPUNK: {
    es: {
      voice: 'synth_narrator',
      speed: 1.05,
      emotion: 'gritty'
    },
    en: {
      voice: 'synth_narrator',
      speed: 1.05,
      emotion: 'gritty'
    }
  },
  LOVECRAFT_HORROR: {
    es: {
      voice: 'whisper_dread',
      speed: 0.85,
      emotion: 'ominous'
    },
    en: {
      voice: 'whisper_dread',
      speed: 0.85,
      emotion: 'ominous'
    }
  },
  CUSTOM: {
    es: {
      voice: 'narrator_grave',
      speed: 1.0,
      emotion: 'neutral'
    },
    en: {
      voice: 'narrator_deep',
      speed: 1.0,
      emotion: 'neutral'
    }
  }
}

/**
 * Obtiene la configuración de voz para un lore y locale específicos
 */
export function getVoiceConfig(lore: Lore, locale: 'es' | 'en') {
  const loreConfig = LORE_VOICES[lore]
  if (!loreConfig) {
    // Fallback a CUSTOM si el lore no está configurado
    return LORE_VOICES.CUSTOM[locale]
  }
  return loreConfig[locale]
}

/**
 * Descripciones narrativas para los mensajes de carga
 */
export const VOICE_LOADING_MESSAGES = {
  es: [
    'El narrador toma aliento...',
    'Las palabras cobran vida...',
    'La voz del destino se prepara...',
    'El bardo afina su garganta...'
  ],
  en: [
    'The narrator takes a breath...',
    'Words come to life...',
    'The voice of destiny prepares...',
    'The bard clears his throat...'
  ]
}

/**
 * Obtiene un mensaje de carga aleatorio
 */
export function getRandomLoadingMessage(locale: 'es' | 'en'): string {
  const messages = VOICE_LOADING_MESSAGES[locale]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Voces para NPCs - variedad para distintos personajes
 * Se asignan basándose en un hash del nombre del NPC
 */
export const NPC_VOICES = {
  es: {
    male: [
      'npc_male_1',    // Voz masculina grave
      'npc_male_2',    // Voz masculina media
      'npc_male_3',    // Voz masculina joven
    ],
    female: [
      'npc_female_1',  // Voz femenina grave
      'npc_female_2',  // Voz femenina media
      'npc_female_3',  // Voz femenina joven
    ],
    neutral: [
      'npc_neutral_1', // Voz neutral/criatura
    ]
  },
  en: {
    male: [
      'npc_male_1',
      'npc_male_2',
      'npc_male_3',
    ],
    female: [
      'npc_female_1',
      'npc_female_2',
      'npc_female_3',
    ],
    neutral: [
      'npc_neutral_1',
    ]
  }
}

/**
 * Obtiene una voz de NPC consistente basada en el nombre
 * El mismo nombre siempre retorna la misma voz
 */
/**
 * Normaliza el nombre de un NPC para consistencia de voz
 * "Panadera Marta" → "Marta", "Mercader Aldric" → "Aldric"
 * "Marta la Panadera" → "Marta", "El viejo Gandalf" → "Gandalf"
 */
function normalizeNPCName(name: string): string {
  if (!name) return 'default_npc'
  // Eliminar artículos y títulos comunes
  const cleaned = name.replace(/^(el|la|los|las|un|una|unos|unas|the|a|an)\s+/i, '').trim()
  // Buscar palabras con mayúscula inicial (nombres propios)
  const words = cleaned.split(/\s+/)
  const properNouns = words.filter(w => /^[A-ZÁÉÍÓÚÑ]/.test(w) && !['El', 'La', 'Los', 'Las', 'Del', 'De', 'Un', 'Una'].includes(w))
  // Preferir la última palabra con mayúscula (generalmente el nombre propio)
  // "Panadera Marta" → Marta, "Mercader Aldric" → Aldric
  if (properNouns.length > 0) {
    return properNouns[properNouns.length - 1]
  }
  // Fallback: primera palabra
  return words[0] || name
}

export function getNPCVoice(npcName: string, locale: 'es' | 'en', gender?: 'male' | 'female' | 'neutral'): string {
  // Simplificado: solo 2 voces (masculina y femenina)
  // Sin hash, sin cache, sin normalización — determinístico por género
  const isFemale = detectNPCGender(npcName, gender)
  return isFemale ? NPC_VOICES[locale].female[0] : NPC_VOICES[locale].male[0]
}

/**
 * Detecta si un NPC es femenino basándose en el nombre
 * Determinístico: mismo nombre siempre da el mismo resultado
 */
function detectNPCGender(npcName: string, explicitGender?: 'male' | 'female' | 'neutral'): boolean {
  if (explicitGender === 'female') return true
  if (explicitGender === 'male') return false

  // Normalizar: tomar la última palabra con mayúscula (nombre propio)
  const words = npcName.split(/\s+/)
  const properNouns = words.filter(w => /^[A-ZÁÉÍÓÚÑ]/.test(w))
  const name = (properNouns.length > 0 ? properNouns[properNouns.length - 1] : words[0] || '').toLowerCase()

  // Nombres femeninos conocidos
  const knownFemale = [
    'rosie', 'arwen', 'galadriel', 'eowyn', 'luthien', 'rose', 'daisy', 'mary', 'lucy',
    'alice', 'elise', 'sophie', 'chloe', 'claire', 'diane', 'eve', 'grace', 'hope',
    'jade', 'june', 'kate', 'mae', 'jane', 'anne', 'marie', 'louise', 'marta',
    'freya', 'sigrid', 'astrid', 'ingrid', 'gudrun', 'brynhild', 'sif',
    'leia', 'padme', 'ahsoka', 'rey', 'jyn',
    'yennefer', 'triss', 'ciri', 'gertrude', 'beatrice', 'isolde', 'laeral',
  ]
  if (knownFemale.includes(name)) return true

  // Nombres masculinos conocidos
  const knownMale = [
    'gandalf', 'aragorn', 'legolas', 'gimli', 'frodo', 'sam', 'bilbo', 'boromir',
    'luke', 'han', 'obi', 'anakin', 'finn', 'poe',
    'geralt', 'vesemir', 'dandelion', 'regis',
    'thor', 'odin', 'loki', 'ragnar', 'bjorn', 'ivar', 'floki',
    'elminster', 'drizzt', 'durnan', 'halaster', 'aldric',
  ]
  if (knownMale.includes(name)) return false

  // Terminaciones masculinas (alta confianza)
  const maleEndings = ['alf', 'orn', 'mund', 'rik', 'gar', 'thor', 'dur', 'grim']
  if (maleEndings.some(e => name.endsWith(e))) return false

  // Terminaciones femeninas (alta confianza)
  const femaleEndings = ['ella', 'ina', 'ara', 'isa', 'ia', 'iel', 'wen', 'lyn', 'beth', 'ette']
  if (femaleEndings.some(e => name.endsWith(e))) return true

  // Terminación en 'a' = femenino (español/italiano)
  if (name.endsWith('a') && name.length > 3) return true

  // Default: masculino
  return false
}

/**
 * Limpia markdown y formato del texto antes de enviarlo a TTS
 * Elimina: **bold**, *italic*, # headers, --- separadores, bullets, quotes, `code`
 */
export function cleanTextForTTS(text: string): string {
  return text
    // Eliminar bold **texto** → texto
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Eliminar italic *texto* (pero no confundir con bold)
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
    // Eliminar headers # ## ###
    .replace(/^#{1,6}\s*/gm, '')
    // Eliminar separadores ---
    .replace(/^-{3,}$/gm, '')
    // Eliminar bullets - y •
    .replace(/^\s*[-•]\s*/gm, '')
    // Eliminar quotes >
    .replace(/^>\s*/gm, '')
    // Eliminar código inline `texto`
    .replace(/`([^`]+)`/g, '$1')
    // Eliminar links [texto](url) → texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Normalizar múltiples saltos de línea
    .replace(/\n{3,}/g, '\n\n')
    // Normalizar espacios múltiples
    .replace(/[ \t]+/g, ' ')
    .trim()
}

/**
 * Añade pausas naturales al texto para mejor prosody en TTS
 * Usa puntuación especial de Deepgram:
 * - ... (3 puntos) = pausa corta (~300ms)
 * - ...... (6 puntos) = pausa larga (~600ms)
 */
export function addNaturalPauses(text: string): string {
  return text
    // Pausa media entre párrafos (NO larga — evita silencios incómodos)
    .replace(/\n\n+/g, '... ')

    // Pausa corta solo antes de revelaciones dramáticas clave
    .replace(/(de repente|de pronto|en ese momento)/gi, '... $1')

    // Asegurar espacio después de puntuación (sin agregar pausas extra —
    // el modelo TTS ya pausa naturalmente en puntos y comas)
    .replace(/([.!?])([A-ZÁÉÍÓÚ])/g, '$1 $2')

    // Limpiar saltos de línea restantes
    .replace(/\n/g, ' ')

    // Limpiar pausas excesivas (máximo 3 puntos)
    .replace(/\.{4,}/g, '...')

    // Normalizar múltiples espacios
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tipo de segmento de voz
 */
export type VoiceSegmentType = 'narration' | 'dialogue'

/**
 * Segmento de texto con información de voz
 */
export interface VoiceSegment {
  type: VoiceSegmentType
  text: string
  voice: string        // ID de voz a usar
  speaker?: string     // Nombre del hablante (para diálogos)
}

/**
 * Divide texto en oraciones para streaming más rápido
 * OPTIMIZADO: Chunks más pequeños (max 120 chars) para latencia mínima
 * La primera oración se genera primero para reducir tiempo de espera
 */
export function splitIntoSentences(text: string, maxChunkSize: number = 120): string[] {
  // Dividir por puntos, signos de exclamación, interrogación, comas largas
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  const result: string[] = []
  let buffer = ''

  for (const sentence of sentences) {
    const trimmed = sentence.trim()

    // Si la oración es muy larga, dividirla por comas
    if (trimmed.length > maxChunkSize) {
      const parts = trimmed.split(/,\s*/)
      for (const part of parts) {
        if (buffer) {
          buffer += ', ' + part
          if (buffer.length >= maxChunkSize * 0.6) {
            result.push(buffer)
            buffer = ''
          }
        } else if (part.length < 40) {
          buffer = part
        } else {
          result.push(part)
        }
      }
    } else if (buffer) {
      buffer += ' ' + trimmed
      if (buffer.length >= maxChunkSize * 0.6) {
        result.push(buffer)
        buffer = ''
      }
    } else if (trimmed.length < 30) {
      buffer = trimmed
    } else {
      result.push(trimmed)
    }
  }

  if (buffer) {
    if (result.length > 0) {
      result[result.length - 1] += ' ' + buffer
    } else {
      result.push(buffer)
    }
  }

  return result.filter(s => s.trim().length > 0)
}

/**
 * Parsea texto y separa narración de diálogos
 * OPTIMIZADO: Divide segmentos largos en chunks más pequeños
 * Detecta patrones como:
 * - "Texto entre comillas" → diálogo
 * - «Texto entre comillas francesas» → diálogo
 * - — Texto con guión largo → diálogo
 * - NombreNPC: "diálogo" → diálogo con nombre
 * - NombreNPC dijo: "diálogo" → diálogo con nombre
 * - "Diálogo", dijo NombreNPC → diálogo invertido
 */
export function parseTextForVoices(
  text: string,
  narratorVoice: string,
  locale: 'es' | 'en'
): VoiceSegment[] {
  // Solo voz del narrador — sin voces individuales de NPCs
  const cleanedText = addNaturalPauses(cleanTextForTTS(text))
  const MAX_CHUNK = 120

  const chunks = cleanedText.length <= MAX_CHUNK
    ? [cleanedText]
    : splitIntoSentences(cleanedText, MAX_CHUNK)

  return chunks
    .filter(chunk => chunk.trim().length > 0)
    .map(chunk => ({
      type: 'narration' as const,
      text: chunk,
      voice: narratorVoice,
    }))
}
