// Resuelve el ID canónico de un arquetipo a partir de lo guardado en
// Character.archetype, que — por como lo persisten guest-create y
// character/create — es el NOMBRE localizado ("Montaraz"), no el id ("ranger").
// El skill tree se indexa por id, así que necesitamos mapear nombre → id.

import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'
import dndClassicData from '@/data/lores/dnd-classic.json'
import romantasyData from '@/data/lores/romantasy.json'
import cozyWitchData from '@/data/lores/cozy-witch.json'

const LORE_DATA: Record<string, any> = {
  LOTR: lotrData,
  ZOMBIES: zombiesData,
  ISEKAI: isekaiData,
  VIKINGOS: vikingosData,
  STAR_WARS: starwarsData,
  CYBERPUNK: cyberpunkData,
  LOVECRAFT_HORROR: lovecraftData,
  DND_CLASSIC: dndClassicData,
  ROMANTASY: romantasyData,
  COZY_WITCH: cozyWitchData,
}

// Nombres LEGACY → id. Personajes creados ANTES del rebranding anti-IP
// (2026-07-16) tienen guardado el nombre viejo del arquetipo en
// Character.archetype; los lore JSONs ya no lo contienen.
const LEGACY_ARCHETYPE_NAMES: Record<string, string> = {
  'hobbit': 'hobbit',                    // ahora "Mediano"
  'guerrera illyriana': 'guerrera-illyriana', // ahora "Guerrera Alaria"
  'illyrian warrior': 'guerrera-illyriana',
}

/**
 * Devuelve el id del arquetipo. Si `archetypeKey` ya es un id, lo devuelve tal
 * cual; si es un nombre localizado (ES/EN), lo mapea al id. null si no matchea.
 */
export function resolveArchetypeId(loreKey: string, archetypeKey: string): string | null {
  const data = LORE_DATA[loreKey]
  if (!data || !Array.isArray(data.archetypes) || !archetypeKey) return null

  // ¿ya es un id?
  if (data.archetypes.some((a: any) => a.id === archetypeKey)) return archetypeKey

  // buscar por nombre localizado
  const lowered = archetypeKey.toLowerCase().trim()
  const match = data.archetypes.find((a: any) => {
    if (typeof a.name === 'string') return a.name.toLowerCase() === lowered
    return a.name?.es?.toLowerCase() === lowered || a.name?.en?.toLowerCase() === lowered
  })
  if (match?.id) return match.id

  // nombres pre-rebranding (personajes existentes)
  return LEGACY_ARCHETYPE_NAMES[lowered] ?? null
}
