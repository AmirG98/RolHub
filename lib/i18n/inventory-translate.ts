// Traducción bidireccional de items de inventory ES⇄EN.
//
// Los personajes preexistentes tienen Character.inventory guardado como snapshot
// en el idioma en el que fueron creados. Este helper permite traducir al vuelo
// en el display sin mutar la DB, usando como fuente los starting_inventory
// bilingües de los 10 lore JSONs.

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

const ALL_LORE_DATA: any[] = [
  lotrData, zombiesData, isekaiData, vikingosData, starwarsData,
  cyberpunkData, lovecraftData, dndClassicData, romantasyData, cozyWitchData,
]

const ES_TO_EN = new Map<string, string>()
const EN_TO_ES = new Map<string, string>()

for (const lore of ALL_LORE_DATA) {
  for (const archetype of lore.archetypes || []) {
    for (const item of archetype.starting_inventory || []) {
      if (item && typeof item === 'object' && item.es && item.en) {
        if (!ES_TO_EN.has(item.es)) ES_TO_EN.set(item.es, item.en)
        if (!EN_TO_ES.has(item.en)) EN_TO_ES.set(item.en, item.es)
      }
    }
  }
}

/**
 * Traduce un item de inventory al locale objetivo. Si el item no está en el
 * lookup (ej: loot agregado por el DM mid-game), devuelve el string original.
 */
export function translateInventoryItem(item: string, targetLocale: 'es' | 'en'): string {
  if (!item) return item
  if (targetLocale === 'en') {
    return ES_TO_EN.get(item) || item
  }
  return EN_TO_ES.get(item) || item
}

export function translateInventoryArray(items: string[], targetLocale: 'es' | 'en'): string[] {
  return items.map(i => translateInventoryItem(i, targetLocale))
}
