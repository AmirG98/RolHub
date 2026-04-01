'use client'

import React, { useState } from 'react'
import { ChevronRight, Map, Compass, Lock, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import { type MapLocationWithStatus } from '@/lib/types/map-state'

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

// Descripciones cortas por tipo y lore
const SHORT_AMBIANCE: Record<string, Record<string, string>> = {
  city: {
    LOTR: 'Voces y comercio llenan el aire',
    ZOMBIES: 'Silencio inquietante entre edificios',
    ISEKAI: 'Bullicio del mercado mágico',
    VIKINGOS: 'Humo y olor a mar',
    STAR_WARS: 'Zumbido de naves y droides',
    CYBERPUNK: 'Neones y lluvia ácida',
    LOVECRAFT_HORROR: 'Arquitectura imposible',
    CUSTOM: 'Actividad y posibilidades',
  },
  safe: {
    LOTR: 'Paz y protección antigua',
    ZOMBIES: 'Barricadas en su lugar',
    ISEKAI: 'Zona de descanso segura',
    VIKINGOS: 'Fuego e hidromiel',
    STAR_WARS: 'Sector seguro',
    CYBERPUNK: 'Fuera de jurisdicción',
    LOVECRAFT_HORROR: 'Normalidad reconfortante',
    CUSTOM: 'Refugio seguro',
  },
  danger: {
    LOTR: 'El mal acecha',
    ZOMBIES: 'Gruñidos cercanos',
    ISEKAI: 'Nivel de peligro alto',
    VIKINGOS: 'Territorio hostil',
    STAR_WARS: 'Presencia Imperial',
    CYBERPUNK: 'Territorio de pandillas',
    LOVECRAFT_HORROR: 'La cordura se desvanece',
    CUSTOM: 'Peligro acechante',
  },
  dungeon: {
    LOTR: 'Oscuridad palpable',
    ZOMBIES: 'Pasillos estrechos',
    ISEKAI: 'Tesoros y monstruos',
    VIKINGOS: 'Tumbas antiguas',
    STAR_WARS: 'Sensores inactivos',
    CYBERPUNK: 'Red aislada',
    LOVECRAFT_HORROR: 'Ángulos imposibles',
    CUSTOM: 'Secretos subterráneos',
  },
  wilderness: {
    LOTR: 'Naturaleza salvaje',
    ZOMBIES: 'Campo abierto',
    ISEKAI: 'Zona de farmeo',
    VIKINGOS: 'Espíritus susurrantes',
    STAR_WARS: 'Vida salvaje',
    CYBERPUNK: 'Sin conexión ni ley',
    LOVECRAFT_HORROR: 'Vegetación incorrecta',
    CUSTOM: 'Tierras salvajes',
  },
  mystery: {
    LOTR: 'Magia antigua',
    ZOMBIES: 'Algo no cuadra',
    ISEKAI: 'Evento secreto',
    VIKINGOS: 'Los dioses observan',
    STAR_WARS: 'La Fuerza es fuerte',
    CYBERPUNK: 'Datos encriptados',
    LOVECRAFT_HORROR: 'Velo entre mundos',
    CUSTOM: 'Misterio por resolver',
  },
  landmark: {
    LOTR: 'Lugar legendario',
    ZOMBIES: 'Punto de referencia',
    ISEKAI: 'Punto de guardado',
    VIKINGOS: 'Marca ancestral',
    STAR_WARS: 'Coordenadas clave',
    CYBERPUNK: 'Punto de interés',
    LOVECRAFT_HORROR: 'Arquitectura imposible',
    CUSTOM: 'Lugar notable',
  },
}

interface SubLocation {
  id: string
  name: string
  type: string
  description: string
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

  return (
    <div className="border-t-2 border-gold/30">
      {/* Header */}
      <div className="px-3 py-2 bg-shadow-mid/80">
        <p className="text-[11px] font-heading text-gold uppercase tracking-widest flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          En este lugar
        </p>
      </div>

      {/* Sub-location cards */}
      <div className="p-2 space-y-1.5">
        {subLocations.map((sl) => {
          const isActive = sl.id === currentSubLocationId
          const isSelected = selectedId === sl.id && !isActive

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
                    {sl.name}
                  </p>
                  <p className={cn(
                    'text-[10px] mt-0.5 line-clamp-1',
                    isActive ? 'text-gold/60' : 'text-parchment/40'
                  )}>
                    {isActive ? '📍 Estás aquí' : sl.description}
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
                    {sl.description}
                  </p>
                  <button
                    onClick={() => onSubLocationClick?.(sl.name)}
                    disabled={isNavigationLocked}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-heading text-xs transition-all',
                      isNavigationLocked
                        ? 'bg-shadow text-parchment/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 text-gold hover:text-gold-bright border border-gold/30 hover:border-gold/50'
                    )}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Dirigirse a {sl.name}
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
      travelTime: timeStr || '???',
      rationsNeeded: days,
      hasEnoughRations: rations >= days || days === 0,
    })
  }

  if (!location) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-parchment/50 font-body text-sm">Ubicación desconocida...</p>
      </div>
    )
  }

  const locationType = location.type || 'landmark'
  const icon = LOCATION_ICONS[locationType] || '📍'
  const ambiance = SHORT_AMBIANCE[locationType]?.[lore] || location.description

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
                {location.name}
              </h2>
              <p className="text-xs text-parchment/70 truncate italic drop-shadow-md">{ambiance}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
            <span className="text-xs font-heading text-gold uppercase tracking-wide drop-shadow-md">Viajar a</span>
            {isNavigationLocked && (
              <span className="text-xs text-red-400 ml-auto flex items-center gap-1">
                <Lock className="w-3 h-3" /> {lockReason}
              </span>
            )}
          </div>

          {connectedLocations.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-xs text-parchment/50 italic mb-1">No hay caminos directos</p>
              <button
                onClick={onShowWorldMap}
                className="text-xs text-gold hover:text-gold-bright underline"
              >
                Abrir mapa
              </button>
            </div>
          ) : (
            <div className="grid gap-1.5">
              {connectedLocations.map((dest) => {
                const destIcon = LOCATION_ICONS[dest.type || 'landmark'] || '📍'
                const destDanger = dest.dangerLevel || 1
                const canTravel = !isNavigationLocked && dest.discovered

                const isConfirming = confirmDestId === dest.id
                const travelTime = travelTimes[dest.name] || ''

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
                        <p className="font-heading text-sm text-parchment truncate drop-shadow-md">{dest.name}</p>
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
                          ¿Viajar a {confirmTravel.destination}?
                        </p>
                        <div className="text-[10px] text-parchment/70 space-y-0.5">
                          <p>🕐 Duración: <span className="text-parchment">{confirmTravel.travelTime}</span></p>
                          {confirmTravel.rationsNeeded > 0 && (
                            <p>🍞 Raciones necesarias: <span className={confirmTravel.hasEnoughRations ? 'text-emerald' : 'text-red-400'}>{confirmTravel.rationsNeeded} día{confirmTravel.rationsNeeded !== 1 ? 's' : ''}</span></p>
                          )}
                          {!confirmTravel.hasEnoughRations && confirmTravel.rationsNeeded > 0 && (
                            <p className="text-red-400/80">⚠️ Sin suficientes raciones — sufrirás hambre</p>
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
                            Partir
                          </button>
                          <button
                            onClick={() => { setConfirmTravel(null); setConfirmDestId(null) }}
                            className="px-2 py-1.5 rounded text-[11px] font-heading text-parchment/50 hover:text-parchment/80 transition-all"
                          >
                            Cancelar
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
        {subLocations.length > 0 && (
          <SubLocationsSection
            subLocations={subLocations}
            currentSubLocationId={currentSubLocationId}
            isNavigationLocked={isNavigationLocked}
            onSubLocationClick={onSubLocationClick}
          />
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
            <span>Mapa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
