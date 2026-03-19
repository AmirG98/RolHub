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
export function getNPCVoice(npcName: string, locale: 'es' | 'en'): string {
  // Hash simple del nombre para consistencia
  let hash = 0
  for (let i = 0; i < npcName.length; i++) {
    hash = ((hash << 5) - hash) + npcName.charCodeAt(i)
    hash = hash & hash
  }
  hash = Math.abs(hash)

  // Determinar género por nombre (heurística simple)
  const femaleIndicators = ['a', 'ella', 'ina', 'ara', 'isa', 'ia']
  const lastName = npcName.toLowerCase().split(' ').pop() || ''
  const isFemale = femaleIndicators.some(ind => lastName.endsWith(ind))

  const voices = isFemale ? NPC_VOICES[locale].female : NPC_VOICES[locale].male
  const index = hash % voices.length

  return voices[index]
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
 */
export function parseTextForVoices(
  text: string,
  narratorVoice: string,
  locale: 'es' | 'en'
): VoiceSegment[] {
  const segments: VoiceSegment[] = []
  const MAX_CHUNK = 120 // Máximo 120 caracteres por chunk para baja latencia

  // Regex para detectar diferentes tipos de diálogo
  const dialoguePattern = /(?:([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚ][a-záéíóúñ]+)?)\s*:\s*)?["«]([^"»]+)["»]|(?:—\s*)([^.!?]+[.!?]?)/g

  let lastIndex = 0
  let match

  // Helper para dividir texto largo en chunks
  const splitLongText = (txt: string): string[] => {
    if (txt.length <= MAX_CHUNK) return [txt]
    return splitIntoSentences(txt, MAX_CHUNK)
  }

  while ((match = dialoguePattern.exec(text)) !== null) {
    // Agregar narración antes del diálogo
    if (match.index > lastIndex) {
      const narrationText = text.slice(lastIndex, match.index).trim()
      if (narrationText) {
        // Dividir narración larga en chunks
        const chunks = splitLongText(narrationText)
        for (const chunk of chunks) {
          segments.push({
            type: 'narration',
            text: chunk,
            voice: narratorVoice
          })
        }
      }
    }

    // Determinar el contenido del diálogo y el hablante
    const speaker = match[1] || undefined
    const dialogueText = match[2] || match[3]

    if (dialogueText && dialogueText.trim()) {
      const npcVoice = speaker
        ? getNPCVoice(speaker, locale)
        : getNPCVoice('default_npc', locale)

      // Dividir diálogo largo en chunks
      const chunks = splitLongText(dialogueText.trim())
      for (const chunk of chunks) {
        segments.push({
          type: 'dialogue',
          text: chunk,
          voice: npcVoice,
          speaker
        })
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Agregar cualquier narración restante
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim()
    if (remainingText) {
      const chunks = splitLongText(remainingText)
      for (const chunk of chunks) {
        segments.push({
          type: 'narration',
          text: chunk,
          voice: narratorVoice
        })
      }
    }
  }

  // Si no se encontraron diálogos, dividir todo como narración
  if (segments.length === 0) {
    const chunks = splitLongText(text)
    for (const chunk of chunks) {
      segments.push({
        type: 'narration',
        text: chunk,
        voice: narratorVoice
      })
    }
  }

  return segments
}
