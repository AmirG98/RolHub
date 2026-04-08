'use client'

import { type Lore } from '@/lib/maps/map-config'
import { getLocalized } from '@/lib/i18n/localize'

// Importar lore data
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
  LOTR: lotrData, ZOMBIES: zombiesData, ISEKAI: isekaiData, VIKINGOS: vikingosData,
  STAR_WARS: starwarsData, CYBERPUNK: cyberpunkData, LOVECRAFT_HORROR: lovecraftData, DND_CLASSIC: dndClassicData,
  ROMANTASY: romantasyData, COZY_WITCH: cozyWitchData,
}

const TYPE_ICONS: Record<string, string> = {
  tavern: '🍺', market: '🏪', gate: '🚪', workshop: '⚒️', stable: '🐴',
  palace: '🏰', library: '📚', garden: '🌿', hall: '🏛️', hospital: '🏥',
  plaza: '🏘️', residence: '🏠', temple: '⛪', prison: '🔒',
}

interface SubLocationListProps {
  lore: Lore
  currentScene: string
  locale?: 'es' | 'en'
}

export function SubLocationList({ lore, currentScene, locale = 'es' }: SubLocationListProps) {
  const loreData = LORE_DATA[lore]
  if (!loreData?.locations) return null

  // El name del location top-level puede ser bilingue — hay que comparar ambas versiones
  const currentLocation = loreData.locations.find((l: any) => {
    const nameEs = typeof l.name === 'string' ? l.name : l.name?.es || ''
    const nameEn = typeof l.name === 'string' ? l.name : l.name?.en || ''
    const sceneLower = currentScene?.toLowerCase() || ''
    const sceneFirstPart = sceneLower.split(',')[0]?.trim() || ''
    return (
      sceneLower.includes(nameEs.toLowerCase()) ||
      sceneLower.includes(nameEn.toLowerCase()) ||
      nameEs.toLowerCase().includes(sceneFirstPart) ||
      nameEn.toLowerCase().includes(sceneFirstPart)
    )
  })

  const subLocations = currentLocation?.sub_locations
  if (!subLocations || subLocations.length === 0) return null

  const currentLocationName = getLocalized(currentLocation.name, locale)

  return (
    <div className="px-3 py-2 border-t border-gold-dim/30 bg-shadow/80">
      <p className="text-[10px] font-heading text-gold-dim uppercase tracking-wider mb-1.5">
        {locale === 'en' ? 'Places in' : 'Lugares en'} {currentLocationName}
      </p>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {subLocations.map((sl: any) => {
          const slName = getLocalized(sl.name, locale)
          const slDescription = getLocalized(sl.description, locale)
          const isActive = currentScene?.toLowerCase().includes(slName.toLowerCase())
          return (
            <div
              key={sl.id}
              className={`flex items-start gap-1.5 px-2 py-1 rounded text-xs ${
                isActive
                  ? 'bg-gold/20 border border-gold-dim/50 text-gold-bright'
                  : 'text-parchment/70 hover:text-parchment/90'
              }`}
            >
              <span className="flex-shrink-0">{TYPE_ICONS[sl.type] || '📍'}</span>
              <div className="min-w-0">
                <span className="font-heading text-[11px]">{slName}</span>
                <p className="text-[9px] text-parchment/50 line-clamp-1">{slDescription}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
