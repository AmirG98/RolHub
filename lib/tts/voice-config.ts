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
