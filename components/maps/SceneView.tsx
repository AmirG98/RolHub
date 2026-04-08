'use client'

import React, { useState } from 'react'
import { ChevronRight, Map, Compass, Lock, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import { useTranslations, useLanguage } from '@/lib/i18n'
import { getLocalized } from '@/lib/i18n/localize'
import { getMapLocationName, getMapLocationDescription } from '@/lib/maps/lore-map-data'
import { type MapLocationWithStatus } from '@/lib/types/map-state'
import { type LocalizedString } from '@/lib/types/lore'

// Iconos por tipo de ubicación
const LOCATION_ICONS: Record<string, string> = {
  city: '🏰',
  safe: '🏠',
  danger: '⚔️',
  dungeon: '🗝️',
  wilderness: '🌲',
  mystery: '✨',
  landmark: '🗿',
}

// Descripciones cortas por tipo y lore — bilingues
type BilingualString = { es: string; en: string }
const SHORT_AMBIANCE: Record<string, Record<string, BilingualString>> = {
  city: {
    LOTR:             { es: 'Voces y comercio llenan el aire',    en: 'Voices and trade fill the air' },
    ZOMBIES:          { es: 'Silencio inquietante entre edificios', en: 'An unsettling silence between buildings' },
    ISEKAI:           { es: 'Bullicio del mercado mágico',        en: 'The bustle of the magic market' },
    VIKINGOS:         { es: 'Humo y olor a mar',                  en: 'Smoke and sea air' },
    STAR_WARS:        { es: 'Zumbido de naves y droides',         en: 'The hum of ships and droids' },
    CYBERPUNK:        { es: 'Neones y lluvia ácida',              en: 'Neon lights and acid rain' },
    LOVECRAFT_HORROR: { es: 'Arquitectura imposible',             en: 'Impossible architecture' },
    CUSTOM:           { es: 'Actividad y posibilidades',          en: 'Activity and possibility' },
  },
  safe: {
    LOTR:             { es: 'Paz y protección antigua',           en: 'Ancient peace and shelter' },
    ZOMBIES:          { es: 'Barricadas en su lugar',             en: 'Barricades in place' },
    ISEKAI:           { es: 'Zona de descanso segura',            en: 'A safe rest area' },
    VIKINGOS:         { es: 'Fuego e hidromiel',                  en: 'Firelight and mead' },
    STAR_WARS:        { es: 'Sector seguro',                      en: 'Secure sector' },
    CYBERPUNK:        { es: 'Fuera de jurisdicción',              en: 'Out of jurisdiction' },
    LOVECRAFT_HORROR: { es: 'Normalidad reconfortante',           en: 'Reassuring normality' },
    CUSTOM:           { es: 'Refugio seguro',                     en: 'A safe haven' },
  },
  danger: {
    LOTR:             { es: 'El mal acecha',                      en: 'Evil lurks nearby' },
    ZOMBIES:          { es: 'Gruñidos cercanos',                  en: 'Groans close by' },
    ISEKAI:           { es: 'Nivel de peligro alto',              en: 'High danger level' },
    VIKINGOS:         { es: 'Territorio hostil',                  en: 'Hostile territory' },
    STAR_WARS:        { es: 'Presencia Imperial',                 en: 'Imperial presence' },
    CYBERPUNK:        { es: 'Territorio de pandillas',            en: 'Gang territory' },
    LOVECRAFT_HORROR: { es: 'La cordura se desvanece',            en: 'Sanity slips away' },
    CUSTOM:           { es: 'Peligro acechante',                  en: 'Lurking danger' },
  },
  dungeon: {
    LOTR:             { es: 'Oscuridad palpable',                 en: 'A palpable darkness' },
    ZOMBIES:          { es: 'Pasillos estrechos',                 en: 'Narrow corridors' },
    ISEKAI:           { es: 'Tesoros y monstruos',                en: 'Treasures and monsters' },
    VIKINGOS:         { es: 'Tumbas antiguas',                    en: 'Ancient tombs' },
    STAR_WARS:        { es: 'Sensores inactivos',                 en: 'Sensors offline' },
    CYBERPUNK:        { es: 'Red aislada',                        en: 'An air-gapped network' },
    LOVECRAFT_HORROR: { es: 'Ángulos imposibles',                 en: 'Impossible angles' },
    CUSTOM:           { es: 'Secretos subterráneos',              en: 'Underground secrets' },
  },
  wilderness: {
    LOTR:             { es: 'Naturaleza salvaje',                 en: 'Untamed wilderness' },
    ZOMBIES:          { es: 'Campo abierto',                      en: 'Open ground' },
    ISEKAI:           { es: 'Zona de farmeo',                     en: 'A farming zone' },
    VIKINGOS:         { es: 'Espíritus susurrantes',              en: 'Whispering spirits' },
    STAR_WARS:        { es: 'Vida salvaje',                       en: 'Wildlife everywhere' },
    CYBERPUNK:        { es: 'Sin conexión ni ley',                en: 'Off-grid and lawless' },
    LOVECRAFT_HORROR: { es: 'Vegetación incorrecta',              en: 'Vegetation that should not be' },
    CUSTOM:           { es: 'Tierras salvajes',                   en: 'Wild lands' },
  },
  mystery: {
    LOTR:             { es: 'Magia antigua',                      en: 'Old magic lingers' },
    ZOMBIES:          { es: 'Algo no cuadra',                     en: "Something doesn't add up" },
    ISEKAI:           { es: 'Evento secreto',                     en: 'A hidden event' },
    VIKINGOS:         { es: 'Los dioses observan',                en: 'The gods are watching' },
    STAR_WARS:        { es: 'La Fuerza es fuerte',                en: 'The Force is strong here' },
    CYBERPUNK:        { es: 'Datos encriptados',                  en: 'Encrypted data' },
    LOVECRAFT_HORROR: { es: 'Velo entre mundos',                  en: 'A thin veil between worlds' },
    CUSTOM:           { es: 'Misterio por resolver',              en: 'A mystery to unravel' },
  },
  landmark: {
    LOTR:             { es: 'Lugar legendario',                   en: 'A legendary place' },
    ZOMBIES:          { es: 'Punto de referencia',                en: 'A landmark' },
    ISEKAI:           { es: 'Punto de guardado',                  en: 'A save point' },
    VIKINGOS:         { es: 'Marca ancestral',                    en: 'An ancestral marker' },
    STAR_WARS:        { es: 'Coordenadas clave',                  en: 'Key coordinates' },
    CYBERPUNK:        { es: 'Punto de interés',                   en: 'A point of interest' },
    LOVECRAFT_HORROR: { es: 'Arquitectura imposible',             en: 'Impossible architecture' },
    CUSTOM:           { es: 'Lugar notable',                      en: 'A notable spot' },
  },
}

interface SubLocation {
  id: string
  name: LocalizedString
  type: string
  description: LocalizedString
}

const SUB_TYPE_ICONS: Record<string, string> = {
  tavern: '🍺', market: '🏪', gate: '🚪', workshop: '⚒️', stable: '🐴',
  palace: '🏰', library: '📚', garden: '🌿', hall: '🏛️', hospital: '🏥',
  plaza: '🏘️', residence: '🏠', temple: '⛪', prison: '🔒',
}

interface TravelInfo {
  destination: string
  travelTime: string
  rationsNeeded: number
  hasEnoughRations: boolean
}

interface SceneViewProps {
  location: MapLocationWithStatus | null
  lore: Lore
  connectedLocations: MapLocationWithStatus[]
  onTravel: (locationId: string) => void
  onExploreInterior?: () => void
  onShowWorldMap: () => void
  onSubLocationClick?: (subLocationName: string) => void
  canExploreInterior?: boolean
  isNavigationLocked?: boolean
  lockReason?: string
  subLocations?: SubLocation[]
  currentSubLocationId?: string | null
  travelTimes?: Record<string, string>
  inventory?: string[]
  className?: string
}

// Sub-locaciones con tarjetas visibles
function SubLocationsSection({
  subLocations,
  currentSubLocationId,
  isNavigationLocked,
  onSubLocationClick,
}: {
  subLocations: SubLocation[]
  currentSubLocationId: string | null | undefined
  isNavigationLocked: boolean
  onSubLocationClick?: (name: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const t = useTranslations()
  const { locale } = useLanguage()

  return (
    <div className="border-t-2 border-gold/30">
      {/* Header */}
      <div className="px-3 py-2 bg-shadow-mid/80">
        <p className="text-[11px] font-heading text-gold uppercase tracking-widest flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {t.game.inThisPlace}
        </p>
      </div>

      {/* Sub-location cards */}
      <div className="p-2 space-y-1.5">
        {subLocations.map((sl) => {
          const isActive = sl.id === currentSubLocationId
          const isSelected = selectedId === sl.id && !isActive
          const slName = getLocalized(sl.name, locale)
          const slDescription = getLocalized(sl.description, locale)
          const hereLabel = locale === 'en' ? '📍 You are here' : '📍 Estás aquí'

          return (
            <div
              key={sl.id}
              className={cn(
                'rounded-lg border transition-all duration-200',
                isActive
                  ? 'bg-gold/10 border-gold/50 shadow-[0_0_8px_rgba(201,168,76,0.15)]'
                  : isSelected
                    ? 'bg-shadow-mid border-gold-dim/40'
                    : 'bg-shadow-mid/50 border-gold-dim/15 hover:border-gold-dim/30'
              )}
            >
              {/* Card header — always visible */}
              <button
                onClick={() => {
                  if (isActive) return
                  setSelectedId(isSelected ? null : sl.id)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
              >
                {/* Icon */}
                <span className={cn(
                  'text-xl flex-shrink-0',
                  isActive && 'drop-shadow-[0_0_4px_rgba(201,168,76,0.5)]'
                )}>
                  {SUB_TYPE_ICONS[sl.type] || '📍'}
                </span>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-heading text-[13px] leading-tight',
                    isActive ? 'text-gold-bright' : 'text-parchment'
                  )}>
                    {slName}
                  </p>
                  <p className={cn(
                    'text-[10px] mt-0.5 line-clamp-1',
                    isActive ? 'text-gold/60' : 'text-parchment/40'
                  )}>
                    {isActive ? hereLabel : slDescription}
                  </p>
                </div>

                {/* Right indicator */}
                {isActive ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-bright animate-pulse flex-shrink-0" />
                ) : (
                  <ChevronDown className={cn(
                    'w-4 h-4 text-parchment/30 transition-transform flex-shrink-0',
                    isSelected && 'rotate-180 text-gold'
                  )} />
                )}
              </button>

              {/* Expanded detail + go button */}
              {isSelected && (
                <div className="px-3 pb-3 border-t border-gold-dim/20 mt-0">
                  <p className="text-[11px] text-parchment/70 font-body mt-2 mb-2.5 leading-relaxed">
                    {slDescription}
                  </p>
                  <button
                    onClick={() => onSubLocationClick?.(slName)}
                    disabled={isNavigationLocked}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-heading text-xs transition-all',
                      isNavigationLocked
                        ? 'bg-shadow text-parchment/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 text-gold hover:text-gold-bright border border-gold/30 hover:border-gold/50'
                    )}
                  >
                    <Compass className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{slName}</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SceneView({
  location,
  lore,
  connectedLocations,
  onTravel,
  onExploreInterior,
  onShowWorldMap,
  onSubLocationClick,
  canExploreInterior = false,
  isNavigationLocked = false,
  lockReason = '',
  subLocations = [],
  currentSubLocationId = null,
  travelTimes = {},
  inventory = [],
  className = '',
}: SceneViewProps) {
  const config = getMapConfig(lore)
  const [confirmTravel, setConfirmTravel] = useState<TravelInfo | null>(null)
  const [confirmDestId, setConfirmDestId] = useState<string | null>(null)

  const t = useTranslations()
  const { locale } = useLanguage()

  // Traduce strings de travel_time (del JSON de lores) del español al inglés via regex.
  // Los JSON guardan "1 día a pie, 4 horas a caballo" — para locale EN lo convertimos
  // al vuelo sin necesidad de traducir los 10 JSONs.
  const localizeTravelTime = (str: string, loc: 'es' | 'en'): string => {
    if (loc !== 'en' || !str) return str
    return str
      // Orden importante: días (plural) antes que día
      .replace(/\b(\d+)\s+d[ií]as\b/gi, '$1 days')
      .replace(/\b(\d+)\s+d[ií]a\b/gi, '$1 day')
      .replace(/\b(\d+)\s+horas\b/gi, '$1 hours')
      .replace(/\b(\d+)\s+hora\b/gi, '$1 hour')
      .replace(/\b(\d+)\s+minutos\b/gi, '$1 minutes')
      .replace(/\b(\d+)\s+minuto\b/gi, '$1 minute')
      .replace(/a pie/gi, 'on foot')
      .replace(/a caballo/gi, 'by horse')
      .replace(/en barco/gi, 'by boat')
      .replace(/en carreta/gi, 'by cart')
      .replace(/volando/gi, 'flying')
  }

  // Calcular días de viaje a partir del texto de travel_time
  const parseDays = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)\s*(?:día|day|días|days)/i)
    if (match) return parseInt(match[1])
    // Si dice horas, es menos de 1 día
    const hoursMatch = timeStr.match(/(\d+)\s*(?:hora|hour)/i)
    if (hoursMatch) return 1
    // Si dice minutos, 0 días
    if (/minut/i.test(timeStr)) return 0
    return 1
  }

  // Contar raciones en inventario (formato: "3 raciones de viaje")
  const countRations = (): number => {
    const rationItem = inventory.find(item => /raci[oó]n|ration|provisiones|supplies|MRE/i.test(item))
    if (!rationItem) return 0
    // Buscar número al inicio: "3 raciones de viaje" → 3
    const startNum = rationItem.match(/^(\d+)\s/)
    if (startNum) return parseInt(startNum[1])
    // Buscar número en paréntesis: "Raciones (3 días)" → 3
    const parenNum = rationItem.match(/\((\d+)/)
    if (parenNum) return parseInt(parenNum[1])
    return 1
  }

  const handleTravelClick = (destId: string, destName: string) => {
    const timeStr = travelTimes[destName] || ''
    const days = parseDays(timeStr)
    const rations = countRations()

    setConfirmDestId(destId)
    setConfirmTravel({
      destination: destName,
      travelTime: localizeTravelTime(timeStr, locale as 'es' | 'en') || '???',
      rationsNeeded: days,
      hasEnoughRations: rations >= days || days === 0,
    })
  }

  if (!location) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-parchment/50 font-body text-sm">{t.game.unknownLocation}</p>
      </div>
    )
  }

  const locationType = location.type || 'landmark'
  const icon = LOCATION_ICONS[locationType] || '📍'
  const ambianceEntry = SHORT_AMBIANCE[locationType]?.[lore]
  const ambiance = ambianceEntry
    ? ambianceEntry[locale as 'es' | 'en'] || ambianceEntry.es
    : getMapLocationDescription(location, locale as 'es' | 'en')

  const dangerLevel = location.dangerLevel || 1
  const dangerColor = dangerLevel >= 4 ? 'text-red-400' : dangerLevel >= 2 ? 'text-gold' : 'text-emerald'

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden',
        'h-full',
        'border border-gold-dim/30 rounded-lg',
        className
      )}
    >
      {/* Fondo oscuro */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-shadow to-shadow-mid" />

      {/* Contenido superpuesto sobre la imagen */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header con nombre de ubicación */}
        <div className={cn(
          'flex items-center justify-between px-3 py-2',
          'border-b border-gold-dim/20 bg-shadow/50'
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-base text-gold-bright truncate drop-shadow-lg">
                {location ? getMapLocationName(location, locale) : ''}
              </h2>
              <p className="text-xs text-parchment/70 truncate italic drop-shadow-md">{ambiance}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2 whitespace-nowrap">
            <span className={cn('text-xs drop-shadow-md', dangerColor)}>
              {'⚔️'.repeat(Math.min(dangerLevel, 3))}
            </span>
            {location.visited && <span className="text-emerald text-xs drop-shadow-md">✓</span>}
          </div>
        </div>

        {/* Contenido scrolleable: viajes + sub-locaciones */}
        <div className="flex-1 overflow-y-auto">

        {/* Destinos de viaje */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-3.5 h-3.5 text-gold drop-shadow-md" />
            <span className="text-xs font-heading text-gold uppercase tracking-wide drop-shadow-md">{t.game.travelToHeading}</span>
            {isNavigationLocked && (
              <span className="text-xs text-red-400 ml-auto flex items-center gap-1">
                <Lock className="w-3 h-3" /> {lockReason}
              </span>
            )}
          </div>

          {connectedLocations.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-xs text-parchment/50 italic mb-1">{t.game.noDirectPaths}</p>
              <button
                onClick={onShowWorldMap}
                className="text-xs text-gold hover:text-gold-bright underline"
              >
                {t.game.openMap}
              </button>
            </div>
          ) : (
            <div className="grid gap-1.5">
              {connectedLocations.map((dest) => {
                const destIcon = LOCATION_ICONS[dest.type || 'landmark'] || '📍'
                const destDanger = dest.dangerLevel || 1
                const canTravel = !isNavigationLocked && dest.discovered

                const isConfirming = confirmDestId === dest.id
                const travelTime = localizeTravelTime(travelTimes[dest.name] || '', locale as 'es' | 'en')

                return (
                  <div key={dest.id} className="space-y-1">
                    <button
                      onClick={() => canTravel && handleTravelClick(dest.id, dest.name)}
                      disabled={!canTravel}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all',
                        'border',
                        isConfirming
                          ? 'border-gold/50 bg-gold/10'
                          : canTravel
                            ? 'border-gold-dim/30 hover:border-gold bg-shadow/30 hover:bg-shadow-mid cursor-pointer'
                            : 'border-gold-dim/10 bg-shadow/10 cursor-not-allowed opacity-50'
                      )}
                    >
                      <span className="text-base flex-shrink-0">{destIcon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-parchment truncate drop-shadow-md">{getMapLocationName(dest, locale as 'es' | 'en')}</p>
                        {travelTime && <p className="text-[9px] text-parchment/40">{travelTime}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={cn('text-xs', destDanger >= 4 ? 'text-red-400' : destDanger >= 2 ? 'text-gold' : 'text-emerald')}>
                          {'⚔️'.repeat(Math.min(destDanger, 2))}
                        </span>
                        {canTravel && <ChevronRight className="w-3.5 h-3.5 text-gold drop-shadow-md" />}
                        {!dest.discovered && <span className="text-xs text-parchment/30">???</span>}
                      </div>
                    </button>

                    {/* Diálogo de confirmación de viaje */}
                    {isConfirming && confirmTravel && (
                      <div className="mx-1 p-2.5 rounded-lg border border-gold/30 bg-shadow-mid/90 space-y-2">
                        <p className="text-[11px] font-heading text-gold">
                          {t.game.travelConfirmQuestion.replace('{dest}', confirmTravel.destination)}
                        </p>
                        <div className="text-[10px] text-parchment/70 space-y-0.5">
                          <p>🕐 {t.game.travelDuration}: <span className="text-parchment">{confirmTravel.travelTime}</span></p>
                          {confirmTravel.rationsNeeded > 0 && (
                            <p>🍞 {t.game.travelRationsNeeded}: <span className={confirmTravel.hasEnoughRations ? 'text-emerald' : 'text-red-400'}>{confirmTravel.rationsNeeded} {confirmTravel.rationsNeeded !== 1 ? t.game.daysShort : t.game.dayShort}</span></p>
                          )}
                          {!confirmTravel.hasEnoughRations && confirmTravel.rationsNeeded > 0 && (
                            <p className="text-red-400/80">⚠️ {t.game.travelNotEnoughRations}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setConfirmTravel(null)
                              setConfirmDestId(null)
                              onTravel(dest.id)
                            }}
                            className="flex-1 px-2 py-1.5 rounded text-[11px] font-heading bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 transition-all"
                          >
                            {t.game.travelDepart}
                          </button>
                          <button
                            onClick={() => { setConfirmTravel(null); setConfirmDestId(null) }}
                            className="px-2 py-1.5 rounded text-[11px] font-heading text-parchment/50 hover:text-parchment/80 transition-all"
                          >
                            {t.game.travelCancel}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sub-locaciones dentro de la ciudad */}
        {subLocations.length > 0 ? (
          <SubLocationsSection
            subLocations={subLocations}
            currentSubLocationId={currentSubLocationId}
            isNavigationLocked={isNavigationLocked}
            onSubLocationClick={onSubLocationClick}
          />
        ) : (
          <p className="text-xs font-ui text-parchment/40 italic text-center py-3 px-4">
            {t.game.subLocationHint}
          </p>
        )}

        </div>{/* Cierre del contenido scrolleable */}

        {/* Footer con botones de acción */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2',
          'border-t border-gold-dim/20 bg-shadow'
        )}>
          <button
            onClick={onShowWorldMap}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-heading text-xs transition-all',
              'bg-shadow-mid hover:bg-shadow border border-gold-dim/30 hover:border-gold text-parchment'
            )}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t.game.map}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
