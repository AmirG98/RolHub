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
  className?: string
}

// Sub-locaciones con info expandible
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="border-t-2 border-gold-dim/40 bg-gradient-to-b from-shadow-mid/50 to-shadow/30">
      {/* Header */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[11px] font-heading text-gold uppercase tracking-widest flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          En este lugar
        </p>
      </div>

      {/* Sub-location list */}
      <div className="px-2 pb-2 space-y-1">
        {subLocations.map((sl) => {
          const isActive = sl.id === currentSubLocationId
          const isExpanded = expandedId === sl.id

          return (
            <div key={sl.id} className={cn(
              'rounded-lg overflow-hidden transition-all duration-200',
              isActive
                ? 'bg-gold/15 ring-1 ring-gold/40'
                : 'bg-shadow-mid/30 hover:bg-shadow-mid/60'
            )}>
              {/* Main row */}
              <button
                onClick={() => {
                  if (isActive) return
                  setExpandedId(isExpanded ? null : sl.id)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all',
                  isActive ? 'cursor-default' : 'cursor-pointer'
                )}
              >
                <span className="text-lg flex-shrink-0">{SUB_TYPE_ICONS[sl.type] || '📍'}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-heading text-xs truncate',
                    isActive ? 'text-gold-bright' : 'text-parchment'
                  )}>
                    {sl.name}
                  </p>
                  {isActive && (
                    <p className="text-[9px] text-gold/70 mt-0.5">Estás aquí</p>
                  )}
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-gold-bright animate-pulse flex-shrink-0" />
                )}
                {!isActive && !isNavigationLocked && (
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 text-parchment/40 transition-transform flex-shrink-0',
                    isExpanded && 'rotate-180'
                  )} />
                )}
              </button>

              {/* Expanded info + go button */}
              {isExpanded && !isActive && (
                <div className="px-3 pb-2.5 border-t border-gold-dim/10">
                  <p className="text-[10px] text-parchment/60 font-body mt-1.5 mb-2 leading-relaxed">
                    {sl.description}
                  </p>
                  <button
                    onClick={() => onSubLocationClick?.(sl.name)}
                    disabled={isNavigationLocked}
                    className={cn(
                      'w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-heading text-[11px] transition-all',
                      isNavigationLocked
                        ? 'bg-shadow text-parchment/30 cursor-not-allowed'
                        : 'bg-gold/20 hover:bg-gold/30 text-gold hover:text-gold-bright border border-gold-dim/30'
                    )}
                  >
                    <Compass className="w-3 h-3" />
                    Ir a {sl.name}
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
  className = '',
}: SceneViewProps) {
  const config = getMapConfig(lore)

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

        {/* Destinos de viaje */}
        <div className={cn(
          'px-3 py-2',
          'flex-1 overflow-auto'
        )}>
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

                return (
                  <button
                    key={dest.id}
                    onClick={() => canTravel && onTravel(dest.id)}
                    disabled={!canTravel}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all',
                      'border',
                      canTravel
                        ? 'border-gold-dim/30 hover:border-gold bg-shadow/30 hover:bg-shadow-mid cursor-pointer'
                        : 'border-gold-dim/10 bg-shadow/10 cursor-not-allowed opacity-50'
                    )}
                  >
                    <span className="text-base flex-shrink-0">{destIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm text-parchment truncate drop-shadow-md">{dest.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn(
                        'text-xs',
                        destDanger >= 4 ? 'text-red-400' : destDanger >= 2 ? 'text-gold' : 'text-emerald'
                      )}>
                        {'⚔️'.repeat(Math.min(destDanger, 2))}
                      </span>
                      {canTravel && <ChevronRight className="w-3.5 h-3.5 text-gold drop-shadow-md" />}
                      {!dest.discovered && <span className="text-xs text-parchment/30">???</span>}
                    </div>
                  </button>
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

        {/* Footer con botones de acción */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2',
          'border-t border-gold-dim/20 bg-shadow'
        )}>
          {canExploreInterior && (
            <button
              onClick={onExploreInterior}
              disabled={isNavigationLocked}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-heading text-xs transition-all',
                isNavigationLocked
                  ? 'bg-shadow-mid text-parchment/40 cursor-not-allowed'
                  : 'bg-emerald/80 hover:bg-emerald text-parchment hover:text-white'
              )}
            >
              <span>Explorar</span>
            </button>
          )}

          <button
            onClick={onShowWorldMap}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-heading text-xs transition-all',
              'bg-shadow-mid hover:bg-shadow border border-gold-dim/30 hover:border-gold text-parchment',
              canExploreInterior ? '' : 'flex-1'
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
